package com.backendfmo.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.pasantes.Gerencia;

@Repository
public interface GerenciaRepository extends JpaRepository<Gerencia,Long> {

    Optional<Gerencia> findByNombreIgnoreCase(String nombre);

    // NUEVO MÉTODO: Búsqueda tipo LIKE
    List<Gerencia> findByNombreContainingIgnoreCase(String termino);
}
