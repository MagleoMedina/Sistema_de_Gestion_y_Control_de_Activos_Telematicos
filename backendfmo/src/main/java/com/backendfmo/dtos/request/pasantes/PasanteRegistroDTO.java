package com.backendfmo.dtos.request.pasantes;

import lombok.Data;

@Data
public class PasanteRegistroDTO {
    // Datos del Usuario (Padre)
    private Integer ficha;
    private String nombre;
    private String extension;
    private String gerencia; // Generalmente "Gerencia de Telemática" para pasantes ahí

    // Datos del Pasante
    private String nombreInstituto; // Lo buscamos o creamos
    private String fechaInicio;
    private String fechaFinalizacion;
    private String areaAsignada;
    private String fechaNacimiento;
    private String tituloPretendido;
    private String cedula;
}