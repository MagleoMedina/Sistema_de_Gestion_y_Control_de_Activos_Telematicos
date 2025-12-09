package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.entregasdaet.RegistroDaetDTO;
import com.backendfmo.services.daet.DaetService;

import jakarta.validation.Valid;

@RestController

public class EntregasAlDAETController {

    @Autowired
    private DaetService daetService;

    @PostMapping("/crearEntregasAlDaet")
    public ResponseEntity<?> crearEntregaDaet(@Valid @RequestBody RegistroDaetDTO dto) {
        
        try {
            return ResponseEntity.ok(daetService.registrarEntregasDaet(dto));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    }

   

