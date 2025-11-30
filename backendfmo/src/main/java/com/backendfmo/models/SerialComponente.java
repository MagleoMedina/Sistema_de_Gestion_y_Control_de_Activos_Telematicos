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
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "serial_componentes")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SerialComponente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String marca;
    private String serial;
    private String capacidad;

    // Relación con el Catálogo (El tipo de componente, ej: RAM)
    @ManyToOne(fetch = FetchType.LAZY)//OneToOne
    @JsonBackReference
    @JoinColumn(name = "componentes_computadora_internos")
    private ComponenteInterno componenteTipo; 
}
