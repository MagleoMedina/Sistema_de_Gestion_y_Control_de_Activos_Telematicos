// Variable global para almacenar los datos y facilitar la búsqueda
let pasantesGlobales = [];

async function getBackendUrl() {
    if (BASE_URL) return BASE_URL;
    const res = await fetch('/config/backend-url');
    const data = await res.json();
    BASE_URL = data.BACKEND_URL;
    return BASE_URL;
}

document.addEventListener('DOMContentLoaded', () => {
    cargarPasantes();

    // Listener para el buscador en tiempo real
    const inputBusqueda = document.getElementById('inputBusqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            const filtrados = pasantesGlobales.filter(p => {
                const nombre = p.usuario?.nombre?.toLowerCase() || "";
                const ficha = p.usuario?.ficha?.toString() || "";
                return nombre.includes(termino) || ficha.includes(termino);
            });
            renderTabla(filtrados);
        });
    }
});

// --- 1. CARGAR DATOS DESDE EL BACKEND ---
async function cargarPasantes() {
    const tbody = document.getElementById('tablaPasantes');
    
    try {
        // Asume que tienes un endpoint GET /pasantes que devuelve la lista
        const response = await ApiService.fetchAutenticado('/listarPasantes');
        
        if (!response.ok) {
            throw new Error("No se pudo obtener la lista de pasantes.");
        }

        const data = await response.json();
        pasantesGlobales = data; // Guardamos en memoria
        renderTabla(pasantesGlobales);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-2"></i>Error al cargar los datos: ${error.message}</td></tr>`;
    }
}

// --- 2. RENDERIZAR LA TABLA ---
function renderTabla(lista) {
    const tbody = document.getElementById('tablaPasantes');
    tbody.innerHTML = '';
    

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron pasantes registrados.</td></tr>`;
        return;
    }

    lista.forEach(async(pasante, index) => {
        // AHORA LOS DATOS ESTÁN DIRECTOS EN EL OBJETO 'pasante'
        const BACKEND_URL = await getBackendUrl();
        const urlFoto = pasante.rutaFotografia ? `${BACKEND_URL}/recursos-pasantes/fotografia/${pasante.rutaFotografia}` : '/img/user-placeholder.png';
        const urlInforme = pasante.rutaInforme ? `${BACKEND_URL}/recursos-pasantes/informe/${pasante.rutaInforme}` : null;

        const tr = document.createElement('tr');
        
        const btnInforme = urlInforme 
            ? `<button class="btn btn-sm btn-outline-danger" onclick="descargarInforme('${urlInforme}')" title="Ver Informe PDF"><i class="bi bi-file-earmark-pdf-fill"></i></button>`
            : `<button class="btn btn-sm btn-outline-secondary disabled" title="Sin Informe"><i class="bi bi-file-earmark-pdf"></i></button>`;

        const jsonPasante = encodeURIComponent(JSON.stringify(pasante));

        tr.innerHTML = `
            <td class="text-center fw-bold text-muted">${index + 1}</td>
            <td class="text-center">
                <img src="${urlFoto}" class="foto-miniatura" onclick="abrirVisorFoto('${urlFoto}')" title="Ver foto ampliada">
            </td>
            <td class="fw-bold text-primary">${pasante.ficha || 'S/N'}</td>
            <td class="fw-bold">${pasante.nombre || 'Desconocido'}</td>
            <td><span class="badge bg-light text-dark border text-wrap text-start">${pasante.tituloPretendido || 'N/A'}</span></td>
            <td class="text-center">
                <div class="btn-group shadow-sm">
                    <button class="btn btn-sm btn-fmo-outline" onclick="abrirDetalles('${jsonPasante}')" title="Ver Expediente Completo">
                        <i class="bi bi-eye-fill me-1"></i>Detalles
                    </button>
                    ${btnInforme}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 3. VER DETALLES (MODAL SOLO LECTURA) ---
async function abrirDetalles(pasanteStringEncoded) {
    try {
        const pasante = JSON.parse(decodeURIComponent(pasanteStringEncoded));
        const BACKEND_URL = await getBackendUrl(); 

        // Foto y Cabecera (AHORA LEEMOS DIRECTAMENTE DE 'pasante')
        const urlFoto = pasante.rutaFotografia ? `${BACKEND_URL}/recursos-pasantes/fotografia/${pasante.rutaFotografia}` : '/img/user-placeholder.png';
        document.getElementById('detFoto').src = urlFoto;
        
        document.getElementById('detNombre').textContent = pasante.nombre || "N/A";
        // Si tienes un campo en tu modal para la cédula, puedes agregarlo aquí:
        // document.getElementById('detCedula').textContent = pasante.cedula || "N/A";
        
        document.getElementById('detFicha').textContent = pasante.ficha || "N/A";
        document.getElementById('detExt').textContent = pasante.extension || "N/A";

        // Campos de lectura
        document.getElementById('detInstituto').textContent = pasante.nombreInstituto || "N/A";
        document.getElementById('detTitulo').textContent = pasante.tituloPretendido || "N/A";
        document.getElementById('detNacimiento').textContent = pasante.fechaNacimiento ? formatearFecha(pasante.fechaNacimiento) : "N/A";
        document.getElementById('detCedula').textContent = pasante.cedula || "N/A";
        document.getElementById('detGerencia').textContent = pasante.gerencia || "N/A";
        document.getElementById('detArea').textContent = pasante.areaAsignada || "N/A";
        document.getElementById('detInicio').textContent = pasante.fechaInicio ? formatearFecha(pasante.fechaInicio) : "N/A";
        document.getElementById('detFin').textContent = pasante.fechaFinalizacion ? formatearFecha(pasante.fechaFinalizacion) : "N/A";

        const btnInforme = document.getElementById('btnDescargarInformeModal');
        if (pasante.rutaInforme) {
            btnInforme.classList.remove('d-none');
            const urlInforme = `${BACKEND_URL}/recursos-pasantes/informe/${pasante.rutaInforme}`;
            btnInforme.onclick = () => descargarInforme(urlInforme);
        } else {
            btnInforme.classList.add('d-none'); 
        }

        new bootstrap.Modal(document.getElementById('modalDetalles')).show();

    } catch (error) {
        console.error("Error parseando datos del pasante:", error);
        mostrarModal("Ocurrió un error al intentar leer los datos del pasante.", "error");
    }
}

// --- 4. VISOR DE FOTO AMPLIA ---
function abrirVisorFoto(url) {
    document.getElementById('visorFoto').src = url;
    new bootstrap.Modal(document.getElementById('modalFoto')).show();
}

// --- 5. DESCARGAR / VER INFORME PDF ---
function descargarInforme(urlAbsoluta) {
    // Abre el PDF en una nueva pestaña
    window.open(urlAbsoluta, '_blank');
}

// --- HELPER: Formatear Fecha ---
function formatearFecha(fechaStr) {
    if(!fechaStr) return "";
    // Convierte "2026-03-01" a "01/03/2026"
    const partes = fechaStr.split('-');
    if(partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaStr;
}