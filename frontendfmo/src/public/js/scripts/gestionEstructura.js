let estructuraGlobal = [];
let gerenciaActivaId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Validar si es ADMIN (Opcional, si quieres que solo los admin vean esta página)
    if (typeof ApiService !== 'undefined' && ApiService.obtenerRol() !== 'ADMIN') {
        mostrarModal("No tienes permisos para acceder a esta configuración.", "error");
        setTimeout(() => window.location.href = '/dashboard', 2000);
        return;
    }

    await cargarEstructura();
});

// ==========================================
// 1. OBTENER Y RENDERIZAR DATOS
// ==========================================
async function cargarEstructura(mantenerSeleccion = true) {
    try {
        // Usamos fetchAutenticado directamente
        const response = await ApiService.fetchAutenticado('/estructura/gerencias');

        if (!response.ok) throw new Error("No se pudo cargar la estructura.");

        estructuraGlobal = await response.json();
        renderGerencias();

        // Si recargamos la página y teníamos una gerencia abierta, la volvemos a abrir
        if (mantenerSeleccion && gerenciaActivaId) {
            seleccionarGerencia(gerenciaActivaId);
        } else {
            // Si la gerencia que teníamos seleccionada se borró, limpiamos la vista
            limpiarPanelDepartamentos();
        }

    } catch (error) {
        console.error(error);
        document.getElementById('listaGerencias').innerHTML = `<div class="text-danger text-center p-3"><i class="bi bi-exclamation-triangle"></i> Error de conexión</div>`;
    }
}

function renderGerencias() {
    const contenedor = document.getElementById('listaGerencias');
    contenedor.innerHTML = '';

    if (estructuraGlobal.length === 0) {
        contenedor.innerHTML = '<div class="text-muted text-center p-3">No hay gerencias registradas.</div>';
        return;
    }

    estructuraGlobal.forEach(gerencia => {
        const item = document.createElement('div');
        const isActive = gerencia.id === gerenciaActivaId ? 'active' : '';
        
        item.className = `list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isActive}`;
        item.onclick = () => seleccionarGerencia(gerencia.id);
        
        item.innerHTML = `
            <div class="text-truncate fw-bold">
                <i class="bi bi-building me-2"></i>${gerencia.nombre}
            </div>
            <div class="btn-group">
                <button class="btn btn-sm btn-link text-dark action-btn p-0 me-2" onclick="event.stopPropagation(); prepararEdicion(${gerencia.id}, '${gerencia.nombre}', 'GERENCIA')" title="Editar">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-link text-danger action-btn p-0" onclick="event.stopPropagation(); prepararEliminacion(${gerencia.id}, '${gerencia.nombre}', 'GERENCIA')" title="Eliminar">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(item);
    });
}

function seleccionarGerencia(id) {
    gerenciaActivaId = id;
    renderGerencias(); // Refrescar para pintar de rojo la seleccionada

    const gerencia = estructuraGlobal.find(g => g.id === id);
    if (!gerencia) return;

    // Actualizar Panel Derecho
    document.getElementById('panelVacio').classList.add('d-none');
    document.getElementById('panelDepartamentos').classList.remove('d-none');
    document.getElementById('lblGerenciaSeleccionada').textContent = `Pertenecientes a: ${gerencia.nombre}`;

    renderDepartamentos(gerencia.departamentos || []);
}

function renderDepartamentos(departamentos) {
    const contenedor = document.getElementById('listaDepartamentos');
    contenedor.innerHTML = '';

    if (departamentos.length === 0) {
        contenedor.innerHTML = '<div class="text-muted text-center p-3">Esta gerencia no tiene departamentos.</div>';
        return;
    }

    departamentos.forEach(depto => {
        const item = document.createElement('div');
        item.className = `list-group-item d-flex justify-content-between align-items-center`;
        
        item.innerHTML = `
            <div class="text-truncate text-secondary fw-semibold">
                <i class="bi bi-diagram-2 me-2"></i>${depto.nombre}
            </div>
            <div class="btn-group">
                <button class="btn btn-sm btn-link text-secondary p-0 me-2" onclick="prepararEdicion(${depto.id}, '${depto.nombre}', 'DEPARTAMENTO')" title="Editar">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-link text-danger p-0" onclick="prepararEliminacion(${depto.id}, '${depto.nombre}', 'DEPARTAMENTO')" title="Eliminar">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(item);
    });
}

function limpiarPanelDepartamentos() {
    gerenciaActivaId = null;
    document.getElementById('panelVacio').classList.remove('d-none');
    document.getElementById('panelDepartamentos').classList.add('d-none');
    document.getElementById('lblGerenciaSeleccionada').textContent = 'Seleccione una gerencia en el panel izquierdo.';
}


