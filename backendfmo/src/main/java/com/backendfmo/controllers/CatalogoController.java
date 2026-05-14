package com.backendfmo.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.models.mantenimiento.Marca;
import com.backendfmo.models.mantenimiento.Modelo;
import com.backendfmo.repository.MarcaRepository;
import com.backendfmo.repository.ModeloRepository;

@RestController
@RequestMapping("/catalogo")
@CrossOrigin("*")
public class CatalogoController {

    @Autowired private MarcaRepository marcaRepository;
    @Autowired private ModeloRepository modeloRepository;

    @GetMapping("/equipos")
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtenerCatalogoEquipos() {
        try {
            List<Map<String, Object>> respuesta = new ArrayList<>();
            List<Marca> marcas = marcaRepository.findAll();

            for (Marca marca : marcas) {
                Map<String, Object> marcaMap = new HashMap<>();
                marcaMap.put("nombre", marca.getNombre());

                // Buscamos los modelos asociados a esa marca
                List<Modelo> modelos = modeloRepository.findByMarca(marca);
                List<Map<String, String>> modelosList = new ArrayList<>();
                
                if (modelos != null) {
                    for (Modelo mod : modelos) {
                        Map<String, String> modMap = new HashMap<>();
                        modMap.put("nombre", mod.getNombre());
                        modelosList.add(modMap);
                    }
                }
                
                marcaMap.put("modelos", modelosList);
                respuesta.add(marcaMap);
            }
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}