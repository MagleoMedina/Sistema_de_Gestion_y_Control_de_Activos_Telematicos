package com.backendfmo.dtos.response.csv;

import lombok.Data;

@Data
public class CsvDTO {

    //Tabla Usuario
    private String usuario;
    private String extension;
    private String gerencia;
    private String ficha;
    //Tabla Encabezado
    private String fecha;
    private String fmoEquipo;
    private String falla;
    private String recibidoPor;
    private String solicitudDaet;
    private String entregadoPor;
    //Dato NULL
    private String retiradorPor;
}
