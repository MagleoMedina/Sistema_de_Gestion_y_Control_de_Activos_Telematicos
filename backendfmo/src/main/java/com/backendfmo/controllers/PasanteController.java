package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.backendfmo.dtos.request.pasantes.PasanteRegistroDTO;
import com.backendfmo.repository.PasanteRepository;
import com.backendfmo.services.PasanteServiceImpl;

import tools.jackson.databind.ObjectMapper;

@RestController
@CrossOrigin(origins = "*")
public class PasanteController {

    @Autowired
    private PasanteServiceImpl pasanteService;

    @Autowired
    private PasanteRepository pasanteRepository;

    @PostMapping(value = "/registrarPasante", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registrarPasante(
            @RequestPart("datos") String datosJson,  // Recibimos el JSON como String
            @RequestPart(value = "fotografia", required = false) MultipartFile fotografia,
            @RequestPart(value = "informe", required = false) MultipartFile informe
    ) {
        try {
            // Convertir el String JSON al DTO manualmente
            // Esto evita problemas comunes con Multipart y JSON complejos en algunos navegadores
            ObjectMapper objectMapper = new ObjectMapper();
            PasanteRegistroDTO dto = objectMapper.readValue(datosJson, PasanteRegistroDTO.class);

            pasanteService.registrarPasante(dto, fotografia, informe);
            
            return ResponseEntity.ok("Pasante registrado correctamente.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al registrar pasante: " + e.getMessage());
        }
    }

    @GetMapping("/listarPasantes")
    public ResponseEntity<?> listarTodo (){

        return ResponseEntity.ok(pasanteRepository.findAll());
    }
}

