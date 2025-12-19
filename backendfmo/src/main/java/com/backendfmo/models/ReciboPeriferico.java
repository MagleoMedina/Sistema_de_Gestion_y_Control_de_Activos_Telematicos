package com.backendfmo.models;

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
@Table(name = "recibo_perifericos")
@Data
public class ReciboPeriferico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Equipo (Padre)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recibo_de_equipos")
    @JsonBackReference
    private ReciboDeEquipos equipoRelacion;

    // Relación con el Catálogo (Periférico)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perifericos")
    @JsonBackReference
    private Periferico perifericoRef;
}
