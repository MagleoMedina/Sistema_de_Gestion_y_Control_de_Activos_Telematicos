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

// ==========================================
// MÓDULO DE ASISTENTE DE IA
// ==========================================

function abrirModalIA() {
    // Resetear la vista del modal cada vez que se abre
    document.getElementById('ia_prompt').value = '';
    document.getElementById('ia_resultados').style.display = 'none';
    document.getElementById('ia_loading').style.display = 'none';
    
    const modalIA = new bootstrap.Modal(document.getElementById('modalAsistenteIA'));
    modalIA.show();
}

async function consultarIA() {
    const prompt = document.getElementById('ia_prompt').value.trim();
    
    // Validación de campo vacío
    if (!prompt) {
        // Usamos tu función mostrarModal existente para las alertas
        return mostrarModal("Campo Vacío", "Por favor, describe la falla técnica para que la IA pueda analizarla.", "warning");
    }

    if (prompt.length < 10) {
        return mostrarModal("Descripción Corta", "Proporciona un poco más de detalles técnicos para un mejor análisis.", "warning");
    }

    // 1. Preparar la Interfaz (Modo Carga)
    document.getElementById('btnConsultarIA').disabled = true;
    document.getElementById('ia_resultados').style.display = 'none';
    document.getElementById('ia_loading').style.display = 'block';

    try {
        // 1. Preparar la Interfaz (Modo Carga)
        document.getElementById('btnConsultarIA').disabled = true;
        document.getElementById('ia_resultados').style.display = 'none';
        document.getElementById('ia_loading').style.display = 'block';

        // 2. Ejecutar la Petición POST al Endpoint de IA usando tu ApiService
        const response = await ApiService.fetchAutenticado('/ia/consultar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        // Si ApiService maneja errores de red internamente y devuelve null, detenemos la ejecución
        if (!response) throw new Error("No se obtuvo respuesta del servidor.");
        
        if (!response.ok) {
            const errorTxt = await response.text();
            throw new Error(errorTxt || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // 3. Renderizar Respuesta de la IA
        const solucionFormateada = data.solucionIA 
            ? data.solucionIA.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
            : "La IA no proporcionó una respuesta.";
            
        document.getElementById('ia_respuesta_texto').innerHTML = solucionFormateada;
        document.getElementById('ia_analisis_contexto').textContent = data.analisisContexto || 'Análisis finalizado.';

        // 4. Renderizar Coincidencia en BD (Si existe)
        if (data.mejorCoincidenciaDB) {
            const match = data.mejorCoincidenciaDB;
            document.getElementById('ia_db_id').textContent = match.id || 'N/A';
            document.getElementById('ia_db_fecha').textContent = match.fecha || 'N/A';
            document.getElementById('ia_db_usuario').textContent = match.nombre || 'Desconocido';
            document.getElementById('ia_db_ficha').textContent = match.ficha || 'N/A';
            document.getElementById('ia_db_analista').textContent = match.atendidoPor || 'N/A';
            document.getElementById('ia_db_reporte').textContent = match.reporte || 'Sin registro detallado.';
            
            document.getElementById('ia_sin_coincidencia').style.display = 'none';
            document.getElementById('ia_coincidencia_db').style.display = 'block';
        } else {
            document.getElementById('ia_coincidencia_db').style.display = 'none';
            document.getElementById('ia_sin_coincidencia').style.display = 'block';
        }

        // 5. Mostrar Resultados con Animación
        document.getElementById('ia_loading').style.display = 'none';
        document.getElementById('ia_resultados').style.display = 'block';

    } catch (error) {
        console.error("Error al consultar la IA:", error);
        document.getElementById('ia_loading').style.display = 'none';
        mostrarModal("Error de Conexión", "No se pudo completar el análisis de la IA. Verifique su conexión y contacte al administrador si el problema persiste.", "error");
    } finally {
        // Habilitar botón nuevamente
        document.getElementById('btnConsultarIA').disabled = false;
    }
}