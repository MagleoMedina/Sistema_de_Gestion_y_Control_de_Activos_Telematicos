package com.backendfmo.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.request.stock.*;
import com.backendfmo.models.perifericos.Periferico;
import com.backendfmo.models.reciboequipos.ComponenteInterno;
import com.backendfmo.models.stock.ControlStock;
import com.backendfmo.repository.ComponenteInternoRepository;
import com.backendfmo.repository.ControlStockRepository;
import com.backendfmo.repository.PerifericoRepository;

@Service
public class ControlStockServiceImpl {

    @Autowired
    private ControlStockRepository stockRepo;

    @Autowired
    private ComponenteInternoRepository componentesRepo;

    @Autowired
    private PerifericoRepository perifericosRepo;

    // --- 1. LISTAR STOCK COMPLETO ---

    public List<StockDTO> listarStock() {
        if (stockRepo.count() == 0) {
            throw new RuntimeException("No hay items en el stock");
        }
        return stockRepo.findAll().stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    // --- 2. AGREGAR NUEVO ITEM (REFERENCIANDO EXISTENTE) ---
    @Transactional
    public ControlStock guardarNuevo(StockCreateDTO dto) {
        ControlStock stock = new ControlStock();

        // 1. Datos propios del Stock
        stock.setMarca(dto.getMarca());
        stock.setCaracteristicas(dto.getCaracteristicas());
        stock.setSerial(dto.getSerial());

        String cat = dto.getCategoria() != null ? dto.getCategoria().toUpperCase() : "DESCONOCIDO";
        stock.setCategoria(cat);

        // 2. Lógica de Búsqueda por ID (Ya existente en DB)
        if ("COMPONENTE".equals(cat)) {
            // Buscamos el componente por su ID (ej: 3 para MEMORIA RAM)
            ComponenteInterno comp = componentesRepo.findById(dto.getIdReferencia())
                    .orElseThrow(
                            () -> new RuntimeException("No existe un Componente con el ID: " + dto.getIdReferencia()));

            stock.setComponente(comp);
            stock.setPeriferico(null); // Constraint Check

        } else if ("PERIFERICO".equals(cat)) {
            // Buscamos el periférico por su ID (ej: 2 para TECLADO)
            Periferico peri = perifericosRepo.findById(dto.getIdReferencia())
                    .orElseThrow(
                            () -> new RuntimeException("No existe un Periférico con el ID: " + dto.getIdReferencia()));

            stock.setPeriferico(peri);
            stock.setComponente(null); // Constraint Check
        } else {
            throw new RuntimeException("Categoría inválida: Use 'COMPONENTE' o 'PERIFERICO'");
        }

        // 3. Guardar el Stock
        return stockRepo.save(stock);
    }

    public void eliminarItem(Long id) {
        ControlStock stock = stockRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Item de stock no encontrado"));
        stockRepo.delete(stock);
    }

    // --- HELPER: CONVERTIR ENTIDAD A DTO ---
    private StockDTO convertirADTO(ControlStock entidad) {
        StockDTO dto = new StockDTO();
        dto.setId(entidad.getId());
        dto.setMarca(entidad.getMarca());
        dto.setSerial(entidad.getSerial());
        dto.setCaracteristicas(entidad.getCaracteristicas());

        if (entidad.getComponente() != null) {
            dto.setCategoria("COMPONENTE");
            dto.setNombreItem(entidad.getComponente().getNombre());
        } else if (entidad.getPeriferico() != null) {
            dto.setCategoria("PERIFERICO");
            dto.setNombreItem(entidad.getPeriferico().getNombre());
        } else {
            dto.setCategoria("DESCONOCIDO");
            dto.setNombreItem("Item Huérfano");
        }
        return dto;
    }
}
