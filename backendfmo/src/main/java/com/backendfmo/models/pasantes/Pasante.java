package com.backendfmo.models.pasantes;

import com.backendfmo.models.reciboequipos.Usuario;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "pasante")
public class Pasante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Usuario (Padre)
    @OneToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id", nullable = false)
    @JsonBackReference(value = "usuario-pasante")
    private Usuario usuario;

    // Relación con Instituto
    @ManyToOne
    @JoinColumn(name = "instituto_id", nullable = false)
    private Instituto instituto;

    // Rutas de archivos
    @Column(name = "informe")
    private String rutaInforme;

    @Column(name = "fotografia")
    private String rutaFotografia;

    // Datos académicos / pasantía
    @Column(name = "fecha_inicio")
    private String fechaInicio;

    @Column(name = "fecha_finalizacion")
    private String fechaFinalizacion;

    // --- NUEVA RELACIÓN: Reemplaza al String area_asignada ---
    @ManyToOne
    @JoinColumn(name = "area_asignada", referencedColumnName = "id")
    private Departamento departamento;

    @Column(name = "fecha_de_nacimiento")
    private String fechaNacimiento;

    @Column(name = "titulo_pretendido")
    private String tituloPretendido;

    @Column(name = "cedula")
    private String cedula;
}
