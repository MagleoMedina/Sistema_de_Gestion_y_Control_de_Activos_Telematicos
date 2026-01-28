package com.backendfmo.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.request.reciboequipos.*;
import com.backendfmo.dtos.response.reciboequipos.*;
import com.backendfmo.models.perifericos.Periferico;
import com.backendfmo.models.reciboequipos.*;
import com.backendfmo.repository.AplicacionesRepository;
import com.backendfmo.repository.ComponenteInternoRepository;
import com.backendfmo.repository.EncabezadoReciboRepository;
import com.backendfmo.repository.PerifericoRepository;
import com.backendfmo.repository.ReciboDeEquiposRepository;
import com.backendfmo.repository.UsuarioRepository;

@Service
public class ReciboDeEquiposServiceImpl{

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ComponenteInternoRepository componenteRepository;

    @Autowired
    private EncabezadoReciboRepository encabezadoRepository;

    @Autowired
    private AplicacionesRepository aplicacionesRepository;

    @Autowired
    private PerifericoRepository perifericoRepository;

    @Autowired
    private ReciboDeEquiposRepository reciboDeEquiposRepository;

    @Transactional
    public List<BusquedaCompletaDTO> guardarUsuariosYRecibos(RegistroTotalDTO dto) {
        // ... (Creación de Usuario) ...
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsuario(dto.getUsuario());
        nuevoUsuario.setClave(dto.getClave());
        nuevoUsuario.setFicha(dto.getFicha());
        nuevoUsuario.setNombre(dto.getNombre());
        nuevoUsuario.setExtension(dto.getExtension());
        nuevoUsuario.setGerencia(dto.getGerencia());

        if (dto.getRecibos() != null) {
            for (EncabezadoDTO encDto : dto.getRecibos()) {
                EncabezadoRecibo encabezado = new EncabezadoRecibo();
                encabezado.setFmoEquipo(encDto.getFmoEquipo());
                encabezado.setSolicitudDAET(encDto.getSolicitudDAET());
                encabezado.setSolicitudST(encDto.getSolicitudST());
                encabezado.setEntregadoPor(encDto.getEntregadoPor());
                encabezado.setRecibidoPor(encDto.getRecibidoPor());
                encabezado.setAsignadoA(encDto.getAsignadoA());
                encabezado.setEstatus(encDto.getEstatus());
                encabezado.setFalla(encDto.getFalla());
                encabezado.setFecha(encDto.getFecha());
                encabezado.setObservacion(encDto.getObservacion());

                if (encDto.getEquipos() != null) {
                    for (EquipoDTO equipoDto : encDto.getEquipos()) {
                        ReciboDeEquipos equipo = new ReciboDeEquipos();
                        equipo.setMarca(equipoDto.getMarca());
                        equipo.setRespaldo(equipoDto.getRespaldo());

                        // --- BLOQUE 1: CARPETAS (INICIO) ---
                        if (equipoDto.getNombresCarpetas() != null) {
                            for (String nombreCarpeta : equipoDto.getNombresCarpetas()) {
                                CarpetaDeRed nuevaCarpeta = new CarpetaDeRed();
                                nuevaCarpeta.setNombreCarpeta(nombreCarpeta);

                                CarpetaRedRecibo carpetaRedRecibo = new CarpetaRedRecibo();
                                carpetaRedRecibo.setCarpetaRelacion(nuevaCarpeta);

                                equipo.agregarRelacionCarpeta(carpetaRedRecibo);
                            }
                        }
                        // --- BLOQUE 1: CARPETAS (FIN) ---

                        // --- BLOQUE 2: COMPONENTES (INICIO) ---
                        // CORRECCIÓN: Este bloque ahora está AFUERA del bloque de carpetas
                        if (equipoDto.getComponentes() != null) {
                            for (ComponenteDetalleDTO compDto : equipoDto.getComponentes()) {

                                // 1. BUSCAR
                                ComponenteInterno componenteExistente = componenteRepository
                                        .findById(compDto.getIdComponente())
                                        .orElseThrow(() -> new RuntimeException(
                                                "Componente no encontrado ID: " + compDto.getIdComponente()));

                                // 2. VINCULAR
                                ComponenteRecibo link = new ComponenteRecibo();
                                link.setCantidad(compDto.getCantidad());
                                link.setComponenteRef(componenteExistente);

                                // 3. AGREGAR
                                equipo.agregarComponente(link);
                            }
                        }
                        // --- BLOQUE 2: COMPONENTES (FIN) ---

                        // --- BLOQUE 3: SERIALES ESPECÍFICOS (NUEVO) ---
                        if (equipoDto.getSeriales() != null) {
                            String obsParaGuardar = equipoDto.getObservacionSeriales();
                            for (SerialDetalleDTO serialDto : equipoDto.getSeriales()) {

                                // A. BUSCAR EL TIPO EN BD (Catálogo)
                                ComponenteInterno tipoExistente = componenteRepository
                                        .findById(serialDto.getIdTipoComponente())
                                        .orElseThrow(() -> new RuntimeException("Tipo componente no encontrado ID: "
                                                + serialDto.getIdTipoComponente()));

                                // B. CREAR EL COMPONENTE FÍSICO (SerialComponente)
                                SerialComponente fisico = new SerialComponente();
                                fisico.setMarca(serialDto.getMarca());
                                fisico.setSerial(serialDto.getSerial());
                                fisico.setCapacidad(serialDto.getCapacidad());
                                fisico.setComponenteTipo(tipoExistente); // Asignamos el tipo encontrado

                                // C. CREAR LA RELACIÓN (SerialRecibo)
                                SerialRecibo linkSerial = new SerialRecibo();
                                linkSerial.setSerialComponente(fisico); // Gracias al CascadeType.ALL, esto guarda
                                                                        // 'fisico'

                                // Asignamos la observación general a ESTE registro específico
                                linkSerial.setObservacion(obsParaGuardar);
                                // D. VINCULAR AL EQUIPO
                                equipo.agregarSerial(linkSerial);
                            }
                        }
                        // A. PROCESAR LOS IDS (Checkboxes marcados: SAP, Siquel...)
                        if (equipoDto.getIdsAplicaciones() != null) {
                            for (Long idApp : equipoDto.getIdsAplicaciones()) {
                                Aplicaciones appExistente = aplicacionesRepository.findById(idApp)
                                        .orElseThrow(() -> new RuntimeException("App ID no encontrada: " + idApp));

                                AplicacionReciboEquipos linkApp = new AplicacionReciboEquipos();
                                linkApp.setAplicacionRef(appExistente);
                                equipo.agregarAplicacion(linkApp);
                            }
                        }

                        // B. PROCESAR TEXTOS EXTRA (Lo que el usuario escribió: "WinRAR", "Chrome")
                        if (equipoDto.getAplicacionesExtra() != null) {
                            for (String nombreApp : equipoDto.getAplicacionesExtra()) {

                                // Limpieza básica (trim)
                                String nombreLimpio = nombreApp.trim();
                                if (nombreLimpio.isEmpty())
                                    continue;

                                // LÓGICA BUSCAR O CREAR
                                Aplicaciones aplicacionFinal = aplicacionesRepository
                                        .findByNombreIgnoreCase(nombreLimpio)
                                        .orElseGet(() -> {
                                            // Si no existe, la creamos al vuelo
                                            Aplicaciones nueva = new Aplicaciones();
                                            nueva.setNombre(nombreLimpio); // Guardamos tal cual escribió (o
                                                                           // .toUpperCase())
                                            return aplicacionesRepository.save(nueva);
                                        });

                                // Creamos la relación con la app (sea nueva o vieja)
                                AplicacionReciboEquipos linkExtra = new AplicacionReciboEquipos();
                                linkExtra.setAplicacionRef(aplicacionFinal);
                                equipo.agregarAplicacion(linkExtra);
                            }
                        }
                        // --- BLOQUE 5: PERIFÉRICOS (NUEVO) ---
                        if (equipoDto.getIdsPerifericos() != null) {
                            for (Long idPerif : equipoDto.getIdsPerifericos()) {

                                // A. Buscar en el catálogo
                                Periferico perifExistente = perifericoRepository.findById(idPerif)
                                        .orElseThrow(
                                                () -> new RuntimeException("Periférico no encontrado ID: " + idPerif));

                                // B. Crear la relación intermedia
                                ReciboPeriferico relacion = new ReciboPeriferico();
                                relacion.setPerifericoRef(perifExistente);

                                // C. Vincular al equipo
                                equipo.agregarPeriferico(relacion);
                            }
                        }
                        // Finalmente agregamos el equipo al encabezado
                        encabezado.agregarEquipo(equipo);
                    }
                }
                nuevoUsuario.agregarRecibo(encabezado);
            }
        }
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // --- 2. CAMBIO: CONVERSIÓN FINAL A DTO ---
        // En lugar de devolver 'usuarioGuardado', convertimos la respuesta a DTOs planos
        List<BusquedaCompletaDTO> respuesta = new ArrayList<>();
        
        if (usuarioGuardado.getRecibos() != null) {
            for (EncabezadoRecibo recibo : usuarioGuardado.getRecibos()) {
                respuesta.add(convertirEntidadADTO(recibo));
            }
        }
        return respuesta;
    }


