package com.backendfmo.services.stock;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    // --- 1. LISTAR TODO EL STOCK ---
    public List<StockDTO> listarStock() {
        if (stockRepo.count() == 0) {
            throw new RuntimeException("No hay items en el stock");
        }
        return stockRepo.findAll().stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    // --- 2. AGREGAR NUEVO ITEM ---
    public ControlStock guardarNuevo(StockCreateDTO dto) {
        ControlStock stock = new ControlStock();
        stock.setMarca(dto.getMarca());
        stock.setCantidad(dto.getCantidad());
        stock.setCaracteristicas(dto.getCaracteristicas());
        stock.setMinimoAlerta(5);

        // Lógica para decidir dónde guardar la relación
        if ("COMPONENTE".equalsIgnoreCase(dto.getCategoria())) {
            ComponenteInterno comp = componentesRepo.findById(dto.getIdReferencia())
                    .orElseThrow(() -> new RuntimeException("Componente no encontrado ID: " + dto.getIdReferencia()));
            stock.setComponente(comp);
            stock.setPeriferico(null); // Asegurar nulo el otro
        } else {
            Periferico peri = perifericosRepo.findById(dto.getIdReferencia())
                    .orElseThrow(() -> new RuntimeException("Periférico no encontrado ID: " + dto.getIdReferencia()));
            stock.setPeriferico(peri);
            stock.setComponente(null); // Asegurar nulo el otro
        }

        return stockRepo.save(stock);
    }

    // --- 3. AJUSTAR CANTIDAD (+1 o -1) ---
    public ControlStock ajustarCantidad(Long id, Integer cantidadAjuste) {
        ControlStock stock = stockRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Item de stock no encontrado"));

        int nuevaCantidad = stock.getCantidad() + cantidadAjuste;
        if (nuevaCantidad < 0) nuevaCantidad = 0; // Evitar negativos

        stock.setCantidad(nuevaCantidad);
        return stockRepo.save(stock);
    }

    // --- HELPER: CONVERTIR ENTIDAD A DTO ---
    private StockDTO convertirADTO(ControlStock entidad) {
        StockDTO dto = new StockDTO();
        dto.setId(entidad.getId());
        dto.setMarca(entidad.getMarca());
        dto.setCantidad(entidad.getCantidad());
        dto.setCaracteristicas(entidad.getCaracteristicas());
        dto.setMinimoAlerta(5);

        // Determinar nombre y categoría basado en cuál relación no es nula
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

        // Calcular estado visual
        if (dto.getCantidad() == 0) dto.setEstado("AGOTADO");
        else if (dto.getCantidad() <= dto.getMinimoAlerta()) dto.setEstado("BAJO");
        else dto.setEstado("OK");

        return dto;
    }
}
