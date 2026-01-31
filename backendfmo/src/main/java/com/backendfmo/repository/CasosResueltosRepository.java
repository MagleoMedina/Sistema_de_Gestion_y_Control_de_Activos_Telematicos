package com.backendfmo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backendfmo.models.casos.CasosResueltos;

public interface CasosResueltosRepository extends JpaRepository<CasosResueltos, Integer> {
    List<CasosResueltos> findByFecha(String fecha);
    List<CasosResueltos> findByAtendidoPorContainingIgnoreCase(String tecnico);
    List<CasosResueltos> findByFechaBetween(String inicio, String fin);
    @Query("SELECT c FROM CasosResueltos c WHERE c.usuario.ficha = :ficha")
    List<CasosResueltos> buscarPorFichaDeUsuario(@Param("ficha") Integer ficha);

    Boolean existsByUsuario_Ficha(Integer ficha);
}   
