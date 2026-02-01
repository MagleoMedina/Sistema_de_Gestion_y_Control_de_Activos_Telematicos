// --- CONFIGURACIÓN ---
let resultadosActuales = []; 
let idParaEliminar = null;
let tipoActual = 'equipos';

// --- LOGICA DE PLACEHOLDER DINÁMICO ---
const placeholderMap = {
    'equipos': "Inserte el FMO/CPU (Ej: 119...)",
    'perifericos': "Inserte el FMO Asignado (Ej: 119...)",
    'daet': "Inserte el FMO/Serial",
    'casos': "Inserte el Número de Ficha (Ej: 12345)"
};

function actualizarPlaceholder() {
    const tipo = document.getElementById('selTipo').value;
    const input = document.getElementById('inputBusqueda');
    
    // 1. Actualizar placeholder del input
    input.placeholder = placeholderMap[tipo] || "Ingrese el identificador...";

    // 2. Actualizar encabezados de la tabla dinámicamente
    const thIdentificador = document.getElementById('th_identificador');
    const thUsuario = document.getElementById('th_usuario');
    const thEstatus = document.getElementById('th_estatus');

    if (tipo === 'casos') {
        thIdentificador.textContent = "Ficha";
        thUsuario.textContent = "Nombre Trabajador";
        thEstatus.textContent = "Atendido Por";
    } else {
        // Restaurar valores originales
        thIdentificador.textContent = "Identificador";
        thUsuario.textContent = "Usuario / Responsable";
        thEstatus.textContent = "Estatus";
    }
}

// Eventos para activar el cambio
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('selTipo').addEventListener('change', actualizarPlaceholder);
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

    // Codificar valor
    const valor = encodeURIComponent(valorRaw.replace(/\//g, '-'));

    // Definir URL según tipo
    let url = '';
    if (tipoActual === 'equipos') url = `/buscarReciboEquipos/${valor}`;
    else if (tipoActual === 'perifericos') url = `/buscarReciboPerifericos/${valor}`;
    else if (tipoActual === 'daet') url = `/buscarEntregasAlDaet/${valor}`;
    else if (tipoActual === 'casos') url = `/casos/buscarPorFicha/${valor}`;

    tbody.innerHTML = '<tr><td colspan="6">Cargando resultados...</td></tr>';

    try {
        const res = await ApiService.fetchAutenticado(url);
        
        // Manejo especial para Casos (puede devolver 204 o 404)
        if (!res || res.status === 404 || res.status === 204) {
             throw new Error("No se encontraron registros.");
        }
        
        if (!res.ok) throw new Error("Error en la consulta.");
        
        const data = await res.json();
        resultadosActuales = Array.isArray(data) ? data : [data];

        if (resultadosActuales.length === 0) {
            throw new Error("No se encontraron registros.");
        }

        renderizarTabla();

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-danger">No se encontraron coincidencias.</td></tr>';
        mostrarModal('<strong>Sin Resultados</strong><br>No se encontraron registros con ese criterio.', 'info');
        resultadosActuales = [];
    }
}

// --- 2. RENDERIZAR TABLA ---
function renderizarTabla() {
    const tbody = document.getElementById('tablaResultados');
    tbody.innerHTML = '';

    resultadosActuales.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        let id, identificador, fecha, usuario, estatus;

        // Mapeo de columnas según el tipo seleccionado
        if (tipoActual === 'equipos') {
            id = item.idEncabezado;
            identificador = item.fmoEquipo;
            fecha = item.fecha;
            usuario = item.usuarioNombre;
            estatus = item.estatus;
        } else if (tipoActual === 'perifericos') {
            id = item.id;
            identificador = item.fmoSerial || "N/A";
            fecha = item.fecha;
            usuario = item.nombre; 
            estatus = "N/A";
        } else if (tipoActual === 'daet') {
            id = item.id;
            identificador = item.solicitudDAET || item.fmoSerial;
            fecha = item.fecha;
            usuario = item.recibidoPor || "DAET";
            estatus = item.estado;
        } else if (tipoActual === 'casos') {
            id = item.id;
            // Lógica robusta: Intenta leer plano, si no, lee anidado (item.usuario.XXX)
            const userObj = item.usuario || {};
            identificador = item.ficha || userObj.ficha || "S/D";
            usuario = item.nombre || userObj.nombre || "S/D";
            fecha = item.fecha;
            estatus = item.atendidoPor; 
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
                        <i class="bi bi-eye-fill" style="vertical-align: bottom;"></i>Ver
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarEliminacion(${id})" title="Eliminar Registro">
                        <i class="bi bi-trash3-fill" style="vertical-align: bottom;"></i>Eliminar
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
        if(typeof mapearDatosEquipos === 'function') mapearDatosEquipos(container, data);
    } 
    else if (tipoActual === 'perifericos') {
        const container = document.getElementById('view_perifericos');
        container.style.display = 'block';
        if(typeof mapearDatosPerifericos === 'function') mapearDatosPerifericos(container, data);
    } 
    else if (tipoActual === 'daet') {
        const container = document.getElementById('view_daet');
        container.style.display = 'block';
        if(typeof mapearDatosDaet === 'function') mapearDatosDaet(container, data);
    }
    else if (tipoActual === 'casos') {
        const container = document.getElementById('view_casos');
        container.style.display = 'block';
        mapearDatosCasos(container, data);
    }

    modal.show();
}

// Función interna para mapear casos (ya que no está en mappings.js externo)
function mapearDatosCasos(container, data) {
    // Extracción robusta de datos (Soporta estructura plana o anidada)
    const userObj = data.usuario || {};
    
    const nombre = data.nombre || userObj.nombre || "N/A";
    const ficha = data.ficha || userObj.ficha || "N/A";
    const gerencia = data.gerencia || userObj.gerencia || "N/A";

    document.getElementById('v_casos_nombre').textContent = nombre;
    document.getElementById('v_casos_ficha').textContent = ficha;
    document.getElementById('v_casos_fecha').textContent = data.fecha || "N/A";
    document.getElementById('v_casos_gerencia').textContent = gerencia;
    document.getElementById('v_casos_tecnico').textContent = data.atendidoPor || "N/A";
    document.getElementById('v_casos_reporte').textContent = data.reporte || "Sin reporte detallado.";
}

// --- 4. PREPARAR ELIMINACIÓN ---
function confirmarEliminacion(id) {
    idParaEliminar = id;
    document.getElementById('lblIdEliminar').innerText = `${id}`;
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
    else if (tipoActual === 'casos') url = `/casos/borrar/${idParaEliminar}`;

    try {
        const res = await ApiService.fetchAutenticado(url, { method: 'DELETE' });

        // Cerrar modal confirmación
        const modalEl = document.getElementById('modalConfirmarDelete');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if(modal) modal.hide();

        if (res.ok) {
            mostrarModal(`
                <strong>Registro Eliminado</strong><br>
                El registro ha sido eliminado exitosamente.
            `, 'success');
            
            // Recargar búsqueda para actualizar la tabla
            buscarRegistros(); 
        } else {
            const txt = await res.text();
            mostrarModal(`
                <strong>Error al Eliminar</strong><br>
                No se pudo borrar el registro. <br><small>${txt}</small>
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