package com.backendfmo.dtos.request.stock;

import lombok.Data;

@Data
public class StockDTO {

    private Long id;
    private String categoria;   // "COMPONENTE" o "PERIFERICO"
    private String nombreItem;  // Ej: "MEMORIA RAM"
    private String marca;
    private String caracteristicas;
    private String estado;
    private String serial;
}
