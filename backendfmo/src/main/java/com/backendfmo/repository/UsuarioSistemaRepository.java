package com.backendfmo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.usuariosistema.UsuarioSistema;

@Repository
public interface UsuarioSistemaRepository extends JpaRepository<UsuarioSistema, Integer> {

    //@Query("DELETE u FROM UsuarioSistema u WHERE u.username = :user")
    void deleteByUsername(String username);
}
