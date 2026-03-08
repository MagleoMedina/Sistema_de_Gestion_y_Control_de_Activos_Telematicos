// Variable global para almacenar los datos y facilitar la búsqueda
let pasantesGlobales = [];

async function getBackendUrl() {
    if (typeof BASE_URL !== 'undefined' && BASE_URL) return BASE_URL;
    const res = await fetch('/config/backend-url');
    const data = await res.json();
    return data.BACKEND_URL;
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarPasantes();

    // Cargar datalists para el modal de edición
    await cargarInstitutosEdit();
    await cargarDepartamentosEdit();

    // ==========================================
    // NUEVO: BUSCADOR DINÁMICO CON DEBOUNCE
    // ==========================================
    const inputBusqueda = document.getElementById('inputBusqueda');
    let timeoutBusqueda; // Variable para el retraso (debounce)

    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            clearTimeout(timeoutBusqueda); // Limpiamos el contador si sigue tecleando
            const termino = e.target.value.trim();

            timeoutBusqueda = setTimeout(async () => {
                const tbody = document.getElementById('tablaPasantes');
                
                // Si borró todo el texto, recargamos la tabla completa
                if (termino === '') {
                    await cargarPasantes();
                    return;
                }

                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4"><div class="spinner-border spinner-border-sm text-danger me-2" role="status"></div>Buscando...</td></tr>`;

                try {
                    const token = sessionStorage.getItem('jwt_token');
                    const BACKEND_URL = await getBackendUrl();
                    let url = '';

                    // Expresión regular: verifica si el primer carácter es un número (0-9)
                    if (/^\d/.test(termino)) {
                        url = `${BACKEND_URL}/buscarPasantePorFicha/${termino}`;
                    } else {
                        // Si es letra o símbolo, busca por nombre
                        url = `${BACKEND_URL}/buscarPasantePorNombre/${termino}`;
                    }

                    const response = await fetch(url, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    // --- NUEVA LÓGICA: Interceptar el 404 ---
                    if (response.status === 404) {
                        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4"><i class="bi bi-search me-2"></i>No se encontraron coincidencias.</td></tr>`;
                        return; // Detenemos la ejecución aquí, no hay error real, solo no hay datos
                    }
                    
                    if (!response.ok) throw new Error("No se pudo realizar la búsqueda.");
                    
                   
                    
                    let data = await response.json();
                    // --- SOLUCIÓN AQUÍ ---
                    // Verificamos si NO es un arreglo
                    if (!Array.isArray(data)) {
                        // Si el objeto tiene datos (ej. un id), lo metemos en un arreglo. 
                        // Si está vacío o es un error, pasamos un arreglo vacío.
                        data = data.id ? [data] : [];
                    }
                    
                    // Actualizamos la tabla con los resultados que dio el backend
                    await renderTabla(data);

                } catch (error) {
                    console.error("Error en búsqueda:", error);
                    
                    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-2"></i>Error al buscar pasante.</td></tr>`;
                }
            }, 500); // 500 milisegundos de espera antes de ir al backend
        });
    }
});

