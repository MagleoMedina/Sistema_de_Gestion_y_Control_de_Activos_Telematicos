package com.backendfmo.controllers;

import com.backendfmo.dtos.request.mantenimiento.MantenimientoProgramadoRequestDTO;
import com.backendfmo.dtos.request.mantenimiento.MantenimientoProgramadoResponseDTO;
import com.backendfmo.dtos.request.mantenimiento.MantenimientoRegistroDTO;
import com.backendfmo.dtos.request.mantenimiento.MantenimientoResponseDTO;
import com.backendfmo.services.MantenimientoService;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/mantenimientos")
@CrossOrigin("*")
public class MantenimientoController {

    @Autowired
    private MantenimientoService mantenimientoService;

    // ==========================================
    // ENDPOINTS DE PROGRAMACIÓN (PENDIENTES)
    // ==========================================

    @PostMapping("/programados/crear")
    public ResponseEntity<?> crearProgramacion(@RequestBody MantenimientoProgramadoRequestDTO dto) {
        try {
            MantenimientoProgramadoResponseDTO respuesta = mantenimientoService.programarMantenimiento(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al programar: " + e.getMessage());
        }
    }

    @GetMapping("/programados/pendientes")
    public ResponseEntity<List<MantenimientoProgramadoResponseDTO>> obtenerPendientes() {
        try {
            return ResponseEntity.ok(mantenimientoService.obtenerPendientes());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/programados/actualizar/{id}")
    public ResponseEntity<?> actualizarProgramacion(@PathVariable Long id, @RequestBody MantenimientoProgramadoRequestDTO dto) {
        try {
            MantenimientoProgramadoResponseDTO respuesta = mantenimientoService.actualizarProgramacion(id, dto);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"error\": \"Error al actualizar: " + e.getMessage() + "\"}");
        }
    }

    // ==========================================
    // ENDPOINTS DE EJECUCIÓN (COMPLETADOS)
    // ==========================================

    @PostMapping(value = "/registrar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registrarMantenimiento(
            @RequestPart("datos") String datosJson,
            @RequestPart(value = "fotos", required = false) List<MultipartFile> fotos
    ) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            MantenimientoRegistroDTO dto = mapper.readValue(datosJson, MantenimientoRegistroDTO.class);

            mantenimientoService.registrarMantenimiento(dto, fotos);

            return ResponseEntity.ok().body("{\"mensaje\": \"Mantenimiento registrado con éxito\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"error\": \"Error al registrar: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    public ResponseEntity<?> obtenerTodos() {
        try {
            return ResponseEntity.ok(mantenimientoService.obtenerTodos());
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/busqueda/fecha/{fecha}")
    public ResponseEntity<List<MantenimientoResponseDTO>> obtenerPorFecha(@PathVariable String fecha) {
        try {
            return ResponseEntity.ok(mantenimientoService.obtenerPorFecha(fecha));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/busqueda/gerencia/{gerencia}")
    public ResponseEntity<List<MantenimientoResponseDTO>> obtenerPorGerencia(@PathVariable String gerencia) {
        try {
            return ResponseEntity.ok(mantenimientoService.obtenerPorGerencia(gerencia));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Funciona tanto para borrar programaciones pendientes como completadas
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarMantenimiento(@PathVariable Long id) {
        try {
            mantenimientoService.eliminarMantenimiento(id);
            return ResponseEntity.ok().body("{\"mensaje\": \"Registro eliminado con éxito\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"error\": \"Error al eliminar: " + e.getMessage() + "\"}");
        }
    }

    @PostMapping(value = "/exportar/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportarCsv(@RequestBody List<MantenimientoResponseDTO> listaMantenimientos) {
        try {
            byte[] archivoCsv = mantenimientoService.generarCsvMantenimientos(listaMantenimientos);
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte_mantenimientos.csv");
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            return new ResponseEntity<>(archivoCsv, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(value = "/exportar/csv/resumen", produces = "text/csv")
    public ResponseEntity<?> exportarCsvResumen(@RequestBody List<MantenimientoResponseDTO> listaMantenimientos) {
        try {
            byte[] archivoCsv = mantenimientoService.generarCsvResumenMantenimientos(listaMantenimientos);
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resumen_estadistico_mantenimientos.csv");
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            return new ResponseEntity<>(archivoCsv, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}

