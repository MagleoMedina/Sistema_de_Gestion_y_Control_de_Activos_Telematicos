package com.backendfmo.dtos.request.ia;

import com.backendfmo.dtos.request.casos.CasoConUsuarioDTO;

import lombok.Data;

@Data
public class IAResponse {
    private String solucionIA;
    private CasoConUsuarioDTO mejorCoincidenciaDB;
    private String analisisContexto;
}