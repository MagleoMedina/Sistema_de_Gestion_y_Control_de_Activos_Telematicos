package com.backendfmo.dtos.request.entregasdaet;

import lombok.Data;

@Data
public class ComponenteDaetDTO {
    private Long idComponente; // ID de la tabla 'componentes_computadora_internos'
    private Integer cantidad;
}
