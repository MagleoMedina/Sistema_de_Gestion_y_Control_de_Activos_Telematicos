package com.backendfmo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backendfmo.models.reciboequipos.ReciboDeEquipos;

public interface ReciboDeEquiposRepository extends JpaRepository<ReciboDeEquipos, Long> {

   @Query("SELECT COUNT(d) FROM ReciboDeEquipos d JOIN d.encabezadoRelacion e WHERE e.estatus = :estatus")
   long contarPorEstatus(@Param("estatus") String estatus);

    // 2. Contar Entregas Pendientes
    @Query("SELECT COUNT(d) FROM ReciboDeEquipos d JOIN d.encabezadoRelacion e WHERE e.estatus <> :estatus")
    long contarPendientes(@Param("estatus") String estatus);
}
