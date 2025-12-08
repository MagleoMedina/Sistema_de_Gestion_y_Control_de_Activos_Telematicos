package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.reciboperifericos.RegistroPerifericosDTO;
import com.backendfmo.services.perifericos.PerifericosService;

@RestController
public class PerifericosController {

    @Autowired
    private PerifericosService perifericosService;

    @PostMapping("/crearReciboPerifericos")
    public ResponseEntity<?> crearRegistroPerifericos(@RequestBody RegistroPerifericosDTO dto) {
         try {
            return ResponseEntity.ok(perifericosService.registrarPerifericos(dto));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/buscarReciboPerifericos/{fmoSerial}")
    public ResponseEntity<?> buscarPeriferico(@PathVariable String fmoSerial) {
        try {
            return ResponseEntity.ok(perifericosService.buscarPorSerial(fmoSerial));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}