// src/public/js/api.js

const API_BASE_URL = 'http://127.0.0.1:8081/api';

/**
 * Objeto centralizado para manejar todas las peticiones al Backend
 */
const ApiService = {

    // --- Módulo de Ingresos (MegaRegistro) ---
    ingresos: {
        async crear(data) {
            try {
                const response = await fetch(`${API_BASE_URL}/ingresos/crear-todo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Error al guardar ingreso');
                return await response.json();
            } catch (error) {
                console.error('Error API Ingresos:', error);
                throw error; // Re-lanzamos el error para manejarlo en la vista
            }
        },
        // Aquí podrías agregar buscarPorFmo(fmo) ...
        async buscarPorFmo(fmo) {
             const response = await fetch(`${API_BASE_URL}/consultas/buscar?fmo=${fmo}`);
             if (!response.ok) throw new Error('No encontrado');
             return await response.json();
        }
    },

    // --- Módulo de Periféricos ---
    perifericos: {
        async crear(data) {
            try {
                const response = await fetch(`${API_BASE_URL}/perifericos/crear`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Error al guardar periféricos');
                return await response.json();
            } catch (error) {
                console.error('Error API Periféricos:', error);
                throw error;
            }
        },
        async buscarPorSerial(serial) {
            const response = await fetch(`${API_BASE_URL}/perifericos/buscar?serial=${serial}`);
            if (!response.ok) throw new Error('Periférico no encontrado');
            return await response.json();
        }
    },

    // --- Módulo DAET ---
    daet: {
        async crear(data) {
            try {
                const response = await fetch(`${API_BASE_URL}/daet/entregas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Error al guardar entrega DAET');
                return await response.json();
            } catch (error) {
                console.error('Error API DAET:', error);
                throw error;
            }
        },
        async buscarPorSerial(serial) {
            const response = await fetch(`${API_BASE_URL}/daet/buscar?serial=${serial}`);
            if (!response.ok) throw new Error('Entrega DAET no encontrada');
            return await response.json();
        }
    }
};