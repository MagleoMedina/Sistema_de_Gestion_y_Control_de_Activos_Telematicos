// Variables Globales
let listaComponentesDB = [];
let listaPerifericosDB = [];

// Cache de todos los items disponibles para el filtrado frontend
let listaGlobalDisponibles = []; 

let tempSerial = null; // Para desvincular
let tempIdEliminar = null; // Para borrar de DB

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCatalogos();
    // Carga inicial: Disponibles
    cargarDisponibles();
    
    // Setear fecha de hoy en modal asignar
    document.getElementById('asigFecha').value = new Date().toISOString().split('T')[0];

    // Listener Autocompletado Ficha
    const inputFicha = document.getElementById('asigFicha');
    if (inputFicha) {
        inputFicha.addEventListener('change', async function() {
            const ficha = this.value;
            if (!ficha) return;
            document.getElementById('asigNombre').placeholder = "Buscando...";
            try {
                const res = await ApiService.fetchAutenticado(`/stock/usuario/${ficha}`);
                if (res && res.ok) {
                    const usuario = await res.json();
                    document.getElementById('asigNombre').value = usuario.nombre || "";
                    document.getElementById('asigGerencia').value = usuario.gerencia || "";
                    document.getElementById('asigExtension').value = usuario.extension || "";
                    mostrarModal("Usuario encontrado. Datos cargados.", "success");
                } else {
                    document.getElementById('asigNombre').value = "";
                    document.getElementById('asigGerencia').value = "";
                    document.getElementById('asigExtension').value = "";
                    document.getElementById('asigNombre').placeholder = "Ingrese nombre completo";
                }
            } catch (error) {
                console.error("Error al buscar usuario:", error);
            }
        });
    }
});

// --- HELPER: OBTENER ROL ---
function obtenerRolUsuario() {
    const token = sessionStorage.getItem('jwt_token'); // Debug: Verificar token
    if (!token) return 'SOPORTE';
    try {
            // Decodificar el Payload del JWT (la segunda parte del string)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            //console.log("Payload del token:", payload);
            return payload.tipo ||"SOPORTE"; // Retorna el rol o SOPORTE por defecto

        } catch (e) {
            console.error("Error al leer rol del token:", e);
            //return 'SOPORTE'; // Por seguridad, asumimos el rol más bajo si falla
        }
}

// --- 1. CARGAR CATALOGOS ---
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

// --- LOGICA DE FILTROS ---
function actualizarDropdownNombres() {
    const tipo = document.getElementById('filtroTipo').value;
    const selectNombres = document.getElementById('filtroNombre');
    selectNombres.innerHTML = '<option value="">Todos los items</option>';
    
    if (!tipo) {
        selectNombres.disabled = true;
        return;
    }

    selectNombres.disabled = false;
    const lista = (tipo === 'COMPONENTE') ? listaComponentesDB : listaPerifericosDB;

    lista.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.nombre; // Filtramos por nombre texto
        opt.textContent = item.nombre;
        selectNombres.appendChild(opt);
    });
}

function aplicarFiltrosDisponibles() {
    const tipo = document.getElementById('filtroTipo').value;
    const nombre = document.getElementById('filtroNombre').value;

    let filtrados = listaGlobalDisponibles;

    if (tipo) {
        filtrados = filtrados.filter(item => item.categoria === tipo);
    }
    if (nombre) {
        filtrados = filtrados.filter(item => item.nombreItem === nombre);
    }

    renderTablaDisponibles(filtrados, document.getElementById('tablaDisponibles'));
}

function limpiarFiltros() {
    document.getElementById('filtroTipo').value = "";
    document.getElementById('filtroNombre').innerHTML = '<option value="">Seleccione Tipo Primero...</option>';
    document.getElementById('filtroNombre').disabled = true;
    renderTablaDisponibles(listaGlobalDisponibles, document.getElementById('tablaDisponibles'));
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
        const nombreUpper = (item.nombre || "").toUpperCase();
        if (categoria === 'COMPONENTE' && (nombreUpper.includes("WINDOWS") || nombreUpper.includes("CANAIMA"))) return;
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = item.nombre;
        select.appendChild(opt);
    });
}

// --- 3. GUARDAR NUEVO ITEM ---
async function guardarNuevoStock() {
    const payload = {
        categoria: document.getElementById('selCategoria').value,
        idReferencia: parseInt(document.getElementById('selReferencia').value),
        marca: document.getElementById('inputMarca').value.trim(),
        caracteristicas: document.getElementById('inputCaract').value.trim(),
        serial: document.getElementById('inputSerial').value.trim()
    }
    if(!payload.idReferencia || !payload.marca || !payload.serial) return mostrarModal("Complete campos obligatorios.", 'warning');

    try {
        const res = await ApiService.fetchAutenticado('/stock', { method: 'POST', body: JSON.stringify(payload) });
        if (res.ok) {
            alert("Item registrado exitosamente."); // Alert simple para asegurar lectura antes de reload
            window.location.reload(); // RECARGA PAGINA
        } else {
            mostrarModal("Error al guardar. Verifique si el serial ya existe.", 'error');
        }
    } catch (e) {
        mostrarModal("Error de conexión.", 'error');
    }
}

