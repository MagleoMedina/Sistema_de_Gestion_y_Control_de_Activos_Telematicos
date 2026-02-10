// Variable global para almacenar resultados temporales
let resultadosActuales = [];
let debounceTimer; // Variable para el temporizador de escritura

document.addEventListener('DOMContentLoaded', () => {
    cambiarInterfazBusqueda(); 
    
    // --- NUEVO: Evento para búsqueda en tiempo real (Solo para Técnico) ---
    const inputGen = document.getElementById('inputGenerico');
    
    inputGen.addEventListener('input', () => {
        const criterio = document.getElementById('selectCriterio').value;
        
        // Solo activamos la búsqueda en tiempo real si el criterio es 'tecnico'
        if (criterio === 'tecnico') {
            clearTimeout(debounceTimer); // Limpiamos el temporizador anterior
            
            // Esperamos 300ms a que el usuario termine de escribir
            debounceTimer = setTimeout(() => {
                const val = inputGen.value.trim();
                if (val.length > 0) {
                    ejecutarBusqueda(); // Reutilizamos la función central
                } else {
                    // Si limpia el campo, limpiamos la tabla
                    document.getElementById('tablaResultados').innerHTML = '';
                }
            }, 300);
        }
    });
});

// --- 1. CONTROL DE INTERFAZ ---
function cambiarInterfazBusqueda() {
    const criterio = document.getElementById('selectCriterio').value;
    
    // Ocultar todos
    document.getElementById('containerGenerico').style.display = 'none';
    document.getElementById('containerFecha').style.display = 'none';
    document.getElementById('containerRango').style.display = 'none';
    document.getElementById('containerTodos').style.display = 'none';
    
    const inputGen = document.getElementById('inputGenerico');
    const lblGen = document.getElementById('lblGenerico');
    
    // Limpiar campo al cambiar de criterio para evitar búsquedas cruzadas
    inputGen.value = ''; 

    switch (criterio) {
        case 'todos':
            document.getElementById('containerTodos').style.display = 'block';
            break;
        case 'ficha':
            document.getElementById('containerGenerico').style.display = 'block';
            lblGen.innerText = "Ingrese Número de Ficha";
            inputGen.placeholder = "Ej: 12345";
            inputGen.type = "number";
            break;
        case 'tecnico':
            document.getElementById('containerGenerico').style.display = 'block';
            lblGen.innerText = "Nombre del Analista (Escriba para buscar)";
            inputGen.placeholder = "Ej: Juan, Maria...";
            inputGen.type = "text";
            break;
        case 'fecha':
            document.getElementById('containerFecha').style.display = 'block';
            break;
        case 'rango':
            document.getElementById('containerRango').style.display = 'flex';
            break;
    }
}

// --- 2. LÓGICA DE BÚSQUEDA ---
async function ejecutarBusqueda() {
    const criterio = document.getElementById('selectCriterio').value;
    const tbody = document.getElementById('tablaResultados');
    
    let url = '';

    // Construcción de URL
    if (criterio === 'todos') {
        url = '/casos'; 
    } 
    else if (criterio === 'ficha') {
        const val = document.getElementById('inputGenerico').value.trim();
        if (!val) return mostrarModal("Atención", "Ingrese una ficha.", "warning");
        url = `/casos/buscarPorFicha/${encodeURIComponent(val)}`;
    }
    else if (criterio === 'tecnico') {
        const val = document.getElementById('inputGenerico').value.trim();
        if (!val) return; 
        
        const safeVal = encodeURIComponent(val.replace(/\//g, '-'));
        url = `/casos/buscarPorTecnico/${safeVal}`;
    }
    else if (criterio === 'fecha') {
        const val = document.getElementById('inputFecha').value;
        if (!val) return mostrarModal("Atención", "Seleccione una fecha.", "warning");
        url = `/casos/buscarPorFecha/${val}`;
    }
    else if (criterio === 'rango') {
        const inicio = document.getElementById('inputFechaInicio').value;
        const fin = document.getElementById('inputFechaFin').value;
        if (!inicio || !fin) return mostrarModal("Atención", "Seleccione ambas fechas.", "warning");
        url = `/casos/rango-fechas/${inicio}/${fin}`;
    }

    if(criterio !== 'tecnico') {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-danger"></div><p>Buscando...</p></td></tr>';
    }

    try {
        const res = await ApiService.fetchAutenticado(url);
        
        if (!res) return;

        if (res.status === 204 || res.status === 404) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No se encontraron registros.</td></tr>';
            resultadosActuales = [];
            return;
        }

        if (!res.ok) {
            const errorTxt = await res.text();
            throw new Error(errorTxt || "Error del servidor");
        }

        const data = await res.json();
        resultadosActuales = Array.isArray(data) ? data : [data];
        
        renderizarTabla(resultadosActuales);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">${error.message}</td></tr>`;
    }
}

// --- 3. RENDERIZADO ---
function renderizarTabla(lista) {
    const tbody = document.getElementById('tablaResultados');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Sin resultados.</td></tr>';
        return;
    }

    lista.forEach((item, index) => {
        const reporteCorto = item.reporte.length > 50 
            ? item.reporte.substring(0, 50) + '...' 
            : item.reporte;
        
        // MOSTRAR EQUIPO SI EXISTE
        const badgeEquipo = item.equipo 
            ? `<span class="badge bg-white text-dark border ms-1"><i class="bi bi-cpu"></i> ${item.equipo}</span>`
            : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 fw-bold text-secondary">${index + 1}</td>
            <td>${item.fecha}</td>
            <td>
                <div class="d-flex flex-column">
                    <span class="fw-bold text-dark">${item.nombre || 'Desconocido'}</span>
                    <div class="mt-1">
                        <span class="small text-muted"><i class="bi bi-person-badge"></i> ${item.ficha}</span>
                        ${badgeEquipo}
                    </div>
                </div>
            </td>
            <td class="small text-muted">${item.gerencia || 'N/A'}</td>
            <td><span class="badge bg-light text-dark border">${item.atendidoPor}</span></td>
            <td class="text-muted fst-italic"><small>${reporteCorto}</small></td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary border-0" onclick="verDetalle(${index})" title="Ver Completo">
                    <i class="bi bi-eye-fill fs-5"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function verDetalle(index) {
    const item = resultadosActuales[index];
    if (!item) return;

    document.getElementById('modal_usuario').textContent = item.nombre;
    document.getElementById('modal_ficha').textContent = "Ficha: " + item.ficha;
    document.getElementById('modal_fecha').textContent = item.fecha;
    document.getElementById('modal_tecnico').textContent = item.atendidoPor;
    document.getElementById('modal_gerencia').textContent = item.gerencia;
    document.getElementById('modal_reporte').textContent = item.reporte;
    
    // ASIGNAR EL EQUIPO AL MODAL
    const elEquipo = document.getElementById('modal_equipo');
    if (elEquipo) {
        elEquipo.textContent = item.equipo || "No registrado";
    }

    new bootstrap.Modal(document.getElementById('modalDetalleCaso')).show();
}