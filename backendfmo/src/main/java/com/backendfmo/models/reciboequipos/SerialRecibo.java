package com.backendfmo.models.reciboequipos;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "serial_recibo")
@Data
public class SerialRecibo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recibo_de_equipos")
    @JsonBackReference
    private ReciboDeEquipos equipoRelacion;

    // AL GUARDAR ESTE LINK, GUARDAMOS TAMBIÉN EL OBJETO SERIAL_COMPONENTE
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_componentes")
    private SerialComponente serialComponente;
    
    @Column(name = "observacion")
    private String observacion;

}
