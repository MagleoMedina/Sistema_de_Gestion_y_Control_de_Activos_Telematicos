package com.backendfmo.dtos.request.stock;

import lombok.Data;

@Data
public class RelacionStockResponseDTO {
    private Long idRelacion;
    
    // Datos de la tabla Usuario
    private Integer ficha;
    private String nombreUsuario;
    private String extension;
    private String gerencia;

    // Datos de la tabla Encabezado_recibo
    private String fmoEquipo;
    private String fecha;

    // Datos extra del item (opcional pero útil)
    private String nombreItem; 
    private String serial;
}