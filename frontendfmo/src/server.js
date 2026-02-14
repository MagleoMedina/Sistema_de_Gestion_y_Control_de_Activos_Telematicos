const express = require('express');
const path = require('path');
const app = express();

// --- CONFIGURACIÓN DINÁMICA del FRONTEND ---
const PORT = 3000;
const HOST = 'localhost';

// Centralizamos la IP y Puerto del Backend usando variables de entorno 
const BACKEND_URL ='http://127.0.0.1:8081/api';

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// IMPORTANTE: Servir archivos estáticos (CSS, JS del cliente)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para exponer BACKEND_URL al frontend
app.get('/config/backend-url', (req, res) => {
    res.json({ BACKEND_URL });
});
// --- RUTAS DE NAVEGACIÓN (Renderizan el HTML) ---

// 1. Inicio
app.get('/dashboard', (req, res) => {
    res.render('pages/dashboard', { title: 'Inicio - FMO' });
});

// 2. Pantalla para ingresar Equipos (El formulario complejo)
app.get('/ingreso-equipos', (req, res) => {
    res.render('pages/recibo-equipos', { title: 'Recibo de Equipos' });
});

// 3. Pantalla para Periféricos sueltos
app.get('/perifericos', (req, res) => {
    res.render('pages/recibo-perifericos', { title: 'Recibo de Periféricos' });
});

// 4. Pantalla para Entregas DAET
app.get('/daet', (req, res) => {
    res.render('pages/recibo-daet', { title: 'Entregas DAET' });
});

// 5. Pantalla de Búsquedas (Trazabilidad)
// Ruta del Hub Principal
app.get('/busqueda', (req, res) => {
    res.render('pages/busqueda-hub', { title: 'Búsqueda' });
});

// Rutas de los Módulos
app.get('/busqueda/daet', (req, res) => {
    res.render('pages/busqueda-daet', { title: 'Búsqueda DAET' });
});

app.get('/busqueda/equipos', (req, res) => {
    res.render('pages/busqueda-equipos', { title: 'Búsqueda Equipos' });
});

app.get('/busqueda/perifericos', (req, res) => {
    res.render('pages/busqueda-perifericos', { title: 'Búsqueda Periféricos' });
});

app.get('/exportar', (req, res) => {
    res.render('pages/exportar-recibos', { title: 'Exportar Recibos' });
});

app.get('/gestion', (req, res) => {
    res.render('pages/gestion-usuarios', { title: 'Gestion Usuarios' });
});

// Ruta del Login
app.get('/', (req, res) => {
    res.render('pages/login');
});

// Ruta para procesar el Login (POST)
app.get('/auth/login', async (req, res) => {
    res.render('/dashboard'); // Temporal para probar
});
app.get('/health', async (req, res) => {
    try {
        // 1. Intentamos contactar al Backend Java (con un timeout corto de 2s)
        // Nota: fetch es nativo en Node v18+. Si usas Node viejo, usa 'axios' o 'node-fetch'
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos máx

        const response = await fetch(`${BACKEND_URL}/status`, { 
            method: 'GET',
            signal: controller.signal 
        });
        clearTimeout(timeoutId);

        // 2. Si Java responde 200, le decimos al navegador que todo está OK
        if (response.ok) {
            res.sendStatus(200);
        } else {
            // Java respondió pero con error (ej. 500)
            res.sendStatus(503);
        }

    } catch (error) {
        // 3. Si ocurre error de conexión (Java apagado), respondemos error
        // console.error("Java Backend no responde:", error.message);
        res.sendStatus(503); // Service Unavailable
    }
});

app.get('/stock', (req, res) => {
    res.render('pages/stock', { title: 'Stock e Inventario' });
});
app.get('/eliminar', (req, res) => {
    res.render('pages/eliminar-registros', { title: 'Stock e Inventario' });
});
// Ruta para el formulario de crear casos
app.get('/casos/crear', (req, res) => {
    res.render('pages/casos-resueltos', { title: 'Registrar Caso' });
});

// Ruta placeholder para buscar (para que el botón del sidebar funcione)
app.get('/casos/buscar', (req, res) => {
    res.render('pages/busqueda-casos', { title: 'Buscar Casos' }); // Asumiendo que crearás esta vista luego
});
// Iniciar servidor
const server = app.listen(PORT, HOST, () => {
    //console.log(`Frontend Express corriendo en http://${HOST}:${PORT}`);
});

module.exports = { server, PORT, HOST, BACKEND_URL };
