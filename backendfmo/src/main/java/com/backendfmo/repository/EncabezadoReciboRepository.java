package com.backendfmo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backendfmo.models.reciboequipos.EncabezadoRecibo;

public interface EncabezadoReciboRepository extends JpaRepository<EncabezadoRecibo, Long> {

    // JPQL Personalizado:
    // "Selecciona el Encabezado (e) y haz un JOIN FETCH (trae los datos ya) de su Usuario"
    // Esto evita que Hibernate haga una segunda consulta para buscar al usuario.
    @Query("SELECT e FROM EncabezadoRecibo e JOIN FETCH e.usuarioRelacion WHERE e.fmoEquipo = :fmo")
    List<EncabezadoRecibo> buscarPorFmoConUsuario(@Param("fmo") String fmoEquipo);
}
