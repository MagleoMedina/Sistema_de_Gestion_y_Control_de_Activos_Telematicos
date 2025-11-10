package com.backendfmo.services.contador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backendfmo.repository.EncabezadoReciboRepository;
import com.backendfmo.repository.EntregasAlDAETRepository;
import com.backendfmo.repository.ReciboDeEquiposRepository;
import com.backendfmo.repository.ReciboDePerifericosRepository;

@Service
public class ContadorServiceImpl {


    @Autowired
    private ReciboDeEquiposRepository equipoRepository;

    @Autowired
    private ReciboDePerifericosRepository perifericoRepository;

    @Autowired
    private EntregasAlDAETRepository daetRepository;

    private static final String ESTATUS_ENTREGADO = "Listo";

    public long contarEquiposAtendidos() {
        return equipoRepository.contarPorEstatus(ESTATUS_ENTREGADO);
    }

    public long contarPerifericosAtendidos(){
        return perifericoRepository.contarPorEstatus(ESTATUS_ENTREGADO);
    }

    public long contarDaetAtendidas(){
        return daetRepository.contarPorEstatus(ESTATUS_ENTREGADO);
    } 
    
    public long getTotalPendientes() {
        long equipos = equipoRepository.contarPendientes(ESTATUS_ENTREGADO);
        long perifericos = perifericoRepository.contarPendientes(ESTATUS_ENTREGADO);
        long daet = daetRepository.contarPendientes(ESTATUS_ENTREGADO);

        return equipos + perifericos + daet;
    }
}
