// Variables Globales
let listaComponentesDB = [];
let listaPerifericosDB = [];
let tempSerial = null; // Para desvincular
let tempIdEliminar = null; // Para borrar de DB

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    cargarStock();
    
    // Setear fecha de hoy en modal asignar
    document.getElementById('asigFecha').value = new Date().toISOString().split('T')[0];
});

// --- 1. CARGAR CATALOGOS (Dropdowns) ---
async function cargarCatalogos() {
    try {
        const resComp = await ApiService.fetchAutenticado('/stock/componentes');
        const resPeri = await ApiService.fetchAutenticado('/stock/perifericos');

        if (resComp.ok) listaComponentesDB = await resComp.json();
        if (resPeri.ok) listaPerifericosDB = await resPeri.json();

    } catch (error) {
        console.error("Error catálogos:", error);
    }
}

// --- 2. GESTIÓN DEL MODAL CREAR ---
function abrirModalAgregar() {
    document.getElementById('formStock').reset();
    document.getElementById('selCategoria').value = "COMPONENTE";
    cargarListaItems(); 
    new bootstrap.Modal(document.getElementById('modalStock')).show();
}

function cargarListaItems() {
    const categoria = document.getElementById('selCategoria').value;
    const select = document.getElementById('selReferencia');
    
    select.innerHTML = '<option value="">Seleccione...</option>';
    let datos = (categoria === 'COMPONENTE') ? listaComponentesDB : listaPerifericosDB;

    datos.forEach(item => {
        // Filtro opcional si quieres ocultar SOs
        const nombreUpper = (item.nombre || "").toUpperCase();
        if (categoria === 'COMPONENTE' && (nombreUpper.includes("WINDOWS") || nombreUpper.includes("CANAIMA"))) return; 
        
        const opt = document.createElement('option');
        opt.value = item.id; 
        opt.textContent = item.nombre;
        select.appendChild(opt);
    });
}

