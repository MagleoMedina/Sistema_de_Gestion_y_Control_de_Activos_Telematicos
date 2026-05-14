package com.backendfmo.services;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.backendfmo.dtos.request.usuariosistema.UsuarioSistemaDTO;
import com.backendfmo.models.usuariosistema.UsuarioSistema;
import com.backendfmo.repository.UsuarioSistemaRepository;

@Service
public class UsuarioSistemaServiceImpl{

    @Autowired
    private UsuarioSistemaRepository usuarioSistemaRepository;

    @Autowired
    private PasswordEncoder encoder;

    // 1. Declarar el Logger para esta clase
    private static final Logger logger = LoggerFactory.getLogger(UsuarioSistemaServiceImpl.class);

    //Obtener todos los usuarios del sistema para el logeo
    public List<UsuarioSistema> getAllUsuarioSistema() {
        if(usuarioSistemaRepository.count() == 0) {
            throw new IllegalStateException("No hay usuarios de sistema registrados");
        }
        logger.info("Obteniendo todos los usuarios del sistema, total: {}", usuarioSistemaRepository.count());
        return usuarioSistemaRepository.findAll();
    }

    //Guardar un usuario de sistema en la BD
    public UsuarioSistema saveUsuarioSistema(UsuarioSistemaDTO s) {
        if(usuarioSistemaRepository.existsByUsername(s.getUsername())) {
            throw new IllegalArgumentException("El usuario " + s.getUsername() + " ya existe");
        }
        
        UsuarioSistema usuarioSistema = mapearEntidad(s);
        logger.info("Guardando usuario de sistema: {}", usuarioSistema.getUsername());
        return usuarioSistemaRepository.save(usuarioSistema);
    }

    //URI para la creacion del usuario del sistema

     public URI createUri(String path, UsuarioSistemaDTO s){

        URI location = ServletUriComponentsBuilder.
            fromCurrentRequest().
            path(path).
            buildAndExpand(s.getId()).
            toUri();

        return location;
    }


    public UsuarioSistema findUsuarioSistemaById(Integer id){
       if (!usuarioSistemaRepository.existsById(id)) {
            throw new IllegalArgumentException("El usuario con id " + id + " no existe");
        }
        logger.info("Buscando usuario de sistema con id: {}", id);
        return usuarioSistemaRepository.findById(id).orElseThrow();
    }

    @Transactional
    public void deleteUsuarioSistema(String username){
        if(!usuarioSistemaRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("El usuario " + username + " no existe");
        }
        logger.info("Eliminando usuario de sistema con username: {}", username);
        usuarioSistemaRepository.deleteByUsername(username);
        
    }

    public UsuarioSistema mapearEntidad(UsuarioSistemaDTO dto){
        UsuarioSistema usuarioSistema = new UsuarioSistema();
        usuarioSistema.setUsername(dto.getUsername());
        usuarioSistema.setClave(encoder.encode(dto.getClave()));
        usuarioSistema.setTipo(dto.getTipo());
        return usuarioSistema;
    }

    
}