    @Transactional(readOnly = true)
    public List<BusquedaCompletaDTO> buscarPorFmo(String fmoEquipo) {
        
        // 1. Buscamos en BD
        List<EncabezadoRecibo> listaEncabezados = encabezadoRepository.buscarPorFmoConUsuario(fmoEquipo);

        if (listaEncabezados.isEmpty()) {
            throw new RuntimeException("No se encontró ningún recibo con el FMO: " + fmoEquipo);
        }

        List<BusquedaCompletaDTO> respuestaLista = new ArrayList<>();

        // 2. Usamos el método auxiliar para convertir cada elemento
        for (EncabezadoRecibo encabezado : listaEncabezados) {
            respuestaLista.add(convertirEntidadADTO(encabezado));
        }

        return respuestaLista;
    }

    /**
     * NUEVO MÉTODO: Listar todos los recibos de equipos registrados en la base de datos.
     */


    @Transactional(readOnly = true)
    public List<BusquedaCompletaDTO> listarTodoReciboDeEquipos() {
      
        // 1. Buscamos todos
        List<ReciboDeEquipos> todos = reciboDeEquiposRepository.findAll();
        if (todos.isEmpty()) {
            throw new RuntimeException("No se encontró ningún recibo");
        }
        List<BusquedaCompletaDTO> respuestaLista = new ArrayList<>();

        // 2. Reutilizamos la lógica de conversión
        for (ReciboDeEquipos recibo : todos) {
            respuestaLista.add(convertirEntidadADTO(recibo.getEncabezadoRelacion()));
        }

        return respuestaLista;
    }

