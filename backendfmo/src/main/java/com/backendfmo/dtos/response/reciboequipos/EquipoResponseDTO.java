package com.backendfmo.dtos.response.reciboequipos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipoResponseDTO {
    private String marca;
    private String respaldo;

    // Listas planas (Simplificadas para el frontend)
    private List<String> carpetas;           // Solo los nombres
    private List<ComponenteResumenDTO> componentesGenericos; // Cantidad + Nombre
    private List<SerialResumenDTO> componentesConSerial;     // Detalles completos
    private String observacionSeriales;
    private List<String> aplicaciones;
    private List<String> perifericos;
}
