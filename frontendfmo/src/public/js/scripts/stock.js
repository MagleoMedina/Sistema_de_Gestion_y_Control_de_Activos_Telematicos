// Almacenes temporales
let listaComponentesDB = [];
let listaPerifericosDB = [];
let itemParaEliminarId = null; // Variable global para la eliminación

// --- 1. CARGA INICIAL ---
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    cargarStock();
});

// --- 2. CARGAR CATÁLOGOS ---
async function cargarCatalogos() {
    try {
        const resComp = await ApiService.fetchAutenticado('/stock/componentes');
        const resPeri = await ApiService.fetchAutenticado('/stock/perifericos');

        if (resComp && resComp.ok) listaComponentesDB = await resComp.json();
        if (resPeri && resPeri.ok) listaPerifericosDB = await resPeri.json();

        cargarListaItems(); // Inicia la lista y los placeholders
    } catch (error) {
        console.error("Error cargando catálogos:", error);
        mostrarModal("No se pudieron cargar los catálogos de items.", 'error');
    }
}

// --- 3. LÓGICA DEL MODAL (Dinámico) ---
function abrirModalAgregar() {
    document.getElementById('formStock').reset();
    document.getElementById('selCategoria').value = "COMPONENTE";
    cargarListaItems(); // Esto también resetea los placeholders
    new bootstrap.Modal(document.getElementById('modalStock')).show();
}

// Actualiza el Select y los Placeholders
function cargarListaItems() {
    const categoria = document.getElementById('selCategoria').value;
    const select = document.getElementById('selReferencia');
    const inputMarca = document.getElementById('inputMarca');
    const inputModelo = document.getElementById('inputModelo');

    // A. Llenar el Select
    select.innerHTML = '<option value="">Seleccione...</option>';
    let datos = (categoria === 'COMPONENTE') ? listaComponentesDB : listaPerifericosDB;

    datos.forEach(item => {
        if (categoria === 'COMPONENTE') {
            const nombreUpper = (item.nombre || "").toUpperCase();
            if (nombreUpper.includes("WINDOWS") || nombreUpper.includes("CANAIMA")) return; 
        }
        const opt = document.createElement('option');
        opt.value = item.id; 
        opt.textContent = item.nombre;
        select.appendChild(opt);
    });

    // B. CAMBIAR PLACEHOLDERS DINÁMICAMENTE
    if (categoria === 'COMPONENTE') {
        inputMarca.placeholder = "Ej: Kingston / Samsung";
        inputModelo.placeholder = "Ej: 8GB DDR4 / 500GB SSD";
    } else {
        inputMarca.placeholder = "Ej: Genius / HP";
        inputModelo.placeholder = "Ej: Inalámbrico / USB / Negro";
    }
}

