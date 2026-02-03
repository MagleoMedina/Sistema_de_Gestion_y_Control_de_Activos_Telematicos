package com.backendfmo.models.stock;

import com.backendfmo.models.reciboequipos.ComponenteInterno;

import java.util.ArrayList;
import java.util.List;

import com.backendfmo.models.perifericos.Periferico;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;

@Data
@Entity
@Table(name="control_stock")
public class ControlStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con Componentes
    @ManyToOne
    @JoinColumn(name = "componentes_computadora_internos")
    private ComponenteInterno componente;

    // Relación con Periféricos
    @ManyToOne
    @JoinColumn(name = "perifericos")
    private Periferico periferico;

    @Column(name = "marca")
    private String marca;

    @Column(name="categoria")
    private String categoria;

    @Transient
    private Integer minimoAlerta;

    @Column(name = "caracteristicas", length = 500)
    private String caracteristicas;

    @Column(name = "serial", unique = true)
    private String serial;
    
    // Método auxiliar para obtener el nombre sin importar qué sea
    public String getNombreItem() {
        if (componente != null) return componente.getNombre();
        if (periferico != null) return periferico.getNombre();
        return "Desconocido";
    }
    
    // Método auxiliar para saber la categoría
    public String getCategoria() {
        return (componente != null) ? "COMPONENTE" : "PERIFERICO";
    }

    @OneToMany(mappedBy = "stockId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RelacionStock> relacionesStock;

    public void agregarRelacionStock(RelacionStock relacionStock) {
        if (relacionesStock == null) relacionesStock = new ArrayList<>();
        relacionesStock.add(relacionStock);
        relacionStock.setStockId(this);
    }

    
}
