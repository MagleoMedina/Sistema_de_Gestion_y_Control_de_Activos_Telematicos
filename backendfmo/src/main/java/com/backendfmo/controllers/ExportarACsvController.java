package com.backendfmo.controllers;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.models.reciboequipos.EncabezadoRecibo;
import com.backendfmo.repository.EncabezadoReciboRepository;
import com.backendfmo.services.CsvServiceImpl;

import jakarta.validation.Valid;


@RestController
@CrossOrigin("*")

public class ExportarACsvController {

    @Autowired
    private CsvServiceImpl service;
    @Autowired
    private EncabezadoReciboRepository encabezadoRepository;

    @GetMapping("/exportarCsvJson/{inicio}/{fin}")
    public ResponseEntity<?> exportarACsv(@Valid @PathVariable String inicio, @Valid @PathVariable String fin){
        try {
            return ResponseEntity.status(202).body(service.obtenerDatosParaCsv(inicio, fin));
        } catch (Exception e) {
        return ResponseEntity.internalServerError().build();
        }
        
    }

@GetMapping("/exportarCsv/{inicio}/{fin}")
public ResponseEntity<Resource> descargarCsv(@PathVariable String inicio, @PathVariable String fin) {

    String nombreArchivo = "Reporte_" + inicio + "_al_" + fin + ".csv";
    List<EncabezadoRecibo> recibos = encabezadoRepository.findByFechaBetween(inicio, fin);
    
    if (recibos.isEmpty()){
        return ResponseEntity.noContent().build();
    }
    
     // 1. Llamar al servicio que genera el stream
    InputStreamResource file = new InputStreamResource(service.generarCsvStream(inicio, fin));

    // 2. Retornar el archivo con las cabeceras adecuadas
    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
            .contentType(MediaType.parseMediaType("application/csv")) // O "text/csv"
            .body(file);
}

}
