package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.services.EliminarRegistroImpl;

@RestController
public class EliminarRegistroController {

    @Autowired private EliminarRegistroImpl service;

    @DeleteMapping("/borrarRecibo/{id}")
    public ResponseEntity<?> eliminarRecibo(@PathVariable Long id) {
        try {
            service.eliminarReciboPorId(id);
            return ResponseEntity.status(200).body("Registro eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar");
        }
    }
}
