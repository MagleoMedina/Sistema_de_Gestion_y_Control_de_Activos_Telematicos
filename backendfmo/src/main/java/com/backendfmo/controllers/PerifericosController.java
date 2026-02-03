package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


import com.backendfmo.dtos.request.reciboperifericos.RegistroPerifericosDTO;
import com.backendfmo.services.PerifericosServiceImpl;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
public class PerifericosController {

    @Autowired
    private PerifericosServiceImpl perifericosService;

    @PostMapping("/crearReciboPerifericos")
    public ResponseEntity<?> crearRegistroPerifericos(@Valid @RequestBody RegistroPerifericosDTO dto) {
         try {
            return ResponseEntity.status(201).body(perifericosService.registrarPerifericos(dto));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/buscarReciboPerifericos/{fmoSerial}")
    public ResponseEntity<?> buscarPeriferico(@PathVariable String fmoSerial) {
        try {
            return ResponseEntity.status(202).body(perifericosService.buscarPorSerial(fmoSerial));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarReciboPerifericos")
    public ResponseEntity<?> buscarReciboDePeriferico() {
        try {
            return ResponseEntity.status(202).body(perifericosService.listarTodoReciboPerifericos());    
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }catch(Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarReciboPerifericos/fecha/{fecha}")
    public ResponseEntity<?> buscarReciboDePerifericosFecha(@PathVariable String fecha) {
        try {
            return ResponseEntity.status(202).body(perifericosService.buscarPorFecha(fecha));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarReciboPerifericos/rangoFechas/{fechaInicio}/{fechaFin}")
    public ResponseEntity<?> buscarReciboDePerifericosRangoFechas(@PathVariable String fechaInicio, @PathVariable String fechaFin) {
        try {
            return ResponseEntity.status(202).body(perifericosService.listarPorRangoDeFechas(fechaInicio, fechaFin));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarReciboPerifericos/buscarPorFicha/{ficha}")
    public ResponseEntity<?> buscarReciboDePerifericosPorFicha(@PathVariable Integer ficha) {
        try {
            return ResponseEntity.status(202).body(perifericosService.buscarPorFicha(ficha));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }
}