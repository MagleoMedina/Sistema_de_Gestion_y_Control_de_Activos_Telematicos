package com.backendfmo.dtos.response.reciboperifericos;

import java.util.List;

import lombok.Data;

@Data
public class ReciboPerifericosDTO {
    // Datos del Periférico (Hijo)
    private String fmoSerial;

    // Datos del Encabezado (Padre)
    private String fmoEquipo; // El código del encabezado
    private String solicitudST;
    private String estatus;
    private String fecha;
    private String solicitudDAET;
    private String entregadoPor;
    private String recibidoPor;
    private String asignadoA;
    private String falla;
    private String gerencia;

    // Datos del Usuario (Abuelo)
    private String nombre;
    private Integer ficha;
    private String usuario;
    private String extension;

    private List<ComponenteItemResponseDTO> componentePerifericos;

    private String otro;

    private List<PerifericoResponseDTO> perifericos;
}
