package com.backendfmo.models;

import java.util.ArrayList;
import java.util.List;

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
import lombok.Data;

@Entity
@Table(name = "entregas_al_daet")
@Data
public class EntregasAlDAET {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String actividad;
    
    @Column(name = "fmo_serial")
    private String fmoSerial;
    
    private String estado;

    private String identifique;

    // Relación Hacia Arriba (Encabezado)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encabezado_recibo")
    private EncabezadoRecibo encabezadoRelacion;

    // Relación Lateral (Catálogo Periféricos - Solo lectura/referencia)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perifericos")
    @JsonBackReference
    private Periferico perifericoRef;

    // Relación Hacia Abajo (Componentes Internos)
    @OneToMany(mappedBy = "entregaRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference  
    private List<ComponenteInternoCpuDaet> componentesInternos = new ArrayList<>();

    // Helper
    public void agregarComponenteInterno(ComponenteInternoCpuDaet comp) {
        componentesInternos.add(comp);
        comp.setEntregaRelacion(this);
    }
}
