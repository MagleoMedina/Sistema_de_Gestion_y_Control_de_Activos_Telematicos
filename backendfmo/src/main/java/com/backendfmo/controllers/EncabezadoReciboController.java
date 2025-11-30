package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.RegistroTotalDTO;
import com.backendfmo.dtos.response.BusquedaCompletaDTO;
import com.backendfmo.models.Usuario;
import com.backendfmo.services.encabezado.ConsultaService;
import com.backendfmo.services.encabezado.MegaRegistroService;

import jakarta.validation.Valid;

@RestController
public class EncabezadoReciboController {

    @Autowired
    private MegaRegistroService service;

    @Autowired
    private ConsultaService consultaService;

    @PostMapping("/ingreso-equipo")
    public ResponseEntity<?> crearIngreso(@Valid @RequestBody RegistroTotalDTO dto) {
        ResponseEntity.ok(service.guardarTodo(dto));
        return ResponseEntity.ok().body(dto);
    }

    // GET /api/consultas/buscar?fmo=PC-GERENCIA-01
    @GetMapping("/buscar/{fmo}")
    public ResponseEntity<?> obtenerDatosPorFmo(@Valid @PathVariable String fmo) {
        BusquedaCompletaDTO resultado = consultaService.buscarPorFmo(fmo);
        return ResponseEntity.ok(resultado);
    }
}
