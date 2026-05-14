package com.backendfmo.dtos.request.mantenimiento;

import lombok.Data;

@Data
public class MantenimientoProgramadoRequestDTO {
    private String gerencia;
    private String fechaProgramada;
    private String analistaResponsable;
}