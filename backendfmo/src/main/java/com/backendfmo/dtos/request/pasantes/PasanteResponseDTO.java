package com.backendfmo.dtos.request.pasantes;

import lombok.Data;

@Data

public class PasanteResponseDTO {
    // Datos del Pasante
    private Long id;
    private String cedula;
    private String rutaInforme;
    private String rutaFotografia;
    private String fechaInicio;
    private String fechaFinalizacion;
    private String fechaNacimiento;
    private String tituloPretendido;

    // Datos del Instituto (Aplanado)
    private String nombreInstituto;

// --- NUEVOS CAMPOS APLANADOS ---
    private String departamentoAsignado; // Nombre del departamento
    private String gerenciaAsignada;     // Nombre de la gerencia padre
    // Datos del Usuario (Aplanados)
    private Integer ficha;
    private String nombre;
    private String extension;
    private String gerencia;
}