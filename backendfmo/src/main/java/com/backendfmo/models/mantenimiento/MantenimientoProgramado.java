package com.backendfmo.models.mantenimiento;

import com.backendfmo.models.pasantes.Gerencia;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "mantenimiento_programado")
@Data
public class MantenimientoProgramado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "gerencia_id", nullable = false)
    private Gerencia gerencia;

    @Column(name = "fecha_programada", nullable = false)
    private String fechaProgramada;

    @Column(name = "analista_responsable", nullable = false)
    private String analistaResponsable;

    @Column(name = "estatus", nullable = false)
    private String estatus = "Pendiente"; // Valor por defecto
}