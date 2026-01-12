package com.backendfmo.services.usuarioSistema;

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
    public UsuarioSistema saveUsuarioSistema(UsuarioSistemaDTO s) {
        
        UsuarioSistema usuarioSistema = mapearEntidad(s);
        return usuarioSistemaRepository.save(usuarioSistema);
    }

    //URI para la creacion del usuario del sistema
    @Override
     public URI createUri(String path, UsuarioSistemaDTO s){

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

    @Transactional
    public void deleteUsuarioSistema(String username){
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
