package com.backendfmo.services;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.backendfmo.dtos.request.mantenimiento.EquipoDetalleDTO;
import com.backendfmo.dtos.request.mantenimiento.MantenimientoProgramadoRequestDTO;
import com.backendfmo.dtos.request.mantenimiento.MantenimientoProgramadoResponseDTO;
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

    // =========================================================================
    // LÓGICA DE PROGRAMACIONES (PENDIENTES)
    // =========================================================================

    @Transactional
    public MantenimientoProgramadoResponseDTO programarMantenimiento(MantenimientoProgramadoRequestDTO dto) {
        Gerencia gerencia = gerenciaRepository.findByNombreIgnoreCase(dto.getGerencia())
                .orElseGet(() -> {
                    Gerencia g = new Gerencia();
                    g.setNombre(dto.getGerencia());
                    return gerenciaRepository.save(g);
                });

        Mantenimiento nuevo = new Mantenimiento();
        nuevo.setGerencia(gerencia);
        nuevo.setFecha(dto.getFechaProgramada());
        nuevo.setAnalista(dto.getAnalistaResponsable());
        nuevo.setEstatus("Pendiente"); // Estatus inicial sin equipos
        
        nuevo = mantenimientoRepository.save(nuevo);
        return convertirAProgramadoDTO(nuevo);
    }

    @Transactional(readOnly = true)
    public List<MantenimientoProgramadoResponseDTO> obtenerPendientes() {
        return mantenimientoRepository.findAll().stream()
                .filter(m -> "Pendiente".equalsIgnoreCase(m.getEstatus()))
                .map(this::convertirAProgramadoDTO)
                .toList();
    }

    @Transactional
    public MantenimientoProgramadoResponseDTO actualizarProgramacion(Long id, MantenimientoProgramadoRequestDTO dto) {
        Mantenimiento existente = mantenimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programación no encontrada con el ID: " + id));

        Gerencia gerencia = gerenciaRepository.findByNombreIgnoreCase(dto.getGerencia())
                .orElseGet(() -> {
                    Gerencia g = new Gerencia();
                    g.setNombre(dto.getGerencia());
                    return gerenciaRepository.save(g);
                });

        existente.setGerencia(gerencia);
        existente.setFecha(dto.getFechaProgramada());
        existente.setAnalista(dto.getAnalistaResponsable());
        
        Mantenimiento actualizado = mantenimientoRepository.save(existente);
        return convertirAProgramadoDTO(actualizado);
    }

    private MantenimientoProgramadoResponseDTO convertirAProgramadoDTO(Mantenimiento m) {
        MantenimientoProgramadoResponseDTO dto = new MantenimientoProgramadoResponseDTO();
        dto.setId(m.getId());
        dto.setGerencia(m.getGerencia().getNombre());
        dto.setFechaProgramada(m.getFecha());
        dto.setAnalistaResponsable(m.getAnalista());
        dto.setEstado(m.getEstatus());
        return dto;
    }


    // =========================================================================
    // EJECUCIÓN DEL MANTENIMIENTO (REGISTRO)
    // =========================================================================

    @Transactional
    public void registrarMantenimiento(MantenimientoRegistroDTO dto, List<MultipartFile> fotos) throws IOException {
        
        Gerencia gerencia = gerenciaRepository.findByNombreIgnoreCase(dto.getGerencia())
                .orElseGet(() -> {
                    Gerencia g = new Gerencia();
                    g.setNombre(dto.getGerencia());
                    return gerenciaRepository.save(g);
                });

        Mantenimiento mantenimiento;

        // Si viene un ID, actualizamos la programación existente a "Completado"
        if (dto.getIdProgramacion() != null) {
            mantenimiento = mantenimientoRepository.findById(dto.getIdProgramacion())
                    .orElseThrow(() -> new RuntimeException("La programación vinculada con ID " + dto.getIdProgramacion() + " no existe."));
            mantenimiento.setGerencia(gerencia);
            mantenimiento.setAnalista(dto.getAnalista());
            mantenimiento.setFecha(dto.getFecha());
            mantenimiento.setEstatus("Completado");
        } else {
            // Si no viene ID, es un mantenimiento espontáneo (nuevo)
            mantenimiento = new Mantenimiento();
            mantenimiento.setGerencia(gerencia);
            mantenimiento.setAnalista(dto.getAnalista());
            mantenimiento.setFecha(dto.getFecha());
            mantenimiento.setEstatus("Completado");
        }
        
        mantenimiento = mantenimientoRepository.save(mantenimiento);

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

            MantenimientoDepartamento detalle = new MantenimientoDepartamento();
            detalle.setMantenimiento(mantenimiento);
            detalle.setUsuario(usuario);
            detalle.setDepartamento(departamento);
            detalle.setDispositivo(dispositivo);
            detalle.setSo(equipoDto.getSo());
            detalle.setObservaciones(equipoDto.getObservaciones());
            mantDeptoRepository.save(detalle);
        }

        if (fotos != null && !fotos.isEmpty()) {
            if (!Files.exists(rootFotosMantenimiento)) {
                Files.createDirectories(rootFotosMantenimiento);
            }
            for (MultipartFile foto : fotos) {
                if (foto != null && !foto.isEmpty()) {
                    String nombreBase = dto.getGerencia().replaceAll("\\s+", "_") + "_" + dto.getFecha() + "_" + UUID.randomUUID().toString().substring(0, 8);
                    String nombreFinal = guardarFotoComprimida(foto, rootFotosMantenimiento, nombreBase);

                    MantenimientoFoto mantFoto = new MantenimientoFoto();
                    mantFoto.setMantenimiento(mantenimiento);
                    mantFoto.setFotoPath(nombreFinal); 
                    mantFotoRepository.save(mantFoto);
                }
            }
        }
    }

    private String guardarFotoComprimida(MultipartFile file, Path rutaBase, String nombreCompletoSinExtension) throws IOException {
        String nombreFinal = nombreCompletoSinExtension + ".jpg"; 
        File archivoDestino = rutaBase.resolve(nombreFinal).toFile();

        try (InputStream is = file.getInputStream();
             ImageOutputStream ios = ImageIO.createImageOutputStream(new FileOutputStream(archivoDestino))) {
            
            BufferedImage image = ImageIO.read(is);
            if (image == null) {
                Files.copy(file.getInputStream(), archivoDestino.toPath(), StandardCopyOption.REPLACE_EXISTING);
                return nombreFinal;
            }

            BufferedImage newBufferedImage = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
            newBufferedImage.createGraphics().drawImage(image, 0, 0, java.awt.Color.WHITE, null);

            Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
            if (!writers.hasNext()) throw new IllegalStateException("No se encontró un escritor JPEG.");
            
            ImageWriter writer = writers.next();
            writer.setOutput(ios);

            ImageWriteParam param = writer.getDefaultWriteParam();
            if (param.canWriteCompressed()) {
                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                param.setCompressionQuality(0.65f); 
            }

            writer.write(null, new IIOImage(newBufferedImage, null, null), param);
            writer.dispose();
        } catch (Exception e) {
             Files.copy(file.getInputStream(), archivoDestino.toPath(), StandardCopyOption.REPLACE_EXISTING);
        }
        
        return nombreFinal;
    }

    // ==========================================
    // MÉTODOS DE CONSULTA (Solo Completados para el Historial)
    // ==========================================
    @Transactional(readOnly = true)
    public List<MantenimientoResponseDTO> obtenerTodos() {
        return mantenimientoRepository.findAll().stream()
                .filter(m -> "Completado".equalsIgnoreCase(m.getEstatus()))
                .flatMap(m -> m.getDetalles().stream().map(d -> convertirADTO(m, d)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MantenimientoResponseDTO> obtenerPorFecha(String fecha) {
        return mantenimientoRepository.findByFecha(fecha).stream()
                .filter(m -> "Completado".equalsIgnoreCase(m.getEstatus()))
                .flatMap(m -> m.getDetalles().stream().map(d -> convertirADTO(m, d)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MantenimientoResponseDTO> obtenerPorGerencia(String gerencia) {
        return mantenimientoRepository.findByGerenciaNombreContainingIgnoreCase(gerencia).stream()
                .filter(m -> "Completado".equalsIgnoreCase(m.getEstatus()))
                .flatMap(m -> m.getDetalles().stream().map(d -> convertirADTO(m, d)))
                .toList();
    }

    @Transactional
    public void eliminarMantenimiento(Long id) {
        Mantenimiento mantenimiento = mantenimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mantenimiento con ID " + id + " no encontrado"));

        if (mantenimiento.getFotos() != null && !mantenimiento.getFotos().isEmpty()) {
            for (MantenimientoFoto foto : mantenimiento.getFotos()) {
                try {
                    Path rutaArchivo = rootFotosMantenimiento.resolve(foto.getFotoPath());
                    Files.deleteIfExists(rutaArchivo);
                } catch (IOException e) {
                    System.err.println("Advertencia: No se pudo eliminar la foto física: " + foto.getFotoPath());
                }
            }
        }
        mantenimientoRepository.delete(mantenimiento);
    }

    // ==========================================
    // EXPORTACIONES CSV
    // ==========================================
    public byte[] generarCsvMantenimientos(List<MantenimientoResponseDTO> listaMantenimientos) {
        StringBuilder csv = new StringBuilder();
        csv.append("Gerencia,Fecha,Analista,Ficha,Usuario,Departamento,CPU/IMP,Marca,Modelo,FMO/Serial,SO,Observaciones\n");
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
        return aplicarBom(csv.toString());
    }

    public byte[] generarCsvResumenMantenimientos(List<MantenimientoResponseDTO> listaMantenimientos) {
        StringBuilder csv = new StringBuilder();
        csv.append("Fecha,Gerencia,Analista,Cantidad Atendidos\n");

        Map<Long, List<MantenimientoResponseDTO>> lotesAgrupados = listaMantenimientos.stream()
                .collect(Collectors.groupingBy(MantenimientoResponseDTO::getId));

        for (List<MantenimientoResponseDTO> lote : lotesAgrupados.values()) {
            if (!lote.isEmpty()) {
                MantenimientoResponseDTO ref = lote.get(0);
                csv.append(escaparCsv(ref.getFecha())).append(",")
                   .append(escaparCsv(ref.getGerencia())).append(",")
                   .append(escaparCsv(ref.getAnalista())).append(",")
                   .append(lote.size()).append("\n");
            }
        }
        return aplicarBom(csv.toString());
    }

    private byte[] aplicarBom(String csv) {
        byte[] csvBytes = csv.getBytes(StandardCharsets.UTF_8);
        byte[] bomAndCsv = new byte[csvBytes.length + 3];
        bomAndCsv[0] = (byte) 0xEF;
        bomAndCsv[1] = (byte) 0xBB;
        bomAndCsv[2] = (byte) 0xBF;
        System.arraycopy(csvBytes, 0, bomAndCsv, 3, csvBytes.length);
        return bomAndCsv;
    }

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
        if (m.getFotos() != null) dto.setFotos(m.getFotos().stream().map(MantenimientoFoto::getFotoPath).toList());
        return dto;
    }
}