// --- 1. CARGAR DATOS DESDE EL BACKEND ---
async function cargarPasantes() {
    const tbody = document.getElementById('tablaPasantes');
    
    try {
        const BACKEND_URL = await getBackendUrl();
        const token = sessionStorage.getItem('jwt_token');
        const response = await fetch(`${BACKEND_URL}/listarPasantes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("No se pudo obtener la lista de pasantes.");

        const data = await response.json();
        pasantesGlobales = data; 
        await renderTabla(pasantesGlobales);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-2"></i>Error al cargar los datos: ${error.message}</td></tr>`;
    }
}

// --- 2. RENDERIZAR LA TABLA ---
async function renderTabla(lista) {
    const tbody = document.getElementById('tablaPasantes');
    tbody.innerHTML = '';
    const BACKEND_URL = await getBackendUrl();
    
    // Verificar si el usuario es ADMIN
    const esAdmin = (typeof ApiService !== 'undefined' && ApiService.obtenerRol() === 'ADMIN');

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron pasantes registrados.</td></tr>`;
        return;
    }

    lista.forEach((pasante, index) => {
        const urlFoto = pasante.rutaFotografia ? `${BACKEND_URL}/recursos-pasantes/fotografia/${pasante.rutaFotografia}` : '/img/user-placeholder.png';
        const urlInforme = pasante.rutaInforme ? `${BACKEND_URL}/recursos-pasantes/informe/${pasante.rutaInforme}` : null;

        const tr = document.createElement('tr');
        
        const btnInforme = urlInforme 
            ? `<button class="btn btn-sm btn-outline-danger" onclick="descargarInforme('${urlInforme}')" title="Ver Informe PDF"><i class="bi bi-file-earmark-pdf-fill"></i></button>`
            : `<button class="btn btn-sm btn-outline-secondary disabled" title="Sin Informe"><i class="bi bi-file-earmark-pdf"></i></button>`;

        const jsonPasante = encodeURIComponent(JSON.stringify(pasante));

        // Construir botones de Admin si corresponde
        let botonesAdmin = '';
        if (esAdmin) {
            botonesAdmin = `
                <button class="btn btn-sm btn-outline-warning" onclick="abrirModalEditar('${jsonPasante}')" title="Editar Pasante">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="prepararEliminar(${pasante.id}, '${pasante.nombre}')" title="Eliminar Pasante">
                    <i class="bi bi-trash-fill"></i>
                </button>
            `;
        }

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
                    ${botonesAdmin} </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// MÉTODOS DE ELIMINACIÓN (DELETE)
// ==========================================
function prepararEliminar(id, nombre) {
    document.getElementById('idPasanteEliminar').value = id;
    document.getElementById('lblNombreEliminar').textContent = nombre || "este pasante";
    new bootstrap.Modal(document.getElementById('modalEliminar')).show();
}

async function confirmarEliminacion() {
    const id = document.getElementById('idPasanteEliminar').value;
    
    try {
        const token = sessionStorage.getItem('jwt_token');
        const BACKEND_URL = await getBackendUrl();
        const res = await fetch(`${BACKEND_URL}/eliminarPasante/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
            mostrarModal("Pasante eliminado con éxito.", "success");
            await cargarPasantes(); // Recargar la tabla
        } else {
            throw new Error("No se pudo eliminar el registro.");
        }
    } catch (error) {
        console.error(error);
        mostrarModal(error.message, "error");
    }
}

// ==========================================
// MÉTODOS DE ACTUALIZACIÓN (PUT)
// ==========================================
function abrirModalEditar(pasanteStringEncoded) {
    const pasante = JSON.parse(decodeURIComponent(pasanteStringEncoded));
    
    // Poblar el formulario del modal
    document.getElementById('editId').value = pasante.id;
    document.getElementById('editFicha').value = pasante.ficha || '';
    document.getElementById('editCedula').value = pasante.cedula || '';
    document.getElementById('editNombre').value = pasante.nombre || '';
    document.getElementById('editNacimiento').value = pasante.fechaNacimiento || '';
    document.getElementById('editExt').value = pasante.extension || '';
    document.getElementById('editInstituto').value = pasante.nombreInstituto || '';
    document.getElementById('editTitulo').value = pasante.tituloPretendido || '';
    document.getElementById('editGerencia').value = pasante.gerenciaAsignada || 'Gerencia de Telemática';
    document.getElementById('editArea').value = pasante.departamentoAsignado || '';
    document.getElementById('editInicio').value = pasante.fechaInicio || '';
    document.getElementById('editFin').value = pasante.fechaFinalizacion || '';
    
    // Limpiar los inputs de archivo por si había algo antes
    document.getElementById('editFoto').value = '';
    document.getElementById('editInforme').value = '';

    new bootstrap.Modal(document.getElementById('modalEditar')).show();
}

