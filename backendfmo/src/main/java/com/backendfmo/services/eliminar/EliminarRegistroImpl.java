package com.backendfmo.services.eliminar;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backendfmo.repository.EncabezadoReciboRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EliminarRegistroImpl {

    @Autowired private EncabezadoReciboRepository encabezadoRepository;
    
    @Transactional // IMPORTANTE: Mantiene la operación atómica
    public void eliminarReciboPorId(Long id) {
        // Verificamos si existe antes de borrar
        if (!encabezadoRepository.existsById(id)) {
            throw new RuntimeException("El recibo con ID " + id + " no existe.");
        }
        
        // Al ejecutar esto, JPA busca la lista de equipos, perifericos, etc.,
        // y lanza los DELETE correspondientes automáticamente.
        encabezadoRepository.deleteById(id);
    }
}
