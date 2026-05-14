package com.backendfmo.dtos.request.estructura;

import lombok.Data;
import java.util.List;

public class EstructuraDTOs {

    // DTO para recibir el nombre al crear/actualizar
    @Data
    public static class NombreRequestDTO {
        private String nombre;
    }

    // DTO para devolver un Departamento
    @Data
    public static class DepartamentoResponseDTO {
        private Long id;
        private String nombre;
        private Long idGerencia;
    }

    // DTO para devolver una Gerencia con sus departamentos
    @Data
    public static class GerenciaResponseDTO {
        private Long id;
        private String nombre;
        private List<DepartamentoResponseDTO> departamentos;
    }
}
