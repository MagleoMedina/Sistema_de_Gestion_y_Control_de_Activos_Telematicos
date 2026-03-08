package com.backendfmo.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.backendfmo.dtos.request.pasantes.PasanteRegistroDTO;
import com.backendfmo.dtos.request.pasantes.PasanteResponseDTO;
import com.backendfmo.repository.PasanteRepository;
import com.backendfmo.services.PasanteServiceImpl;

import jakarta.validation.Valid;
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
    public ResponseEntity<?> obtenerTodos() {
        try {
            List<PasanteResponseDTO> lista = pasanteService.obtenerTodosLosPasantes();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarPasantePorFicha/{ficha}")
    public ResponseEntity<?> buscarPorFicha(@Valid @PathVariable Integer ficha) {
        try {
            return ResponseEntity.status(200).body(pasanteService.buscarPorFicha(ficha));
        }catch(RuntimeException e){
            return ResponseEntity.status(404).body("{\"error\": \"" + e.getMessage() + "\"}");
        }catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Error al buscar pasante: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/buscarPasantePorNombre/{nombre}")
    public ResponseEntity<?> buscarPorNombre(@Valid @PathVariable String nombre) {
        try {
            List<PasanteResponseDTO> pasantes = pasanteService.buscarPorNombre(nombre);
            if (!pasantes.isEmpty()) {
                return ResponseEntity.ok(pasantes);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping(value = "/actualizarPasante/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizarPasante(
            @Valid @PathVariable Long id,
            @RequestPart("datos") String datosJson,
            @RequestPart(value = "fotografia", required = false) MultipartFile fotografia,
            @RequestPart(value = "informe", required = false) MultipartFile informe
    ) {
        try {
            // Convertimos el JSON al DTO
            ObjectMapper objectMapper = new ObjectMapper();
            PasanteRegistroDTO dto = objectMapper.readValue(datosJson, PasanteRegistroDTO.class);

            // Llamamos al servicio de actualización
            PasanteResponseDTO pasanteActualizado = pasanteService.actualizarPasante(id, dto, fotografia, informe);
            
            return ResponseEntity.ok(pasanteActualizado);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al actualizar pasante: " + e.getMessage());
        }
    }


    @DeleteMapping("/eliminarPasante/{id}")
    public ResponseEntity<?> eliminarPasante(@Valid @PathVariable Long id) {
        try {
            pasanteService.eliminarPasante(id);
            // Devolvemos un JSON simple con el mensaje de éxito
            return ResponseEntity.ok().body("{\"mensaje\": \"Pasante y archivos eliminados correctamente.\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Error al eliminar pasante: " + e.getMessage() + "\"}");
        }
    }
}
