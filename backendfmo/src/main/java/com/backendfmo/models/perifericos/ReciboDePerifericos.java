package com.backendfmo.models.perifericos;

import com.backendfmo.models.reciboequipos.ComponenteInterno;
import com.backendfmo.models.reciboequipos.EncabezadoRecibo;

import jakarta.persistence.Column;
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
@Table(name = "recibo_de_perifericos")
@Data
public class ReciboDePerifericos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Encabezado Principal (Padre)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encabezado_recibo")
    private EncabezadoRecibo encabezadoRelacion;

    // Relación con la tabla Periféricos (Monitor, Mouse, etc.)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perifericos")
    private Periferico perifericoRef;

    // Relación con Componentes Internos (Opcional, según tu SQL)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "componentes_computadora_internos")
    private ComponenteInterno componenteRef;

    @Column(name = "fmo_serial")
    private String fmoSerial;
}