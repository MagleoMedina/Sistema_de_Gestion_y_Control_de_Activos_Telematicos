package com.backendfmo.dtos.request.mantenimiento;

import lombok.Data;
import java.util.List;

@Data
public class MantenimientoResponseDTO {
    private Long id;
    
    // Cabecera
    private String fecha;
    private String analista;
    private String gerencia;

    // Detalle (Usuario y Ubicación)
    private Integer ficha;
    private String nombreUsuario;
    private String departamento;

    // Detalle (Equipo)
    private String fmo;
    private String tipoDispositivo;
    private String marca;
    private String modelo;
    private String so;
    private String observaciones;

    // Fotos
    private List<String> fotos;
}