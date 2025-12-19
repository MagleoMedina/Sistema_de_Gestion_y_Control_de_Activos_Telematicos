package com.backendfmo.dtos.response.reciboperifericos;

import lombok.Data;

@Data
public class ItemPerifericoDTO {
    private Long idComponente; // ID del Periférico (1=Monitor, etc.)
    private String fmoSerial;  // Serial específico
}