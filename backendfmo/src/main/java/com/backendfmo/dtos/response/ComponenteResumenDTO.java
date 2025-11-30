package com.backendfmo.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ComponenteResumenDTO {
    private String nombreComponente;
    private Integer cantidad;
}