// ==========================================
// 2. CREAR (POST)
// ==========================================
async function crearGerencia() {
    const input = document.getElementById('inputNuevaGerencia');
    const nombre = input.value.trim();
    if (!nombre) return mostrarModal("Ingrese un nombre válido.", "warning");

    await procesarPeticion(`/estructura/gerencias`, 'POST', { nombre });
    input.value = ''; // Limpiar
}

async function crearDepartamento() {
    if (!gerenciaActivaId) return;
    const input = document.getElementById('inputNuevoDepto');
    const nombre = input.value.trim();
    if (!nombre) return mostrarModal("Ingrese un nombre válido.", "warning");

    await procesarPeticion(`/estructura/gerencias/${gerenciaActivaId}/departamentos`, 'POST', { nombre });
    input.value = ''; // Limpiar
}


// ==========================================
// 3. EDITAR (PUT) - MODAL UNIFICADO
// ==========================================
function prepararEdicion(id, nombreActual, tipo) {
    document.getElementById('editId').value = id;
    document.getElementById('editTipo').value = tipo;
    document.getElementById('editNombre').value = nombreActual;
    document.getElementById('tituloModalEditar').innerHTML = `<i class="bi bi-pencil-square me-2"></i>Editar ${tipo === 'GERENCIA' ? 'Gerencia' : 'Departamento'}`;
    
    new bootstrap.Modal(document.getElementById('modalEditar')).show();
}

async function guardarEdicion() {
    const id = document.getElementById('editId').value;
    const tipo = document.getElementById('editTipo').value;
    const nuevoNombre = document.getElementById('editNombre').value.trim();

    if (!nuevoNombre) return mostrarModal("El nombre no puede estar vacío.", "warning");

    const endpoint = tipo === 'GERENCIA' ? `/estructura/gerencias/${id}` : `/estructura/departamentos/${id}`;
    
    const exito = await procesarPeticion(endpoint, 'PUT', { nombre: nuevoNombre });
    
    if(exito) {
        bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
    }
}


// ==========================================
// 4. ELIMINAR (DELETE) - MODAL UNIFICADO
// ==========================================
function prepararEliminacion(id, nombre, tipo) {
    document.getElementById('deleteId').value = id;
    document.getElementById('deleteTipo').value = tipo;
    
    document.getElementById('lblPreguntaEliminar').textContent = `Eliminar ${tipo === 'GERENCIA' ? 'Gerencia' : 'Departamento'}`;
    
    let mensaje = `¿Confirma que desea eliminar <b>"${nombre}"</b>?`;
    if (tipo === 'GERENCIA') {
        mensaje += `<br><br><span class="text-danger">⚠️ ¡ADVERTENCIA! Todos los departamentos vinculados a esta gerencia también serán eliminados.</span>`;
    }
    document.getElementById('lblDetalleEliminar').innerHTML = mensaje;

    new bootstrap.Modal(document.getElementById('modalEliminarEstructura')).show();
}

async function ejecutarEliminacion() {
    const id = document.getElementById('deleteId').value;
    const tipo = document.getElementById('deleteTipo').value;
    
    const endpoint = tipo === 'GERENCIA' ? `/estructura/gerencias/${id}` : `/estructura/departamentos/${id}`;
    
    // Si eliminamos la gerencia activa, limpiamos la vista
    if (tipo === 'GERENCIA' && parseInt(id) === gerenciaActivaId) {
        gerenciaActivaId = null;
    }

    const exito = await procesarPeticion(endpoint, 'DELETE', null);
    
    if(exito) {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminarEstructura')).hide();
    }
}

// ==========================================
// HELPER REFACTORIZADO: Usa fetchAutenticado
// ==========================================
async function procesarPeticion(rutaRelativa, metodo, cuerpoJSON) {
    try {
        const opciones = {
            method: metodo
        };

        if (cuerpoJSON) {
            opciones.headers = { 'Content-Type': 'application/json' };
            opciones.body = JSON.stringify(cuerpoJSON);
        }

        // Delegamos a ApiService la inyección del Token y la BASE_URL
        const res = await ApiService.fetchAutenticado(rutaRelativa, opciones);

        if (!res.ok) {
            const errorData = await res.text();
            throw new Error(errorData);
        }

        mostrarModal("Operación realizada con éxito.", "success");
        await cargarEstructura(); // Recargamos todo para actualizar la vista
        return true;

    } catch (error) {
        console.error("Error en operación:", error);
        mostrarModal("Ocurrió un error: " + error.message, "error");
        return false;
    }
}