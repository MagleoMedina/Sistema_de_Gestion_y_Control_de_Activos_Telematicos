package com.backendfmo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.request.mantenimiento.MantenimientoProgramadoRequestDTO;
import com.backendfmo.dtos.request.mantenimiento.MantenimientoProgramadoResponseDTO;
import com.backendfmo.models.mantenimiento.MantenimientoProgramado;
import com.backendfmo.models.pasantes.Gerencia;
import com.backendfmo.repository.GerenciaRepository;
import com.backendfmo.repository.MantenimientoProgramadoRepository;

@Service
public class MantenimientoProgramadoService {

    @Autowired
    private MantenimientoProgramadoRepository programadoRepository;

    @Autowired
    private GerenciaRepository gerenciaRepository;

    // ==========================================
    // CREAR MANTENIMIENTO PROGRAMADO
    // ==========================================
    @Transactional
    public MantenimientoProgramadoResponseDTO programarMantenimiento(MantenimientoProgramadoRequestDTO dto) {
        
        // 1. Buscamos la gerencia o la creamos si es nueva
        Gerencia gerencia = gerenciaRepository.findByNombreIgnoreCase(dto.getGerencia())
                .orElseGet(() -> {
                    Gerencia g = new Gerencia();
                    g.setNombre(dto.getGerencia());
                    return gerenciaRepository.save(g);
                });

        // 2. Construimos la entidad
        MantenimientoProgramado nuevo = new MantenimientoProgramado();
        nuevo.setGerencia(gerencia);
        nuevo.setFechaProgramada(dto.getFechaProgramada());
        nuevo.setAnalistaResponsable(dto.getAnalistaResponsable());
        nuevo.setEstatus("Pendiente"); // Forzamos el estatus inicial

        // 3. Guardamos en la BD
        nuevo = programadoRepository.save(nuevo);

        // 4. Retornamos usando nuestro método convertidor
        return convertirEntidadADTO(nuevo);
    }

    // ==========================================
    // CONSULTAR PENDIENTES
    // ==========================================
    @Transactional(readOnly = true)
    public List<MantenimientoProgramadoResponseDTO> obtenerPendientes() {
        return programadoRepository.findByEstatusIgnoreCase("Pendiente").stream()
                .map(this::convertirEntidadADTO)
                .toList();
    }

    // ==========================================
    // MÉTODO AUXILIAR PARA EVITAR REDUNDANCIA
    // ==========================================
    private MantenimientoProgramadoResponseDTO convertirEntidadADTO(MantenimientoProgramado entidad) {
        MantenimientoProgramadoResponseDTO dto = new MantenimientoProgramadoResponseDTO();
        dto.setId(entidad.getId());
        dto.setGerencia(entidad.getGerencia().getNombre());
        dto.setFechaProgramada(entidad.getFechaProgramada());
        dto.setAnalistaResponsable(entidad.getAnalistaResponsable());
        dto.setEstado(entidad.getEstatus());
        return dto;
    }

    // ==========================================
    // ACTUALIZAR MANTENIMIENTO PROGRAMADO (PUT)
    // ==========================================
    @Transactional
    public MantenimientoProgramadoResponseDTO actualizarProgramacion(Long id, MantenimientoProgramadoRequestDTO dto) {
        // 1. Buscamos el registro existente
        MantenimientoProgramado existente = programadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programación no encontrada con el ID: " + id));

        // 2. Gestionamos la Gerencia (por si fue modificada)
        Gerencia gerencia = gerenciaRepository.findByNombreIgnoreCase(dto.getGerencia())
                .orElseGet(() -> {
                    Gerencia g = new Gerencia();
                    g.setNombre(dto.getGerencia());
                    return gerenciaRepository.save(g);
                });

        // 3. Actualizamos los campos
        existente.setGerencia(gerencia);
        existente.setFechaProgramada(dto.getFechaProgramada());
        existente.setAnalistaResponsable(dto.getAnalistaResponsable());
        
        // 4. Guardamos y retornamos
        MantenimientoProgramado actualizado = programadoRepository.save(existente);
        return convertirEntidadADTO(actualizado);
    }

    // ==========================================
    // ELIMINAR MANTENIMIENTO PROGRAMADO (DELETE)
    // ==========================================
    @Transactional
    public void eliminarProgramacion(Long id) {
        MantenimientoProgramado existente = programadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programación no encontrada con el ID: " + id));
        
        programadoRepository.delete(existente);
    }
}
