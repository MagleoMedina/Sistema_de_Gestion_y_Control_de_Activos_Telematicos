package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.pasantes.Gerencia;

public interface GerenciaRepository extends JpaRepository<Gerencia,Long> {

    Optional<Gerencia> findByNombreIgnoreCase(String nombre);
}