    @Transactional(readOnly = true)
    public List<BusquedaCompletaDTO> listarReciboDeEquiposPorFecha(String fecha) {
        
        // 1. Buscamos todos
        List<EncabezadoRecibo> todos = encabezadoRepository.findByFecha(fecha);
        if(todos.isEmpty()){
            throw new RuntimeException("No se encontró ningún recibo con fecha " + fecha);
        }
        List<BusquedaCompletaDTO> respuestaLista = new ArrayList<>();

        // 2. Reutilizamos la lógica de conversión
        for (EncabezadoRecibo encabezado : todos) {
            respuestaLista.add(convertirEntidadADTO(encabezado));
        }

        return respuestaLista;
    }

    @Transactional(readOnly = true)
    public List<BusquedaCompletaDTO> listarReciboDeEquiposPorRangoFechas(String fechaInicio, String fechaFin) {
        
       
        // 1. Buscamos todos
        List<EncabezadoRecibo> todos = encabezadoRepository.findByFechaBetween(fechaInicio, fechaFin);
        
        if(todos.isEmpty()){
            throw new RuntimeException("No se encontró ningún recibo con rango de fecha " + fechaInicio + " "+ fechaFin);
        }
        List<BusquedaCompletaDTO> respuestaLista = new ArrayList<>();

        // 2. Reutilizamos la lógica de conversión
        for (EncabezadoRecibo encabezado : todos) {
            respuestaLista.add(convertirEntidadADTO(encabezado));
        }

        return respuestaLista;
    }

    @Transactional
    public BusquedaCompletaDTO actualizarEstatusRecibo(Long idEncabezado, String nuevoEstatus) {
        
        // 1. Buscar el encabezado por ID
        EncabezadoRecibo encabezado = encabezadoRepository.findById(idEncabezado) 
            .orElseThrow(() -> new RuntimeException("Recibo no encontrado con ID: " + idEncabezado));

        // 2. Actualizar el campo
        encabezado.setEstatus(nuevoEstatus);

        // 3. Guardar cambios
        EncabezadoRecibo actualizado = encabezadoRepository.save(encabezado);

        // 4. Retornar el DTO completo actualizado (reusando tu método privado existente)
        return convertirEntidadADTO(actualizado);
    }

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

