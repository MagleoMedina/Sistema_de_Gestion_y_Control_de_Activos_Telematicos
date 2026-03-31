package com.backendfmo.controllers;

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
        }catch (Exception e) {
            //e.printStackTrace();
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


    // ==========================================
    // ENDPOINT PARA ELIMINAR
    // ==========================================
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarMantenimiento(@PathVariable Long id) {
        try {
            mantenimientoService.eliminarMantenimiento(id);
            return ResponseEntity.ok().body("{\"mensaje\": \"Lote de mantenimiento y fotografías eliminados con éxito\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"error\": \"Error al eliminar: " + e.getMessage() + "\"}");
        }
        
}

@PostMapping(value = "/exportar/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportarCsv(@RequestBody List<MantenimientoResponseDTO> listaMantenimientos) {
        try {
            // 1. Delegamos la lógica pesada al Servicio
            byte[] archivoCsv = mantenimientoService.generarCsvMantenimientos(listaMantenimientos);

            // 2. Configuramos las cabeceras HTTP
            HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte_mantenimientos.csv");
            headers.setContentType(MediaType.parseMediaType("text/csv"));

            // 3. Retornamos el archivo
            return new ResponseEntity<>(archivoCsv, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==========================================
    // ENDPOINT PARA EXPORTAR CSV RESUMIDO
    // ==========================================
    @PostMapping(value = "/exportar/csv/resumen", produces = "text/csv")
    public ResponseEntity<?> exportarCsvResumen(@RequestBody List<MantenimientoResponseDTO> listaMantenimientos) {
        try {
            // Llamamos al nuevo método resumido
            byte[] archivoCsv = mantenimientoService.generarCsvResumenMantenimientos(listaMantenimientos);

            HttpHeaders headers = new HttpHeaders();
            // Le damos un nombre distinto para diferenciarlo del detallado
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resumen_estadistico_mantenimientos.csv");
            headers.setContentType(MediaType.parseMediaType("text/csv"));

            return new ResponseEntity<>(archivoCsv, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
