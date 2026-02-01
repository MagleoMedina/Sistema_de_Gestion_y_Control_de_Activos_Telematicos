package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.backendfmo.dtos.request.casos.CasoConUsuarioDTO;
import com.backendfmo.services.CasosResueltosServiceImpl;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/casos")
public class CasosResueltosController {

    @Autowired
    private CasosResueltosServiceImpl service;

    @GetMapping
    public ResponseEntity<?> listar() {
        try {
            return ResponseEntity.status(202).body(service.listarTodos());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }

    }

    @PostMapping("/guardar")
    public ResponseEntity<?> crear(@Valid @RequestBody CasoConUsuarioDTO dto) {
        try {
            return ResponseEntity.status(201).body(service.guardarCasoConNuevoUsuario(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }

    }

    @GetMapping("/buscarPorFecha/{fecha}")
    public ResponseEntity<?> buscarPorFecha(@Valid @PathVariable String fecha) {
        try {
            return ResponseEntity.status(202).body(service.listarPorFecha(fecha));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarPorTecnico/{tecnico}")
    public ResponseEntity<?> buscarPorTecnico(@Valid @PathVariable String tecnico) {
        try {
            return ResponseEntity.status(202).body(service.buscarPorTecnico(tecnico));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/rango-fechas/{inicio}/{fin}")
    public ResponseEntity<?> buscarPorRango(@Valid @PathVariable String inicio, @Valid @PathVariable String fin) {
        try {
            return ResponseEntity.status(202).body(service.listarPorRangoFechas(inicio, fin));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            // Retorna el mensaje de error de validación (400 Bad Request)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/borrar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            service.eliminarCaso(id);
            return ResponseEntity.ok("Registro eliminado correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error interno.");
        }
    }

    @GetMapping("/buscarPorFicha/{ficha}")
    public ResponseEntity<?> buscarPorFicha(@PathVariable Integer ficha) {
        try {
            return ResponseEntity.status(202).body(service.listarPorFicha(ficha));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/exportar-csv")
    public ResponseEntity<Resource> descargarCsv(
            @RequestParam String inicio,
            @RequestParam String fin) {

        String nombreArchivo = "Casos_Resueltos_" + inicio + "_al_" + fin + ".csv";

        InputStreamResource file = new InputStreamResource(service.generarReporteCsv(inicio, fin));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nombreArchivo)
                .contentType(MediaType.parseMediaType("application/csv")) // O "text/csv"
                .body(file);
    }
}