async function guardarEdicion() {
    const id = document.getElementById('editId').value;
    
    const datosModificados = {
        ficha: parseInt(document.getElementById('editFicha').value),
        cedula: document.getElementById('editCedula').value,
        nombre: document.getElementById('editNombre').value,
        extension: document.getElementById('editExt').value,
        gerencia: document.getElementById('editGerencia').value,
        nombreInstituto: document.getElementById('editInstituto').value,
        fechaInicio: document.getElementById('editInicio').value,
        fechaFinalizacion: document.getElementById('editFin').value,
        areaAsignada: document.getElementById('editArea').value,
        fechaNacimiento: document.getElementById('editNacimiento').value,
        tituloPretendido: document.getElementById('editTitulo').value
    };

    const formData = new FormData();
    formData.append('datos', JSON.stringify(datosModificados));

    const fotoFile = document.getElementById('editFoto').files[0];
    if (fotoFile) formData.append('fotografia', fotoFile);

    const informeFile = document.getElementById('editInforme').files[0];
    if (informeFile) formData.append('informe', informeFile);

    try {
        const token = sessionStorage.getItem('jwt_token');
        const BACKEND_URL = await getBackendUrl();
        
        const response = await fetch(`${BACKEND_URL}/actualizarPasante/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
                // NO ponemos Content-Type para permitir multipart/form-data
            },
            body: formData
        });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
            mostrarModal("Pasante actualizado correctamente.", "success");
            await cargarPasantes();
        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
        mostrarModal("Ocurrió un error al actualizar: " + error.message, "error");
    }
}

// ==========================================
// MÉTODOS COMPARTIDOS (Lectura y Datalists)
// ==========================================

async function cargarInstitutosEdit() {
    try {
        const token = sessionStorage.getItem('jwt_token');
        const baseUrl = await getBackendUrl();
        const res = await fetch(`${baseUrl}/institutos`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const institutos = await res.json();
            const datalist = document.getElementById('listaInstitutosEdit');
            datalist.innerHTML = ''; 
            institutos.forEach(inst => {
                const option = document.createElement('option');
                option.value = inst.nombreInstituto;
                datalist.appendChild(option);
            });
        }
    } catch (e) { console.error("Error institutos", e); }
}

async function cargarDepartamentosEdit() {
    try {
        const token = sessionStorage.getItem('jwt_token');
        const baseUrl = await getBackendUrl();
        const res = await fetch(`${baseUrl}/estructura/gerencias`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            const gerencias = await res.json();
            const gerenciaFiltro = gerencias.find(g => g.nombre.toLowerCase() === 'gerencia de telemática');
            const datalist = document.getElementById('listaDepartamentosEdit');
            datalist.innerHTML = ''; 
            if (gerenciaFiltro && gerenciaFiltro.departamentos) {
                gerenciaFiltro.departamentos.forEach(dep => {
                    const option = document.createElement('option');
                    option.value = dep.nombre;
                    datalist.appendChild(option);
                });
            }
        }
    } catch (e) { console.error("Error deptos", e); }
}

function abrirDetalles(pasanteStringEncoded) {
    try {
        const pasante = JSON.parse(decodeURIComponent(pasanteStringEncoded));
        getBackendUrl().then(BACKEND_URL => {
            const urlFoto = pasante.rutaFotografia ? `${BACKEND_URL}/recursos-pasantes/fotografia/${pasante.rutaFotografia}` : '/img/user-placeholder.png';
            document.getElementById('detFoto').src = urlFoto;
            
            document.getElementById('detNombre').textContent = pasante.nombre || "N/A";
            document.getElementById('detFicha').textContent = pasante.ficha || "N/A";
            document.getElementById('detExt').textContent = pasante.extension || "N/A";
            document.getElementById('detInstituto').textContent = pasante.nombreInstituto || "N/A";
            document.getElementById('detTitulo').textContent = pasante.tituloPretendido || "N/A";
            document.getElementById('detNacimiento').textContent = pasante.fechaNacimiento ? formatearFecha(pasante.fechaNacimiento) : "N/A";
            document.getElementById('detCedula').textContent = pasante.cedula || "N/A";
            
            // Usando los nuevos campos del DTO: gerenciaAsignada y departamentoAsignado
            document.getElementById('detGerencia').textContent = pasante.gerenciaAsignada || "N/A";
            document.getElementById('detArea').textContent = pasante.departamentoAsignado || "N/A";
            
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
        });
    } catch (error) {
        console.error("Error parseando:", error);
        mostrarModal("Ocurrió un error al intentar leer los datos del pasante.", "error");
    }
}

function abrirVisorFoto(url) {
    document.getElementById('visorFoto').src = url;
    new bootstrap.Modal(document.getElementById('modalFoto')).show();
}

function descargarInforme(urlAbsoluta) {
    window.open(urlAbsoluta, '_blank');
}

function formatearFecha(fechaStr) {
    if(!fechaStr) return "";
    const partes = fechaStr.split('-');
    if(partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return fechaStr;
}