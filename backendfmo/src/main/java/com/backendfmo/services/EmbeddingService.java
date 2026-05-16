package com.backendfmo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.genai.Client;
import com.google.genai.types.EmbedContentResponse;

import jakarta.annotation.PostConstruct;

@Service
public class EmbeddingService {

    @Value("${ia.llm.api.key}")
    private String apiKey;

    private Client client;

    @PostConstruct
    public void init() {
        this.client = Client.builder().apiKey(apiKey).build();
    }

    /**
     * 1. Convierte un texto (reporte o prompt) en un Vector Numérico.
     */
    public List<Float> generarVector(String texto) {
        try {
            EmbedContentResponse response = client.models.embedContent(
                "gemini-embedding-001", 
                texto, 
                null
            );
            
            // 1. Abrimos la primera caja (la lista de embeddings)
            if (response.embeddings().isPresent() && !response.embeddings().get().isEmpty()) {
                
                // Tomamos el primer vector
                var primerVector = response.embeddings().get().get(0);
                
                // 2. Abrimos la segunda caja (los valores numéricos)
                if (primerVector.values().isPresent()) {
                    return primerVector.values().get(); // Extraemos la List<Float> real
                }
            }
            
            System.err.println("[DEBUG EMBEDDING] La API de IA no devolvió vectores para este texto.");
            return null;
            
        } catch (Exception e) {
            System.err.println("[DEBUG EMBEDDING] Error al vectorizar: " + e.getMessage());
            return null;
        }
    }

    /**
     * 2. Calcula la "Similitud de Coseno" entre dos vectores.
     * Retorna un valor entre -1.0 y 1.0 (1.0 es una coincidencia exacta).
     */
    public double calcularSimilitud(List<Float> vectorA, List<Float> vectorB) {
        if (vectorA == null || vectorB == null || vectorA.size() != vectorB.size()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.size(); i++) {
            dotProduct += vectorA.get(i) * vectorB.get(i);
            normA += Math.pow(vectorA.get(i), 2);
            normB += Math.pow(vectorB.get(i), 2);
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}