// --- 4. GUARDAR NUEVO STOCK ---
async function guardarNuevoStock() {
    const MINIMO_ALERTA = 5;
    const payload = {
        categoria: document.getElementById('selCategoria').value,
        idReferencia: parseInt(document.getElementById('selReferencia').value),
        marca: document.getElementById('inputMarca').value.trim(),
        caracteristicas: document.getElementById('inputModelo').value.trim(),
        cantidad: parseInt(document.getElementById('inputCantidad').value),
        minimoAlerta: MINIMO_ALERTA,
    }

    // VALIDACIÓN CAMPOS VACÍOS
    if(!payload.idReferencia || !payload.marca || !payload.caracteristicas || isNaN(payload.cantidad) || payload.cantidad < 0) {
        mostrarModal(`
            <strong>Datos Incompletos</strong><br>
            Por favor, seleccione un artículo y complete marca y características.
        `, 'warning');
        return;
    }

    try {
        const res = await ApiService.fetchAutenticado('/stock', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res && res.ok) {
            mostrarModal(`
                <strong>¡Item Agregado!</strong><br>
                Se ingresó: <b>${payload.marca}</b> al inventario.
            `, 'success');

            bootstrap.Modal.getInstance(document.getElementById('modalStock')).hide();
            cargarStock();
        } else {
            mostrarModal("Error al guardar en el servidor.", 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarModal(`Error de conexión: ${error.message}`, 'error');
    }
}

// --- 5. CARGAR TABLA DE STOCK ---
async function cargarStock() {
    const tbodyComp = document.getElementById('tablaComponentes');
    const tbodyPeri = document.getElementById('tablaPerifericos');

    tbodyComp.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';
    tbodyPeri.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';

    try {
        const res = await ApiService.fetchAutenticado('/stock');
        
        if (!res || res.status === 404) {
            mostrarVacio(tbodyComp, tbodyPeri);
            return;
        }

        if(!res.ok) throw new Error("Fallo al obtener stock");
        const data = await res.json(); 

        tbodyComp.innerHTML = '';
        tbodyPeri.innerHTML = '';

        let totalItems = 0;
        let totalCritico = 0;

        if (!data || data.length === 0) {
            mostrarVacio(tbodyComp, tbodyPeri);
            actualizarResumen(0, 0);
            return;
        }

        data.forEach(item => {
            totalItems += item.cantidad;
            if (item.estado === 'BAJO' || item.estado === 'AGOTADO') totalCritico++;

            let estadoHtml = '<span class="badge bg-success">En Stock</span>';
            if (item.estado === 'AGOTADO') estadoHtml = '<span class="badge bg-danger">Agotado</span>';
            else if (item.estado === 'BAJO') estadoHtml = '<span class="badge badge-low-stock">Stock Bajo</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold text-primary">${item.nombreItem}</td>
                <td>
                    <div class="fw-bold text-dark">${item.marca}</div>
                    <small class="text-muted">${item.caracteristicas}</small>
                </td>
                <td class="text-center">
                    <span class="fs-5 fw-bold ${item.cantidad === 0 ? 'text-danger' : 'text-dark'}">${item.cantidad}</span>
                </td>
                <td class="text-center">${estadoHtml}</td>
                <td class="text-center">
                    <button class="btn btn-outline-danger btn-circle btn-sm me-1"
                            onclick="modificarStock(${item.id}, -1)" ${item.cantidad === 0 ? 'disabled' : ''} title="Retirar 1">
                        <i class="fas fa-minus">-</i>
                    </button>
                    <button class="btn btn-outline-success btn-circle btn-sm me-2"
                            onclick="modificarStock(${item.id}, 1)" title="Agregar 1">
                        <i class="fas fa-plus">+</i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm"
                            onclick="abrirConfirmarEliminacion(${item.id})" title="Eliminar registro">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;

            if (item.categoria === 'COMPONENTE') tbodyComp.appendChild(tr);
            else tbodyPeri.appendChild(tr);
        });

        if (tbodyComp.innerHTML === '') mostrarVacio(tbodyComp, null);
        if (tbodyPeri.innerHTML === '') mostrarVacio(null, tbodyPeri);

        actualizarResumen(totalItems, totalCritico);

    } catch (error) {
        console.error(error);
        mostrarVacio(tbodyComp, tbodyPeri);
    }
}

// --- 6. MODIFICAR STOCK ---
async function modificarStock(id, cantidad) {
    try {
        const res = await ApiService.fetchAutenticado(`/stock/${id}/ajustar?cantidad=${cantidad}`, { method: 'POST' });
        if (res && res.ok) {
            cargarStock();
        } else {
            mostrarModal("No se pudo actualizar el stock.", 'error');
        }
    } catch (error) {
        mostrarModal("Error de red.", 'error');
    }
}

// --- 7. ELIMINAR ITEM (CON MODAL) ---

// PASO A: Abrir Modal
function abrirConfirmarEliminacion(id) {
    itemParaEliminarId = id; // Guardamos ID globalmente
    new bootstrap.Modal(document.getElementById('modalConfirmarEliminacion')).show();
}

// PASO B: Ejecutar (Click en "Sí")
async function ejecutarEliminacionStock() {
    // Cerramos el modal de confirmación
    const modalEl = document.getElementById('modalConfirmarEliminacion');
    bootstrap.Modal.getInstance(modalEl).hide();

    if (!itemParaEliminarId) return;

    try {
        const res = await ApiService.fetchAutenticado(`/stock/${itemParaEliminarId}`, {
            method: 'DELETE'
        });

        if (res && res.ok) {
            mostrarModal("Registro eliminado del inventario correctamente.", 'success');
            cargarStock();
        } else {
            mostrarModal("No se pudo eliminar el registro.", 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarModal(`Error al eliminar: ${error.message}`, 'error');
    } finally {
        itemParaEliminarId = null; // Limpieza
    }
}

// --- HELPERS ---
function actualizarResumen(total, critico) {
    const elTotal = document.getElementById('totalItems');
    const elCritico = document.getElementById('totalCritico');
    if(elTotal) elTotal.innerText = total;
    if(elCritico) elCritico.innerText = critico;
}

function mostrarVacio(compBody, periBody) {
    const msg = '<tr><td colspan="5" class="text-center text-muted p-4">No se encontraron elementos</td></tr>';
    if (compBody) compBody.innerHTML = msg;
    if (periBody) periBody.innerHTML = msg;
}