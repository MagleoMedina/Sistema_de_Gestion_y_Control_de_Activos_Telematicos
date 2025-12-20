package com.backendfmo.services.perifericos;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.request.reciboperifericos.ComponenteItemDTO;
import com.backendfmo.dtos.request.reciboperifericos.RegistroPerifericosDTO;
import com.backendfmo.dtos.response.reciboperifericos.ComponenteItemResponseDTO;
import com.backendfmo.dtos.response.reciboperifericos.PerifericoResponseDTO;
import com.backendfmo.dtos.request.reciboperifericos.PerifericoDTO;
import com.backendfmo.dtos.response.reciboperifericos.ReciboPerifericosDTO;
import com.backendfmo.models.perifericos.Periferico;
import com.backendfmo.models.perifericos.ReciboDePerifericos;
import com.backendfmo.models.reciboequipos.ComponenteInterno;
import com.backendfmo.models.reciboequipos.EncabezadoRecibo;
import com.backendfmo.models.reciboequipos.Usuario;
import com.backendfmo.repository.ComponenteInternoRepository;
import com.backendfmo.repository.PerifericoRepository;
import com.backendfmo.repository.ReciboDePerifericosRepository;
import com.backendfmo.repository.UsuarioRepository;

@Service
public class PerifericosService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ComponenteInternoRepository componenteRepository;

    @Autowired
    private ReciboDePerifericosRepository perifericoRepository;

    @Autowired
    private PerifericoRepository perifericoCatalogoRepository;

    @Transactional
    public Usuario registrarPerifericos(RegistroPerifericosDTO dto) {
        // 1. Crear Usuario (Abuelo)
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsuario(dto.getUsuario());
        nuevoUsuario.setGerencia(dto.getGerencia());
        nuevoUsuario.setNombre(dto.getNombre());
        nuevoUsuario.setFicha(dto.getFicha());

        // 2. Crear Encabezado (Padre)
        EncabezadoRecibo encabezado = new EncabezadoRecibo();
        encabezado.setFmoEquipo(dto.getFmoEquipo());
        encabezado.setSolicitudST(dto.getSolicitudST());


        encabezado.setSolicitudDAET(dto.getSolicitudDAET());
        encabezado.setEntregadoPor(dto.getEntregadoPor());
        encabezado.setRecibidoPor(dto.getRecibidoPor());
        encabezado.setAsignadoA(dto.getAsignadoA());
        
        encabezado.setEstatus(dto.getEstatus());
        encabezado.setFecha(dto.getFecha());
        encabezado.setObservacion(dto.getObservacion());
        encabezado.setFalla(dto.getFalla());
        
        ReciboDePerifericos periferico = new ReciboDePerifericos();
        // 3. Procesar COMPONENTES (Hijos)
        if (dto.getComponentePerifericos() != null) {
            for (ComponenteItemDTO itemDto : dto.getComponentePerifericos()) {
                
                // A. BUSCAR componente existente en BD (Validación)
                ComponenteInterno componenteBD = componenteRepository.findById(itemDto.getIdComponente())
                    .orElseThrow(() -> new RuntimeException("Componente no encontrado con ID: " + itemDto.getIdComponente()));

                // B. CREAR la entidad del periférico
                
                periferico.setComponenteRef(componenteBD); // Asignamos la referencia encontrada
                periferico.setOtro(dto.getOtro());
                // C. VINCULAR al Encabezado
                encabezado.agregarPeriferico(periferico);
            }
        }
        //PROCESAR PERIFÉRICOS (Hijos)
        if (dto.getPerifericos() != null) {
            for (PerifericoDTO perifDto : dto.getPerifericos()) {

                // A. BUSCAR en el catálogo de Perifericos
                Periferico perifericoCatalogo = perifericoCatalogoRepository.findById(perifDto.getId())
                     .orElseThrow(() -> new RuntimeException("Periférico no encontrado con ID: " + perifDto.getId()));

                // B. CREAR la entidad del recibo
                ReciboDePerifericos reciboItem = new ReciboDePerifericos();
                
                // OJO: Aquí no hay serial en el DTO para estos items, solo ID. 
                // Si requieres serial para monitor/teclado, deberías agregarlo a PerifericoDTO.
                
                reciboItem.setPerifericoRef(perifericoCatalogo); // Relación con Periferico
                //reciboItem.setOtro(dto.getOtro()); // Asignamos el campo 'otro' global también aquí
               // reciboItem.setFmoSerial(dto.getFmoSerial());
                // C. VINCULAR al Encabezado
                encabezado.agregarPeriferico(reciboItem);
            }
        }

        // 4. VINCULAR Encabezado al Usuario
        nuevoUsuario.agregarRecibo(encabezado);

        //Seteamos el fmo serial del periférico que se vaya a registrar
        periferico.setFmoSerial(dto.getFmoSerial());
        // 5. GUARDAR (Cascada: Usuario -> Encabezado -> Perifericos)
        return usuarioRepository.save(nuevoUsuario);
    }

