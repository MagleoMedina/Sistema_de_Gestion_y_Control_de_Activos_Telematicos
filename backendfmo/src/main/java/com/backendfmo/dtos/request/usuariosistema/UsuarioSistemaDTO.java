package com.backendfmo.dtos.request.usuariosistema;

import lombok.Data;

@Data
public class UsuarioSistemaDTO {

    private Integer id;
    private String username;
    private String clave;
    private String tipo;   
}
