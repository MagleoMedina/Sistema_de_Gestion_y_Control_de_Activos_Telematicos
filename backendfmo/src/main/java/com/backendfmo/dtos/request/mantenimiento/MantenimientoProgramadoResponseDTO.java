package com.backendfmo.dtos.request.mantenimiento;

import lombok.Data;

@Data
public class MantenimientoProgramadoResponseDTO {
    private Long id;
    private String gerencia;
    private String fechaProgramada;
    private String analistaResponsable;
    private String estado;
}