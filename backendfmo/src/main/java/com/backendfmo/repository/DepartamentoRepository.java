package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.pasantes.Departamento;
import com.backendfmo.models.pasantes.Gerencia;

@Repository
public interface DepartamentoRepository extends JpaRepository<Departamento, Long>{
    Optional<Departamento> findByNombreIgnoreCaseAndGerencia(String nombre, Gerencia gerencia);
}
