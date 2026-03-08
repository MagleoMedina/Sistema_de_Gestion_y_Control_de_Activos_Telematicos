package com.backendfmo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backendfmo.models.pasantes.Pasante;

public interface PasanteRepository extends JpaRepository<Pasante, Long> {
    // Aquí puedes agregar métodos de búsqueda si necesitas luego

    // 1. Buscar por Ficha (Coincidencia exacta)
    // Spring navega a la entidad Usuario y busca por el atributo ficha
    Optional<Pasante> findByUsuarioFicha(Integer ficha);

    // 2. Buscar por Nombre usando LIKE (Aproximación nativa de Spring)
    // ContainingIgnoreCase se traduce automáticamente a: WHERE LOWER(usuario.nombre) LIKE LOWER('%nombre%')
    List<Pasante> findByUsuarioNombreContainingIgnoreCase(String nombre);

    /* * Opcional: Si prefieres escribir la consulta manualmente usando JPQL 
     * con el operador LIKE explícito, sería de esta manera:
     * * @Query("SELECT p FROM Pasante p WHERE LOWER(p.usuario.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
     * List<Pasante> buscarPorNombreLike(@Param("nombre") String nombre);
     */
}
