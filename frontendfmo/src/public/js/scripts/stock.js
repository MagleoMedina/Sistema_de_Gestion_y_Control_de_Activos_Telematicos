// Variables Globales
let listaComponentesDB = [];
let listaPerifericosDB = [];
let tempSerial = null; // Para desvincular
let tempIdEliminar = null; // Para borrar de DB

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    cargarStock();
    cargarDisponibles();

    // Setear fecha de hoy en modal asignar
    document.getElementById('asigFecha').value = new Date().toISOString().split('T')[0];

    // --- NUEVO: LISTENER PARA AUTOCOMPLETADO POR FICHA ---
    const inputFicha = document.getElementById('asigFicha');
    if (inputFicha) {
        inputFicha.addEventListener('change', async function() {
            const ficha = this.value;

            // Si el campo está vacío, no hacemos nada
            if (!ficha) return;

            // Mostrar un pequeño indicador de carga (opcional, visual)
            document.getElementById('asigNombre').placeholder = "Buscando...";

            try {
                // Consultamos al nuevo endpoint
                const res = await ApiService.fetchAutenticado(`/stock/usuario/${ficha}`);

                if (res && res.ok) {
                    const usuario = await res.json(); // Ahora el JSON será válido
                    document.getElementById('asigNombre').value = usuario.nombre || "";

                    // AUTOCOMPLETAR LOS CAMPOS
                    document.getElementById('asigNombre').value = usuario.nombre || "";
                    document.getElementById('asigGerencia').value = usuario.gerencia || "";
                    document.getElementById('asigExtension').value = usuario.extension || "";

                    // Feedback visual sutil (opcional)
                    mostrarModal("Usuario encontrado. Datos cargados.", "success");
                } else {
                    // Si es 404, significa que es un usuario NUEVO.
                    // Limpiamos los campos para que el operador los llene manualmente.
                    document.getElementById('asigNombre').value = "";
                    document.getElementById('asigGerencia').value = "";
                    document.getElementById('asigExtension').value = "";
                    document.getElementById('asigNombre').placeholder = "Ingrese nombre completo";

                    // No mostramos error, porque es un flujo normal (crear nuevo)
                }
            } catch (error) {
                console.error("Error al buscar usuario:", error);
            }
        });
    }
});
// A. CARGAR DISPONIBLES (Inventario General filtrado)
async function cargarDisponibles() {
    const tbody = document.getElementById('tablaDisponibles');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Cargando inventario...</td></tr>';

    try {
        // 1. Obtener todo el stock
        const resStock = await ApiService.fetchAutenticado('/stock');

        // 2. Obtener asignaciones para saber qué filtrar
        const resAsig = await ApiService.fetchAutenticado('/stock/asignaciones');

        if (!resStock.ok) throw new Error("Error al obtener inventario");

        const dataStock = await resStock.json();
        const dataAsig = resAsig.ok ? await resAsig.json() : [];

        // Guardamos los seriales ocupados para filtrar
        serialesAsignadosCache = dataAsig.map(a => a.serial);

        // Actualizamos contadores
        document.getElementById('totalLibres').innerText = dataStock.length - serialesAsignadosCache.length;
        document.getElementById('totalAsignados').innerText = serialesAsignadosCache.length;

        // FILTRADO: Solo mostramos los que NO están en la lista de asignados
        const disponibles = dataStock.filter(item => !serialesAsignadosCache.includes(item.serial));

        renderTablaDisponibles(disponibles, tbody);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar datos.</td></tr>';
    }
}

