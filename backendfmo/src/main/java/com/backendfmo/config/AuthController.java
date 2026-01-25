package com.backendfmo.config;

import com.backendfmo.dtos.request.usuariosistema.UsuarioSistemaDTO;
import com.backendfmo.models.usuariosistema.UsuarioSistema;
import com.backendfmo.repository.UsuarioSistemaRepository;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    // 1. INYECTAMOS EL REPOSITORIO PARA BUSCAR EL ROL
    @Autowired
    private UsuarioSistemaRepository usuarioRepository;

    @PostMapping("/login")
    public String login(@Valid @RequestBody UsuarioSistemaDTO authRequest) {
        // 1. Autenticar (Valida usuario y clave)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getClave())
        );

        if (authentication.isAuthenticated()) {
            // 2. BUSCAR EL USUARIO COMPLETO EN BD PARA OBTENER SU ROL REAL
            // (Spring Security usa "ROLE_ADMIN", pero nosotros queremos el string limpio "ADMIN")
            UsuarioSistema usuario = usuarioRepository.findByUsername(authRequest.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

            // 3. GENERAR EL TOKEN PASANDO USUARIO Y ROL (TIPO)
            // Asegúrate de haber actualizado JwtUtil como en el Paso 1
            return jwtUtil.generateToken(usuario.getUsername(), usuario.getTipo());
            
        } else {
            throw new UsernameNotFoundException("Solicitud de usuario invalida !");
        }
    }
}