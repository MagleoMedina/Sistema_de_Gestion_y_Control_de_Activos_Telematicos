package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.pasantes.Instituto;

@Repository
public interface InstitutoRepository extends JpaRepository<Instituto, Long> {
   
    Optional<Instituto> findByNombreInstitutoIgnoreCase(String nombre);
}
