package com.backendfmo.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ComponenteDetalleDTO {
    
    private Long idComponente; // El ID de la tabla que llenamos con SQL (1, 2, 3...)
    private Integer cantidad;
}
