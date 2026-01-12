package com.backendfmo.dtos.response.reciboequipos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BusquedaCompletaDTO {
    // Datos del Usuario (Traídos por JOIN)
    private String usuarioNombre;
    private String usuarioFicha;
    private String usuarioGerencia;
    private String clave;


    // Datos del Encabezado
    private Long idEncabezado;
    private String fmoEquipo;
    private String solicitudST;
    private String fecha;
    private String estatus;
    private String extension;

    private String entregadoPor;
    private String recibidoPor;
    private String asignadoA;
    private String falla;
    private String observacion;
    private String solicitudDAET;


    // Lista de Equipos
    private List<EquipoResponseDTO> equipos;
}
