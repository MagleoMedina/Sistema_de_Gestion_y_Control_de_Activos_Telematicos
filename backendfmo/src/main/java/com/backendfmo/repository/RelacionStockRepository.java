package com.backendfmo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.stock.RelacionStock;

import java.util.Optional;
import com.backendfmo.models.stock.ControlStock;
public interface RelacionStockRepository extends JpaRepository<RelacionStock, Long> {
// Para validar si ya está asignado (retorna true/false)
    boolean existsByStockId(ControlStock stock);

    // Para buscar la relación específica y borrarla
    Optional<RelacionStock> findByStockId(ControlStock stock);
}