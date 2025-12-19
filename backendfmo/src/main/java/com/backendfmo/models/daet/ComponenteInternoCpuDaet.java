package com.backendfmo.models.daet;

import com.backendfmo.models.reciboequipos.ComponenteInterno;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "componentes_internos_cpu_daet")
@Data
public class ComponenteInternoCpuDaet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer cantidad;

    // Relación Hacia Arriba (La Entrega)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entregas_al_daet")
    @JsonBackReference
    private EntregasAlDAET entregaRelacion;

    // Relación Lateral (Catálogo Componentes Internos)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "componentes_computadora_internos")
    @JsonBackReference
    private ComponenteInterno componenteRef;
}