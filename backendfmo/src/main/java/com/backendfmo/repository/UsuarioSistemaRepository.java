package com.backendfmo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.UsuarioSistema;

@Repository
public interface UsuarioSistemaRepository extends JpaRepository<UsuarioSistema, Integer> {

}
