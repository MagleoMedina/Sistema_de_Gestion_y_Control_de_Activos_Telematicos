package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.estructura.EstructuraDTOs.NombreRequestDTO;
import com.backendfmo.services.EstructuraServiceImpl;

@RestController
@RequestMapping("/estructura")
@CrossOrigin("*")
public class EstructuraController {

    @Autowired
    private EstructuraServiceImpl estructuraService;

    // ==========================================
    // ENDPOINTS DE GERENCIAS
    // ==========================================

    @PostMapping("/gerencias")
    public ResponseEntity<?> crearGerencia(@RequestBody NombreRequestDTO request) {
        try {
            return ResponseEntity.ok(estructuraService.crearGerencia(request.getNombre()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/gerencias/{id}")
    public ResponseEntity<?> actualizarGerencia(@PathVariable Long id, @RequestBody NombreRequestDTO request) {
        try {
            return ResponseEntity.ok(estructuraService.actualizarGerencia(id, request.getNombre()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/gerencias/{id}")
    public ResponseEntity<?> eliminarGerencia(@PathVariable Long id) {
        try {
            estructuraService.eliminarGerencia(id);
            return ResponseEntity.ok().body("{\"mensaje\": \"Gerencia y sus departamentos eliminados correctamente\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ==========================================
    // ENDPOINTS DE DEPARTAMENTOS
    // ==========================================

    @PostMapping("/gerencias/{idGerencia}/departamentos")
    public ResponseEntity<?> agregarDepartamento(
            @PathVariable Long idGerencia, 
            @RequestBody NombreRequestDTO request) {
        try {
            return ResponseEntity.ok(estructuraService.agregarDepartamento(idGerencia, request.getNombre()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/departamentos/{id}")
    public ResponseEntity<?> actualizarDepartamento(@PathVariable Long id, @RequestBody NombreRequestDTO request) {
        try {
            return ResponseEntity.ok(estructuraService.actualizarDepartamento(id, request.getNombre()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/departamentos/{id}")
    public ResponseEntity<?> eliminarDepartamento(@PathVariable Long id) {
        try {
            estructuraService.eliminarDepartamento(id);
            return ResponseEntity.ok().body("{\"mensaje\": \"Departamento eliminado correctamente\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/gerencias")
    public ResponseEntity<?> obtenerTodasLasGerencias() {
        try {
            return ResponseEntity.ok(estructuraService.obtenerTodasGerencias());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
