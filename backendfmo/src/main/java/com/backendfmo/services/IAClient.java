package com.backendfmo.services;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.backendfmo.dtos.request.casos.CasoConUsuarioDTO;
import com.backendfmo.dtos.request.ia.IAPromptRequest;
import com.backendfmo.dtos.request.ia.IAResponse;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

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

    @Autowired
    private EmbeddingService embeddingService; // Inyectamos el nuevo servicio

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Se ejecuta automáticamente al arrancar la aplicación
    @PostConstruct
    public void init() {
        this.client = Client.builder().apiKey(apiKey).build();
    }

@Override
    public String generarRespuesta(String prompt) {
        try {
            GenerateContentResponse response = client.models.generateContent(
                modelName,
                prompt,
                null
            );
            
            if (response != null && response.text() != null) {
                return response.text();
            } else {
                return "Error: La IA no devolvió ninguna respuesta válida.";
            }

        } catch (Exception e) {
            String errorMsg = e.getMessage().toLowerCase();
            //System.out.println("[DEBUG IA] Error capturado: " + e.getMessage());

            // --- VALIDACIÓN 1: SIN INTERNET O CONEXIÓN ---
            if (errorMsg.contains("timeout") || errorMsg.contains("connection") || errorMsg.contains("unreachable")|| errorMsg.contains("failed")) {
                return "Error de conectividad: No se pudo establecer comunicación con el servidor de IA. Verifique su conexión a internet.";
            }

            // --- VALIDACIÓN 2: SIN TOKENS O CUOTA EXCEDIDA ---
            if (errorMsg.contains("429") || errorMsg.contains("quota") || errorMsg.contains("exhausted") || errorMsg.contains("limit")) {
                return "Error de Recursos: Se ha alcanzado el límite de tokens o cuota diaria de la API de IA.";
            }

            return "Error inesperado en el servicio de IA: " + e.getMessage();
        }
    }

    public IAResponse procesarConsultaIA(IAPromptRequest request) {
        System.out.println("========== INICIANDO BÚSQUEDA VECTORIAL ==========");
        IAResponse response = new IAResponse();

        // 1. Vectorizar el prompt del usuario
        List<Float> vectorUsuario = embeddingService.generarVector(request.getPrompt());
        
        List<CasoConUsuarioDTO> historial = casosResueltos.listarTodos();
        CasoConUsuarioDTO mejorMatch = null;
        double mejorPuntuacion = -1.0;

        // 2. Búsqueda por Similitud de Coseno en Memoria
        if (vectorUsuario != null && historial != null) {
            for (CasoConUsuarioDTO caso : historial) {
                if (caso.getVectorEmbedding() != null && !caso.getVectorEmbedding().isEmpty()) {
                    try {
                        // Convertir el JSON de SQLite de vuelta a List<Float>
                        List<Float> vectorCaso = objectMapper.readValue(
                            caso.getVectorEmbedding(), 
                            new TypeReference<List<Float>>(){}
                        );
                        
                        double similitud = embeddingService.calcularSimilitud(vectorUsuario, vectorCaso);
                        
                        // Si la similitud es mayor al 75% (0.75) y es la más alta hasta ahora
                        if (similitud > 0.75 && similitud > mejorPuntuacion) {
                            mejorPuntuacion = similitud;
                            mejorMatch = caso;
                        }
                    } catch (Exception e) {
                        System.out.println("[DEBUG] Error procesando vector del ID " + caso.getId());
                    }
                }
            }
        }

        if (mejorMatch != null) {
            System.out.println("[DEBUG] Mejor match vectorial: ID " + mejorMatch.getId() + " (Score: " + mejorPuntuacion + ")");
        } else {
            System.out.println("[DEBUG] No se encontraron coincidencias vectoriales con similitud > 75%");
        }

        response.setMejorCoincidenciaDB(mejorMatch);

        // 3. Generar la solución final con el contexto encontrado
        String contextoDB = (mejorMatch != null) 
            ? "Contexto histórico muy similar encontrado: " + mejorMatch.getReporte()
            : "No hay antecedentes exactos en la base de datos.";

        String promptFinal = String.format(
            "Rol: Analista Experto de Telemática (Nivel 3).\n" +
            "Falla: '%s'\n" +
            "Contexto BD: '%s'\n\n" +
            "Instrucción: Genera una solución técnica elocuente y directa. " +
            "Para optimizar tokens, cumple estas REGLAS ESTRICTAS:\n" +
            "1. CERO saludos, introducciones o conclusiones.\n" +
            "2. Proporciona solo un diagnóstico breve (1 línea) y pasos de acción concretos en viñetas.\n" +
            "3. Usa lenguaje técnico preciso y profesional.",
            request.getPrompt(), contextoDB
        );

        response.setSolucionIA(this.generarRespuesta(promptFinal));
        response.setAnalisisContexto(mejorMatch != null ? "Sugerencia basada en RAG (Vectores)." : "Generado puramente por IA.");

        System.out.println("========== FIN BÚSQUEDA VECTORIAL ==========\n");
        return response;
    }

}