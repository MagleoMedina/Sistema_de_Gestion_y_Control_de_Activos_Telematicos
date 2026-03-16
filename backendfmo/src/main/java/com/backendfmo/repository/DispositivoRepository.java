package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.mantenimiento.Dispositivo;

public interface DispositivoRepository extends JpaRepository<Dispositivo, Long> {
    Optional<Dispositivo> findByFmoIgnoreCase(String fmo);
}