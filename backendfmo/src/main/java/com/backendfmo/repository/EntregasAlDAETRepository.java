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

    @Query("SELECT e FROM EntregasAlDAET e WHERE e.encabezadoRelacion.fecha = :fecha")
    List<EntregasAlDAET> findByFechaEncabezado(@Param("fecha") String fecha);
}
