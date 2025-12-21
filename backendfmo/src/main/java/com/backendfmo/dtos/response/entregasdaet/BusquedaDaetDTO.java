package com.backendfmo.dtos.response.entregasdaet;

import java.util.List;

import lombok.Data;

@Data

public class BusquedaDaetDTO {
    // --- Datos Específicos de la Entrega (Lo que buscaste) ---
    private String fmoSerial;
    private String actividad;
    private String estado;
    private String tipoPeriferico; // Nombre del Periférico (Ej: "CPU Torre")
    private String identifique;

    // --- Datos del Encabezado (Padre) ---
    private String fmoEquipoLote; // El código del lote/encabezado
    private String solicitudDAET;
    private String solicitudST;
    private String estatus;
    private String fecha;
    private String observacion;
    private String recibidoPor;
    private String asignadoA;
    // --- Lista de Componentes Internos (Hijos) ---
    private List<ComponenteInternoResumenDTO> componentesInternos;

    private List<ComponenteInternoResumenDTO> componenteUnico;
}
