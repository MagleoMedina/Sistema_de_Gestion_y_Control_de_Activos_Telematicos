package com.backendfmo.dtos.request.mantenimiento;

import lombok.Data;

@Data
public class EquipoDetalleDTO {
    private Integer ficha;
    private String nombreUsuario;
    private String departamento;
    private String fmo;
    private String tipoDispositivo;
    private String marca;
    private String modelo;
    private String so;
    private String observaciones;
}
