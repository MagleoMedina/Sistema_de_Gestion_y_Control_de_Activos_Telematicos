package com.backendfmo.dtos.request.entregasdaet;

import java.util.List;

import lombok.Data;

@Data
public class EntregaItemDTO {
    private Long idPeriferico; // ID de la tabla 'perifericos' (Ej: ID del "CPU")
    private String actividad;
    private String fmoSerial;
    private String estado;
    private String identifique;
    
    // Lista Secundaria (Lo que lleva adentro ese periférico)
    private List<ComponenteDaetDTO> componentesInternos;

    //Lista del componente unico
    private List<ComponenteDaetDTO> componenteUnico;
}
