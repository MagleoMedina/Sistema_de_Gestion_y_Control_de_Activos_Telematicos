package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.pasantes.Instituto;

public interface InstitutoRepository extends JpaRepository<Instituto, Long> {
   
    Optional<Instituto> findByNombreInstitutoIgnoreCase(String nombre);
}
