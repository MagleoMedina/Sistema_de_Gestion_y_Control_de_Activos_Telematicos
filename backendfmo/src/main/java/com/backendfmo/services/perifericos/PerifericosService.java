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
        nuevoUsuario.setFicha(dto.getFicha());
        nuevoUsuario.setExtension(dto.getExtension());

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
        encabezado.setFalla(dto.getFalla());

        // Variable de control para saber si ya guardamos algo
        boolean itemProcesado = false;

        // 3. CASO A: PROCESAR COMPONENTES (Dropdown)
        if (dto.getComponentePerifericos() != null && !dto.getComponentePerifericos().isEmpty()) {
            for (ComponenteItemDTO itemDto : dto.getComponentePerifericos()) {
                
                // Buscar componente existente
                ComponenteInterno componenteBD = componenteRepository.findById(itemDto.getIdComponente())
                    .orElseThrow(() -> new RuntimeException("Componente no encontrado con ID: " + itemDto.getIdComponente()));

                // Crear nueva entidad por cada ítem
                ReciboDePerifericos itemRecibo = new ReciboDePerifericos();
                
                itemRecibo.setComponenteRef(componenteBD);
                itemRecibo.setFmoSerial(dto.getFmoSerial()); // Serial General
                
                // Si tienes columna 'otro' en la tabla, puedes dejarla null o vacía aquí
                // itemRecibo.setOtro(null); 

                encabezado.agregarPeriferico(itemRecibo);
            }
            itemProcesado = true;
        }

        // 4. CASO B: PROCESAR PERIFÉRICOS (Checkboxes)
        // Solo entra aquí si la lista no es nula y tiene elementos
        if (dto.getPerifericos() != null && !dto.getPerifericos().isEmpty()) {
            for (PerifericoDTO perifDto : dto.getPerifericos()) {

                // Buscar en catálogo
                Periferico perifericoCatalogo = perifericoCatalogoRepository.findById(perifDto.getId())
                     .orElseThrow(() -> new RuntimeException("Periférico no encontrado con ID: " + perifDto.getId()));

                ReciboDePerifericos itemRecibo = new ReciboDePerifericos();
                
                itemRecibo.setPerifericoRef(perifericoCatalogo);
                itemRecibo.setFmoSerial(dto.getFmoSerial()); // Serial General
                
                encabezado.agregarPeriferico(itemRecibo);
            }
            itemProcesado = true;
        }

        // 5. CASO C: PROCESAR "OTRO" (Solo Texto)
        // Si no se procesaron componentes ni periféricos, Y hay texto en 'otro'
        if (!itemProcesado && dto.getOtro() != null && !dto.getOtro().trim().isEmpty()) {
            
            ReciboDePerifericos itemRecibo = new ReciboDePerifericos();
            
            itemRecibo.setFmoSerial(dto.getFmoSerial());
            itemRecibo.setOtro(dto.getOtro()); // Guardamos el texto manual
            
            // ComponenteRef y PerifericoRef quedarán en NULL, lo cual es correcto para "Otros"
            
            encabezado.agregarPeriferico(itemRecibo);
        }

        // 6. VINCULAR Encabezado al Usuario
        nuevoUsuario.agregarRecibo(encabezado);

        // 7. GUARDAR
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

        public List<ReciboPerifericosDTO> buscarPorFecha(String fecha) {
        
        // 1. Buscar TODOS los registros que coincidan con el serial
        List<ReciboDePerifericos> resultados = perifericoRepository.findByFechaEncabezado(fecha);

        if (resultados.isEmpty()) {
            throw new RuntimeException("No se encontró ningún recibo con la fecha: " + fecha);
        }

        // 2. Convertir cada resultado encontrado en un DTO
        return resultados.stream()
            .map(this::convertirADTO) // Llamamos a un método auxiliar para limpiar el código
            .collect(Collectors.toList());
    }

@Transactional(readOnly = true)
    public List<ReciboPerifericosDTO> listarTodoReciboPerifericos() {
        
        // 1. Buscar TODOS los registros que coincidan con el serial
        List<ReciboDePerifericos> resultados = perifericoRepository.findAll();

        if (resultados.isEmpty()) {
            throw new RuntimeException("No se encontraron registros de periféricos.");
        }

        // 2. Convertir cada resultado encontrado en un DTO
        return resultados.stream()
            .map(this::convertirADTO) // Llamamos a un método auxiliar para limpiar el código
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReciboPerifericosDTO> listarPorRangoDeFechas(String fechaInicio, String fechaFinalizacion){
        
        // 1. Buscar TODOS los registros que coincidan con el serial
        List<ReciboDePerifericos> resultados = perifericoRepository.findByFechaEncabezadoBetween(fechaInicio, fechaFinalizacion);

        if (resultados.isEmpty()) {
            throw new RuntimeException("No se encontraron registros de periféricos con esa fecha.");
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
            response.setNombre(usuario.getNombre());
            response.setFicha(usuario.getFicha()); 
            response.setUsuario(usuario.getUsuario());
            response.setExtension(usuario.getExtension());
            response.setGerencia(usuario.getGerencia());
            
        }
        
        // Mapear Datos del Encabezado
        response.setSolicitudST(encabezado.getSolicitudST());
        response.setSolicitudDAET(encabezado.getSolicitudDAET());
        response.setEstatus(encabezado.getEstatus());
        response.setFecha(encabezado.getFecha()); 
        response.setAsignadoA(encabezado.getAsignadoA());
        response.setRecibidoPor(encabezado.getRecibidoPor());
        response.setEntregadoPor(encabezado.getEntregadoPor());
        response.setFalla(encabezado.getFalla());
        response.setFmoEquipo(encabezado.getFmoEquipo());
        

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
