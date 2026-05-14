package com.backendfmo.dtos.request.pasantes;

import lombok.Data;

@Data
public class PasanteRegistroDTO {
    // Datos del Usuario (Padre)
    private Integer ficha;
    private String nombre;
    private String extension;
    private String gerencia; // Texto, ej: "Gerencia de Telemática"

    // Datos del Pasante
    private String nombreInstituto; 
    private String fechaInicio;
    private String fechaFinalizacion;
    private String areaAsignada; // Texto, ej: "Soporte Técnico" (será el Departamento)
    private String fechaNacimiento;
    private String tituloPretendido;
    private String cedula;
}