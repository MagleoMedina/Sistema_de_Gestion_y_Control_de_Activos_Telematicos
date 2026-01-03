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


// MÉTODO AUXILIAR (Privado para uso interno del servicio)
private BusquedaDaetDTO convertirEntidadADTO(EntregasAlDAET entrega) {
    BusquedaDaetDTO dto = new BusquedaDaetDTO();

    // --- A. MAPEO DE DATOS DE LA ENTREGA ---
    dto.setFmoSerial(entrega.getFmoSerial());
    dto.setActividad(entrega.getActividad());
    dto.setEstado(entrega.getEstado());
    dto.setIdentifique(entrega.getIdentifique());

    if (entrega.getPerifericoRef() != null) {
         dto.setTipoPeriferico(entrega.getPerifericoRef().getNombre());
    }

    Usuario nuevoUsuario = entrega.getEncabezadoRelacion().getUsuarioRelacion();
    if (nuevoUsuario != null) {
        dto.setFicha(nuevoUsuario.getFicha());
    }

    // --- B. MAPEO DE DATOS DEL ENCABEZADO ---
    EncabezadoRecibo encabezado = entrega.getEncabezadoRelacion();
    if (encabezado != null) {
        dto.setFmoEquipoLote(encabezado.getFmoEquipo());
        dto.setSolicitudDAET(encabezado.getSolicitudDAET());
        dto.setSolicitudST(encabezado.getSolicitudST());
        dto.setEstatus(encabezado.getEstatus());
        dto.setFecha(encabezado.getFecha());
        dto.setObservacion(encabezado.getObservacion());
        dto.setAsignadoA(encabezado.getAsignadoA());
        dto.setRecibidoPor(encabezado.getRecibidoPor());
    }

    // --- C. MAPEO: LISTA DE COMPONENTES INTERNOS ---
    List<ComponenteInternoResumenDTO> listaHijos = new ArrayList<>();
    if (entrega.getComponentesInternos() != null && !entrega.getComponentesInternos().isEmpty()) {
        for (ComponenteInternoCpuDaet comp : entrega.getComponentesInternos()) {
            ComponenteInternoResumenDTO dtoComp = new ComponenteInternoResumenDTO();
            dtoComp.setCantidad(comp.getCantidad());
            if (comp.getComponenteRef() != null) {
                dtoComp.setNombreComponente(comp.getComponenteRef().getNombre());
            }
            listaHijos.add(dtoComp);
        }
    }
    dto.setComponentesInternos(listaHijos);

    // --- D. MAPEO: COMPONENTE ÚNICO ---
    List<ComponenteInternoResumenDTO> listaUnico = new ArrayList<>();
    if (entrega.getComponenteDirectoRef() != null) {
        ComponenteInternoResumenDTO dtoUnico = new ComponenteInternoResumenDTO();
        dtoUnico.setCantidad(1); 
        dtoUnico.setNombreComponente(entrega.getComponenteDirectoRef().getNombre());
        listaUnico.add(dtoUnico);
    }
    dto.setComponenteUnico(listaUnico.isEmpty() ? null : listaUnico);

    return dto;
}

@Transactional(readOnly = true)
public List<BusquedaDaetDTO> listarTodoDAET() {
    // 1. Buscar TODOS en la BD
    List<EntregasAlDAET> todasLasEntregas = entregasRepository.findAll();

    // 2. Preparar lista de respuesta
    List<BusquedaDaetDTO> respuesta = new ArrayList<>();

    // 3. Convertir usando el método auxiliar
    for (EntregasAlDAET entrega : todasLasEntregas) {
        // REUTILIZACIÓN DE LÓGICA AQUÍ:
        respuesta.add(convertirEntidadADTO(entrega));
    }

    return respuesta;
}

