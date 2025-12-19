package com.backendfmo.controllers;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.models.usuariosistema.UsuarioSistema;
import com.backendfmo.services.usuarioSistema.IUsuarioSistemaService;

import jakarta.validation.Valid;


@RestController
public class UsuarioSistemaController {

    @Autowired
    private IUsuarioSistemaService service;


    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("API is running");
    }

    @GetMapping("/usuarioSistema")
    public ResponseEntity<?> getAllUsuarioSistema(){
        try {
            return ResponseEntity.ok(service.getAllUsuarioSistema());
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
        
    }
   
    @PostMapping("/crearUsuarioSistema")
    public ResponseEntity<?> createUsuarioSistema(@Valid @RequestBody UsuarioSistema usuarioSistema) {
       try {
            service.saveUsuarioSistema(usuarioSistema);
            URI location = service.createUri("/{id}", usuarioSistema);
            return (ResponseEntity<?>) ResponseEntity.created(location).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/usuarioSistema/{id}")
    public ResponseEntity<?> findUsuarioSistemaById(@Valid @PathVariable Integer id){
        try {
            return ResponseEntity.ok(service.findUsuarioSistemaById(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

}
