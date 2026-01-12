package com.backendfmo.services.usuarioSistema;

import java.net.URI;
import java.util.List;

import com.backendfmo.dtos.request.usuariosistema.UsuarioSistemaDTO;
import com.backendfmo.models.usuariosistema.UsuarioSistema;

public interface IUsuarioSistemaService {

    List<UsuarioSistema> getAllUsuarioSistema();
    URI createUri(String path, UsuarioSistemaDTO s);
    UsuarioSistema saveUsuarioSistema(UsuarioSistemaDTO s);
    UsuarioSistema findUsuarioSistemaById(Integer i);
    void deleteUsuarioSistema(String username);
   


}
