package com.backendfmo.services;

import java.net.URI;
import java.util.List;

import com.backendfmo.models.UsuarioSistema;

public interface IUsuarioSistemaService {

    List<UsuarioSistema> getAllUsuarioSistema();
    URI createUri(String path, UsuarioSistema s);
    UsuarioSistema saveUsuarioSistema(UsuarioSistema s);
    UsuarioSistema findUsuarioSistemaById(Integer i);



}
