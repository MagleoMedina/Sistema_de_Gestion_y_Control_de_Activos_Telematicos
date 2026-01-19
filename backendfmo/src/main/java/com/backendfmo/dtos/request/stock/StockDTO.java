package com.backendfmo.dtos.request.stock;

import lombok.Data;

@Data
public class StockDTO {

    private long id;
    private String categoria;   // "COMPONENTE" o "PERIFERICO"
    private String nombreItem;  // Ej: "MEMORIA RAM"
    private String marca;
    private String caracteristicas;
    private Integer cantidad;
    private Integer minimoAlerta;
    private String estado;
}
