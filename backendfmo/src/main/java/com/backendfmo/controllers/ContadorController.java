package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.services.ContadorServiceImpl;

import org.springframework.web.bind.annotation.CrossOrigin;



@RestController
@RequestMapping("/contador")
@CrossOrigin(origins="*")
public class ContadorController {

    @Autowired
    private ContadorServiceImpl service;

    @GetMapping("/reciboDeEquipos")
    public ResponseEntity<?> contarReciboDeEquiposListo(){
        return ResponseEntity.ok(service.contarEquiposAtendidos());
    }

    @GetMapping("/reciboDePerifericos")
    public ResponseEntity<?> contarReciboDePerifericosListo(){
        return ResponseEntity.ok(service.contarPerifericosAtendidos());
    }

    @GetMapping("/entregasAlDaet")
    public ResponseEntity <?> contarEntregasAlDaet(){
        return ResponseEntity.ok(service.contarDaetAtendidas());
    }

    @GetMapping("/pendientes")
    public ResponseEntity<?> contarPendientes(){
        return ResponseEntity.ok(service.getTotalPendientes());
    }

    @GetMapping("/casosResueltos")
    public ResponseEntity<?> contarCasosResueltos(){
        return ResponseEntity.ok(service.contarCasosResueltos());
    }

}
    


