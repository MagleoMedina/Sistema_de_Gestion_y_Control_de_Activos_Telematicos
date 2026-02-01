package com.backendfmo.dtos.request.casos;

import lombok.Data;

@Data
public class CasoConUsuarioDTO {
    // Datos del Usuario
    
    private Integer ficha;
    private String nombre;
    private String gerencia;

    // Datos del Caso
    private Integer id;
    private String fecha;
    private String reporte;
    private String atendidoPor;
}
