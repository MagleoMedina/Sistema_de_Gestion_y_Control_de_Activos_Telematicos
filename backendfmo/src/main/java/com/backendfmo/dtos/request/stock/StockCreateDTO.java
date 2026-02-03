package com.backendfmo.dtos.request.stock;

import lombok.Data;

@Data
public class StockCreateDTO {

    private String categoria; // "COMPONENTE" o "PERIFERICO"

    // Usamos Long para recibir el ID (ej: 1, 2, 3...)
    private Long idReferencia;

    private String marca;
    private String caracteristicas;
    private String serial;
}