package com.backendfmo.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Obtenemos la ruta dinámica de la PC actual
        String projectRoot = System.getProperty("user.dir");
        
        // Construimos la ruta absoluta hacia donde guardaste las fotos
        // OJO: Usamos "file:///" para decirle que es un archivo del sistema
        String rutaPasantes = Paths.get(projectRoot, "src", "main", "resources", "pasantes").toUri().toString();

        // Configuración:
        // Cuando alguien pida: http://localhost:8081/recursos-pasantes/fotografia/foto.png
        // Spring buscará en:   /home/usuario/proyecto/src/main/resources/pasantes/fotografia/foto.png
        
        registry.addResourceHandler("/recursos-pasantes/**")
                .addResourceLocations(rutaPasantes);
    }
}