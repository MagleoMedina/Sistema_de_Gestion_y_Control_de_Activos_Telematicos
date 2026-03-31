package com.backendfmo.dtos.request.mantenimiento;

import java.util.List;

import lombok.Data;

@Data
public class MantenimientoRegistroDTO {
    // Datos del Usuario y Ubicación
    // --- NUEVO CAMPO OPCIONAL ---
    // Si viene vacío (null), es un mantenimiento no planificado (espontáneo).
    // Si trae un ID, es un mantenimiento programado que se está ejecutando.
    private Long idProgramacion;
    private String gerencia;
    private String fecha;
    private String analista;
    private List<EquipoDetalleDTO> equipos; // <--- LA NUEVA LISTA
}