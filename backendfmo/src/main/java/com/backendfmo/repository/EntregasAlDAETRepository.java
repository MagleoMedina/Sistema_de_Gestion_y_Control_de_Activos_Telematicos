package com.backendfmo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.daet.EntregasAlDAET;

import java.util.List;


@Repository
public interface EntregasAlDAETRepository extends JpaRepository<EntregasAlDAET, Long> {

    List<EntregasAlDAET> findByFmoSerial(String fmoSerial);

    @Query("SELECT e FROM EntregasAlDAET e WHERE e.encabezadoRelacion.fmoEquipo = :fmoEquipo")
    List<EntregasAlDAET> findByFmoEquipo(@Param("fmoEquipo") String fmoEquipo);

    @Query("SELECT e FROM EntregasAlDAET e WHERE e.encabezadoRelacion.fecha = :fecha")
    List<EntregasAlDAET> findByFechaEncabezado(@Param("fecha") String fecha);

    @Query("SELECT e FROM EntregasAlDAET e WHERE e.encabezadoRelacion.fecha between :fechaInicio AND :fechaFin")
    List<EntregasAlDAET> findByFechaEncabezadoBetween(@Param("fechaInicio") String fechaInicio, @Param("fechaFin") String fechaFin);

    // 1. Contar Entregas Atendidas
   @Query("SELECT COUNT(d) FROM EntregasAlDAET d JOIN d.encabezadoRelacion e WHERE e.estatus = :estatus")
   long contarPorEstatus(@Param("estatus") String estatus);

    // 2. Contar Entregas Pendientes
    @Query("SELECT COUNT(d) FROM EntregasAlDAET d JOIN d.encabezadoRelacion e WHERE e.estatus <> :estatus")
    long contarPendientes(@Param("estatus") String estatus);
}
