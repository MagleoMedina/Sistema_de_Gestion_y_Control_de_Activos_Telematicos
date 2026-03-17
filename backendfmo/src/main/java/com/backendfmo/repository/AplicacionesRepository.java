package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.reciboequipos.Aplicaciones;

@Repository
public interface AplicacionesRepository extends JpaRepository<Aplicaciones, Long>{

    // Método mágico de JPA para buscar por nombre ignorando mayúsculas
    Optional<Aplicaciones> findByNombreIgnoreCase(String nombre);
}
