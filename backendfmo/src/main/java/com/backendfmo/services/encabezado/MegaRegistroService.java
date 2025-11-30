package com.backendfmo.services.encabezado;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Verifica que tus imports sean correctos según donde creaste los archivos
import com.backendfmo.dtos.EncabezadoDTO;
import com.backendfmo.dtos.EquipoDTO;
import com.backendfmo.dtos.RegistroTotalDTO;
// Nota: Usualmente los DTOs van en el paquete dtos, verifica este import:
import com.backendfmo.models.ComponenteDetalleDTO; 
import com.backendfmo.models.CarpetaDeRed;
import com.backendfmo.models.CarpetaRedRecibo;
import com.backendfmo.models.ComponenteInterno;
import com.backendfmo.models.ComponenteRecibo;
import com.backendfmo.models.EncabezadoRecibo;
import com.backendfmo.models.ReciboDeEquipos;
import com.backendfmo.models.Usuario;
import com.backendfmo.repository.ComponenteInternoRepository;
import com.backendfmo.repository.UsuarioRepository;

@Service
public class MegaRegistroService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ComponenteInternoRepository componenteRepository;

    @Transactional
    public Usuario guardarTodo(RegistroTotalDTO dto) {
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

                        // Finalmente agregamos el equipo al encabezado
                        encabezado.agregarEquipo(equipo);
                    }
                }
                nuevoUsuario.agregarRecibo(encabezado);
            }
        }
        return usuarioRepository.save(nuevoUsuario);
    }
}