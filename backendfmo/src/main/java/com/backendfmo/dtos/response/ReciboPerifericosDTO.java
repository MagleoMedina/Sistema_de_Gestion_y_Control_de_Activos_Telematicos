package com.backendfmo.dtos.response;

import lombok.Data;

@Data
public class ReciboPerifericosDTO {
    // Datos del Periférico (Hijo)
    private String fmoSerial;
    private String tipoComponente; // Ej: "Teclado" (Viene del Catálogo)

    // Datos del Encabezado (Padre)
    //private String fmoEquipoLote; // El código del encabezado
    private String solicitudST;
    private String estatus;
    private String fecha;
    private String observacion;
    private String solicitudDAET;
    private String entregadoPor;
    private String recibidoPor;
    private String asignadoA;

    // Datos del Usuario (Abuelo)
    private String nombre;
    private Integer ficha;
    private String usuarioGerencia;
}
