package com.backendfmo.services;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.backendfmo.dtos.request.usuariosistema.UsuarioSistemaDTO;
import com.backendfmo.models.usuariosistema.UsuarioSistema;
import com.backendfmo.repository.UsuarioSistemaRepository;

@Service
public class UsuarioSistemaServiceImpl{

    @Autowired
    private UsuarioSistemaRepository usuarioSistemaRepository;


    //Obtener todos los usuarios del sistema para el logeo
    public List<UsuarioSistema> getAllUsuarioSistema() {
        if(usuarioSistemaRepository.count() == 0) {
            throw new IllegalStateException("No hay usuarios de sistema registrados");
        }
        return usuarioSistemaRepository.findAll();
    }

    //Guardar un usuario de sistema en la BD
    public UsuarioSistema saveUsuarioSistema(UsuarioSistemaDTO s) {
        if(usuarioSistemaRepository.existsByUsername(s.getUsername())) {
            throw new IllegalArgumentException("El usuario " + s.getUsername() + " ya existe");
        }
        
        UsuarioSistema usuarioSistema = mapearEntidad(s);
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
        return usuarioSistemaRepository.findById(id).orElseThrow();
    }

    @Transactional
    public void deleteUsuarioSistema(String username){
        if(!usuarioSistemaRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("El usuario " + username + " no existe");
        }
        usuarioSistemaRepository.deleteByUsername(username);
        
    }

    public UsuarioSistema mapearEntidad(UsuarioSistemaDTO dto){
        UsuarioSistema usuarioSistema = new UsuarioSistema();
        usuarioSistema.setUsername(dto.getUsername());
        usuarioSistema.setClave(dto.getClave());
        usuarioSistema.setTipo(dto.getTipo());
        return usuarioSistema;
    }

}
