package com.backendfmo.services;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backendfmo.models.casos.CasosResueltos;
import com.backendfmo.models.reciboequipos.Usuario;
import com.backendfmo.repository.CasosResueltosRepository;
import com.backendfmo.repository.UsuarioRepository;
import com.backendfmo.dtos.request.casos.CasoConUsuarioDTO;

@Service
public class CasosResueltosServiceImpl {

    @Autowired
    private CasosResueltosRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository; // Para validar la existencia del usuario

    @Transactional
    public CasoConUsuarioDTO guardarCasoConNuevoUsuario(CasoConUsuarioDTO dto) {
        // 1. Crear y guardar el Usuario primero
        Usuario nuevoUsuario = new Usuario();

        nuevoUsuario.setFicha(dto.getFicha());
        nuevoUsuario.setNombre(dto.getNombre());
        nuevoUsuario.setGerencia(dto.getGerencia());

        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // 2. Crear y guardar el Caso asociado al usuario recién creado
        CasosResueltos nuevoCaso = new CasosResueltos();
        nuevoCaso.setUsuario(usuarioGuardado); // Asociación directa
        nuevoCaso.setFecha(dto.getFecha());
        nuevoCaso.setReporte(dto.getReporte());
        nuevoCaso.setAtendidoPor(dto.getAtendidoPor());
        nuevoCaso.setEquipo(dto.getEquipo());

        CasosResueltos casoGuardado = repository.save(nuevoCaso);

        // 3. Retornar el DTO de respuesta
        return convertirADTO(casoGuardado);
    }

    // Helper para convertir Entidad -> DTO
    private CasoConUsuarioDTO convertirADTO(CasosResueltos entidad) {
        CasoConUsuarioDTO dto = new CasoConUsuarioDTO();

        // 1. Mapeo de datos del Usuario asociado
        Usuario user = entidad.getUsuario();

        dto.setFicha(user.getFicha());
        dto.setNombre(user.getNombre());
        dto.setGerencia(user.getGerencia());
   

        // 2. Mapeo de datos del Caso
        dto.setId(entidad.getId());
        dto.setFecha(entidad.getFecha());
        dto.setReporte(entidad.getReporte());
        dto.setAtendidoPor(entidad.getAtendidoPor());
        dto.setEquipo(entidad.getEquipo());

        return dto;
    }

    @Transactional(readOnly = true)
    public List<CasoConUsuarioDTO> listarTodos() {
        List<CasosResueltos> casos = repository.findAll();
        if (casos.isEmpty()) {
            throw new RuntimeException("No se encontraron casos resueltos.");
        }

        return casos.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CasoConUsuarioDTO> listarPorFecha(String fecha) {
        // 1. Buscamos las entidades en la base de datos a través del repositorio
        List<CasosResueltos> entidades = repository.findByFecha(fecha);
        if (entidades.isEmpty()) {
            throw new RuntimeException("No se encontraron casos resueltos para la fecha: " + fecha);
        }
        // 2. Convertimos la lista de entidades a una lista de DTOs para la respuesta
        return entidades.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CasoConUsuarioDTO> buscarPorTecnico(String tecnico) {
        // El repositorio buscará coincidencias parciales
        List<CasosResueltos> entidades = repository.findByAtendidoPorContainingIgnoreCase(tecnico);
        if (entidades.isEmpty()) {
            throw new RuntimeException("No se encontraron casos resueltos para el técnico: " + tecnico);
        }
        return entidades.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CasoConUsuarioDTO> listarPorRangoFechas(String inicio, String fin) {
        // 1. Validación de campos vacíos o nulos
        if (inicio == null || inicio.isEmpty() || fin == null || fin.isEmpty()) {
            throw new IllegalArgumentException("Ambas fechas (inicio y fin) son obligatorias.");
        }

        // 2. Validación de lógica cronológica
        // Al ser strings en formato YYYY-MM-DD, el compareTo funciona perfectamente
        if (inicio.compareTo(fin) > 0) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha de finalización.");
        }

        // 3. Consulta y transformación
        List<CasosResueltos> entidades = repository.findByFechaBetween(inicio, fin);

        if (entidades.isEmpty()) {
            throw new RuntimeException(
                    "No se encontraron casos resueltos en el rango de fechas: " + inicio + " - " + fin);
        }
        return entidades.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean eliminarCaso(Integer id) {
        // 1. Verificar si el registro existe
        if (!repository.existsById(id)) {
            throw new RuntimeException("El caso con ID " + id + " no existe.");
        }

        try {
            // 2. Ejecutar la eliminación
            repository.deleteById(id);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar el registro: " + e.getMessage());
        }
    }

    @Transactional
    public List<CasoConUsuarioDTO> listarPorFicha(Integer ficha) {
        // 1. Obtener la lista de entidades desde el repositorio
        List<CasosResueltos> entidades = repository.buscarPorFichaDeUsuario(ficha);
        if (!repository.existsByUsuario_Ficha(ficha)) {
            throw new RuntimeException("No existe ningún registro con la ficha: " + ficha);
        }
        if (entidades.isEmpty()) {
            throw new RuntimeException("No se encontraron casos resueltos para la ficha: " + ficha);
        }

        // 2. Convertir y retornar la lista de DTOs
        return entidades.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public ByteArrayInputStream generarReporteCsv(String fechaInicio, String fechaFin) {
        // 1. Obtener la data filtrada
        List<CasosResueltos> casos = repository.findByFechaBetween(fechaInicio, fechaFin);

        // 2. Preparar el flujo de salida
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (PrintWriter writer = new PrintWriter(out)) {

            // TRUCO: Agregar BOM (Byte Order Mark) para que Excel reconozca UTF-8 (tildes y
            // ñ)
            out.write(0xEF);
            out.write(0xBB);
            out.write(0xBF);

            // 3. Crear Encabezados del CSV
            // Usamos punto y coma (;) que suele ser el estándar por defecto en Excel en
            // español,
            // o coma (,) si tu configuración regional es inglés. Aquí uso coma.
            writer.println("ID,Ficha,Nombre,Gerencia,Fecha Atencion,Atendido Por,Reporte");

            // 4. Recorrer la lista y escribir filas
            for (CasosResueltos caso : casos) {
                Usuario user = caso.getUsuario();

                // Manejo de nulos seguro
                String ficha = (user != null && user.getFicha() != null) ? user.getFicha().toString() : "S/D";
                String nombre = (user != null) ? escaparCsv(user.getNombre()) : "Usuario Eliminado";
                String gerencia = (user != null) ? escaparCsv(user.getGerencia()) : "S/D";

                String linea = String.format("%s,%s,%s,%s,%s,%s,%s",
                        caso.getId(),
                        ficha,
                        nombre,
                        gerencia,
                        caso.getFecha(),
                        escaparCsv(caso.getAtendidoPor()), // Asegúrate de usar el getter correcto
                        escaparCsv(caso.getReporte()));

                writer.println(linea);
            }

            writer.flush();
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Error al generar el archivo CSV: " + e.getMessage());
        }
    }

    // Método auxiliar para evitar que las comas o saltos de línea dentro del texto
    // rompan el CSV
    private String escaparCsv(String texto) {
        if (texto == null)
            return "";
        // Reemplazar comillas dobles por comillas simples para evitar conflicto
        String limpio = texto.replace("\"", "'");
        // Reemplazar saltos de línea por espacios
        limpio = limpio.replace("\n", " ").replace("\r", " ");
        // Si el texto contiene comas, lo encerramos en comillas dobles (estándar CSV)
        if (limpio.contains(",")) {
            return "\"" + limpio + "\"";
        }
        return limpio;
    }
}
