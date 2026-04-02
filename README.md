# Sistema de Gestión de Soporte y Mantenimiento FMO 🛠️

Una plataforma web integral diseñada para la Gerencia de Telemática, orientada a agilizar, documentar y controlar los procesos de soporte técnico, mantenimiento de equipos y gestión de pasantes. 

El sistema permite la planificación de mantenimientos preventivos, registro de intervenciones en lote, subida de evidencia fotográfica optimizada y generación de reportes estadísticos exportables.

## ✨ Características Principales

### 🔧 Mantenimiento de Equipos
* **Programación:** Agendamiento de mantenimientos por gerencia con asignación de analistas responsables.
* **Registro en Lote:** Interfaz dinámica para registrar múltiples equipos intervenidos en una sola transacción.
* **Evidencia Fotográfica:** Subida de imágenes adjuntas a los reportes con **compresión automática (JPEG por Cuantización)** en el servidor para optimizar el almacenamiento.
* **Historial y Calendario:** Visualización interactiva de mantenimientos programados (Azul) y completados (Naranja) a través de un calendario anual.

### 📊 Reportes y Exportación
* **Exportación a CSV:** Generación de archivos Excel (CSV con codificación UTF-8 BOM) para garantizar la correcta visualización de caracteres especiales.
* **Reportes Detallados:** Exportación completa de todos los equipos, especificaciones y observaciones.
* **Reportes Estadísticos:** Exportación resumida que agrupa la cantidad de equipos/usuarios atendidos por gerencia y fecha.

### 🎓 Gestión de Pasantes
* Registro de datos personales, académicos y asignación departamental.
* Gestión de archivos adjuntos (fotografía de perfil e informe final).
* **Compresión de Documentos:** Optimización interna de archivos PDF utilizando el algoritmo LZW (vía Apache PDFBox).

### 🔐 Seguridad y Accesibilidad
* **Autenticación JWT:** Rutas protegidas mediante tokens web (JSON Web Tokens).
* **Control de Roles:** Funciones sensibles (como la eliminación de registros y fotos físicas) restringidas exclusivamente a usuarios con rol `ADMIN`.
* **Diseño Responsivo:** Interfaz adaptable a dispositivos móviles utilizando Bootstrap 5 y menús laterales colapsables.

---

## 💻 Stack Tecnológico

**Backend (Lógica de Negocio y API):**
* **Lenguaje:** Java
* **Framework:** Spring Boot
* **Persistencia:** Spring Data JPA / Hibernate
* **Base de Datos:** SQLite (Relacional)
* **Procesamiento de Archivos:** `javax.imageio` (Imágenes), `Apache PDFBox` (PDFs).

**Frontend (Interfaz de Usuario):**
* **Maquetado:** HTML5, CSS3, Bootstrap 5.
* **Motor de Plantillas:** EJS (Embedded JavaScript templates).
* **Interactividad:** JavaScript (Vanilla JS) con la API Fetch para peticiones asíncronas.
* **Iconos:** Bootstrap Icons.

---

## ⚙️ Instalación y Configuración Local

### Requisitos Previos
* Java Development Kit (JDK) 17 o superior.
* Node.js (si el frontend se sirve a través de un servidor Express/Node).
* Maven (para la gestión de dependencias del backend).

### Pasos para ejecutar el proyecto

#### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/soporte-fmo.git
cd soporte-fmo
```

#### 2. Configurar el Backend (Spring Boot)

- Navega a la carpeta del backend.
- Ejecuta Maven para descargar las dependencias:

  ```bash
  mvn clean install
  ```

- Inicia la aplicación:

  ```bash
  mvn spring-boot:run
  ```

> **Nota:** La base de datos SQLite se generará automáticamente según la configuración de `application.properties`.

#### 3. Configurar el Frontend

- Navega a la carpeta del cliente/frontend.
- Instala las dependencias necesarias:

  ```bash
  npm install
  ```

- Inicia el servidor de desarrollo:

  ```bash
  npm start
  ```

#### 4. Acceso

Abre tu navegador y dirígete a [http://localhost:3000](http://localhost:3000) (o el puerto configurado en tu servidor frontend).

---

## 📝 Licencia y Autoría

Desarrollado para la Gerencia de Telemática de FMO.