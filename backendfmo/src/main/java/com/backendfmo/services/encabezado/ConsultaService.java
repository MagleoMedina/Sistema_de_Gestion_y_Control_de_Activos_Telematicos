package com.backendfmo.services.encabezado;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.response.*;
import com.backendfmo.models.*;
import com.backendfmo.repository.EncabezadoReciboRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class ConsultaService {

    @Autowired
    private EncabezadoReciboRepository encabezadoRepository;

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