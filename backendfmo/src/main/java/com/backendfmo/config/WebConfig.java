package com.backendfmo.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Obtenemos la ruta raíz del proyecto
        String projectRoot = System.getProperty("user.dir");
        
        // 1. Construimos la ruta física hacia la carpeta de PASANTES
        String rutaPasantes = Paths.get(projectRoot, "src", "main", "resources", "pasantes").toUri().toString() + "/";

        // 2. Construimos la ruta física hacia la carpeta de MANTENIMIENTOS
        String rutaMantenimientos = Paths.get(projectRoot, "src", "main", "resources", "mantenimientos").toUri().toString() + "/";

        // Mapeo 1: Todo lo que empiece por /recursos-pasantes/ busca en la carpeta pasantes
        registry.addResourceHandler("/recursos-pasantes/**")
                .addResourceLocations(rutaPasantes);
                
        // Mapeo 2: Todo lo que empiece por /mantenimientos/ busca en la carpeta mantenimientos
        registry.addResourceHandler("/mantenimientos/**")
                .addResourceLocations(rutaMantenimientos);
    }
}