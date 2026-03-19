package com.backendfmo.dtos.request.mantenimiento;

import java.util.List;

import lombok.Data;

@Data
public class MantenimientoRegistroDTO {
    // Datos del Usuario y Ubicación
    private String gerencia;
    private String fecha;
    private String analista;
    private List<EquipoDetalleDTO> equipos; // <--- LA NUEVA LISTA
}