package com.backendfmo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backendfmo.models.reciboequipos.ReciboDeEquipos;

public interface ReciboDeEquiposRepository extends JpaRepository<ReciboDeEquipos, Long> {

   @Query("SELECT COUNT(d) FROM ReciboDeEquipos d JOIN d.encabezadoRelacion e WHERE e.estatus = :estatus")
   long contarPorEstatus(@Param("estatus") String estatus);

   @Query("SELECT e FROM ReciboDeEquipos e WHERE e.encabezadoRelacion.fmoEquipo = :fmoEquipo")
   List<ReciboDeEquipos> findByFmoEquipo(@Param("fmoEquipo") String fmoEquipo);

    // 2. Contar Entregas Pendientes
    @Query("SELECT COUNT(d) FROM ReciboDeEquipos d JOIN d.encabezadoRelacion e WHERE e.estatus <> :estatus")
    long contarPendientes(@Param("estatus") String estatus);
}
