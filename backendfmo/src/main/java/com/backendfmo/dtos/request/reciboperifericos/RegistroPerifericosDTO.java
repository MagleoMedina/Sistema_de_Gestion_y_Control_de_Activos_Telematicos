package com.backendfmo.dtos.request.reciboperifericos;

import java.util.List;

import lombok.Data;

@Data
public class RegistroPerifericosDTO {
    // Datos Usuario (Para crear uno nuevo siguiendo tu lógica)
    private String usuario;
    private Integer ficha;
    private String gerencia;
    private String extension;
   

    // Datos Encabezado
    private String fmoEquipo; // En este caso será el código del lote de periféricos
    private String solicitudST;
    private String solicitudDAET;
    private String entregadoPor;
    private String recibidoPor;
    private String asignadoA;
    private String estatus;
    private String fecha;
    private String falla;
    
    

    // La lista de Componentes 
    private List<ComponenteItemDTO> componentePerifericos;

    private List<PerifericoDTO> perifericos;
    private String otro;
    private String fmoSerial;
}
