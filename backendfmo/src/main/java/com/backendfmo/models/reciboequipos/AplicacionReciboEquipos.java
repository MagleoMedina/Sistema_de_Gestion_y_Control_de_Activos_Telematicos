package com.backendfmo.models.reciboequipos;

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
@Table(name = "aplicaciones_recibo_equipos")
@Data
public class AplicacionReciboEquipos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Catálogo (Solo lectura/referencia)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aplicaciones")
    //@Column(name = "aplicaciones")
    private Aplicaciones aplicacionRef;

    // Relación con el Equipo (Padre)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recibo_de_equipos")
    //@Column(name = "recibo_de_equipos")
    private ReciboDeEquipos equipoRelacion;
}