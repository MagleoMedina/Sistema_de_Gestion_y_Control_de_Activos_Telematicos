package com.backendfmo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backendfmo.models.perifericos.Periferico;
import com.backendfmo.models.perifericos.ReciboDePerifericos;

public interface PerifericoRepository extends JpaRepository<Periferico,Long>{


    @Query("SELECT e FROM ReciboDePerifericos e WHERE e.encabezadoRelacion.fecha = :fecha")
    List<ReciboDePerifericos> findByFechaEncabezado(@Param("fecha") String fecha);

    @Query("SELECT e FROM ReciboDePerifericos e WHERE e.encabezadoRelacion.fecha between :fechaInicio AND :fechaFin")
    List<ReciboDePerifericos> findByFechaEncabezadoBetween(@Param("fechaInicio") String fechaInicio, @Param("fechaFin") String fechaFin);

}
