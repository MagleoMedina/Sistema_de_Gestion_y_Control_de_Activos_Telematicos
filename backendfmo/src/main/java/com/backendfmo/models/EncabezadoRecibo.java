package com.backendfmo.models;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "encabezado_recibo")  
@Builder

public class EncabezadoRecibo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Campos propios de la tabla
    @Column(name = "fmo_equipo")
    private String fmoEquipo;

    @Column(name = "solicitud_daet")
    private String solicitudDAET;

    @Column(name = "solicitud_st")
    private String solicitudST;

    @Column(name = "entregado_por")
    private String entregadoPor;

    @Column(name = "recibido_por")
    private String recibidoPor;

    @Column(name = "asignado_a")
    private String asignadoA;

    @Column(name = "estatus")
    private String estatus;
    
    @Column(name = "falla")
    private String falla;
    
    @Column(name = "fecha")
    private String fecha; 
    
    @Column(name = "observacion")
    private String observacion;

    // LA LLAVE FORÁNEA
    // name = "usuario": Indica que la columna en la BD se llama 'usuario'
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario") 
    @JsonBackReference
    private Usuario usuarioRelacion;
}
