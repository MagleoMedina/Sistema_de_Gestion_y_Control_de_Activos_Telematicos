package com.backendfmo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.mantenimiento.Mantenimiento;

public interface MantenimientoRepository extends JpaRepository<Mantenimiento, Long> {}
