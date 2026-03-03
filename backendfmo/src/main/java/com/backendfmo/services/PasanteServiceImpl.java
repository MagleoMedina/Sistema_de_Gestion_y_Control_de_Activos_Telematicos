package com.backendfmo.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.backendfmo.dtos.request.pasantes.PasanteRegistroDTO;
import com.backendfmo.models.pasantes.Instituto;
import com.backendfmo.models.pasantes.Pasante;
import com.backendfmo.models.reciboequipos.Usuario;
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

        // --- 3. MANEJO DE ARCHIVOS (LÓGICA ACTUALIZADA) ---
        
        // A. Limpiamos el nombre: "Yuriannys Garcia" -> "YuriannysGarcia" (sin espacios)
        String nombreSinEspacios = usuarioGuardado.getNombre().replaceAll("\\s+", "");

        // B. Construimos el nombre base: "9950_foto_YuriannysGarcia"
        String nombreBaseFoto = usuarioGuardado.getFicha() + "_foto_" + nombreSinEspacios;
        String nombreBaseInforme = usuarioGuardado.getFicha() + "_informe_" + nombreSinEspacios;

        // C. Llamamos a guardar (Ahora pasamos el nombre completo deseado)
        String rutaFoto = guardarArchivo(fotoFile, rootFoto, nombreBaseFoto);
        String rutaInforme = guardarArchivo(informeFile, rootInforme, nombreBaseInforme);
        // --------------------------------------------------

        // 4. CREACIÓN DEL PASANTE
        Pasante pasante = pasanteRepository.findById(usuarioGuardado.getId().longValue()) 
                          .orElse(new Pasante());

        pasante.setUsuario(usuarioGuardado);
        pasante.setInstituto(instituto);
        pasante.setFechaInicio(dto.getFechaInicio());
        pasante.setFechaFinalizacion(dto.getFechaFinalizacion());
        pasante.setAreaAsignada(dto.getAreaAsignada());
        pasante.setFechaNacimiento(dto.getFechaNacimiento());
        pasante.setTituloPretendido(dto.getTituloPretendido());

        if (rutaFoto != null) pasante.setRutaFotografia(rutaFoto);
        if (rutaInforme != null) pasante.setRutaInforme(rutaInforme);

        return pasanteRepository.save(pasante);
    }

    // --- FUNCIÓN ACTUALIZADA ---
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

        // --- CAMBIO CLAVE ---
        // Antes devolvíamos: rutaArchivo.toString() (Ruta absoluta /home/magleo...)
        // Ahora devolvemos: nombreFinal (Solo el archivo "9950_foto_X.png")
        return nombreFinal; 
    }
}