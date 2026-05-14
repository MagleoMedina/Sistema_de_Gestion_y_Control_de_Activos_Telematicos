package com.backendfmo.config;

import com.backendfmo.dtos.request.usuariosistema.UsuarioSistemaDTO;
import com.backendfmo.models.usuariosistema.UsuarioSistema;
import com.backendfmo.repository.UsuarioSistemaRepository;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    // 1. Declarar el Logger para esta clase
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

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
            logger.info("Usuario '{}' autenticado con rol '{}'", usuario.getUsername(), usuario.getTipo());
            return jwtUtil.generateToken(usuario.getUsername(), usuario.getTipo());
            
        } else {
            throw new UsernameNotFoundException("Solicitud de usuario invalida !");
        }
    }
}