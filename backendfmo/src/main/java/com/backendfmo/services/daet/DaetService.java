package com.backendfmo.services.daet;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.request.entregasdaet.ComponenteDaetDTO;
import com.backendfmo.dtos.request.entregasdaet.EntregaItemDTO;
import com.backendfmo.dtos.request.entregasdaet.RegistroDaetDTO;
import com.backendfmo.dtos.response.entregasdaet.BusquedaDaetDTO;
import com.backendfmo.dtos.response.entregasdaet.ComponenteInternoResumenDTO;
import com.backendfmo.models.daet.ComponenteInternoCpuDaet;
import com.backendfmo.models.daet.EntregasAlDAET;
import com.backendfmo.models.perifericos.Periferico;
import com.backendfmo.models.reciboequipos.ComponenteInterno;
import com.backendfmo.models.reciboequipos.EncabezadoRecibo;
import com.backendfmo.models.reciboequipos.Usuario;
import com.backendfmo.repository.ComponenteInternoRepository;
import com.backendfmo.repository.EntregasAlDAETRepository;
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
    @Autowired
    private EntregasAlDAETRepository entregasRepository;

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
                    .orElseThrow(() -> new RuntimeException("Periférico no encontrado ID: " + entregaDto.getIdPeriferico()));

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



@Transactional(readOnly = true)
public List<BusquedaDaetDTO> buscarPorSerialDaet(String serial) {
    
    // 1. Buscar en BD (Ahora recibimos una lista)
    List<EntregasAlDAET> entregasEncontradas = entregasRepository.findByFmoSerial(serial);

    // Validación opcional: Si la lista está vacía, lanzamos error o devolvemos lista vacía
    if (entregasEncontradas.isEmpty()) {
        throw new RuntimeException("No se encontraron registros con el Serial: " + serial);
    }

    // 2. Preparamos la lista de respuesta
    List<BusquedaDaetDTO> listaRespuesta = new ArrayList<>();

    // 3. Iteramos sobre cada registro encontrado para convertirlo a DTO
    for (EntregasAlDAET entrega : entregasEncontradas) {
        BusquedaDaetDTO dto = new BusquedaDaetDTO();

        // --- Mapeo Datos Entrega ---
        dto.setFmoSerial(entrega.getFmoSerial());
        dto.setActividad(entrega.getActividad());
        dto.setEstado(entrega.getEstado());
        dto.setIdentifique(entrega.getIdentifique());
        dto.setTipoPeriferico(entrega.getPerifericoRef().getNombre());

        // --- Mapeo Datos Encabezado ---
        EncabezadoRecibo encabezado = entrega.getEncabezadoRelacion();
        dto.setFmoEquipoLote(encabezado.getFmoEquipo());
        dto.setSolicitudDAET(encabezado.getSolicitudDAET());
        dto.setEstatusEncabezado(encabezado.getEstatus());
        dto.setFecha(encabezado.getFecha());
        dto.setObservacion(encabezado.getObservacion());

        // --- Mapeo Componentes Internos ---
        List<ComponenteInternoResumenDTO> listaComponentes = new ArrayList<>();
        if (entrega.getComponentesInternos() != null) {
            for (ComponenteInternoCpuDaet comp : entrega.getComponentesInternos()) {
                ComponenteInternoResumenDTO dtoComp = new ComponenteInternoResumenDTO();
                dtoComp.setCantidad(comp.getCantidad());
                dtoComp.setNombreComponente(comp.getComponenteRef().getNombre());
                listaComponentes.add(dtoComp);
            }
        }
        dto.setComponentesInternos(listaComponentes);

        // Agregamos el DTO ya lleno a la lista final
        listaRespuesta.add(dto);
    }

    return listaRespuesta;
}
}
