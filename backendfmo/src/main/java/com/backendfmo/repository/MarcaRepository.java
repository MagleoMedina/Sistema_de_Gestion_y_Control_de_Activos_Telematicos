package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.mantenimiento.Marca;

public interface MarcaRepository extends JpaRepository<Marca, Long> {
    Optional<Marca> findByNombreIgnoreCase(String nombre);
}
