
package com.backendfmo.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.request.estructura.EstructuraDTOs.DepartamentoResponseDTO;
import com.backendfmo.dtos.request.estructura.EstructuraDTOs.GerenciaResponseDTO;
import com.backendfmo.models.pasantes.Departamento;
import com.backendfmo.models.pasantes.Gerencia;
import com.backendfmo.repository.DepartamentoRepository;
import com.backendfmo.repository.GerenciaRepository;

@Service
public class EstructuraServiceImpl {

    @Autowired
    private GerenciaRepository gerenciaRepository;

    @Autowired
    private DepartamentoRepository departamentoRepository;

    // --- MÉTODOS PARA GERENCIA ---

    @Transactional
    public GerenciaResponseDTO crearGerencia(String nombre) {
        if (gerenciaRepository.findByNombreIgnoreCase(nombre).isPresent()) {
            throw new RuntimeException("La gerencia ya existe: " + nombre);
        }
        Gerencia gerencia = new Gerencia();
        gerencia.setNombre(nombre);
        return mapearGerencia(gerenciaRepository.save(gerencia));
    }

    @Transactional
    public GerenciaResponseDTO actualizarGerencia(Long id, String nuevoNombre) {
        Gerencia gerencia = gerenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gerencia no encontrada"));
        gerencia.setNombre(nuevoNombre);
        return mapearGerencia(gerenciaRepository.save(gerencia));
    }

    @Transactional
    public void eliminarGerencia(Long id) {
        Gerencia gerencia = gerenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gerencia no encontrada"));
        // Al eliminar la gerencia, Hibernate eliminará automáticamente 
        // los departamentos asociados gracias al CascadeType.ALL en el modelo.
        gerenciaRepository.delete(gerencia);
    }

    // --- MÉTODOS PARA DEPARTAMENTO ---

    @Transactional
    public DepartamentoResponseDTO agregarDepartamento(Long idGerencia, String nombreDepto) {
        Gerencia gerencia = gerenciaRepository.findById(idGerencia)
                .orElseThrow(() -> new RuntimeException("Gerencia no encontrada"));

        if (departamentoRepository.findByNombreIgnoreCaseAndGerencia(nombreDepto, gerencia).isPresent()) {
            throw new RuntimeException("El departamento ya existe en esta gerencia");
        }

        Departamento departamento = new Departamento();
        departamento.setNombre(nombreDepto);
        departamento.setGerencia(gerencia);
        
        return mapearDepartamento(departamentoRepository.save(departamento));
    }

    @Transactional
    public DepartamentoResponseDTO actualizarDepartamento(Long id, String nuevoNombre) {
        Departamento departamento = departamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departamento no encontrado"));
        departamento.setNombre(nuevoNombre);
        return mapearDepartamento(departamentoRepository.save(departamento));
    }

    @Transactional
    public void eliminarDepartamento(Long id) {
        Departamento departamento = departamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departamento no encontrado"));
        departamentoRepository.delete(departamento);
    }

    // --- HELPERS DE MAPEO (Para evitar recursión infinita) ---

    private GerenciaResponseDTO mapearGerencia(Gerencia g) {
        GerenciaResponseDTO dto = new GerenciaResponseDTO();
        dto.setId(g.getId());
        dto.setNombre(g.getNombre());
        if (g.getDepartamentos() != null) {
            dto.setDepartamentos(g.getDepartamentos().stream()
                    .map(this::mapearDepartamento)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private DepartamentoResponseDTO mapearDepartamento(Departamento d) {
        DepartamentoResponseDTO dto = new DepartamentoResponseDTO();
        dto.setId(d.getId());
        dto.setNombre(d.getNombre());
        dto.setIdGerencia(d.getGerencia().getId());
        return dto;
    }

    public List<GerenciaResponseDTO> obtenerTodasGerencias() {
        return gerenciaRepository.findAll().stream()
                .map(this::mapearGerencia)
                .collect(Collectors.toList());
    }

}