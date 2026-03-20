package com.backendfmo.services;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.backendfmo.dtos.request.mantenimiento.EquipoDetalleDTO;
import com.backendfmo.dtos.request.mantenimiento.MantenimientoRegistroDTO;
import com.backendfmo.dtos.request.mantenimiento.MantenimientoResponseDTO;
import com.backendfmo.models.mantenimiento.*;
import com.backendfmo.models.pasantes.*;
import com.backendfmo.models.reciboequipos.Usuario;
import com.backendfmo.repository.*;

@Service
public class MantenimientoService {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private GerenciaRepository gerenciaRepository;
    @Autowired private DepartamentoRepository departamentoRepository;
    @Autowired private MarcaRepository marcaRepository;
    @Autowired private ModeloRepository modeloRepository;
    @Autowired private DispositivoRepository dispositivoRepository;
    @Autowired private MantenimientoRepository mantenimientoRepository;
    @Autowired private MantenimientoDepartamentoRepository mantDeptoRepository;
    @Autowired private MantenimientoFotoRepository mantFotoRepository;

    private final Path rootFotosMantenimiento;

    public MantenimientoService() {
        String projectRoot = System.getProperty("user.dir");
        this.rootFotosMantenimiento = Paths.get(projectRoot, "src", "main", "resources", "mantenimientos", "fotos");
    }

    @Transactional
    public void registrarMantenimiento(MantenimientoRegistroDTO dto, List<MultipartFile> fotos) throws IOException {
        
        // 1. Gestionar Gerencia (Cabecera)
        Gerencia gerencia = gerenciaRepository.findByNombreIgnoreCase(dto.getGerencia())
                .orElseGet(() -> {
                    Gerencia g = new Gerencia();
                    g.setNombre(dto.getGerencia());
                    return gerenciaRepository.save(g);
                });

        // 2. Crear un solo Mantenimiento (Cabecera)
        Mantenimiento mantenimiento = new Mantenimiento();
        mantenimiento.setGerencia(gerencia);
        mantenimiento.setAnalista(dto.getAnalista());
        mantenimiento.setFecha(dto.getFecha());
        mantenimiento = mantenimientoRepository.save(mantenimiento);

        // 3. Iterar y guardar los múltiples equipos vinculados a la cabecera
        for (EquipoDetalleDTO equipoDto : dto.getEquipos()) {
            
            Usuario usuario = usuarioRepository.findByFicha(equipoDto.getFicha())
                    .orElseGet(() -> {
                        Usuario u = new Usuario();
                        u.setFicha(equipoDto.getFicha());
                        u.setUsuario(String.valueOf(equipoDto.getFicha())); 
                        u.setClave("123456"); 
                        return u;
                    });
            usuario.setNombre(equipoDto.getNombreUsuario());
            usuario = usuarioRepository.save(usuario);

            Departamento departamento = departamentoRepository.findByNombreIgnoreCaseAndGerencia(equipoDto.getDepartamento(), gerencia)
                    .orElseGet(() -> {
                        Departamento d = new Departamento();
                        d.setNombre(equipoDto.getDepartamento());
                        d.setGerencia(gerencia);
                        return departamentoRepository.save(d);
                    });

            Marca marca = marcaRepository.findByNombreIgnoreCase(equipoDto.getMarca())
                    .orElseGet(() -> {
                        Marca m = new Marca();
                        m.setNombre(equipoDto.getMarca());
                        return marcaRepository.save(m);
                    });

            Modelo modelo = modeloRepository.findByNombreIgnoreCaseAndMarca(equipoDto.getModelo(), marca)
                    .orElseGet(() -> {
                        Modelo m = new Modelo();
                        m.setNombre(equipoDto.getModelo());
                        m.setMarca(marca);
                        return modeloRepository.save(m);
                    });

            Dispositivo dispositivo = dispositivoRepository.findByFmoIgnoreCase(equipoDto.getFmo())
                    .orElseGet(() -> {
                        Dispositivo d = new Dispositivo();
                        d.setFmo(equipoDto.getFmo());
                        return d;
                    });
            dispositivo.setTipo(equipoDto.getTipoDispositivo());
            dispositivo.setModelo(modelo);
            dispositivo = dispositivoRepository.save(dispositivo);

            // Detalle del Mantenimiento
            MantenimientoDepartamento detalle = new MantenimientoDepartamento();
            detalle.setMantenimiento(mantenimiento);
            detalle.setUsuario(usuario);
            detalle.setDepartamento(departamento);
            detalle.setDispositivo(dispositivo);
            detalle.setSo(equipoDto.getSo());
            detalle.setObservaciones(equipoDto.getObservaciones());
            mantDeptoRepository.save(detalle);
        }

        // 4. Guardar Fotos (Una sola vez para todo el lote)
        if (fotos != null && !fotos.isEmpty()) {
            if (!Files.exists(rootFotosMantenimiento)) {
                Files.createDirectories(rootFotosMantenimiento);
            }
            for (MultipartFile foto : fotos) {
                if (foto != null && !foto.isEmpty()) {
                    String extension = "";
                    String originalName = foto.getOriginalFilename();
                    if (originalName != null && originalName.contains(".")) {
                        extension = originalName.substring(originalName.lastIndexOf("."));
                    }
                    String nombreFinal = dto.getGerencia()+ "_" + dto.getFecha()+ "_" + UUID.randomUUID() + extension;
                    Path rutaArchivo = rootFotosMantenimiento.resolve(nombreFinal);
                    Files.copy(foto.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);

                    MantenimientoFoto mantFoto = new MantenimientoFoto();
                    mantFoto.setMantenimiento(mantenimiento);
                    mantFoto.setFotoPath(nombreFinal);
                    mantFotoRepository.save(mantFoto);
                }
            }
        }
    }

