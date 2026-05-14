package com.backendfmo.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.mantenimiento.MantenimientoProgramadoRequestDTO;
import com.backendfmo.dtos.request.mantenimiento.MantenimientoProgramadoResponseDTO;
import com.backendfmo.services.MantenimientoProgramadoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/programaciones")
public class MantenimientoProgramadoController {

    @Autowired
    private MantenimientoProgramadoService programadoService;

    @PostMapping("/crear")
    public ResponseEntity<?> crearProgramacion(@Valid @RequestBody MantenimientoProgramadoRequestDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(programadoService.programarMantenimiento(dto));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al programar: " + e.getMessage());
        }
    }

    @GetMapping("/pendientes")
    public ResponseEntity<?> obtenerPendientes() {
        try {
            return ResponseEntity.ok(programadoService.obtenerPendientes());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==========================================
    // ENDPOINT PARA ACTUALIZAR (PUT)
    // ==========================================
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarProgramacion(@PathVariable Long id, @RequestBody MantenimientoProgramadoRequestDTO dto) {
        try {
            MantenimientoProgramadoResponseDTO respuesta = programadoService.actualizarProgramacion(id, dto);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"error\": \"Error al actualizar: " + e.getMessage() + "\"}");
        }
    }

    // ==========================================
    // ENDPOINT PARA ELIMINAR (DELETE)
    // ==========================================
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarProgramacion(@PathVariable Long id) {
        try {
            programadoService.eliminarProgramacion(id);
            return ResponseEntity.ok().body("{\"mensaje\": \"Programación eliminada con éxito\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"error\": \"Error al eliminar: " + e.getMessage() + "\"}");
        }
    }
}
