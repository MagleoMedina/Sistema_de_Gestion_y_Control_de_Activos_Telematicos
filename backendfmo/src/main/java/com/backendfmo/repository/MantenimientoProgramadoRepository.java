package com.backendfmo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.mantenimiento.MantenimientoProgramado;

@Repository
public interface MantenimientoProgramadoRepository extends JpaRepository<MantenimientoProgramado, Long> {
    
    // Spring Boot escribirá el "SELECT * WHERE estatus = ?" automáticamente
    List<MantenimientoProgramado> findByEstatusIgnoreCase(String estatus);
}