package com.backendfmo.dtos.request.stock;

import lombok.Data;

@Data
public class StockCreateDTO {
    private String categoria;   // "COMPONENTE" o "PERIFERICO"
    private Long idReferencia; // El ID del catálogo seleccionado
    private String marca;
    private Integer cantidad;
    private Integer minimoAlerta;
    private String caracteristicas;
}