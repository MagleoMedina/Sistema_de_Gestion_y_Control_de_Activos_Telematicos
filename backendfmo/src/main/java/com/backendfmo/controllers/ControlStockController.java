package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.stock.AsignacionStockDTO;
import com.backendfmo.dtos.request.stock.RelacionStockResponseDTO;
import com.backendfmo.dtos.request.stock.StockCreateDTO;

import jakarta.validation.Valid;

import com.backendfmo.repository.ComponenteInternoRepository;
import com.backendfmo.repository.PerifericoRepository;
import com.backendfmo.services.ControlStockServiceImpl;

@RestController
@RequestMapping("/stock")
@CrossOrigin("*")
public class ControlStockController {

    @Autowired
    private ControlStockServiceImpl stockService;

    @Autowired
    private ComponenteInternoRepository componenteRepository;

    @Autowired
    private PerifericoRepository perifericoRepository;

    // GET /api/stock -> Devuelve la lista completa formateada
    @GetMapping
    public ResponseEntity<?> listarStock() {
        try {
            return ResponseEntity.status(202).body(stockService.listarStock());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // POST /api/stock -> Crea un nuevo registro
    @PostMapping
    public ResponseEntity<?> crearStock(@Valid @RequestBody StockCreateDTO dto) {
        try {
            return ResponseEntity.status(201).body(stockService.guardarNuevo(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @GetMapping("/componentes")
    public ResponseEntity<?> listarComponentes() {
        try {
            return ResponseEntity.status(202).body(componenteRepository.findAll());
        } catch (RuntimeException e) {
            // TODO: handle exception
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }

    }

    @GetMapping("/perifericos")
    public ResponseEntity<?> listarPerifericos() {
        try {
            return ResponseEntity.status(202).body(perifericoRepository.findAll());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarStock(@PathVariable Long id) {
        try {
            stockService.eliminarItem(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ENDPOINT 1: ASIGNAR STOCK A FMO (Registrar salida)
    @PostMapping("/asignar")
    public ResponseEntity<?> asignarStock(@RequestBody AsignacionStockDTO dto) {
        try {
            stockService.asignarStockAEquipo(dto);
            return ResponseEntity.ok("Stock asignado correctamente al equipo " + dto.getFmoEquipo());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ENDPOINT 2: LISTAR ASIGNACIONES
    @GetMapping("/asignaciones")
    public ResponseEntity<?> listarAsignaciones() {
        return ResponseEntity.ok(stockService.listarRelacionesAsignadas());
    }

    // NUEVO ENDPOINT: Desvincular por serial
    @DeleteMapping("/desvincular/{serial}")
    public ResponseEntity<?> desvincularItem(@PathVariable String serial) {
        try {
            stockService.desvincularPorSerial(serial);
            return ResponseEntity.ok("El item con serial " + serial + " ha sido desvinculado y devuelto al stock disponible.");
        } catch (RuntimeException e) {
            // Retorna 400 Bad Request con el mensaje del error (ej: "Serial no existe" o "No está asignado")
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}