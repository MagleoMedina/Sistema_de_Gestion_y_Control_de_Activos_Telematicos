package com.backendfmo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SerialDetalleDTO {
    
    private Long idTipoComponente; // El ID del catálogo (ej: 1 = RAM)
    private String marca;          // "Kingston"
    private String serial;         // "XJ-900"
    private String capacidad;      // "8GB"
}
