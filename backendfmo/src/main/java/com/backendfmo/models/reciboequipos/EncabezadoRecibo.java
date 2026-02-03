package com.backendfmo.models.reciboequipos;

import java.util.ArrayList;
import java.util.List;

import com.backendfmo.models.daet.EntregasAlDAET;
import com.backendfmo.models.perifericos.ReciboDePerifericos;
import com.backendfmo.models.stock.RelacionStock;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "encabezado_recibo")  

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

    // Relación hacia abajo (hacia los equipos/detalles)
    @OneToMany(mappedBy = "encabezadoRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ReciboDeEquipos> listaEquipos = new ArrayList<>();

    // Método helper
    public void agregarEquipo(ReciboDeEquipos equipo) {
        listaEquipos.add(equipo);
        equipo.setEncabezadoRelacion(this);
    }
 
    // Relación exclusiva para Periféricos
    @OneToMany(mappedBy = "encabezadoRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ReciboDePerifericos> perifericos = new ArrayList<>();

    // Helper method
    public void agregarPeriferico(ReciboDePerifericos periferico) {
        perifericos.add(periferico);
        periferico.setEncabezadoRelacion(this);
    }

    @OneToMany(mappedBy = "encabezadoRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<EntregasAlDAET> entregasDaet = new ArrayList<>();

    public void agregarEntregaDaet(EntregasAlDAET entrega) {
        entregasDaet.add(entrega);
        entrega.setEncabezadoRelacion(this);
    }

// Lista para Periféricos Sueltos (Usa la NUEVA entidad)
    @OneToMany(mappedBy = "encabezadoRelacion", cascade = CascadeType.ALL)
    private List<ReciboDePerifericos> listaPerifericosSueltos;

    // Helper para agregar periféricos sueltos
    public void agregarPerifericoSuelto(ReciboDePerifericos item) {
        if (listaPerifericosSueltos == null) listaPerifericosSueltos = new ArrayList<>();
        listaPerifericosSueltos.add(item);
        item.setEncabezadoRelacion(this);
    }

    @OneToMany(mappedBy = "encabezadoRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RelacionStock> relacionStocks = new ArrayList<>();

    public void agregarRelacionStock(RelacionStock relacionStock) {
        if(relacionStocks == null) relacionStocks = new ArrayList<>();
        relacionStocks.add(relacionStock);
        relacionStock.setEncabezadoRelacion(this);
    }

}
