const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// IMPORTANTE: Servir archivos estáticos (CSS, JS del cliente)
app.use(express.static(path.join(__dirname, 'public')));


// --- RUTAS DE NAVEGACIÓN (Renderizan el HTML) ---

// 1. Inicio
app.get('/', (req, res) => {
    res.render('pages/dashboard', { title: 'Inicio - FMO' });
});

// 2. Pantalla para ingresar Equipos (El formulario complejo)
app.get('/ingreso-equipos', (req, res) => {
    res.render('pages/ingreso-equipos', { title: 'Registro de Equipos' });
});

// 3. Pantalla para Periféricos sueltos
app.get('/perifericos', (req, res) => {
    res.render('pages/perifericos', { title: 'Gestión Periféricos' });
});

// 4. Pantalla para Entregas DAET
app.get('/daet', (req, res) => {
    res.render('pages/daet', { title: 'Entregas DAET' });
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

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`Frontend Express corriendo en http://localhost:${PORT}`);
});

module.exports = server;