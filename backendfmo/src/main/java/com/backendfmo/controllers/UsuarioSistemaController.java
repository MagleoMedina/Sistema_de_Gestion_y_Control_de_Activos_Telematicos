package com.backendfmo.controllers;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.usuariosistema.UsuarioSistemaDTO;
import com.backendfmo.repository.UsuarioSistemaRepository;
import com.backendfmo.services.usuarioSistema.UsuarioSistemaServiceImpl;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
public class UsuarioSistemaController {

    @Autowired
    private UsuarioSistemaServiceImpl service;

    @Autowired
    private UsuarioSistemaRepository usuarioServicRepository;

    @GetMapping("/status")
    public ResponseEntity<String> getStatusAPI() {
        try {
            return ResponseEntity.status(200).body("API is running");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }

    }

    @GetMapping("/usuarioSistema")
    public ResponseEntity<?> getAllUsuarioSistema() {
        try {
            return ResponseEntity.status(202).body(service.getAllUsuarioSistema());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }

    }

    @PostMapping("/crearUsuarioSistema")
    public ResponseEntity<?> createUsuarioSistema(@Valid @RequestBody UsuarioSistemaDTO usuarioSistema) {
        try {
            boolean existeUsuario = usuarioServicRepository.existsByUsername(usuarioSistema.getUsername());
            if (existeUsuario) {
                return ResponseEntity.status(400).body("El usuario " + usuarioSistema.getUsername() + " ya existe");
            }
            service.saveUsuarioSistema(usuarioSistema);
            URI location = service.createUri("/{id}", usuarioSistema);
            return (ResponseEntity<?>) ResponseEntity.created(location).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/usuarioSistema/{id}")
    public ResponseEntity<?> findUsuarioSistemaById(@Valid @PathVariable Integer id) {
        try {
            boolean exist = usuarioServicRepository.existsById(id);
            if(!exist){
                return ResponseEntity.status(204).body("No se encontro el id " + id);
            }
            return ResponseEntity.status(202).body(service.findUsuarioSistemaById(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/usuarioSistema/borrar/{username}")
    public ResponseEntity<?> deleteUsuarioSistemaByUsername(@Valid @PathVariable String username) {
        try {
            boolean eliminado = usuarioServicRepository.existsByUsername(username);
            if (!eliminado) {
                return ResponseEntity.status(204).body("El usuario " + username + " no existe");
            }
            service.deleteUsuarioSistema(username);
            return ResponseEntity.status(202).body("Usuario " + username + " eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

}
