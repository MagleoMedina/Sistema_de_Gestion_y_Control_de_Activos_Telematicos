package com.backendfmo.services.perifericos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.request.reciboperifericos.PerifericoItemDTO;
import com.backendfmo.dtos.request.reciboperifericos.RegistroPerifericosDTO;
import com.backendfmo.dtos.response.reciboperifericos.ReciboPerifericosDTO;
import com.backendfmo.models.perifericos.Periferico;
import com.backendfmo.models.perifericos.ReciboDePerifericos;
import com.backendfmo.models.reciboequipos.ComponenteInterno;
import com.backendfmo.models.reciboequipos.EncabezadoRecibo;
import com.backendfmo.models.reciboequipos.ReciboPeriferico;
import com.backendfmo.models.reciboequipos.Usuario;
import com.backendfmo.repository.ComponenteInternoRepository;
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

        // 3. Procesar Periféricos (Hijos)
        if (dto.getItemsPerifericos() != null) {
            for (PerifericoItemDTO itemDto : dto.getItemsPerifericos()) {
                
                // A. BUSCAR componente existente en BD (Validación)
                ComponenteInterno componenteBD = componenteRepository.findById(itemDto.getIdComponente())
                    .orElseThrow(() -> new RuntimeException("Componente no encontrado con ID: " + itemDto.getIdComponente()));

                // B. CREAR la entidad del periférico
                ReciboDePerifericos periferico = new ReciboDePerifericos();
                periferico.setFmoSerial(itemDto.getFmoSerial());
                periferico.setComponenteRef(componenteBD); // Asignamos la referencia encontrada

                // C. VINCULAR al Encabezado
                encabezado.agregarPeriferico(periferico);
            }
        }

        // 4. VINCULAR Encabezado al Usuario
        nuevoUsuario.agregarRecibo(encabezado);

        // 5. GUARDAR (Cascada: Usuario -> Encabezado -> Perifericos)
        return usuarioRepository.save(nuevoUsuario);
    }


@Transactional(readOnly = true) // Optimiza la velocidad de lectura
public ReciboPerifericosDTO buscarPorSerial(String serial) {
    
    // 1. Buscamos el registro específico en la tabla recibo_de_perifericos
    ReciboDePerifericos periferico = perifericoRepository.findByFmoSerial(serial)
            .orElseThrow(() -> new RuntimeException("No se encontró ningún periférico con el Serial: " + serial));

    // 2. Extraemos las entidades relacionadas (Navegación hacia arriba)
    EncabezadoRecibo encabezado = periferico.getEncabezadoRelacion();
    Usuario usuario = encabezado.getUsuarioRelacion();

    // 3. Mapeamos a DTO (Llenamos el objeto de respuesta)
    ReciboPerifericosDTO respuesta = new ReciboPerifericosDTO();

    // Datos del ítem
    respuesta.setFmoSerial(periferico.getFmoSerial());
    respuesta.setTipoComponente(periferico.getComponenteRef().getNombre()); // Join con tabla componentes

    // Datos del Encabezado
   // respuesta.setFmoEquipoLote(encabezado.getFmoEquipo());
    respuesta.setSolicitudST(encabezado.getSolicitudST());
    respuesta.setEstatus(encabezado.getEstatus());
    respuesta.setFecha(encabezado.getFecha());
    respuesta.setObservacion(encabezado.getObservacion());
    respuesta.setSolicitudDAET(encabezado.getSolicitudDAET());
    respuesta.setEntregadoPor(encabezado.getEntregadoPor());
    respuesta.setRecibidoPor(encabezado.getRecibidoPor());
    respuesta.setAsignadoA(encabezado.getAsignadoA());

    // Datos del Usuario
    respuesta.setNombre(usuario.getNombre());
    respuesta.setFicha(usuario.getFicha());
    respuesta.setUsuarioGerencia(usuario.getGerencia());

    return respuesta;
}
}
