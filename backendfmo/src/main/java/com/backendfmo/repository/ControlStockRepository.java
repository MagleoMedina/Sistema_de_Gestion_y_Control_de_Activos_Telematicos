package com.backendfmo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.stock.ControlStock;

@Repository
public interface ControlStockRepository extends JpaRepository<ControlStock, Long> {

}
