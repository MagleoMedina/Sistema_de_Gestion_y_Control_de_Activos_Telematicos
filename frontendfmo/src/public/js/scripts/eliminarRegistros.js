// --- CONFIGURACIÓN ---

// Variables de estado
let resultadosActuales = []; 
let idParaEliminar = null;
let tipoActual = 'equipos';

// --- LOGICA DE PLACEHOLDER DINÁMICO ---
const placeholderMap = {
    'equipos': "Inserte el FMO/CPU (Ej: 119...)",
    'perifericos': "Inserte el FMO Asignado (Ej: 119...)",
    'daet': "Inserte el FMO/Serial"
};

function actualizarPlaceholder() {
    const tipo = document.getElementById('selTipo').value;
    const input = document.getElementById('inputBusqueda');
    // Asignar el texto según el mapa, o un default por si acaso
    input.placeholder = placeholderMap[tipo] || "Ingrese el identificador...";
}

// Eventos para activar el cambio
document.addEventListener('DOMContentLoaded', () => {
    // 1. Asignar el evento 'change' al select
    document.getElementById('selTipo').addEventListener('change', actualizarPlaceholder);
    // 2. Ejecutar una vez al inicio
    actualizarPlaceholder();
});

// --- 1. BUSCAR REGISTROS ---
async function buscarRegistros() {
    tipoActual = document.getElementById('selTipo').value;
    const valorRaw = document.getElementById('inputBusqueda').value.trim();
    const tbody = document.getElementById('tablaResultados');

if (!valorRaw) {
        mostrarModal(`<strong>Campo Vacío</strong><br>Por favor ingrese un valor para realizar la búsqueda.`, 'warning');
        return;
    }

    // --- CORRECCIÓN AQUÍ: Codificar el valor para evitar problemas con "N/A" ---
   const valor = encodeURIComponent(valorRaw.replace(/\//g, '-'));

    // Definir URL según tipo
    let url = '';
    if (tipoActual === 'equipos') url = `/buscarReciboEquipos/${valor}`;
    else if (tipoActual === 'perifericos') url = `/buscarReciboPerifericos/${valor}`;
    else if (tipoActual === 'daet') url = `/buscarEntregasAlDaet/${valor}`;

    tbody.innerHTML = '<tr><td colspan="6">Cargando resultados...</td></tr>';

    try {
        const res = await ApiService.fetchAutenticado(url);
        if (!res.ok) throw new Error("No se encontraron registros.");
        
        // Normalizar respuesta (Array o Objeto único)
        const data = await res.json();
        resultadosActuales = Array.isArray(data) ? data : [data];

        if (resultadosActuales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-danger">No se encontraron coincidencias.</td></tr>';
            mostrarModal('<strong>Sin Resultados</strong><br>No se encontraron registros con ese criterio.', 'info');
            return;
        }

        renderizarTabla();

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No se encontraron registros con ese criterio.</td></tr>';
        resultadosActuales = [];
        
        // Opcional: mostrar modal si es un error de conexión real, no solo "no encontrado"
         mostrarModal("No se encontraron registros.", 'warning');
    }
}

// --- 2. RENDERIZAR TABLA ---
function renderizarTabla() {
    const tbody = document.getElementById('tablaResultados');
    tbody.innerHTML = '';

    resultadosActuales.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        // Extraer datos comunes dependiendo del tipo
        let id, identificador, fecha, usuario, estatus;

        if (tipoActual === 'equipos') {
            id = item.idEncabezado;
            identificador = item.fmoEquipo;
            fecha = item.fecha;
            usuario = item.usuarioNombre;
            estatus = item.estatus;
        } else if (tipoActual === 'perifericos') {
            id = item.id; // O item.idEncabezado según DTO
            identificador = item.fmoSerial || "N/A";
            fecha = item.fecha;
            usuario = item.nombre; // En perifericos el usuario suele venir como 'nombre'
            estatus = "N/A";
        } else if (tipoActual === 'daet') {
            id = item.id;
            identificador = item.solicitudDAET || item.fmoSerial;
            fecha = item.fecha;
            usuario = item.recibidoPor || "DAET";
            estatus = item.estado;
        }

        tr.innerHTML = `
            <td class="fw-bold">${index + 1}</td>
            <td class="text-primary fw-bold">${identificador || 'S/D'}</td>
            <td>${fecha || 'S/D'}</td>
            <td>${usuario || 'S/D'}</td>
            <td><span class="badge bg-secondary">${estatus || '-'}</span></td>
            <td>
                <div class="d-flex justify-content-center gap-2">
                    <button class="btn btn-sm btn-info text-white" onclick="verRegistro(${index})" title="Ver Detalles">
                        <i class="bi bi-eye-fill" style = "vertical-align : bottom;"></i>Ver
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarEliminacion(${id})" title="Eliminar Registro">
                        <i class="bi bi-trash3-fill" style = "vertical-align:bottom;"></i>Eliminar
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 3. VER REGISTRO (MAPPING) ---
function verRegistro(index) {
    const data = resultadosActuales[index];
    const modal = new bootstrap.Modal(document.getElementById('modalVerDetalle'));
    
    // Ocultar todos los templates primero
    document.querySelectorAll('.template-section').forEach(el => el.style.display = 'none');

    // Mostrar y llenar el correcto
    if (tipoActual === 'equipos') {
        const container = document.getElementById('view_equipos');
        container.style.display = 'block';
        mapearDatosEquipos(container, data);
    } 
    else if (tipoActual === 'perifericos') {
        const container = document.getElementById('view_perifericos');
        container.style.display = 'block';
        mapearDatosPerifericos(container, data);
    } 
    else if (tipoActual === 'daet') {
        const container = document.getElementById('view_daet');
        container.style.display = 'block';
        mapearDatosDaet(container, data);
    }

    modal.show();
}

// --- 4. PREPARAR ELIMINACIÓN ---
function confirmarEliminacion(id) {
    idParaEliminar = id;
    //document.getElementById('lblIdEliminar').innerText = `ID: ${id}`;
    new bootstrap.Modal(document.getElementById('modalConfirmarDelete')).show();
}

// --- 5. EJECUTAR ELIMINACIÓN (DELETE ENDPOINT) ---
async function ejecutarEliminacion() {
    if (!idParaEliminar) return;

    let url = '';
    // Construir URL basada en el tipo seleccionado
    if (tipoActual === 'equipos') url = `/borrarReciboEquipo/${idParaEliminar}`;
    else if (tipoActual === 'perifericos') url = `/recibo-perifericos/${idParaEliminar}`;
    else if (tipoActual === 'daet') url = `/entregas-daet/${idParaEliminar}`;

    try {
        const res = await ApiService.fetchAutenticado(url, { method: 'DELETE' });

        // Cerrar modal confirmación
        bootstrap.Modal.getInstance(document.getElementById('modalConfirmarDelete')).hide();

        if (res.ok) {
            mostrarModal(`
                <strong>Registro Eliminado</strong><br>
                La operación se completó exitosamente.
            `, 'success');
            
            // Limpiar tabla o recargar búsqueda
            buscarRegistros(); 
        } else {
            mostrarModal(`
                <strong>Error al Eliminar</strong><br>
                No se pudo borrar el registro. Verifique que no tenga dependencias.
            `, 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarModal(`
            <strong>Error de Conexión</strong><br>
            ${error.message}
        `, 'error');
    } finally {
        idParaEliminar = null;
    }
}