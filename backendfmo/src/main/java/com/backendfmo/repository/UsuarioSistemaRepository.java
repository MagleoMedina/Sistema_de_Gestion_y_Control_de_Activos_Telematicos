package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.usuariosistema.UsuarioSistema;

@Repository
public interface UsuarioSistemaRepository extends JpaRepository<UsuarioSistema, Integer> {

    void deleteByUsername(String username);
    boolean existsByUsername(String username);
    Optional<UsuarioSistema> findByUsername(String username);
}
