package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.mantenimiento.Marca;
import com.backendfmo.models.mantenimiento.Modelo;

public interface ModeloRepository extends JpaRepository<Modelo, Long> {
    Optional<Modelo> findByNombreIgnoreCaseAndMarca(String nombre, Marca marca);
}