package com.backendfmo.models.reciboequipos;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "carpeta_red_recibo")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CarpetaRedRecibo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recibo_de_equipos")
    private ReciboDeEquipos equipoRelacion;

    // --- CAMBIO IMPORTANTE ---
    // Agregamos cascade = CascadeType.ALL para que al guardar el link,
    // se cree la carpeta automáticamente en la tabla 'carpeta_de_red'
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "carpeta_de_red")
    @JsonBackReference
    private CarpetaDeRed carpetaRelacion;
}