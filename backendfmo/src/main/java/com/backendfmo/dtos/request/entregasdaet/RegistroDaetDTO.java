package com.backendfmo.dtos.request.entregasdaet;

import java.util.List;

import lombok.Data;

@Data
public class RegistroDaetDTO {
    // Encabezado
    private String fmoEquipo;
    private String solicitudDAET;
    private String solicitudST; 
    private String fecha;
    private String observacion;
    private String estatus;
    private String asignadoA;
    private String recibidoPor;

    // Lista Principal
    private List<EntregaItemDTO> entregas;
}