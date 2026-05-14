package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.ia.IAPromptRequest;
import com.backendfmo.dtos.request.ia.IAResponse;
import com.backendfmo.services.IAClient;


@RestController
@RequestMapping("/ia")
@CrossOrigin("*")
public class IAController {

    @Autowired
    private IAClient iAClient;
    
    @PostMapping("/consultar")
    public ResponseEntity<IAResponse> consultarIA(@RequestBody IAPromptRequest request) {
        try {
            IAResponse resultado = iAClient.procesarConsultaIA(request);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}