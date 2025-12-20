package com.backendfmo.services.reciboequipos;

import com.backendfmo.dtos.request.reciboequipos.RegistroTotalDTO;
import com.backendfmo.dtos.response.reciboequipos.BusquedaCompletaDTO;
import com.backendfmo.models.reciboequipos.Usuario;

import java.util.List;

public interface IReciboEquiposService {

    List<BusquedaCompletaDTO> buscarPorFmo(String fmoEquipo);
    Usuario guardarUsuariosYRecibos(RegistroTotalDTO dto);
}
