package com.backendfmo.dtos.request.mantenimiento;

import lombok.Data;

@Data
public class MantenimientoRegistroDTO {
    // Datos del Usuario y Ubicación
    private Integer ficha;
    private String nombreUsuario;
    private String gerencia;
    private String departamento;

    // Datos del Equipo
    private String tipoDispositivo; // "CPU", "Impresora", etc.
    private String marca;
    private String modelo;
    private String fmo;
    
    // Datos del Mantenimiento
    private String so;
    private String observaciones;
    private String analista;
    private String fecha;
}