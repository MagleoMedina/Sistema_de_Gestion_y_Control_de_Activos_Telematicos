package com.backendfmo.models.reciboequipos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "carpeta_de_red")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class CarpetaDeRed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_carpeta")
    private String nombreCarpeta;
}