package com.backendfmo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backendfmo.models.reciboequipos.ComponenteInterno;

@Repository
public interface ComponenteInternoRepository extends JpaRepository<ComponenteInterno, Long> {

}
