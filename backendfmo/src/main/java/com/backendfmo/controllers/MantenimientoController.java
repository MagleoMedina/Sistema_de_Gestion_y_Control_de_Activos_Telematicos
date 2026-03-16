package com.backendfmo.controllers;

import com.backendfmo.dtos.request.mantenimiento.MantenimientoRegistroDTO;
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
}
