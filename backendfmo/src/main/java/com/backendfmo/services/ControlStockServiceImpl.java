package com.backendfmo.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.dtos.request.stock.*;
import com.backendfmo.models.perifericos.Periferico;
import com.backendfmo.models.reciboequipos.ComponenteInterno;
import com.backendfmo.models.reciboequipos.EncabezadoRecibo;
import com.backendfmo.models.reciboequipos.Usuario;
import com.backendfmo.models.stock.ControlStock;
import com.backendfmo.models.stock.RelacionStock;
import com.backendfmo.repository.ComponenteInternoRepository;
import com.backendfmo.repository.ControlStockRepository;
import com.backendfmo.repository.EncabezadoReciboRepository;
import com.backendfmo.repository.PerifericoRepository;
import com.backendfmo.repository.UsuarioRepository;
import com.backendfmo.repository.RelacionStockRepository;

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

    @Autowired
    private UsuarioRepository usuarioRepo; // Necesario para buscar por ficha

    @Autowired
    private EncabezadoReciboRepository encabezadoRepo; // Para guardar el recibo

    @Autowired
    private RelacionStockRepository relacionStockRepo; // Para guardar la unión

   // --- 3. ASIGNAR STOCK A UN EQUIPO (CREANDO USUARIO SI NO EXISTE) ---
    @Transactional
    public void asignarStockAEquipo(AsignacionStockDTO dto) {

       
        // 1. Validar Stock
        ControlStock stock = stockRepo.findById(dto.getIdStock())
                .orElseThrow(() -> new RuntimeException("Item de stock no encontrado ID: " + dto.getIdStock()));

                       
        // 1. Validar Stock por ID
        ControlStock stockExist = stockRepo.findById(dto.getIdStock())
                .orElseThrow(() -> new RuntimeException("Item de stock no encontrado ID: " + dto.getIdStock()));

        // === NUEVA VALIDACIÓN: Verificar si ya está asignado ===
        if (relacionStockRepo.existsByStockId(stockExist)) {
            throw new RuntimeException("El item '" + stockExist.getNombreItem() + 
                                       "' con serial " + stockExist.getSerial() + 
                                       " ya se encuentra asignado a otro equipo. Desvincúlelo primero.");
        }
        // 2. Lógica de Usuario (Buscar o Crear)
        Usuario usuario = usuarioRepo.findByFicha(dto.getFichaUsuario())
                .orElseGet(() -> {
                    // Si no existe, instanciamos uno nuevo y configuramos credenciales por defecto
                    Usuario u = new Usuario();
                    u.setFicha(dto.getFichaUsuario());
                    u.setUsuario("u" + dto.getFichaUsuario()); // Ej: u12345

                    return u;
                });

        // 3. Actualizamos los datos del usuario (sea nuevo o existente)
        usuario.setNombre(dto.getNombreUsuario());
        usuario.setExtension(dto.getExtension());
        usuario.setGerencia(dto.getGerencia());
        
        // Guardamos el usuario en BD
        usuario = usuarioRepo.save(usuario);

        // 4. Crear el Encabezado del Recibo
        EncabezadoRecibo recibo = new EncabezadoRecibo();
        recibo.setFmoEquipo(dto.getFmoEquipo());
        recibo.setFecha(dto.getFecha());
        recibo.setUsuarioRelacion(usuario); // Vinculamos al usuario recién guardado/actualizado
        
        // Guardamos el recibo
        recibo = encabezadoRepo.save(recibo);

        // 5. Crear la Relación Stock
        RelacionStock relacion = new RelacionStock();
        relacion.setStockId(stock);
        relacion.setEncabezadoRelacion(recibo);

        // Guardamos la relación final
        relacionStockRepo.save(relacion);
    }

    // --- 4. LISTAR RELACIONES ---
    public List<RelacionStockResponseDTO> listarRelacionesAsignadas() {
        List<RelacionStock> relaciones = relacionStockRepo.findAll();

        return relaciones.stream().map(rel -> {
            RelacionStockResponseDTO dto = new RelacionStockResponseDTO();
            dto.setIdRelacion(rel.getId());

            if (rel.getStockId() != null) {
                dto.setNombreItem(rel.getStockId().getNombreItem());
                dto.setSerial(rel.getStockId().getSerial());
            }

            EncabezadoRecibo enc = rel.getEncabezadoRelacion();
            if (enc != null) {
                dto.setFmoEquipo(enc.getFmoEquipo());
                dto.setFecha(enc.getFecha());

                Usuario usu = enc.getUsuarioRelacion();
                if (usu != null) {
                    dto.setFicha(usu.getFicha());
                    dto.setNombreUsuario(usu.getNombre());
                    dto.setExtension(usu.getExtension());
                    dto.setGerencia(usu.getGerencia());
                }
            }
            return dto;
        }).collect(Collectors.toList());
    }

    // --- 5. NUEVO: DESVINCULAR (ELIMINAR RELACIÓN POR SERIAL) ---
    @Transactional
    public void desvincularPorSerial(String serial) {
        // 1. Buscar el item en stock por Serial
        ControlStock stock = stockRepo.findBySerial(serial)
                .orElseThrow(() -> new RuntimeException("No existe ningún item registrado con el serial: " + serial));

        // 2. Buscar si tiene una relación activa (si está asignado)
        RelacionStock relacion = relacionStockRepo.findByStockId(stock)
                .orElseThrow(() -> new RuntimeException("El item con serial " + serial + " existe, pero NO está asignado a ningún equipo."));

        // 3. Eliminar la relación
        // Al borrar el registro de la tabla intermedia, el item queda "libre" 
        // y el check "existsByStockId" dará false en el futuro.
        relacionStockRepo.delete(relacion);
    }
}
