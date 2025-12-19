package com.backendfmo.dtos.request.reciboequipos;

import java.util.List;

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

    // Lista para componentes genéricos (solo cantidad)
    private List<ComponenteDetalleDTO> componentes; 
    
    // NUEVA LISTA: Para componentes con Serial
    private List<SerialDetalleDTO> seriales;

    private String observacionSeriales; 

    private List<Long> idsAplicaciones;

    private List<String> aplicacionesExtra;

    private List<Long> idsPerifericos;


    
}
