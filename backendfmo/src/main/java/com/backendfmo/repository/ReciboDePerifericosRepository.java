package com.backendfmo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backendfmo.models.perifericos.ReciboDePerifericos;

public interface ReciboDePerifericosRepository extends JpaRepository<ReciboDePerifericos, Long> {
    
    // Spring JPA genera la query automáticamente basándose en el nombre del método
    List<ReciboDePerifericos> findByFmoSerial(String fmoSerial);
    
    Optional<ReciboDePerifericos> findById(Long perifericoId);

    @Query("SELECT e FROM ReciboDePerifericos e WHERE e.encabezadoRelacion.fecha = :fecha")
    List<ReciboDePerifericos> findByFechaEncabezado(@Param("fecha") String fecha);

    @Query("SELECT e FROM ReciboDePerifericos e WHERE e.encabezadoRelacion.fecha between :fechaInicio AND :fechaFin")
    List<ReciboDePerifericos> findByFechaEncabezadoBetween(@Param("fechaInicio") String fechaInicio, @Param("fechaFin") String fechaFin);
}
