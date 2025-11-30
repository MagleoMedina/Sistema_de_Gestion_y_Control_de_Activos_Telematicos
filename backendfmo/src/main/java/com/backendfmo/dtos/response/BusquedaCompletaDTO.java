package com.backendfmo.dtos.response;

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

    // Datos del Encabezado
    private String fmoEquipo;
    private String solicitudST;
    private String fecha;
    private String estatus;

    // Lista de Equipos
    private List<EquipoResponseDTO> equipos;
}
