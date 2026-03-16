package com.backendfmo.controllers;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import com.backendfmo.repository.InstitutoRepository;

@RestController
@RequestMapping("/institutos")
@CrossOrigin("*")
public class InstitutoController {

    @Autowired
    private InstitutoRepository institutoRepository;

    @GetMapping
    public ResponseEntity<?> obtenerTodos() {
        return ResponseEntity.ok(institutoRepository.findAll());
    }
}
