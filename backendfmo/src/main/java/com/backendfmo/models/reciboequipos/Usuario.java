package com.backendfmo.models.reciboequipos;


import java.util.ArrayList;
import java.util.List;

import com.backendfmo.models.casos.CasosResueltos;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario")
    private String usuario;

    @Column(name = "clave")
    private String clave;

    @Column(name = "ficha", unique = true)
    private Integer ficha;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "extension")
    private String extension;

    @Column(name = "gerencia")
    private String gerencia;

    // Relación 1 a N
    // mappedBy = "usuarioRelacion": Debe coincidir con el nombre del atributo en la clase hija
    @OneToMany(mappedBy = "usuarioRelacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<EncabezadoRecibo> recibos = new ArrayList<>();

    // Método helper para vincular
    public void agregarRecibo(EncabezadoRecibo recibo) {
        recibos.add(recibo);
        recibo.setUsuarioRelacion(this);
    }

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CasosResueltos> casosResueltos = new ArrayList<>();

    // Método helper para vincular
    public void agregarCasoResuelto(CasosResueltos casoResuelto) {
        casosResueltos.add(casoResuelto);
        casoResuelto.setUsuario(this);
    }

}
