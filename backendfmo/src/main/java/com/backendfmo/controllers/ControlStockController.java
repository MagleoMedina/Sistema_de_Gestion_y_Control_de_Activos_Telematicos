package com.backendfmo.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.stock.StockCreateDTO;
import com.backendfmo.dtos.request.stock.StockDTO;
import com.backendfmo.models.stock.ControlStock;
import com.backendfmo.services.stock.ControlStockServiceImpl;

import jakarta.validation.Valid;

import com.backendfmo.repository.ComponenteInternoRepository;
import com.backendfmo.repository.PerifericoRepository;

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
        } catch (Exception e) {
           return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // POST /api/stock -> Crea un nuevo registro
    @PostMapping
    public ResponseEntity<ControlStock> crearStock(@Valid @RequestBody StockCreateDTO dto) {
        try {
            return ResponseEntity.status(201).body(stockService.guardarNuevo(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // POST /api/stock/{id}/ajustar?cantidad=1 (o -1)
    @PostMapping("/{id}/ajustar")
    public ResponseEntity<ControlStock> ajustarStock(@Valid @PathVariable Long id,@Valid @RequestParam Integer cantidad) {
        try {
            return ResponseEntity.status(202).body(stockService.ajustarCantidad(id, cantidad));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/componentes")
    public ResponseEntity<?> listarComponentes(){
        try {
            return ResponseEntity.status(202).body(componenteRepository.findAll());
        } catch (Exception e) {
            // TODO: handle exception
            return ResponseEntity.status(500).body(e.getMessage());
        }
         
    }

     @GetMapping("/perifericos")
     public ResponseEntity<?> listarPerifericos(){
        try {
            return ResponseEntity.status(202).body(perifericoRepository.findAll());
        } catch (Exception e) {
            // TODO: handle exception
            return ResponseEntity.status(500).body(e.getMessage());
        }
        
    }
}
