package com.backendfmo.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.backendfmo.dtos.request.pasantes.PasanteRegistroDTO;
import com.backendfmo.dtos.request.pasantes.PasanteResponseDTO;
import com.backendfmo.models.pasantes.Departamento;
import com.backendfmo.models.pasantes.Gerencia;
import com.backendfmo.models.pasantes.Instituto;
import com.backendfmo.models.pasantes.Pasante;
import com.backendfmo.models.reciboequipos.Usuario;
import com.backendfmo.repository.DepartamentoRepository;
import com.backendfmo.repository.GerenciaRepository;
import com.backendfmo.repository.InstitutoRepository;
import com.backendfmo.repository.PasanteRepository;
import com.backendfmo.repository.UsuarioRepository;

@Service
public class PasanteServiceImpl {

    @Autowired
    private PasanteRepository pasanteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private InstitutoRepository institutoRepository;

    @Autowired
    private DepartamentoRepository departamentoRepository; // <-- NUEVO REPOSITORIO

    @Autowired
    private GerenciaRepository gerenciaRepository;
    
    private final Path rootFoto;
    private final Path rootInforme;

   public PasanteServiceImpl() {
        String projectRoot = System.getProperty("user.dir");
        Path basePath = Paths.get(projectRoot, "src", "main", "resources", "pasantes");
        this.rootFoto = basePath.resolve("fotografia");
        this.rootInforme = basePath.resolve("informe");
    }

    @Transactional
    public Pasante registrarPasante(PasanteRegistroDTO dto, MultipartFile fotoFile, MultipartFile informeFile) throws IOException {
        
        // 1. GESTIÓN DE USUARIO
        Usuario usuario = usuarioRepository.findByFicha(dto.getFicha())
                .orElseGet(() -> {
                    Usuario u = new Usuario();
                    u.setFicha(dto.getFicha());
                    u.setUsuario(String.valueOf(dto.getFicha())); 
                    u.setClave("123456"); 
                    return u;
                });

        usuario.setNombre(dto.getNombre());
        usuario.setExtension(dto.getExtension());
        usuario.setGerencia(dto.getGerencia());
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        // 2. GESTIÓN DE INSTITUTO
        Instituto instituto = institutoRepository.findByNombreInstitutoIgnoreCase(dto.getNombreInstituto())
                .orElseGet(() -> {
                    Instituto i = new Instituto();
                    i.setNombreInstituto(dto.getNombreInstituto());
                    return institutoRepository.save(i);
                });

        // --- 3. GESTIÓN DINÁMICA DE GERENCIA Y DEPARTAMENTO ---
        
        // A. Buscar o crear la Gerencia
        Gerencia gerencia = gerenciaRepository.findByNombreIgnoreCase(dto.getGerencia())
                .orElseGet(() -> {
                    Gerencia g = new Gerencia();
                    g.setNombre(dto.getGerencia());
                    return gerenciaRepository.save(g);
                });

        // B. Buscar o crear el Departamento (vinculado a esa Gerencia)
        Departamento departamento = departamentoRepository.findByNombreIgnoreCaseAndGerencia(dto.getAreaAsignada(), gerencia)
                .orElseGet(() -> {
                    Departamento d = new Departamento();
                    d.setNombre(dto.getAreaAsignada());
                    d.setGerencia(gerencia); // Relación crucial
                    return departamentoRepository.save(d);
                });
        // --------------------------------------------------------

        // 4. MANEJO DE ARCHIVOS
        String nombreSinEspacios = usuarioGuardado.getNombre().replaceAll("\\s+", "");
        String nombreBaseFoto = usuarioGuardado.getFicha() + "_foto_" + nombreSinEspacios;
        String nombreBaseInforme = usuarioGuardado.getFicha() + "_informe_" + nombreSinEspacios;

        String rutaFoto = guardarArchivo(fotoFile, rootFoto, nombreBaseFoto);
        String rutaInforme = guardarArchivo(informeFile, rootInforme, nombreBaseInforme);

        // 5. CREACIÓN DEL PASANTE
        Pasante pasante = pasanteRepository.findById(usuarioGuardado.getId().longValue()) 
                          .orElse(new Pasante());

        pasante.setUsuario(usuarioGuardado);
        pasante.setInstituto(instituto);
        pasante.setDepartamento(departamento); // Asignamos el departamento que creamos o encontramos
        
        pasante.setCedula(dto.getCedula());
        pasante.setFechaInicio(dto.getFechaInicio());
        pasante.setFechaFinalizacion(dto.getFechaFinalizacion());
        pasante.setFechaNacimiento(dto.getFechaNacimiento());
        pasante.setTituloPretendido(dto.getTituloPretendido());

        if (rutaFoto != null) pasante.setRutaFotografia(rutaFoto);
        if (rutaInforme != null) pasante.setRutaInforme(rutaInforme);

        return pasanteRepository.save(pasante);
    }

    private String guardarArchivo(MultipartFile file, Path rutaBase, String nombreCompletoSinExtension) throws IOException {
        if (file == null || file.isEmpty()) return null;
        if (!Files.exists(rutaBase)) {
            Files.createDirectories(rutaBase);
        }
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String nombreFinal = nombreCompletoSinExtension + extension;
        Path rutaArchivo = rutaBase.resolve(nombreFinal);
        Files.copy(file.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);
        return nombreFinal; 
    }

    public List<PasanteResponseDTO> obtenerTodosLosPasantes() {
        List<Pasante> pasantes = pasanteRepository.findAll();
        return pasantes.stream().map(this::convertirEntidadADTO).collect(Collectors.toList());
    }

    public PasanteResponseDTO convertirEntidadADTO(Pasante p) {
        PasanteResponseDTO dto = new PasanteResponseDTO();
        
        dto.setId(p.getId());
        dto.setCedula(p.getCedula()); 
        dto.setRutaInforme(p.getRutaInforme());
        dto.setRutaFotografia(p.getRutaFotografia());
        dto.setFechaInicio(p.getFechaInicio());
        dto.setFechaFinalizacion(p.getFechaFinalizacion());
        dto.setFechaNacimiento(p.getFechaNacimiento());
        dto.setTituloPretendido(p.getTituloPretendido());

        if (p.getInstituto() != null) {
            dto.setNombreInstituto(p.getInstituto().getNombreInstituto());
        }

        if (p.getDepartamento() != null) {
            dto.setDepartamentoAsignado(p.getDepartamento().getNombre());
            // Como la tabla pasante ahora guarda el departamento, podemos obtener la gerencia en cascada:
            if (p.getDepartamento().getGerencia() != null) {
                dto.setGerenciaAsignada(p.getDepartamento().getGerencia().getNombre());
            }
        }

        if (p.getUsuario() != null) {
            dto.setFicha(p.getUsuario().getFicha());
            dto.setNombre(p.getUsuario().getNombre());
            dto.setExtension(p.getUsuario().getExtension());
            // Si quieres también puedes enviar la gerencia guardada en el usuario, pero ya la enviamos desde el departamento arriba.
        }

        return dto;
    }
}