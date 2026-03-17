package com.backendfmo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.mantenimiento.Mantenimiento;

import java.util.List;

public interface MantenimientoRepository extends JpaRepository<Mantenimiento, Long> {

    // Buscar por fecha exacta
    List<Mantenimiento> findByFecha(String fecha);
    
    // Buscar por el nombre de la gerencia (ignorando mayúsculas/minúsculas)
    List<Mantenimiento> findByGerenciaNombreContainingIgnoreCase(String gerencia);

}