@Transactional(readOnly = true)
    public List<ReciboPerifericosDTO> buscarPorSerial(String fmoSerial) {
        
        // 1. Buscar TODOS los registros que coincidan con el serial
        List<ReciboDePerifericos> resultados = perifericoRepository.findByFmoSerial(fmoSerial);

        if (resultados.isEmpty()) {
            throw new RuntimeException("No se encontró ningún componente con el serial: " + fmoSerial);
        }

        // 2. Convertir cada resultado encontrado en un DTO
        return resultados.stream()
            .map(this::convertirADTO) // Llamamos a un método auxiliar para limpiar el código
            .collect(Collectors.toList());
    }

// Método auxiliar corregido
    private ReciboPerifericosDTO convertirADTO(ReciboDePerifericos perifericoHijo) {
        ReciboPerifericosDTO response = new ReciboPerifericosDTO();
        
        // Obtener Padre (Encabezado)
        EncabezadoRecibo encabezado = perifericoHijo.getEncabezadoRelacion();
        if (encabezado == null) return response; 

        // Obtener Abuelo (Usuario)
        Usuario usuario = encabezado.getUsuarioRelacion(); 

        // Mapear Datos del Usuario
        if (usuario != null) {
            // Asumiendo que el DTO tiene estos campos
            // response.setUsuario(usuario.getUsuario()); 
            response.setNombre(usuario.getNombre());
            response.setFicha(usuario.getFicha()); 
            response.setUsuario(usuario.getUsuario());
        }
        
        // Mapear Datos del Encabezado
        response.setSolicitudST(encabezado.getSolicitudST());
        response.setSolicitudDAET(encabezado.getSolicitudDAET());
        response.setEstatus(encabezado.getEstatus());
        response.setFecha(encabezado.getFecha()); 
        response.setObservacion(encabezado.getObservacion());
        response.setAsignadoA(encabezado.getAsignadoA());
        response.setRecibidoPor(encabezado.getRecibidoPor());
        response.setEntregadoPor(encabezado.getEntregadoPor());
        response.setFalla(encabezado.getFalla());

        List<ComponenteItemResponseDTO> listaComponentes = new ArrayList<>();
        List<PerifericoResponseDTO> listaCatalogo = new ArrayList<>();
        
        if (encabezado.getPerifericos() != null) { 
            for (ReciboDePerifericos item : encabezado.getPerifericos()) {
                
                // CASO A: Es un Componente Interno (Disco, RAM, etc.)
                if (item.getComponenteRef() != null) {
                    ComponenteItemResponseDTO itemDto = new ComponenteItemResponseDTO();
                    itemDto.setIdComponente(item.getComponenteRef().getId());
                    listaComponentes.add(itemDto);
                } 
                
                // CASO B: Es un Periférico de Catálogo (Monitor, Teclado, etc.)
                else if (item.getPerifericoRef() != null) {
                    PerifericoResponseDTO perDto = new PerifericoResponseDTO();
                    perDto.setId(item.getPerifericoRef().getId());
                    // Opcional: perDto.setNombre(item.getPerifericoRef().getNombre());
                    listaCatalogo.add(perDto);
                }
            }
        }
        
        // Asignamos las dos listas por separado
        response.setComponentePerifericos(listaComponentes);
        response.setPerifericos(listaCatalogo);
        
        response.setFmoSerial(perifericoHijo.getFmoSerial());
        response.setOtro(perifericoHijo.getOtro());

        return response;

    }
}