// --- 3. GUARDAR NUEVO ITEM (POST) ---
async function guardarNuevoStock() {
    const payload = {
        categoria: document.getElementById('selCategoria').value,
        idReferencia: parseInt(document.getElementById('selReferencia').value),
        marca: document.getElementById('inputMarca').value.trim(),
        caracteristicas: document.getElementById('inputCaract').value.trim(),
        serial: document.getElementById('inputSerial').value.trim()
    }

    if(!payload.idReferencia || !payload.marca || !payload.serial) {
        return mostrarModal("Complete los campos obligatorios (Referencia, Marca, Serial).", 'warning');
    }

    try {
        const res = await ApiService.fetchAutenticado('/stock', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            mostrarModal("Item registrado exitosamente.", 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalStock')).hide();
            cargarStock();
        } else {
            mostrarModal("Error al guardar. Verifique si el serial ya existe.", 'error');
        }
    } catch (e) {
        mostrarModal("Error de conexión.", 'error');
    }
}

// --- 4. LISTAR STOCK (GET) ---
async function cargarStock() {
    const tbody = document.getElementById('tablaStock');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Cargando inventario...</td></tr>';

    try {
        const res = await ApiService.fetchAutenticado('/stock');
        if (!res.ok) throw new Error("Error al obtener datos");
        
        const data = await res.json(); // Lista plana de StockDTO
        
        // Obtenemos asignaciones para saber el estado real
        // Esto es un truco: cruzamos data con el endpoint de asignaciones para saber cual está ocupado
        const resAsig = await ApiService.fetchAutenticado('/stock/asignaciones');
        let serialesAsignados = [];
        if(resAsig.ok) {
            const dataAsig = await resAsig.json();
            serialesAsignados = dataAsig.map(a => a.serial);
        }

        tbody.innerHTML = '';
        let libres = 0;
        let asignados = 0;

        data.forEach(item => {
            const esAsignado = serialesAsignados.includes(item.serial);
            if(esAsignado) asignados++; else libres++;

            const badge = esAsignado 
                ? '<span class="badge bg-secondary">Asignado</span>' 
                : '<span class="badge bg-success">Disponible</span>';

            const botonesAccion = esAsignado
                ? `<button class="btn btn-sm btn-outline-warning" onclick="abrirDesvincular('${item.serial}')" title="Desvincular del Equipo">
                     <i class="bi bi-link-45deg"></i>
                   </button>`
                : `<button class="btn btn-sm btn-success" onclick="abrirModalAsignar(${item.id}, '${item.nombreItem}', '${item.serial}')" title="Asignar a Personal">
                     <i class="bi bi-person-plus-fill"></i>
                   </button>
                   <button class="btn btn-sm btn-outline-danger ms-1" onclick="abrirEliminar(${item.id})" title="Borrar del Sistema">
                     <i class="bi bi-trash3"></i>
                   </button>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="fw-bold text-dark">${item.nombreItem}</div>
                    <small class="badge bg-light text-secondary border">${item.categoria}</small>
                </td>
                <td>
                    <div class="small fw-bold">${item.marca}</div>
                    <div class="small text-muted text-wrap" style="max-width: 250px;">${item.caracteristicas}</div>
                </td>
                <td class="font-monospace text-primary">${item.serial}</td>
                <td class="text-center">${badge}</td>
                <td class="text-center">${botonesAccion}</td>
            `;
            tbody.appendChild(tr);
        });

        // Actualizar contadores cards
        document.getElementById('totalLibres').innerText = libres;
        document.getElementById('totalAsignados').innerText = asignados;

        if (data.length === 0) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Inventario vacío.</td></tr>';

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar datos.</td></tr>';
    }
}

// --- 5. ASIGNACIÓN (Logica Completa) ---
function abrirModalAsignar(id, nombre, serial) {
    document.getElementById('hdnIdStockAsignar').value = id;
    document.getElementById('lblItemAsignar').innerText = nombre;
    document.getElementById('lblSerialAsignar').innerText = "Serial: " + serial;
    // Limpiar campos de usuario
    document.getElementById('asigFmo').value = "";
    document.getElementById('asigFicha').value = "";
    document.getElementById('asigNombre').value = "";
    document.getElementById('asigGerencia').value = "";
    document.getElementById('asigExtension').value = "";
    
    new bootstrap.Modal(document.getElementById('modalAsignar')).show();
}

async function ejecutarAsignacion() {
    const payload = {
        idStock: parseInt(document.getElementById('hdnIdStockAsignar').value),
        fmoEquipo: document.getElementById('asigFmo').value.trim(),
        fecha: document.getElementById('asigFecha').value,
        
        fichaUsuario: parseInt(document.getElementById('asigFicha').value),
        nombreUsuario: document.getElementById('asigNombre').value.trim(),
        extension: document.getElementById('asigExtension').value.trim(),
        gerencia: document.getElementById('asigGerencia').value.trim()
    };

    if(!payload.fmoEquipo || !payload.fichaUsuario || !payload.nombreUsuario) {
        return mostrarModal("FMO, Ficha y Nombre son obligatorios.", 'warning');
    }

    try {
        const res = await ApiService.fetchAutenticado('/stock/asignar', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            mostrarModal("Equipo asignado correctamente.", 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalAsignar')).hide();
            cargarStock();
        } else {
            const txt = await res.text();
            mostrarModal(`Error: ${txt}`, 'error');
        }
    } catch (e) {
        mostrarModal("Error de conexión.", 'error');
    }
}

// --- 6. DESVINCULAR (DELETE /desvincular/:serial) ---
function abrirDesvincular(serial) {
    tempSerial = serial;
    document.getElementById('lblSerialDesvincular').innerText = serial;
    new bootstrap.Modal(document.getElementById('modalDesvincular')).show();
}

async function ejecutarDesvinculacion() {
    if (!tempSerial) return;
    
    // Codificar serial por si tiene barras (/)
    const safeSerial = encodeURIComponent(tempSerial);

    try {
        const res = await ApiService.fetchAutenticado(`/stock/desvincular/${safeSerial}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            mostrarModal("Item liberado correctamente.", 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalDesvincular')).hide();
            cargarStock();
        } else {
            const txt = await res.text();
            mostrarModal(`No se pudo desvincular: ${txt}`, 'error');
        }
    } catch (e) {
        mostrarModal("Error al procesar.", 'error');
    }
}

// --- 7. ELIMINAR DE DB (DELETE /stock/:id) ---
function abrirEliminar(id) {
    tempIdEliminar = id;
    new bootstrap.Modal(document.getElementById('modalEliminar')).show();
}

async function ejecutarEliminacionDb() {
    if(!tempIdEliminar) return;

    try {
        const res = await ApiService.fetchAutenticado(`/stock/${tempIdEliminar}`, { method: 'DELETE' });
        if(res.ok) {
            mostrarModal("Registro eliminado.", 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
            cargarStock();
        } else {
            mostrarModal("Error al eliminar. Verifique que no esté asignado.", 'error');
        }
    } catch(e) {
        mostrarModal("Error de conexión.", 'error');
    }
}