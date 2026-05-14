package com.backendfmo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backendfmo.repository.CasosResueltosRepository;
import com.backendfmo.repository.EntregasAlDAETRepository;
import com.backendfmo.repository.ReciboDeEquiposRepository;
import com.backendfmo.repository.ReciboDePerifericosRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ContadorServiceImpl {

    private static final Logger logger = LoggerFactory.getLogger(ContadorServiceImpl.class);
    
    @Autowired
    private ReciboDeEquiposRepository equipoRepository;

    @Autowired
    private ReciboDePerifericosRepository perifericoRepository;

    @Autowired
    private EntregasAlDAETRepository daetRepository;

    @Autowired
    private CasosResueltosRepository casosResueltosRepository;

    private static final String ESTATUS_ENTREGADO = "Listo";

    public long contarEquiposAtendidos() {
        logger.info("Contando equipos atendidos con estatus '{}'", ESTATUS_ENTREGADO);
        return equipoRepository.contarPorEstatus(ESTATUS_ENTREGADO);
    }

    public long contarPerifericosAtendidos(){
        logger.info("Contando periféricos atendidos con estatus '{}'", ESTATUS_ENTREGADO);
        return perifericoRepository.contarPorEstatus(ESTATUS_ENTREGADO);
    }

    public long contarDaetAtendidas(){
        logger.info("Contando DAET atendidas con estatus '{}'", ESTATUS_ENTREGADO);
        return daetRepository.contarPorEstatus(ESTATUS_ENTREGADO);
    } 
    
    public long getTotalPendientes() {
        long equipos = equipoRepository.contarPendientes(ESTATUS_ENTREGADO);
        long perifericos = perifericoRepository.contarPendientes(ESTATUS_ENTREGADO);
        long daet = daetRepository.contarPendientes(ESTATUS_ENTREGADO);

        return equipos + perifericos + daet;
    }

    public Long contarCasosResueltos() {
        logger.info("Contando casos resueltos");
        return casosResueltosRepository.contarRegistros();
    }
}