    // ==========================================
    // MÉTODOS DE CONSULTA APLANADOS PARA LA VISTA
    // ==========================================
    @Transactional(readOnly = true)
    public List<MantenimientoResponseDTO> obtenerTodos() {
        return mantenimientoRepository.findAll().stream()
                .flatMap(m -> m.getDetalles().stream().map(d -> convertirADTO(m, d)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MantenimientoResponseDTO> obtenerPorFecha(String fecha) {
        return mantenimientoRepository.findByFecha(fecha).stream()
                .flatMap(m -> m.getDetalles().stream().map(d -> convertirADTO(m, d)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MantenimientoResponseDTO> obtenerPorGerencia(String gerencia) {
        return mantenimientoRepository.findByGerenciaNombreContainingIgnoreCase(gerencia).stream()
                .flatMap(m -> m.getDetalles().stream().map(d -> convertirADTO(m, d)))
                .toList();
    }

    // ==========================================
    // MÉTODO PARA ELIMINAR (DELETE)
    // ==========================================
    @Transactional
    public void eliminarMantenimiento(Long id) {
        // 1. Buscar el mantenimiento por su ID
        Mantenimiento mantenimiento = mantenimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mantenimiento con ID " + id + " no encontrado"));

        // 2. Eliminar las fotos físicas del disco duro
        if (mantenimiento.getFotos() != null && !mantenimiento.getFotos().isEmpty()) {
            for (MantenimientoFoto foto : mantenimiento.getFotos()) {
                try {
                    // Resuelve la ruta completa del archivo y lo elimina si existe
                    Path rutaArchivo = rootFotosMantenimiento.resolve(foto.getFotoPath());
                    Files.deleteIfExists(rutaArchivo);
                } catch (IOException e) {
                    System.err.println("Advertencia: No se pudo eliminar la foto física: " + foto.getFotoPath());
                    e.printStackTrace();
                    // No lanzamos la excepción aquí para que, aunque falte la foto física, 
                    // el registro de la BD sí se pueda eliminar.
                }
            }
        }

        // 3. Eliminar el registro de la Base de Datos
        // (Gracias a CascadeType.ALL, esto borrará también los detalles y las referencias de las fotos)
        mantenimientoRepository.delete(mantenimiento);
    }

    // ==========================================
    // LÓGICA DE NEGOCIO: GENERACIÓN DE CSV
    // ==========================================
    public byte[] generarCsvMantenimientos(List<MantenimientoResponseDTO> listaMantenimientos) {
        StringBuilder csv = new StringBuilder();
        
        // 1. Escribir las cabeceras solicitadas
        csv.append("Gerencia,Fecha,Analista,Ficha,Usuario,Departamento,CPU/IMP,Marca,Modelo,FMO/Serial,SO,Observaciones\n");

        // 2. Recorrer el JSON y transformarlo a filas de texto
        for (MantenimientoResponseDTO dto : listaMantenimientos) {
            csv.append(escaparCsv(dto.getGerencia())).append(",")
               .append(escaparCsv(dto.getFecha())).append(",")
               .append(escaparCsv(dto.getAnalista())).append(",")
               .append(dto.getFicha() != null ? dto.getFicha() : "").append(",")
               .append(escaparCsv(dto.getNombreUsuario())).append(",")
               .append(escaparCsv(dto.getDepartamento())).append(",")
               .append(escaparCsv(dto.getTipoDispositivo())).append(",")
               .append(escaparCsv(dto.getMarca())).append(",")
               .append(escaparCsv(dto.getModelo())).append(",")
               .append(escaparCsv(dto.getFmo())).append(",")
               .append(escaparCsv(dto.getSo())).append(",")
               .append(escaparCsv(dto.getObservaciones())).append("\n");
        }

        // 3. Convertir a Bytes y añadir BOM (Byte Order Mark) para compatibilidad UTF-8 en Excel
        byte[] csvBytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] bomAndCsv = new byte[csvBytes.length + 3];
        bomAndCsv[0] = (byte) 0xEF;
        bomAndCsv[1] = (byte) 0xBB;
        bomAndCsv[2] = (byte) 0xBF;
        System.arraycopy(csvBytes, 0, bomAndCsv, 3, csvBytes.length);

        return bomAndCsv;
    }

    // Método auxiliar para limpiar el texto de caracteres que rompen el CSV
    private String escaparCsv(String valor) {
        if (valor == null) return "";
        String valorLimpio = valor.trim();
        if (valorLimpio.contains(",") || valorLimpio.contains("\"") || valorLimpio.contains("\n")) {
            return "\"" + valorLimpio.replace("\"", "\"\"") + "\"";
        }
        return valorLimpio;
    }

    private MantenimientoResponseDTO convertirADTO(Mantenimiento m, MantenimientoDepartamento detalle) {
        MantenimientoResponseDTO dto = new MantenimientoResponseDTO();
        dto.setId(m.getId());
        dto.setFecha(m.getFecha());
        dto.setAnalista(m.getAnalista());
        dto.setGerencia(m.getGerencia().getNombre());
        
        dto.setFicha(detalle.getUsuario().getFicha());
        dto.setNombreUsuario(detalle.getUsuario().getNombre());
        dto.setDepartamento(detalle.getDepartamento().getNombre());
        
        dto.setFmo(detalle.getDispositivo().getFmo());
        dto.setTipoDispositivo(detalle.getDispositivo().getTipo());
        dto.setMarca(detalle.getDispositivo().getModelo().getMarca().getNombre());
        dto.setModelo(detalle.getDispositivo().getModelo().getNombre());
        
        dto.setSo(detalle.getSo());
        dto.setObservaciones(detalle.getObservaciones());

        if (m.getFotos() != null) {
            dto.setFotos(m.getFotos().stream().map(MantenimientoFoto::getFotoPath).toList());
        }
        return dto;
    }
}