package com.backendfmo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backendfmo.dtos.response.csv.CsvDTO;
import com.backendfmo.models.reciboequipos.EncabezadoRecibo;
import com.backendfmo.repository.EncabezadoReciboRepository;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class CsvServiceImpl {

    @Autowired
    private EncabezadoReciboRepository encabezadoRepository;

 public List<CsvDTO> obtenerDatosParaCsv(String inicio, String fin) {
        // 1. Buscar registros en la BD
        List<EncabezadoRecibo> recibos = encabezadoRepository.findByFechaBetween(inicio, fin);
        
        // 2. Mapear a DTO
        return recibos.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    private CsvDTO convertirADTO(EncabezadoRecibo entidad) {
        CsvDTO dto = new CsvDTO();
        
        // --- Mapeo de Datos del Encabezado ---
        dto.setFecha(entidad.getFecha() != null ? entidad.getFecha().toString() : "");
        dto.setFmoEquipo(entidad.getFmoEquipo());
        dto.setFalla(entidad.getFalla());
        dto.setRecibidoPor(entidad.getRecibidoPor());
        dto.setSolicitudDaet(entidad.getSolicitudDAET());
        dto.setEntregadoPor(entidad.getAsignadoA()); // Ojo: Verifica si entregadoPor es 'asignadoA' o un campo específico
        
        // --- Mapeo de Datos del Usuario (Relación Padre) ---
        // Asumiendo que Encabezado tiene una relación @ManyToOne con Usuario llamada 'usuario'
        if (entidad.getUsuarioRelacion() != null) {
            dto.setUsuario(entidad.getUsuarioRelacion().getNombre());
            dto.setExtension(entidad.getUsuarioRelacion().getExtension());
            dto.setGerencia(entidad.getUsuarioRelacion().getGerencia());
            dto.setFicha(String.valueOf(entidad.getUsuarioRelacion().getFicha()));
        } else {
            // Manejo si no hay usuario asociado
            dto.setUsuario("N/A");
        }

        // --- Campo NULL ---
        dto.setRetiradorPor(null); // O "" si prefieres vacío en lugar de null

        return dto;
    }

    public ByteArrayInputStream generarCsvStream(String inicio, String fin) {
    // 1. Obtener la data (reutilizamos tu lógica anterior)
    List<CsvDTO> datos = obtenerDatosParaCsv(inicio, fin);

    // 2. Preparar el Stream de salida
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    
    // Usamos UTF-8 y añadimos el BOM (\uFEFF) para que Excel reconozca las tildes y ñ automáticamente
    try (PrintWriter writer = new PrintWriter(new java.io.OutputStreamWriter(out, StandardCharsets.UTF_8))) {
        
        writer.write('\uFEFF'); // BOM para Excel

        // 3. Escribir Encabezados (Header)
        // El orden debe coincidir con los datos de abajo
        String[] encabezados = {
            "Fecha", "Ficha", "Usuario", "Gerencia", "Extensión", 
            "Equipo FMO", "Falla Reportada", "Solicitud DAET", 
            "Entregado Por", "Recibido Por", "Retirado Por"
        };
        writer.println(String.join(";", encabezados)); // Usamos punto y coma (;) que es más seguro para Excel en español

        // 4. Escribir Filas
        for (CsvDTO dato : datos) {
            writer.println(convertirALineaCsv(dato));
        }

        writer.flush();
        return new ByteArrayInputStream(out.toByteArray());

    } catch (Exception e) {
        throw new RuntimeException("Error al generar el archivo CSV: " + e.getMessage());
    }
}

// Método auxiliar para limpiar datos y evitar errores con los separadores
private String convertirALineaCsv(CsvDTO dato) {
    return String.join(";",
        limpiar(dato.getFecha()),
        limpiar(dato.getFicha()),
        limpiar(dato.getUsuario()),
        limpiar(dato.getGerencia()),
        limpiar(dato.getExtension()),
        limpiar(dato.getFmoEquipo()),
        limpiar(dato.getFalla()),
        limpiar(dato.getSolicitudDaet()),
        limpiar(dato.getEntregadoPor()),
        limpiar(dato.getRecibidoPor()),
        limpiar(dato.getRetiradorPor())
    );
}

// Evita que si un texto tiene ";" rompa las columnas, y maneja nulos
private String limpiar(String texto) {
    if (texto == null) return "";
    // Reemplazar saltos de línea y el separador (;) para no romper el CSV
    return texto.replace(";", ",").replace("\n", " ").trim();
}


}
