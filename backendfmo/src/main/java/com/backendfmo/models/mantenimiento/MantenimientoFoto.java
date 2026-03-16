package com.backendfmo.models.mantenimiento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "mantenimiento_fotos")
public class MantenimientoFoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mantenimiento_id", nullable = false)
    private Mantenimiento mantenimiento;

    @Column(name = "foto_path", nullable = false)
    private String fotoPath;
}