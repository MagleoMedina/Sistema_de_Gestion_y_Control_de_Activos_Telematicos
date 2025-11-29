package com.backendfmo.services;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.backendfmo.models.UsuarioSistema;
import com.backendfmo.repository.UsuarioSistemaRepository;

@Service
public class UsuarioSistemaServiceImpl implements IUsuarioSistemaService {

    @Autowired
    private UsuarioSistemaRepository usuarioSistemaRepository;

    @Override
    //Obtener todos los usuarios del sistema para el logeo
    public List<UsuarioSistema> getAllUsuarioSistema() {
        return usuarioSistemaRepository.findAll();
    }

    @Override
    //Guardar un usuario de sistema en la BD
    public UsuarioSistema saveUsuarioSistema(UsuarioSistema s) {
        
          return  usuarioSistemaRepository.save(s);
       
    }

    //URI para la creacion del usuario del sistema
    @Override
     public URI createUri(String path, UsuarioSistema s){

        URI location = ServletUriComponentsBuilder.
            fromCurrentRequest().
            path(path).
            buildAndExpand(s.getId()).
            toUri();

        return location;
    }

    @Override
    public UsuarioSistema findUsuarioSistemaById(Integer id){
       
        return usuarioSistemaRepository.findById(id).orElseThrow();
    }
}
