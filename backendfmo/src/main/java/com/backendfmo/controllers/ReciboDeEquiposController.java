package com.backendfmo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backendfmo.dtos.request.reciboequipos.ActualizarEstatusDTO;
import com.backendfmo.dtos.request.reciboequipos.RegistroTotalDTO;
import com.backendfmo.dtos.response.reciboequipos.BusquedaCompletaDTO;
import com.backendfmo.services.ReciboDeEquiposServiceImpl;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
public class ReciboDeEquiposController {

    @Autowired
    private ReciboDeEquiposServiceImpl service;


    @PostMapping("/crearReciboEquipos")
    public ResponseEntity<?> crearIngreso(@Valid @RequestBody RegistroTotalDTO dto) {
       try {
        return ResponseEntity.status(201).body(service.guardarUsuariosYRecibos(dto));
       } catch (Exception e) {
        return ResponseEntity.status(500).body(e.getMessage());
       } 
        
    }

    @GetMapping("/buscarReciboEquipos/{fmo}")
    public ResponseEntity<?> obtenerDatosPorFmo(@Valid @PathVariable String fmo) {
        try {
            return ResponseEntity.status(202).body(service.buscarPorFmo(fmo));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }catch(Exception e){
            return ResponseEntity.internalServerError().build();

        }

    }

    @GetMapping("/buscarReciboEquipos")
    public ResponseEntity<?> listarReciboDeEquipos() {
        try {
           return ResponseEntity.status(202).body(service.listarTodoReciboDeEquipos());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
        
    }

    @GetMapping("/buscarReciboEquipos/fecha/{fecha}")
    public ResponseEntity<?> listarReciboDeEquiposPorFecha(@Valid @PathVariable String fecha) {
        try {
            return ResponseEntity.status(202).body(service.listarReciboDeEquiposPorFecha(fecha));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/buscarReciboEquipos/rangoFechas/{fechaInicio}/{fechaFin}")
    public ResponseEntity<?> listarReciboDeEquiposPorRangoFechas(@Valid @PathVariable String fechaInicio,@Valid @PathVariable String fechaFin) {
        try {
            return ResponseEntity.status(202).body(service.listarReciboDeEquiposPorRangoFechas(fechaInicio, fechaFin));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }catch(Exception e){
            return ResponseEntity.internalServerError().build();
        }
      
    }

    @PatchMapping("reciboDeEquipos/{id}/estatus")
    public ResponseEntity<?> actualizarEstatus(@PathVariable Long id,@RequestBody ActualizarEstatusDTO dto) {
        try {
            BusquedaCompletaDTO resultado = service.actualizarEstatusRecibo(id, dto.getEstatus());
            return ResponseEntity.status(202).body(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/borrarReciboEquipo/{id}")
    public ResponseEntity<?> eliminarRecibo(@PathVariable Long id) {
        try {
            service.eliminarReciboPorId(id);
            return ResponseEntity.status(204).body("Registro eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar");
        }
    }

}
