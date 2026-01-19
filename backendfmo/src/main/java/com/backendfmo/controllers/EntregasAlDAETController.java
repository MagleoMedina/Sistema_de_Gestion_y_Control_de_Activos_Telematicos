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
import com.backendfmo.services.DaetServiceImpl;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
public class EntregasAlDAETController {

    @Autowired
    private DaetServiceImpl daetService;

    @PostMapping("/crearEntregasAlDaet")
    public ResponseEntity<?> crearEntregaDaet(@Valid @RequestBody RegistroDaetDTO dto) {

        try {
            return ResponseEntity.status(201).body(daetService.registrarEntregasDaet(dto));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarEntregasAlDaet/fmoSerial/{fmoSerial}")
    public ResponseEntity<?> buscarPorSerial(@Valid @PathVariable String fmoSerial) {

        try {
            return ResponseEntity.status(202).body(daetService.buscarPorSerialDaet(fmoSerial));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarEntregasAlDaet/fmoEquipo/{fmoEquipo}")
    public ResponseEntity<?> buscarPorFmoEquipo(@Valid @PathVariable String fmoEquipo) {
       
        try {
            return ResponseEntity.status(202).body(daetService.buscarPorFmoEquipo(fmoEquipo));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarEntregasAlDaet")
    public ResponseEntity<?> listarTodoDAET() {

        try {
            return ResponseEntity.status(202).body(daetService.listarTodoDAET());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarEntregasAlDaet/fecha/{fecha}")
    public ResponseEntity<?> buscarPorFecha(@Valid @PathVariable String fecha) {
        try {
            return ResponseEntity.status(202).body(daetService.buscarPorFecha(fecha));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarEntregasAlDaet/rangoFechas/{fechaInicio}/{fechaFin}")
    public ResponseEntity<?> buscarPorRangoDeFechas(@PathVariable String fechaInicio, @PathVariable String fechaFin) {
        try {
            return ResponseEntity.status(202).body(daetService.listarPorRangoDeFechas(fechaInicio, fechaFin));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }

    }
}