function renderTablaDisponibles(lista, tbody) {
    tbody.innerHTML = '';
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay items disponibles.</td></tr>';
        return;
    }

    lista.forEach(item => {
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
        <td class="text-center"><span class="badge bg-success">Disponible</span></td>
        <td class="text-center">
        <button class="btn btn-sm btn-success" onclick="abrirModalAsignar(${item.id}, '${item.nombreItem}', '${item.serial}')" title="Asignar a Personal">
        <i class="bi bi-person-plus-fill"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger ms-1" onclick="abrirEliminar(${item.id})" title="Borrar del Sistema">
        <i class="bi bi-trash3"></i>
        </button>
        </td>
        `;
        tbody.appendChild(tr);
    });
}

// B. CARGAR ASIGNADOS (Con lógica de botones correspondiente)
async function cargarAsignados() {
    const tbody = document.getElementById('tablaAsignados');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Cargando asignaciones...</td></tr>';

    try {
        const res = await ApiService.fetchAutenticado('/stock/asignaciones');
        if (!res.ok) throw new Error("Error al obtener asignaciones");

        const data = await res.json();
        renderTablaAsignados(data, tbody);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar asignados.</td></tr>';
    }
}

// C. BUSCAR ASIGNADOS POR FICHA (Nuevo endpoint)
async function buscarAsignadosPorFicha() {
    const ficha = document.getElementById('inputBuscarFicha').value;
    if (!ficha) {
        return mostrarModal("Ingrese una ficha para buscar.", "warning");
    }

    const tbody = document.getElementById('tablaAsignados');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Buscando...</td></tr>';

    try {
        const res = await ApiService.fetchAutenticado(`/stock/asignaciones/buscar/${ficha}`);
        if (!res.ok) throw new Error("Error en la búsqueda");

        const data = await res.json();
        renderTablaAsignados(data, tbody);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error buscando por ficha.</td></tr>';
    }
}

function renderTablaAsignados(lista, tbody) {
    tbody.innerHTML = '';
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sin registros.</td></tr>';
        return;
    }

    lista.forEach(item => {
        // En asignados, el item no tiene ID directo del stock fácil en el DTO plano de RelacionStockResponseDTO si no lo mapeaste.
        // Pero en RelacionStockResponseDTO no teníamos idStock, solo idRelacion y datos del stock.
        // OJO: Para desvincular necesitamos el SERIAL. Para ver detalle necesitamos ID RELACION o datos ya presentes.

        // Ajuste: Usaremos el objeto item directamente para 'ver detalle' ya que tiene todos los datos.
        // Para desvincular usamos item.serial.

        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>
        <div class="fw-bold text-dark">${item.nombreItem}</div>
        <div class="font-monospace text-primary small">${item.serial}</div>
        </td>
        <td>
        <div class="fw-bold">${item.nombreUsuario || 'N/A'}</div>
        <small class="text-muted"><i class="bi bi-person-badge"></i> ${item.ficha || '-'}</small>
        </td>
        <td>${item.fmoEquipo || 'N/A'}</td>
        <td>${item.fecha || '-'}</td>
        <td class="text-center">
        <div class="btn-group shadow-sm">
        <button class="btn btn-sm btn-info text-white" onclick='verDetalleAsignacion(${JSON.stringify(item)})' title="Ver Detalles">
        <i class="bi bi-eye-fill"></i>
        </button>
        <button class="btn btn-sm btn-outline-warning" onclick="abrirDesvincular('${item.serial}')" title="Desvincular">
        <i class="bi bi-link-45deg"></i>
        </button>
        </div>
        </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- VISUALIZACIÓN DETALLE DESDE TABLA ASIGNADOS ---
function verDetalleAsignacion(item) {
    // Llenar el modal con los datos del JSON recibido directamente de la fila
    document.getElementById('view_nombreItem').textContent = item.nombreItem || "N/A";
    document.getElementById('view_serial').textContent = item.serial || "N/A";

    document.getElementById('view_fmo').textContent = item.fmoEquipo || "N/A";
    document.getElementById('view_fecha').textContent = item.fecha || "N/A";

    document.getElementById('view_usuario').textContent = item.nombreUsuario || "Sin Usuario";
    document.getElementById('view_gerencia').textContent = item.gerencia || "";
    document.getElementById('view_ficha').textContent = item.ficha || "-";
    document.getElementById('view_ext').textContent = item.extension || "-";

    new bootstrap.Modal(document.getElementById('modalVerRelacion')).show();
}
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

    // MODIFICACIÓN AQUÍ: Agregamos el botón de ver (ojo) si está asignado
    const botonesAccion = esAsignado
        ? `<div class="btn-group shadow-sm">
             <button class="btn btn-sm btn-info text-white" onclick="verRelacion(${item.id})" title="Ver Detalles de Asignación">
               <i class="bi bi-eye-fill"></i>
             </button>
             <button class="btn btn-sm btn-outline-warning" onclick="abrirDesvincular('${item.serial}')" title="Desvincular del Equipo">
               <i class="bi bi-link-45deg"></i>
             </button>
           </div>`
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

// --- 8. VER RELACIÓN (GET /stock/relacion/:id) ---
async function verRelacion(idStock) {
    try {
        const res = await ApiService.fetchAutenticado(`/stock/relacion/${idStock}`);

        if (!res.ok) {
            mostrarModal("No se pudo obtener la información de asignación.", "error");
            return;
        }

        const data = await res.json();

        // Llenar el modal con los datos recibidos
        document.getElementById('view_nombreItem').textContent = data.nombreItem || "N/A";
        document.getElementById('view_serial').textContent = data.serial || "N/A";

        document.getElementById('view_fmo').textContent = data.fmoEquipo || "N/A";
        document.getElementById('view_fecha').textContent = data.fecha || "N/A";

        document.getElementById('view_usuario').textContent = data.nombreUsuario || "Sin Usuario";
        document.getElementById('view_gerencia').textContent = data.gerencia || "";
        document.getElementById('view_ficha').textContent = data.ficha || "-";
        document.getElementById('view_ext').textContent = data.extension || "-";

        new bootstrap.Modal(document.getElementById('modalVerRelacion')).show();

    } catch (error) {
        console.error(error);
        mostrarModal("Error de conexión al consultar detalles.", "error");
    }
}
