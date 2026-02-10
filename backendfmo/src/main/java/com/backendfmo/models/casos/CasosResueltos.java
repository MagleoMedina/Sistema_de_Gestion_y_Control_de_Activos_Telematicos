package com.backendfmo.models.casos;

import com.backendfmo.models.reciboequipos.Usuario;
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
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "casos_resueltos")
public class CasosResueltos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario")
    @JsonBackReference
    private Usuario usuario;

    @Column(name = "fecha")
    private String fecha;
    
    @Column(name = "reporte")
    private String reporte;
    
    @Column(name = "atendido_por")
    private String atendidoPor;

    @Column(name = "equipo")
    private String equipo;
}
