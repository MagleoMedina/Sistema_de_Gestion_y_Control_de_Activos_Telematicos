package com.backendfmo.models.stock;

import com.backendfmo.models.reciboequipos.EncabezadoRecibo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "relacion_stock")
public class RelacionStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "stock_id")
    private ControlStock stockId;

    @ManyToOne
    @JoinColumn(name = "encabezado_id")
    private EncabezadoRecibo encabezadoRelacion;



}
