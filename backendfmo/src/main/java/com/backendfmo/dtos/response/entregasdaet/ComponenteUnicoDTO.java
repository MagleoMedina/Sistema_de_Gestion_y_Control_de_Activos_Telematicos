package com.backendfmo.dtos.response.entregasdaet;

import lombok.Data;

@Data
public class ComponenteUnicoDTO {
    private String nombreComponente; // Ej: "Memoria RAM"
    private Integer cantidad;
}
