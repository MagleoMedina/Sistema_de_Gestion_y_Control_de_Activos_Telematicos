package com.backendfmo.services.daet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.request.entregasdaet.ComponenteDaetDTO;
import com.backendfmo.dtos.request.entregasdaet.EntregaItemDTO;
import com.backendfmo.dtos.request.entregasdaet.RegistroDaetDTO;
import com.backendfmo.models.ComponenteInterno;
import com.backendfmo.models.ComponenteInternoCpuDaet;
import com.backendfmo.models.EncabezadoRecibo;
import com.backendfmo.models.EntregasAlDAET;
import com.backendfmo.models.Periferico;
import com.backendfmo.models.Usuario;
import com.backendfmo.repository.ComponenteInternoRepository;
import com.backendfmo.repository.PerifericoRepository;
import com.backendfmo.repository.UsuarioRepository;


@Service
public class DaetService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PerifericoRepository perifericoRepository; // Para buscar "CPU", "Impresora"
    @Autowired
    private ComponenteInternoRepository componenteRepository; // Para buscar "RAM", "Disco"

    @Transactional
    public Usuario registrarEntregasDaet(RegistroDaetDTO dto) {
        // 1. Crear Usuario
        Usuario nuevoUsuario = new Usuario();
      
        // 2. Crear Encabezado
        EncabezadoRecibo encabezado = new EncabezadoRecibo();
        encabezado.setFmoEquipo(dto.getFmoEquipo());
        encabezado.setSolicitudDAET(dto.getSolicitudDAET());
        encabezado.setSolicitudST(dto.getSolicitudST());
        encabezado.setEstatus(dto.getEstatus());
        encabezado.setFecha(dto.getFecha());
        encabezado.setObservacion(dto.getObservacion());
        encabezado.setAsignadoA(dto.getAsignadoA());
        encabezado.setRecibidoPor(dto.getRecibidoPor());


        // 3. Procesar Entregas (Nivel intermedio)
        if (dto.getEntregas() != null) {
            for (EntregaItemDTO entregaDto : dto.getEntregas()) {
                
                // A. Buscar el Periférico Base (Ej: CPU)
                Periferico perifBase = perifericoRepository.findById(entregaDto.getIdPeriferico())
                    .orElseThrow(() -> new RuntimeException("Periférico no encontrado ID: " + entregaDto.getIdPeriferico());

                // B. Crear la Entrega
                EntregasAlDAET entrega = new EntregasAlDAET();
                entrega.setActividad(entregaDto.getActividad());
                entrega.setFmoSerial(entregaDto.getFmoSerial());
                entrega.setEstado(entregaDto.getEstado());
                entrega.setIdentifique(entregaDto.getIdentifique());
                entrega.setPerifericoRef(perifBase); // Asignar referencia

                // C. Procesar Componentes Internos (Nivel más bajo)
                if (entregaDto.getComponentesInternos() != null) {
                    for (ComponenteDaetDTO compDto : entregaDto.getComponentesInternos()) {
                        
                        // Buscar componente interno (Ej: RAM)
                        ComponenteInterno compInternoRef = componenteRepository.findById(compDto.getIdComponente())
                            .orElseThrow(() -> new RuntimeException("Componente Interno no encontrado ID: " + compDto.getIdComponente()));

                        // Crear relación con cantidad
                        ComponenteInternoCpuDaet relacionInterna = new ComponenteInternoCpuDaet();
                        relacionInterna.setCantidad(compDto.getCantidad());
                        relacionInterna.setComponenteRef(compInternoRef);

                        // Vincular a la entrega
                        entrega.agregarComponenteInterno(relacionInterna);
                    }
                }

                // Vincular Entrega al Encabezado
                encabezado.agregarEntregaDaet(entrega);
            }
        }

        // 4. Vincular y Guardar
        nuevoUsuario.agregarRecibo(encabezado);
        return usuarioRepository.save(nuevoUsuario);
    }
}
