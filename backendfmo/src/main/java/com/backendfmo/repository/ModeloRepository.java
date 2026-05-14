package com.backendfmo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.mantenimiento.Marca;
import com.backendfmo.models.mantenimiento.Modelo;
import java.util.List;

@Repository
public interface ModeloRepository extends JpaRepository<Modelo, Long> {
    Optional<Modelo> findByNombreIgnoreCaseAndMarca(String nombre, Marca marca);

    // AÑADE ESTA LÍNEA PARA TRAER TODOS LOS MODELOS DE UNA MARCA
    List<Modelo> findByMarca(Marca marca);
}