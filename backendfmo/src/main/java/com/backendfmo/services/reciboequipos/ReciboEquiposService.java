package com.backendfmo.services.reciboequipos;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.request.reciboequipos.ComponenteDetalleDTO;
import com.backendfmo.dtos.request.reciboequipos.EncabezadoDTO;
import com.backendfmo.dtos.request.reciboequipos.EquipoDTO;
import com.backendfmo.dtos.request.reciboequipos.RegistroTotalDTO;
import com.backendfmo.dtos.request.reciboequipos.SerialDetalleDTO;
import com.backendfmo.dtos.response.BusquedaCompletaDTO;
import com.backendfmo.dtos.response.ComponenteResumenDTO;
import com.backendfmo.dtos.response.EquipoResponseDTO;
import com.backendfmo.dtos.response.SerialResumenDTO;
import com.backendfmo.models.CarpetaDeRed;
import com.backendfmo.models.CarpetaRedRecibo;
import com.backendfmo.models.ComponenteInterno;
import com.backendfmo.models.ComponenteRecibo;
import com.backendfmo.models.EncabezadoRecibo;
import com.backendfmo.models.ReciboDeEquipos;
import com.backendfmo.models.SerialComponente;
import com.backendfmo.models.SerialRecibo;
import com.backendfmo.models.Usuario;
import com.backendfmo.repository.ComponenteInternoRepository;
import com.backendfmo.repository.EncabezadoReciboRepository;
import com.backendfmo.repository.UsuarioRepository;

@Service
public class ReciboEquiposService implements IReciboEquiposService{

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ComponenteInternoRepository componenteRepository;

    @Autowired
    private EncabezadoReciboRepository encabezadoRepository;

    @Override
    @Transactional
    public Usuario guardarUsuariosYRecibos(RegistroTotalDTO dto) {
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
                            for (SerialDetalleDTO serialDto : equipoDto.getSeriales()) {
                                
                                // A. BUSCAR EL TIPO EN BD (Catálogo)
                                ComponenteInterno tipoExistente = componenteRepository
                                    .findById(serialDto.getIdTipoComponente())
                                    .orElseThrow(() -> new RuntimeException("Tipo componente no encontrado ID: " + serialDto.getIdTipoComponente()));

                                // B. CREAR EL COMPONENTE FÍSICO (SerialComponente)
                                SerialComponente fisico = new SerialComponente();
                                fisico.setMarca(serialDto.getMarca());
                                fisico.setSerial(serialDto.getSerial());
                                fisico.setCapacidad(serialDto.getCapacidad());
                                fisico.setComponenteTipo(tipoExistente); // Asignamos el tipo encontrado

                                // C. CREAR LA RELACIÓN (SerialRecibo)
                                SerialRecibo linkSerial = new SerialRecibo();
                                linkSerial.setSerialComponente(fisico); // Gracias al CascadeType.ALL, esto guarda 'fisico'

                                // D. VINCULAR AL EQUIPO
                                equipo.agregarSerial(linkSerial);
                            }
                        }
                        // Finalmente agregamos el equipo al encabezado
                        encabezado.agregarEquipo(equipo);
                    }
                }
                nuevoUsuario.agregarRecibo(encabezado);
            }
        }
        return usuarioRepository.save(nuevoUsuario);
    }

    @Transactional(readOnly = true) // Importante: Optimiza la transacción para solo lectura
    public BusquedaCompletaDTO buscarPorFmo(String fmoEquipo) {
        
        // 1. Buscamos en BD
        EncabezadoRecibo encabezado = encabezadoRepository.buscarPorFmoConUsuario(fmoEquipo)
                .orElseThrow(() -> new RuntimeException("No se encontró ningún recibo con el FMO: " + fmoEquipo));

        // 2. Empezamos a mapear (Traducir Entidad -> DTO)
        BusquedaCompletaDTO respuesta = new BusquedaCompletaDTO();
        
        // --- Mapeo Usuario (Abuelo) ---
        Usuario user = encabezado.getUsuarioRelacion();
        respuesta.setUsuarioNombre(user.getNombre());
        respuesta.setUsuarioFicha(String.valueOf(user.getFicha()));
        respuesta.setUsuarioGerencia(user.getGerencia());

        // --- Mapeo Encabezado (Padre) ---
        respuesta.setFmoEquipo(encabezado.getFmoEquipo());
        respuesta.setSolicitudST(encabezado.getSolicitudST());
        respuesta.setFecha(encabezado.getFecha());
        respuesta.setEstatus(encabezado.getEstatus());

        // --- Mapeo Equipos (Hijos) ---
        List<EquipoResponseDTO> listaEquipos = new ArrayList<>();
        
        for (ReciboDeEquipos equipoEntity : encabezado.getListaEquipos()) { // Ojo: asegúrate que tu getter se llame así en Encabezado
            EquipoResponseDTO equipoDto = new EquipoResponseDTO();
            equipoDto.setMarca(equipoEntity.getMarca());
            equipoDto.setRespaldo(equipoEntity.getRespaldo());

            // A. Extraer Carpetas
            List<String> carpetas = new ArrayList<>();
            for (CarpetaRedRecibo cr : equipoEntity.getCarpetasAsignadas()) {
                // Navegamos: Link -> Carpeta -> Nombre
                carpetas.add(cr.getCarpetaRelacion().getNombreCarpeta());
            }
            equipoDto.setCarpetas(carpetas);

            // B. Extraer Componentes Genéricos
            List<ComponenteResumenDTO> compGen = new ArrayList<>();
            for (ComponenteRecibo cr : equipoEntity.getComponentesInternos()) {
                ComponenteResumenDTO cDto = new ComponenteResumenDTO();
                cDto.setCantidad(cr.getCantidad());
                // Navegamos: Link -> ComponenteRef -> Nombre
                cDto.setNombreComponente(cr.getComponenteRef().getNombre());
                compGen.add(cDto);
            }
            equipoDto.setComponentesGenericos(compGen);

            // C. Extraer Seriales Específicos
            List<SerialResumenDTO> seriales = new ArrayList<>();
            for (SerialRecibo sr : equipoEntity.getSerialesAsignados()) {
                SerialResumenDTO sDto = new SerialResumenDTO();
                SerialComponente fisico = sr.getSerialComponente();
                
                sDto.setMarca(fisico.getMarca());
                sDto.setSerial(fisico.getSerial());
                sDto.setCapacidad(fisico.getCapacidad());
                // Navegamos: Link -> SerialFisico -> TipoComponente -> Nombre
                sDto.setTipoComponente(fisico.getComponenteTipo().getNombre());
                
                seriales.add(sDto);
            }
            equipoDto.setComponentesConSerial(seriales);

            listaEquipos.add(equipoDto);
        }

        respuesta.setEquipos(listaEquipos);
        return respuesta;
    }


}