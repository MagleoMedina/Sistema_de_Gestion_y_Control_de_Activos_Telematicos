package com.backendfmo.models.mantenimiento;

import java.util.List;

import com.backendfmo.models.pasantes.Gerencia;

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
import lombok.Data;

@Data
@Entity
@Table(name = "mantenimiento")
public class Mantenimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "gerencia_id", nullable = false)
    private Gerencia gerencia;

    @Column(nullable = false)
    private String analista;

    @Column(nullable = false)
    private String fecha;

    @OneToMany(mappedBy = "mantenimiento", cascade = CascadeType.ALL)
    private List<MantenimientoDepartamento> detalles;

    @OneToMany(mappedBy = "mantenimiento", cascade = CascadeType.ALL)
    private List<MantenimientoFoto> fotos;
}