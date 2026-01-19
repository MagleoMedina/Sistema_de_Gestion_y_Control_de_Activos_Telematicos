package com.backendfmo.config;

import com.backendfmo.models.usuariosistema.UsuarioSistema;
import com.backendfmo.repository.UsuarioSistemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UsuarioSistemaRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<UsuarioSistema> usuarioOpt = repository.findByUsername(username);

        if (usuarioOpt.isEmpty()) {
            throw new UsernameNotFoundException("Usuario no encontrado: " + username);
        }

        UsuarioSistema usuario = usuarioOpt.get();

        // Mapeamos tu UsuarioSistema al User de Spring Security
        return User.builder()
                .username(usuario.getUsername())
                .password(usuario.getClave()) // La clave DEBE estar encriptada en BD
                .roles(usuario.getTipo()) // Usamos tu campo "tipo" como Rol
                .build();
    }
}