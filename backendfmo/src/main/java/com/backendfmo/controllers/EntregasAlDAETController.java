package com.backendfmo.controllers;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.entregasdaet.RegistroDaetDTO;
import com.backendfmo.services.daet.DaetService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
public class EntregasAlDAETController {

    @Autowired
    private DaetService daetService;

    @PostMapping("/crearEntregasAlDaet")
    public ResponseEntity<?> crearEntregaDaet(@Valid @RequestBody RegistroDaetDTO dto) {
        
        try {
            ResponseEntity.ok(daetService.registrarEntregasDaet(dto));
            return ResponseEntity.ok().body(dto);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/buscarEntregasAlDaet/fmoSerial/{fmoSerial}") 
    public ResponseEntity<?> buscarPorSerial(@PathVariable String fmoSerial) {
        return ResponseEntity.ok(daetService.buscarPorSerialDaet(fmoSerial));
    }

    @GetMapping("/buscarEntregasAlDaet/fmoEquipo/{fmoEquipo}")
    public ResponseEntity<?> buscarPorFmoEquipo(@PathVariable String fmoEquipo) {
        
        return ResponseEntity.ok(daetService.buscarPorFmoEquipo(fmoEquipo));
    }

    @GetMapping("/buscarEntregasAlDaet") 
    public ResponseEntity<?> listarTodoDAET() {
        return ResponseEntity.ok(daetService.listarTodoDAET());
    }

    @GetMapping("/buscarEntregasAlDaet/fecha/{fecha}")
    public ResponseEntity<?> buscarPorFecha(@PathVariable String fecha) {
        
        return ResponseEntity.ok(daetService.buscarPorFecha(fecha));
    }


 

    

    }

   