    private BusquedaCompletaDTO convertirEntidadADTO(EncabezadoRecibo encabezado) {
        BusquedaCompletaDTO dto = new BusquedaCompletaDTO();

        // --- Mapeo Usuario (Abuelo) ---
        Usuario user = encabezado.getUsuarioRelacion();
        if (user != null) {
            dto.setUsuarioNombre(user.getNombre());
            dto.setUsuarioFicha(String.valueOf(user.getFicha()));
            dto.setUsuarioGerencia(user.getGerencia());
            dto.setClave(user.getClave());
            dto.setUsuario(user.getUsuario());
            dto.setExtension(user.getExtension());
        }

        // --- Mapeo Encabezado (Padre) ---
        dto.setIdEncabezado(encabezado.getId());
        dto.setFmoEquipo(encabezado.getFmoEquipo());
        dto.setSolicitudST(encabezado.getSolicitudST());
        dto.setFecha(encabezado.getFecha());
        dto.setEstatus(encabezado.getEstatus());
        dto.setEntregadoPor(encabezado.getEntregadoPor());
        dto.setAsignadoA(encabezado.getAsignadoA());
        dto.setRecibidoPor(encabezado.getRecibidoPor());
        dto.setFalla(encabezado.getFalla());
        dto.setObservacion(encabezado.getObservacion());
        dto.setSolicitudDAET(encabezado.getSolicitudDAET());

        // --- Mapeo Equipos (Hijos) ---
        List<EquipoResponseDTO> listaEquiposDto = new ArrayList<>();

        if (encabezado.getListaEquipos() != null) {
            for (ReciboDeEquipos equipoEntity : encabezado.getListaEquipos()) {
                EquipoResponseDTO equipoDto = new EquipoResponseDTO();
                equipoDto.setMarca(equipoEntity.getMarca());
                equipoDto.setRespaldo(equipoEntity.getRespaldo());

                // A. Periféricos
                List<String> listaNombresPerifericos = new ArrayList<>();
                if (equipoEntity.getPerifericosIncluidos() != null) {
                    for (ReciboPeriferico relPerif : equipoEntity.getPerifericosIncluidos()) {
                        if (relPerif.getPerifericoRef() != null) {
                            listaNombresPerifericos.add(relPerif.getPerifericoRef().getNombre());
                        }
                    }
                }
                equipoDto.setPerifericos(listaNombresPerifericos);

                // B. Aplicaciones
                List<String> listaNombresApps = new ArrayList<>();
                if (equipoEntity.getAplicacionesInstaladas() != null) {
                    for (AplicacionReciboEquipos appRecibo : equipoEntity.getAplicacionesInstaladas()) {
                        if (appRecibo.getAplicacionRef() != null) {
                            listaNombresApps.add(appRecibo.getAplicacionRef().getNombre());
                        }
                    }
                }
                equipoDto.setAplicaciones(listaNombresApps);

                // C. Observación Seriales
                if (equipoEntity.getSerialesAsignados() != null && !equipoEntity.getSerialesAsignados().isEmpty()) {
                    String obs = equipoEntity.getSerialesAsignados().get(0).getObservacion();
                    equipoDto.setObservacionSeriales(obs);
                }

                // D. Carpetas
                List<String> carpetas = new ArrayList<>();
                if (equipoEntity.getCarpetasAsignadas() != null) {
                    for (CarpetaRedRecibo cr : equipoEntity.getCarpetasAsignadas()) {
                        if (cr.getCarpetaRelacion() != null) {
                            carpetas.add(cr.getCarpetaRelacion().getNombreCarpeta());
                        }
                    }
                }
                equipoDto.setCarpetas(carpetas);

                // E. Componentes Genéricos
                List<ComponenteResumenDTO> compGen = new ArrayList<>();
                if (equipoEntity.getComponentesInternos() != null) {
                    for (ComponenteRecibo cr : equipoEntity.getComponentesInternos()) {
                        ComponenteResumenDTO cDto = new ComponenteResumenDTO();
                        cDto.setCantidad(cr.getCantidad());
                        if (cr.getComponenteRef() != null) {
                            cDto.setNombreComponente(cr.getComponenteRef().getNombre());
                        }
                        compGen.add(cDto);
                    }
                }
                equipoDto.setComponentesGenericos(compGen);

                // F. Seriales Específicos
                List<SerialResumenDTO> seriales = new ArrayList<>();
                if (equipoEntity.getSerialesAsignados() != null) {
                    for (SerialRecibo sr : equipoEntity.getSerialesAsignados()) {
                        SerialResumenDTO sDto = new SerialResumenDTO();
                        SerialComponente fisico = sr.getSerialComponente();
                        if (fisico != null) {
                            sDto.setMarca(fisico.getMarca());
                            sDto.setSerial(fisico.getSerial());
                            sDto.setCapacidad(fisico.getCapacidad());
                            if (fisico.getComponenteTipo() != null) {
                                sDto.setTipoComponente(fisico.getComponenteTipo().getNombre());
                            }
                        }
                        seriales.add(sDto);
                    }
                }
                equipoDto.setComponentesConSerial(seriales);

                listaEquiposDto.add(equipoDto);
            }
        }
        dto.setEquipos(listaEquiposDto);
        return dto;
    }


}