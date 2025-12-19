package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.perifericos.ReciboDePerifericos;

public interface ReciboDePerifericosRepository extends JpaRepository<ReciboDePerifericos, Long> {
    
    // Spring JPA genera la query automáticamente basándose en el nombre del método
    Optional<ReciboDePerifericos> findByFmoSerial(String fmoSerial);
    Optional<ReciboDePerifericos> findById(Long perifericoId);
}
