package com.backendfmo.models.reciboequipos;

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
@Table(name = "componentes_recibo")
@Data
public class ComponenteRecibo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer cantidad; // Campo extra solicitado

    // Relación hacia el Equipo (Muchos componentes pertenecen a un equipo)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recibo_de_equipos")
    @JsonBackReference
    private ReciboDeEquipos equipoRelacion;

    // Relación hacia el Componente del Catálogo
    // NO usamos CascadeType.ALL aquí, porque NO queremos borrar ni crear componentes nuevos,
    // solo queremos referenciarlos.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "componentes_computadora_internos")
    @JsonBackReference
    private ComponenteInterno componenteRef;
}
