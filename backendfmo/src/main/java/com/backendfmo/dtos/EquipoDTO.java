package com.backendfmo.dtos;

import java.util.List;

import com.backendfmo.models.ComponenteDetalleDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipoDTO {
    // Datos Equipo
    private String marca;
    private String respaldo;

    // Ahora el usuario escribe los nombres manualmente
    private List<String> nombresCarpetas;

    private List<ComponenteDetalleDTO> componentes;
}
