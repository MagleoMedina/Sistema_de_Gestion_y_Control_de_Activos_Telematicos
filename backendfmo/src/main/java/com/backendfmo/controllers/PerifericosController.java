package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.reciboperifericos.RegistroPerifericosDTO;
import com.backendfmo.dtos.response.ReciboPerifericosDTO;
import com.backendfmo.models.Usuario;
import com.backendfmo.services.perifericos.PerifericosService;

@RestController
public class PerifericosController {

    @Autowired
    private PerifericosService perifericosService;

    @PostMapping("/crear")
    public ResponseEntity<Usuario> crearRegistroPerifericos(@RequestBody RegistroPerifericosDTO dto) {
        Usuario usuarioGuardado = perifericosService.registrarPerifericos(dto);
        return ResponseEntity.ok(usuarioGuardado);
    }

    @GetMapping("/buscare/{fmoSerial}")
    public ResponseEntity<ReciboPerifericosDTO> buscarPeriferico(@PathVariable String fmoSerial) {
        ReciboPerifericosDTO resultado = perifericosService.buscarPorSerial(fmoSerial);
        return ResponseEntity.ok(resultado);
    }
}