/**
 * api.js
 * Módulo centralizado para la comunicación con el Backend Spring Boot
 */

const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8081/api', // Tu Backend Java
    AUTH_ENDPOINT: '/auth/login',
    TOKEN_KEY: 'jwt_token' // Nombre de la llave en sessionStorage
};

const ApiService = {
    
    // --- 1. AUTENTICACIÓN ---

    /**
     * Realiza el login y devuelve el token
     */
    async login(username, clave) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, clave })
            });

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error("Credenciales incorrectas");
                }
                throw new Error(`Error del servidor: ${response.status}`);
            }

            // El backend devuelve el token como texto plano (String)
            const token = await response.text();
            return token;

        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    },

    /**
     * Cierra la sesión eliminando el token
     */
    logout() {
        sessionStorage.removeItem(API_CONFIG.TOKEN_KEY);
        window.location.href = '/';
    },

    // --- 2. PETICIONES GENÉRICAS PROTEGIDAS ---

    /**
     * Wrapper para fetch que inyecta automáticamente el Token JWT
     * @param {string} endpoint - Ej: '/api/stock'
     * @param {object} options - Opciones estándar de fetch (method, body, etc.)
     */
    async fetchAutenticado(endpoint, options = {}) {
        const token = sessionStorage.getItem(API_CONFIG.TOKEN_KEY);

        // Si no hay token, forzamos salida (Seguridad Frontend)
        if (!token) {
            console.warn("No hay token, redirigiendo al login...");
            window.location.href = '/';
            return;
        }

        // Configurar Headers por defecto
        const defaultHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Combinar headers personalizados si existen
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);

            // Si el token expiró o es inválido (403 Forbidden)
            if (response.status === 403) {
                alert("Su sesión ha expirado. Por favor ingrese nuevamente.");
                this.logout();
                return null;
            }

            return response;

        } catch (error) {
            console.error("Error en petición autenticada:", error);
            throw error;
        }
    }
};

// Exponer globalmente para que otros scripts lo usen
window.ApiService = ApiService;