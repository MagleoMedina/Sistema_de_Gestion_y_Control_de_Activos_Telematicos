async function getBackendUrl() {
    if (typeof BASE_URL !== 'undefined' && BASE_URL) return BASE_URL;
    const res = await fetch('/config/backend-url');
    const data = await res.json();
    window.BASE_URL = data.BACKEND_URL;
    return data.BACKEND_URL;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Al cargar la página, traemos todos los mantenimientos
    await cargarTodos();
});

// ==========================================
// MÉTODOS DE BÚSQUEDA (FETCH)
// ==========================================
async function cargarTodos() {
    // Limpiamos los inputs de filtro visualmente
    document.getElementById('filtroGerencia').value = '';
    document.getElementById('filtroFecha').value = '';
    await ejecutarBusqueda('/mantenimientos');
}

async function buscarPorFecha() {
    const fecha = document.getElementById('filtroFecha').value;
    if (!fecha) return mostrarModal("Por favor seleccione una fecha.", "warning");
    
    // Limpiamos el otro filtro para evitar confusión
    document.getElementById('filtroGerencia').value = ''; 
    await ejecutarBusqueda(`/mantenimientos/busqueda/fecha/${fecha}`);
}

async function buscarPorGerencia() {
    const gerencia = document.getElementById('filtroGerencia').value.trim();
    if (!gerencia) return mostrarModal("Por favor escriba una gerencia.", "warning");
    
    document.getElementById('filtroFecha').value = ''; 
    await ejecutarBusqueda(`/mantenimientos/busqueda/gerencia/${gerencia}`);
}

// Función centralizada para hacer las peticiones
async function ejecutarBusqueda(endpointRelativo) {
    const tbody = document.getElementById('tablaResultados');
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4"><div class="spinner-border spinner-border-sm text-danger me-2"></div>Buscando...</td></tr>`;

    try {
        const token = sessionStorage.getItem('jwt_token');
        const BACKEND_URL = await getBackendUrl();
        
        const res = await fetch(`${BACKEND_URL}${endpointRelativo}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // --- NUEVO: Interceptar el 404 ---
        if (res.status === 404) {
            // Le pasamos un arreglo vacío a renderTabla para que dibuje el mensaje de "No se encontraron registros"
            renderTabla([]); 
            return; // Detenemos la ejecución aquí
        }

        if (!res.ok) throw new Error("Error de conexión al consultar datos.");

        const data = await res.json();
        renderTabla(data);

    } catch (error) {
        console.error("Error:", error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-2"></i>Error al cargar los mantenimientos.</td></tr>`;
    }
}

// ==========================================
// RENDERIZAR TABLA
// ==========================================
function renderTabla(lista) {
    const tbody = document.getElementById('tablaResultados');
    tbody.innerHTML = '';

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4"><i class="bi bi-info-circle me-2"></i>No se encontraron registros.</td></tr>`;
        return;
    }

    lista.forEach((mant, index) => {
        const tr = document.createElement('tr');
        
        // Serializamos el objeto completo para pasarlo al modal de detalles
        const jsonMant = encodeURIComponent(JSON.stringify(mant));

        // Determinar si el botón de fotos debe estar activo o bloqueado
        const tieneFotos = mant.fotos && mant.fotos.length > 0;
        const btnFotos = tieneFotos 
            ? `<button class="btn btn-sm btn-outline-secondary" onclick="abrirGaleria('${jsonMant}')" title="Ver Fotos"><i class="bi bi-images"></i></button>`
            : `<button class="btn btn-sm btn-outline-secondary disabled" title="Sin Fotos"><i class="bi bi-image"></i></button>`;

        tr.innerHTML = `
            <td class="text-center fw-bold text-muted">${index + 1}</td>
            <td class="fw-bold">${formatearFecha(mant.fecha) || 'N/A'}</td>
            <td><span class="text-truncate d-inline-block" style="max-width: 150px;" title="${mant.gerencia || 'N/A'}">${mant.gerencia || 'N/A'}</span></td>
            <td>
                <div class="fw-bold">${mant.nombreUsuario || 'N/A'}</div>
                <small class="text-muted">Ficha: ${mant.ficha || 'S/N'}</small>
            </td>
            <td>
                <div class="text-primary fw-bold">${mant.fmo || 'S/N'}</div>
                <span class="badge bg-light text-dark border">${mant.tipoDispositivo || 'N/A'}</span>
            </td>
            <td><span class="text-truncate d-inline-block text-muted" style="max-width: 200px;" title="${mant.observaciones || ''}">${mant.observaciones || 'Sin observaciones'}</span></td>
            <td class="text-center">
                <div class="btn-group shadow-sm">
                    <button class="btn btn-sm btn-outline-danger" onclick="abrirDetalles('${jsonMant}')" title="Ver Detalles">
                        <i class="bi bi-eye-fill me-1"></i>Detalles
                    </button>
                    ${btnFotos}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// MODALES E INTERACTIVIDAD
// ==========================================
function abrirDetalles(jsonEncoded) {
    try {
        const mant = JSON.parse(decodeURIComponent(jsonEncoded));
        
        document.getElementById('detFecha').textContent = formatearFecha(mant.fecha) || 'N/A';
        document.getElementById('detAnalista').textContent = mant.analista || 'N/A';
        document.getElementById('detGerencia').textContent = mant.gerencia || 'N/A';
        document.getElementById('detDepto').textContent = mant.departamento || 'N/A';
        
        document.getElementById('detUsuario').textContent = mant.nombreUsuario || 'N/A';
        document.getElementById('detFicha').textContent = mant.ficha || 'S/N';
        
        document.getElementById('detFmo').textContent = mant.fmo || 'N/A';
        document.getElementById('detTipo').textContent = mant.tipoDispositivo || 'N/A';
        document.getElementById('detMarca').textContent = mant.marca || 'N/A';
        document.getElementById('detModelo').textContent = mant.modelo || 'N/A';
        document.getElementById('detSo').textContent = mant.so || 'N/A';
        document.getElementById('detObs').textContent = mant.observaciones || 'Ninguna';

        new bootstrap.Modal(document.getElementById('modalDetalles')).show();
    } catch (e) {
        console.error("Error al leer detalles:", e);
    }
}

async function abrirGaleria(jsonEncoded) {
    try {
        const mant = JSON.parse(decodeURIComponent(jsonEncoded));
        const contenedor = document.getElementById('contenedorGaleria');
        contenedor.innerHTML = '';

        if (!mant.fotos || mant.fotos.length === 0) return;

        const BACKEND_URL = await getBackendUrl();

        mant.fotos.forEach(nombreArchivo => {
            // Asume que tu backend de Java sirve los archivos estáticos en esta ruta
            const urlFoto = `${BACKEND_URL}/mantenimientos/fotos/${nombreArchivo}`;
            
            const img = document.createElement('img');
            img.src = urlFoto;
            img.className = 'foto-galeria';
            img.title = "Clic para abrir en nueva pestaña";
            img.onclick = () => window.open(urlFoto, '_blank'); // Abre la foto original

            contenedor.appendChild(img);
        });

        new bootstrap.Modal(document.getElementById('modalGaleria')).show();
    } catch (e) {
        console.error("Error al cargar fotos:", e);
    }
}

// --- UTILIDAD ---
function formatearFecha(fechaStr) {
    if(!fechaStr) return "";
    const partes = fechaStr.split('-');
    if(partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return fechaStr;
}