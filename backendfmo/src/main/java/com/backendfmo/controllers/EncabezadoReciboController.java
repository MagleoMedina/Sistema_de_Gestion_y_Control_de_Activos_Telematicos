package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.reciboequipos.RegistroTotalDTO;
import com.backendfmo.dtos.response.BusquedaCompletaDTO;
import com.backendfmo.services.reciboequipos.IReciboEquiposService;


import jakarta.validation.Valid;

@RestController
public class EncabezadoReciboController {

    @Autowired
    private IReciboEquiposService service;


    @PostMapping("/ingreso-equipo")
    public ResponseEntity<?> crearIngreso(@Valid @RequestBody RegistroTotalDTO dto) {
        ResponseEntity.ok(service.guardarUsuariosYRecibos(dto));
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/buscar/{fmo}")
    public ResponseEntity<?> obtenerDatosPorFmo(@Valid @PathVariable String fmo) {
        BusquedaCompletaDTO resultado = service.buscarPorFmo(fmo);
        return ResponseEntity.ok(resultado);
    }
}