// --- 4. CARGAR DISPONIBLES ---
async function cargarDisponibles() {
    const tbody = document.getElementById('tablaDisponibles');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Cargando inventario...</td></tr>';
    try {
        const resStock = await ApiService.fetchAutenticado('/stock');
        const resAsig = await ApiService.fetchAutenticado('/stock/asignaciones');
        if (!resStock.ok) throw new Error("Error al obtener inventario");

        const dataStock = await resStock.json();
        const dataAsig = resAsig.ok ? await resAsig.json() : [];
        const serialesAsignados = dataAsig.map(a => a.serial);

        // Actualizar contadores
        const disponibles = dataStock.filter(item => !serialesAsignados.includes(item.serial));
        document.getElementById('totalLibres').innerText = disponibles.length;
        document.getElementById('totalAsignados').innerText = serialesAsignados.length;

        // Guardar en global para filtros
        listaGlobalDisponibles = disponibles;

        renderTablaDisponibles(disponibles, tbody);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar datos.</td></tr>';
    }
}

function renderTablaDisponibles(lista, tbody) {
    tbody.innerHTML = '';
    const rol = obtenerRolUsuario(); // Verificamos rol

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay items que coincidan.</td></tr>';
        return;
    }

    lista.forEach(item => {
        // Solo mostrar botón de eliminar si es ADMIN
        const btnEliminar = (rol === 'ADMIN') 
            ? `<button class="btn btn-sm btn-outline-danger ms-1" onclick="abrirEliminar(${item.id})" title="Borrar del Sistema"><i class="bi bi-trash3"></i></button>`
            : '';

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
               ${btnEliminar}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 5. CARGAR ASIGNADOS ---
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

async function buscarAsignadosPorFicha() {
    const ficha = document.getElementById('inputBuscarFicha').value;
    if (!ficha) return mostrarModal("Ingrese una ficha para buscar.", "warning");
    const tbody = document.getElementById('tablaAsignados');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Buscando...</td></tr>';
    try {
        const res = await ApiService.fetchAutenticado(`/stock/asignaciones/buscar/${ficha}`);
        if (!res.ok) throw new Error("Error en la búsqueda");
        const data = await res.json();
        renderTablaAsignados(data, tbody);
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error buscando por ficha.</td></tr>';
    }
}

function renderTablaAsignados(lista, tbody) {
    tbody.innerHTML = '';
    const rol = obtenerRolUsuario();

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sin registros.</td></tr>';
        return;
    }

    lista.forEach(item => {
        // Solo mostrar botón de desvincular si es ADMIN
        const btnDesvincular = (rol === 'ADMIN')
            ? `<button class="btn btn-sm btn-outline-warning" onclick="abrirDesvincular('${item.serial}')" title="Desvincular"><i class="bi bi-link-45deg"></i></button>`
            : '';

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
                 ${btnDesvincular}
               </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 6. ACCIONES (ASIGNAR, DESVINCULAR, ELIMINAR) ---

function abrirModalAsignar(id, nombre, serial) {
    document.getElementById('hdnIdStockAsignar').value = id;
    document.getElementById('lblItemAsignar').innerText = nombre;
    document.getElementById('lblSerialAsignar').innerText = "Serial: " + serial;
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
    if(!payload.fmoEquipo || !payload.fichaUsuario || !payload.nombreUsuario) return mostrarModal("FMO, Ficha y Nombre son obligatorios.", 'warning');

    try {
        const res = await ApiService.fetchAutenticado('/stock/asignar', { method: 'POST', body: JSON.stringify(payload) });
        if (res.ok) {
            alert("Equipo asignado correctamente.");
            window.location.reload(); // RECARGA PAGINA
        } else {
            const txt = await res.text();
            mostrarModal(`Error: ${txt}`, 'error');
        }
    } catch (e) {
        mostrarModal("Error de conexión.", 'error');
    }
}

function abrirDesvincular(serial) {
    tempSerial = serial;
    document.getElementById('lblSerialDesvincular').innerText = serial;
    new bootstrap.Modal(document.getElementById('modalDesvincular')).show();
}

async function ejecutarDesvinculacion() {
    if (!tempSerial) return;
    const safeSerial = encodeURIComponent(tempSerial);
    try {
        const res = await ApiService.fetchAutenticado(`/stock/desvincular/${safeSerial}`, { method: 'DELETE' });
        if (res.ok) {
            alert("Item liberado correctamente.");
            window.location.reload(); // RECARGA PAGINA
        } else {
            const txt = await res.text();
            mostrarModal(`No se pudo desvincular: ${txt}`, 'error');
        }
    } catch (e) {
        mostrarModal("Error al procesar.", 'error');
    }
}

function abrirEliminar(id) {
    tempIdEliminar = id;
    new bootstrap.Modal(document.getElementById('modalEliminar')).show();
}

async function ejecutarEliminacionDb() {
    if(!tempIdEliminar) return;
    try {
        const res = await ApiService.fetchAutenticado(`/stock/${tempIdEliminar}`, { method: 'DELETE' });
        if(res.ok) {
            alert("Registro eliminado.");
            window.location.reload(); // RECARGA PAGINA
        } else {
            mostrarModal("Error al eliminar. Verifique que no esté asignado.", 'error');
        }
    } catch(e) {
        mostrarModal("Error de conexión.", 'error');
    }
}

function verDetalleAsignacion(item) {
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

function verRelacion(idStock) {
    // Si necesitas llamar al endpoint GET /relacion/{id}
    // En este flujo, ya tenemos los datos en el array de asignados, pero si lo usas, mantenlo así.
    ApiService.fetchAutenticado(`/stock/relacion/${idStock}`)
        .then(res => res.json())
        .then(data => {
             verDetalleAsignacion(data); // Reutilizamos funcion visual
        })
        .catch(err => console.error(err));
}