package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.reciboequipos.ActualizarEstatusDTO;
import com.backendfmo.dtos.request.reciboequipos.RegistroTotalDTO;
import com.backendfmo.dtos.response.reciboequipos.BusquedaCompletaDTO;
import com.backendfmo.services.reciboequipos.ReciboEquiposService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
public class ReciboEquiposController {

    @Autowired
    private ReciboEquiposService service;


    @PostMapping("/crearReciboEquipos")
    public ResponseEntity<?> crearIngreso(@Valid @RequestBody RegistroTotalDTO dto) {
        ResponseEntity.ok(service.guardarUsuariosYRecibos(dto));
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/buscarReciboEquipos/{fmo}")
    public ResponseEntity<?> obtenerDatosPorFmo(@PathVariable String fmo) {
        
        return ResponseEntity.ok(service.buscarPorFmo(fmo));
    }

    @GetMapping("/buscarReciboEquipos")
    public ResponseEntity<?> listarReciboDeEquipos() {
        
        return ResponseEntity.ok(service.listarTodoReciboDeEquipos());
    }

    @GetMapping("/buscarReciboEquipos/fecha/{fecha}")
    public ResponseEntity<?> listarReciboDeEquiposPorFecha(@PathVariable String fecha) {
        
        return ResponseEntity.ok(service.listarReciboDeEquiposPorFecha(fecha));
    }

    @GetMapping("/buscarReciboEquipos/rangoFechas/{fechaInicio}/{fechaFin}")
    public ResponseEntity<?> listarReciboDeEquiposPorRangoFechas(@PathVariable String fechaInicio, @PathVariable String fechaFin) {
        
        return ResponseEntity.ok(service.listarReciboDeEquiposPorRangoFechas(fechaInicio, fechaFin));
    }
    @PatchMapping("reciboDeEquipos/{id}/estatus")
    public ResponseEntity<BusquedaCompletaDTO> actualizarEstatus(@PathVariable Long id,@RequestBody ActualizarEstatusDTO dto) {
        try {
            BusquedaCompletaDTO resultado = service.actualizarEstatusRecibo(id, dto.getEstatus());
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}
