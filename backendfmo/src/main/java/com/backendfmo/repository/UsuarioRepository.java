package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.reciboequipos.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    //Buscar Por ficha
    @Query("SELECT u FROM Usuario u WHERE u.ficha = ?1")
    Optional<Usuario> findByFicha(Integer ficha);
}

