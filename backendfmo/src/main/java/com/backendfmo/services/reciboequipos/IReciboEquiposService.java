package com.backendfmo.services.reciboequipos;

import com.backendfmo.dtos.request.reciboequipos.RegistroTotalDTO;
import com.backendfmo.dtos.response.BusquedaCompletaDTO;
import com.backendfmo.models.Usuario;

public interface IReciboEquiposService {

    BusquedaCompletaDTO buscarPorFmo(String fmoEquipo);
    Usuario guardarUsuariosYRecibos(RegistroTotalDTO dto);
}