@Transactional(readOnly = true)
public List<BusquedaDaetDTO> buscarPorSerialDaet(String serial) {
    
    List<EntregasAlDAET> entregasEncontradas = entregasRepository.findByFmoSerial(serial);

    if (entregasEncontradas.isEmpty()) {
        throw new RuntimeException("No se encontraron registros con el Serial: " + serial);
    }

    List<BusquedaDaetDTO> respuesta = new ArrayList<>();

    for (EntregasAlDAET entrega : entregasEncontradas) {
        // REUTILIZACIÓN DE LÓGICA AQUÍ TAMBIÉN:
        respuesta.add(convertirEntidadADTO(entrega));
    }

    return respuesta;
}
@Transactional(readOnly = true)
    public List<BusquedaDaetDTO> buscarPorFecha(String fecha) {
        
        // 1. Buscamos en BD usando el repositorio
        List<EntregasAlDAET> entregasEncontradas = entregasRepository.findByFechaEncabezado(fecha);

        if (entregasEncontradas.isEmpty()) {
            throw new RuntimeException("No se encontraron registros para la fecha: " + fecha);
        }

        List<BusquedaDaetDTO> respuesta = new ArrayList<>();

        // 2. Convertimos cada entidad encontrada a DTO
        for (EntregasAlDAET entrega : entregasEncontradas) {
            respuesta.add(convertirEntidadADTO(entrega));
        }

        return respuesta;
    }
    @Transactional(readOnly = true)
    public List<BusquedaDaetDTO> buscarPorFmoEquipo(String fmoEquipo) {
        
        // 1. Buscamos en BD usando el repositorio
        List<EntregasAlDAET> entregasEncontradas = entregasRepository.findByFmoEquipo(fmoEquipo);

        if (entregasEncontradas.isEmpty()) {
            throw new RuntimeException("No se encontraron registros para el FMO Equipo: " + fmoEquipo);
        }

        List<BusquedaDaetDTO> respuesta = new ArrayList<>();

        // 2. Convertimos cada entidad encontrada a DTO
        for (EntregasAlDAET entrega : entregasEncontradas) {
            respuesta.add(convertirEntidadADTO(entrega));
        }

        return respuesta;
    }

    @Transactional(readOnly = true  )

    public List<BusquedaDaetDTO> listarPorRangoDeFechas(String fechaInicio, String fechaFin) {
        
        // 1. Buscar en BD usando el repositorio
        List<EntregasAlDAET> entregasEncontradas = entregasRepository.findByFechaEncabezadoBetween(fechaInicio, fechaFin);

        if (entregasEncontradas.isEmpty()) {
            throw new RuntimeException("No se encontraron registros entre las fechas: " + fechaInicio + " y " + fechaFin);
        }

        List<BusquedaDaetDTO> respuesta = new ArrayList<>();

        // 2. Convertir cada entidad encontrada a DTO
        for (EntregasAlDAET entrega : entregasEncontradas) {
            respuesta.add(convertirEntidadADTO(entrega));
        }

        return respuesta;
    }
@Transactional
    public Usuario registrarEntregasDaet(RegistroDaetDTO dto) {
        // 1. Crear Usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setFicha(dto.getFicha());
      
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


        if (dto.getEntregas() != null) {
            for (EntregaItemDTO entregaDto : dto.getEntregas()) {
                
                EntregasAlDAET entrega = new EntregasAlDAET();
                entrega.setActividad(entregaDto.getActividad());
                entrega.setFmoSerial(entregaDto.getFmoSerial());
                entrega.setEstado(entregaDto.getEstado());
                entrega.setIdentifique(entregaDto.getIdentifique());

                // CASO A: Es un EQUIPO/PERIFÉRICO (Tiene ID en perifericos)
                if (entregaDto.getIdPeriferico() != null) {
                    Periferico perifBase = perifericoRepository.findById(entregaDto.getIdPeriferico())
                        .orElseThrow(() -> new RuntimeException("Periférico no encontrado"));
                    entrega.setPerifericoRef(perifBase);
                }

                // CASO B: Es un COMPONENTE SUELTO (Componente Único)
                // Guardamos directamente en la columna 'componentes_computadora_internos'
                if (entregaDto.getComponenteUnico() != null && !entregaDto.getComponenteUnico().isEmpty()) {
                    // Tomamos el primero de la lista (ya que es único)
                    ComponenteDaetDTO compDto = entregaDto.getComponenteUnico().get(0);
                    
                    ComponenteInterno compRef = componenteRepository.findById(compDto.getIdComponente())
                        .orElseThrow(() -> new RuntimeException("Componente no encontrado"));

                    // ¡AQUÍ ESTÁ LA MAGIA! Guardamos directo en la tabla padre
                    entrega.setComponenteDirectoRef(compRef); 
                }

                // CASO C: Es un CPU con HIJOS (Componentes Internos)
                // Esto sigue guardando en la tabla intermedia de detalle
                if (entregaDto.getComponentesInternos() != null) {
                    for (ComponenteDaetDTO compDto : entregaDto.getComponentesInternos()) {
                        ComponenteInterno compInternoRef = componenteRepository.findById(compDto.getIdComponente())
                            .orElseThrow(() -> new RuntimeException("Componente Interno no encontrado"));

                        ComponenteInternoCpuDaet relacionInterna = new ComponenteInternoCpuDaet();
                        relacionInterna.setCantidad(compDto.getCantidad());
                        relacionInterna.setComponenteRef(compInternoRef);
                        
                        entrega.agregarComponenteInterno(relacionInterna);
                    }
                }

                encabezado.agregarEntregaDaet(entrega);
            }
        }

        // 4. Vincular y Guardar
        nuevoUsuario.agregarRecibo(encabezado);
        return usuarioRepository.save(nuevoUsuario);
    }
}
