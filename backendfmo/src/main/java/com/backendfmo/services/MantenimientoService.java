package com.backendfmo.services;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.backendfmo.dtos.request.mantenimiento.MantenimientoRegistroDTO;
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
        
        // 1. Gestionar Usuario
        Usuario usuario = usuarioRepository.findByFicha(dto.getFicha())
                .orElseGet(() -> {
                    Usuario u = new Usuario();
                    u.setFicha(dto.getFicha());
                    u.setUsuario(String.valueOf(dto.getFicha())); 
                    u.setClave("123456"); 
                    return u;
                });
        usuario.setNombre(dto.getNombreUsuario());
        usuario = usuarioRepository.save(usuario);

        // 2. Gestionar Gerencia y Departamento
        Gerencia gerencia = gerenciaRepository.findByNombreIgnoreCase(dto.getGerencia())
                .orElseGet(() -> {
                    Gerencia g = new Gerencia();
                    g.setNombre(dto.getGerencia());
                    return gerenciaRepository.save(g);
                });

        Departamento departamento = departamentoRepository.findByNombreIgnoreCaseAndGerencia(dto.getDepartamento(), gerencia)
                .orElseGet(() -> {
                    Departamento d = new Departamento();
                    d.setNombre(dto.getDepartamento());
                    d.setGerencia(gerencia);
                    return departamentoRepository.save(d);
                });

        // 3. Gestionar Marca, Modelo y Dispositivo
        Marca marca = marcaRepository.findByNombreIgnoreCase(dto.getMarca())
                .orElseGet(() -> {
                    Marca m = new Marca();
                    m.setNombre(dto.getMarca());
                    return marcaRepository.save(m);
                });

        Modelo modelo = modeloRepository.findByNombreIgnoreCaseAndMarca(dto.getModelo(), marca)
                .orElseGet(() -> {
                    Modelo m = new Modelo();
                    m.setNombre(dto.getModelo());
                    m.setMarca(marca);
                    return modeloRepository.save(m);
                });

        Dispositivo dispositivo = dispositivoRepository.findByFmoIgnoreCase(dto.getFmo())
                .orElseGet(() -> {
                    Dispositivo d = new Dispositivo();
                    d.setFmo(dto.getFmo());
                    return d;
                });
        dispositivo.setTipo(dto.getTipoDispositivo());
        dispositivo.setModelo(modelo);
        dispositivo = dispositivoRepository.save(dispositivo);

        // 4. Crear Cabecera de Mantenimiento
        Mantenimiento mantenimiento = new Mantenimiento();
        mantenimiento.setGerencia(gerencia);
        mantenimiento.setAnalista(dto.getAnalista());
        mantenimiento.setFecha(dto.getFecha());
        mantenimiento = mantenimientoRepository.save(mantenimiento);

        // 5. Crear Detalle de Mantenimiento
        MantenimientoDepartamento detalle = new MantenimientoDepartamento();
        detalle.setMantenimiento(mantenimiento);
        detalle.setUsuario(usuario);
        detalle.setDepartamento(departamento);
        detalle.setDispositivo(dispositivo);
        detalle.setSo(dto.getSo());
        detalle.setObservaciones(dto.getObservaciones());
        mantDeptoRepository.save(detalle);

        // 6. Guardar Fotos físicamente y en Base de Datos
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
                    
                    // Nombre único: FMO_UUID.extension
                    String nombreFinal = dto.getFmo() + "_" + UUID.randomUUID().toString() + extension;
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
}