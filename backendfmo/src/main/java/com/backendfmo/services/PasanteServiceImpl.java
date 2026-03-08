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

    public PasanteResponseDTO buscarPorFicha(Integer ficha) {
        Pasante pasante = pasanteRepository.findByUsuarioFicha(ficha)
            .orElseThrow(() -> new RuntimeException("No se encontró pasante con la ficha: " + ficha));
        return convertirEntidadADTO(pasante);
    }

    // Buscar lista de pasantes que coincidan con un nombre
    public List<PasanteResponseDTO> buscarPorNombre(String nombre) {
        List<Pasante> pasantes = pasanteRepository.findByUsuarioNombreContainingIgnoreCase(nombre)  ;
        if (pasantes.isEmpty()) {
            throw new RuntimeException("No se encontraron pasantes con el nombre: " + nombre);
        }
        return pasantes.stream()
                .map(this::convertirEntidadADTO)
                .collect(Collectors.toList());
    }


    @Transactional
    public PasanteResponseDTO actualizarPasante(Long id, PasanteRegistroDTO dto, MultipartFile fotoFile, MultipartFile informeFile) throws IOException {
        
        // 1. Buscar el pasante existente
        Pasante pasante = pasanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pasante no encontrado con el ID: " + id));

        // 2. Actualizar datos del Usuario
        Usuario usuario = pasante.getUsuario();
        usuario.setFicha(dto.getFicha());
        usuario.setNombre(dto.getNombre());
        usuario.setExtension(dto.getExtension());
        usuario.setGerencia(dto.getGerencia());
        usuarioRepository.save(usuario);

        // 3. Actualizar Instituto
        Instituto instituto = institutoRepository.findByNombreInstitutoIgnoreCase(dto.getNombreInstituto())
                .orElseGet(() -> {
                    Instituto i = new Instituto();
                    i.setNombreInstituto(dto.getNombreInstituto());
                    return institutoRepository.save(i);
                });
        pasante.setInstituto(instituto);

        // 4. Actualizar Gerencia y Departamento
        Gerencia gerencia = gerenciaRepository.findByNombreIgnoreCase(dto.getGerencia())
                .orElseGet(() -> {
                    Gerencia g = new Gerencia();
                    g.setNombre(dto.getGerencia());
                    return gerenciaRepository.save(g);
                });

        Departamento departamento = departamentoRepository.findByNombreIgnoreCaseAndGerencia(dto.getAreaAsignada(), gerencia)
                .orElseGet(() -> {
                    Departamento d = new Departamento();
                    d.setNombre(dto.getAreaAsignada());
                    d.setGerencia(gerencia);
                    return departamentoRepository.save(d);
                });
        pasante.setDepartamento(departamento);

        // 5. Actualizar campos escalares del Pasante
        pasante.setCedula(dto.getCedula());
        pasante.setFechaInicio(dto.getFechaInicio());
        pasante.setFechaFinalizacion(dto.getFechaFinalizacion());
        pasante.setFechaNacimiento(dto.getFechaNacimiento());
        pasante.setTituloPretendido(dto.getTituloPretendido());

        // 6. MANEJO DE ARCHIVOS: Sobreescribir si se envían archivos nuevos
        if (fotoFile != null && !fotoFile.isEmpty()) {
            if (pasante.getRutaFotografia() != null && !pasante.getRutaFotografia().isEmpty()) {
                // Sobreescribe manteniendo el nombre exacto registrado en la BD
                sobreescribirArchivo(fotoFile, rootFoto, pasante.getRutaFotografia());
            } else {
                // Si por alguna razón no tenía foto previa, creamos una nueva
                String nombreSinEspacios = usuario.getNombre().replaceAll("\\s+", "");
                String nombreBaseFoto = usuario.getFicha() + "_foto_" + nombreSinEspacios;
                pasante.setRutaFotografia(guardarArchivo(fotoFile, rootFoto, nombreBaseFoto));
            }
        }

        if (informeFile != null && !informeFile.isEmpty()) {
            if (pasante.getRutaInforme() != null && !pasante.getRutaInforme().isEmpty()) {
                // Sobreescribe manteniendo el nombre exacto registrado en la BD
                sobreescribirArchivo(informeFile, rootInforme, pasante.getRutaInforme());
            } else {
                String nombreSinEspacios = usuario.getNombre().replaceAll("\\s+", "");
                String nombreBaseInforme = usuario.getFicha() + "_informe_" + nombreSinEspacios;
                pasante.setRutaInforme(guardarArchivo(informeFile, rootInforme, nombreBaseInforme));
            }
        }

        // Guardar y retornar el DTO
        Pasante pasanteActualizado = pasanteRepository.save(pasante);
        return convertirEntidadADTO(pasanteActualizado);
    }

    // --- NUEVO MÉTODO PARA SOBREESCRIBIR ---
    private void sobreescribirArchivo(MultipartFile file, Path rutaBase, String nombreExacto) throws IOException {
        if (!Files.exists(rutaBase)) {
            Files.createDirectories(rutaBase);
        }
        
        // Se usa el nombreExacto que ya incluye la extensión (ej: "9900_foto_Juan.png")
        Path rutaArchivo = rutaBase.resolve(nombreExacto);
        
        // REPLACE_EXISTING reemplaza el contenido del archivo si ya existe
        Files.copy(file.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);
    }


    @Transactional
    public void eliminarPasante(Long id) throws IOException {
        // 1. Buscar el pasante en la base de datos
        Pasante pasante = pasanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pasante no encontrado con el ID: " + id));

        // 2. Eliminar la Fotografía física
        if (pasante.getRutaFotografia() != null && !pasante.getRutaFotografia().isEmpty()) {
            Path archivoFoto = rootFoto.resolve(pasante.getRutaFotografia());
            Files.deleteIfExists(archivoFoto); // Solo elimina si el archivo realmente existe
        }

        // 3. Eliminar el Informe físico
        if (pasante.getRutaInforme() != null && !pasante.getRutaInforme().isEmpty()) {
            Path archivoInforme = rootInforme.resolve(pasante.getRutaInforme());
            Files.deleteIfExists(archivoInforme);
        }
        // Primero eliminamos el pasante (tabla hija)
        pasanteRepository.delete(pasante);
        
        // Opcional: Si deseas que al eliminar al pasante también se elimine su usuario
        // de la tabla 'usuario' (para liberar la ficha), descomenta la siguiente línea:
         // 4. Eliminar el registro de la base de datos   
        Usuario usuario = pasante.getUsuario();
         usuarioRepository.delete(usuario);
    }
}