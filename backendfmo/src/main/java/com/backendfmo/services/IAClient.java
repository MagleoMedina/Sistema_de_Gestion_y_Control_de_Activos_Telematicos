package com.backendfmo.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.backendfmo.dtos.request.casos.CasoConUsuarioDTO;
import com.backendfmo.dtos.request.ia.IAPromptRequest;
import com.backendfmo.dtos.request.ia.IAResponse;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

import jakarta.annotation.PostConstruct;

@Service
public class IAClient implements LLMClient {

    @Value("${ia.llm.api.key}")
    private String apiKey;

    @Value("${ia.llm.model}")
    private String modelName;

    @Autowired
    private CasosResueltosServiceImpl casosResueltos;

    // Instancia del cliente oficial de Google
    private Client client;

    // Se ejecuta automáticamente al arrancar la aplicación
    @PostConstruct
    public void init() {
        this.client = Client.builder().apiKey(apiKey).build();
    }

    @Override
    public String generarRespuesta(String prompt) {
        try {
            // Petición limpia y directa usando el SDK
            GenerateContentResponse response = client.models.generateContent(
                modelName,
                prompt,
                null
            );
            
            // Validación de seguridad
            if (response != null && response.text() != null) {
                return response.text();
            } else {
                return "Error: La IA no devolvió ninguna respuesta válida.";
            }

        } catch (Exception e) {
            return "Error inesperado al conectar con el servicio de IA: " + e.getMessage();
        }
    }

    public IAResponse procesarConsultaIA(IAPromptRequest request) {
        IAResponse response = new IAResponse();

        // 1. BUSCAR MEJOR COINCIDENCIA EN LA BASE DE DATOS USANDO IA
        List<CasoConUsuarioDTO> historial = casosResueltos.listarTodos();
        
        Long idMejorCoincidencia = buscarMejorIdConIA(request.getPrompt(), historial);

        CasoConUsuarioDTO mejorMatch = null;
        if (idMejorCoincidencia != null) {
            mejorMatch = historial.stream()
                .filter(m -> m.getId() != null && m.getId().equals(idMejorCoincidencia))
                .findFirst()
                .orElse(null);
        }

        response.setMejorCoincidenciaDB(mejorMatch);

        // 2. GENERAR SOLUCIÓN PROPIA CON IA
        String contextoDB = (mejorMatch != null) 
            ? "Historial relevante encontrado en la base de datos: " + mejorMatch.getReporte()
            : "No hay antecedentes exactos en la base de datos.";

        String promptFinal = String.format(
            "Actúa como un experto en soporte técnico de la Gerencia de Telemática de CVG Ferrominera. " +
            "Problema reportado: %s. %s. " +
            "Genera una solución técnica detallada, paso a paso y profesional para este escenario.",
            request.getPrompt(), contextoDB
        );

        response.setSolucionIA(this.generarRespuesta(promptFinal));
        response.setAnalisisContexto(mejorMatch != null ? "Sugerencia basada en IA y experiencia previa." : "Generado puramente por IA.");

        return response;
    }

    /**
     * Usa la IA para comparar el problema actual contra el historial 
     * y devolver únicamente el ID del registro más parecido por contexto.
     */
    private Long buscarMejorIdConIA(String promptUsuario, List<CasoConUsuarioDTO> historial) {
        if (historial == null || historial.isEmpty()) return null;

        // Construimos una lista simplificada para no saturar de tokens a la IA
        // Se asume que CasoConUsuarioDTO tiene el método getId()
        String listaCasos = historial.stream()
            .map(m -> "ID: " + m.getId() + " -> Resumen: " + m.getReporte())
            .collect(Collectors.joining("\n"));

        String promptBusqueda = String.format(
            "Dada la siguiente lista de casos técnicos resueltos:\n%s\n\n" +
            "¿Cuál de estos casos (proporciona solo el número de ID) es el más relevante para resolver este problema: '%s'?\n" +
            "Si ninguno tiene relación técnica real, responde exclusivamente: null. No des explicaciones ni añadas texto extra.",
            listaCasos, promptUsuario
        );

        String respuestaIA = this.generarRespuesta(promptBusqueda).trim();

        try {
            if (respuestaIA.equalsIgnoreCase("null")) return null;
            
            // Limpiamos la respuesta por si la IA agrega texto extra (ej. "El ID es: 12")
            String idLimpio = respuestaIA.replaceAll("[^0-9]", "");
            if (idLimpio.isEmpty()) return null;
            
            return Long.parseLong(idLimpio);
        } catch (Exception e) {
            return null; // Si hay un error de parseo, asumimos que no hubo coincidencia
        }
    }
}