package com.backendfmo.controllers;

import com.backendfmo.dtos.request.mantenimiento.MantenimientoRegistroDTO;
import com.backendfmo.dtos.request.mantenimiento.MantenimientoResponseDTO;
import com.backendfmo.services.MantenimientoService;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
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
}
