package com.backendfmo.dtos.request.stock;

import lombok.Data;

@Data
public class AsignacionStockDTO {
// Datos de la Asignación
    private Long idStock;       // ID del ítem (teclado, mouse, etc.)
    private String fmoEquipo;   // FMO del equipo donde se instala
    private String fecha;       // Fecha de asignación

    // Datos del Usuario (Para crearlo o actualizarlo)
    private Integer fichaUsuario;
    private String nombreUsuario;
    private String extension;
    private String gerencia;

}