package com.backendfmo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.pasantes.Pasante;

public interface PasanteRepository extends JpaRepository<Pasante, Long> {
    // Aquí puedes agregar métodos de búsqueda si necesitas luego
}
