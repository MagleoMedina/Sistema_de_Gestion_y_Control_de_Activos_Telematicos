document.addEventListener('DOMContentLoaded', async () => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    document.getElementById('progFecha').value = manana.toISOString().split('T')[0];


    document.getElementById('progAnalista').value = "";

    await cargarGerencias();
    await cargarPendientes();
});

async function cargarGerencias() {
    try {
        const res = await ApiService.fetchAutenticado('/estructura/gerencias');
        if (res.ok) {
            const gerencias = await res.json();
            const selectG = document.getElementById('progGerencia');
            const selectEdit = document.getElementById('editProgGerencia'); // Select del modal
            
            const defaultOption = '<option value="" disabled selected>Seleccione una Gerencia...</option>';
            selectG.innerHTML = defaultOption;
            selectEdit.innerHTML = defaultOption;
            
            gerencias.forEach(g => {
                const option = document.createElement('option');
                option.value = g.nombre;
                option.textContent = g.nombre;
                selectG.appendChild(option);
                selectEdit.appendChild(option.cloneNode(true)); // Llenamos ambos selects
            });
        }
    } catch (error) {
        console.error("Error cargando gerencias:", error);
    }
}

// ==========================================
// CREAR PROGRAMACIÓN (POST)
// ==========================================
async function guardarProgramacion() {
    const gerencia = document.getElementById('progGerencia').value;
    const fecha = document.getElementById('progFecha').value;
    const analista = document.getElementById('progAnalista').value;

    if (!gerencia || !fecha) return mostrarModal("Complete los campos obligatorios.", "warning");
    mostrarModal(`<div class="spinner-border text-danger me-2"></div> Agendando mantenimiento...`, "info");

    try {
        const res = await ApiService.fetchAutenticado('/programaciones/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gerencia, fechaProgramada: fecha, analistaResponsable: analista })
        });

        if (res.ok) {
            mostrarModal(`<strong>¡Programación Exitosa!</strong><br>El mantenimiento ha sido agendado.`, "success");
            document.getElementById('progGerencia').value = "";
            await cargarPendientes();
        } else {
            throw new Error(await res.text());
        }
    } catch (error) {
        mostrarModal(`<strong>Error:</strong><br>${error.message}`, "error");
    }
}

// ==========================================
// CARGAR TABLA Y RENDERIZAR
// ==========================================
async function cargarPendientes() {
    const tbody = document.getElementById('tablaPendientes');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-warning me-2"></div>Cargando pendientes...</td></tr>`;

    try {
        const res = await ApiService.fetchAutenticado('/programaciones/pendientes');
        if (!res.ok) throw new Error("No se pudo conectar con el servidor.");
        const data = await res.json();
        renderTablaPendientes(data);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Error al cargar la lista.</td></tr>`;
    }
}

function renderTablaPendientes(lista) {
    const tbody = document.getElementById('tablaPendientes');
    tbody.innerHTML = '';

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted"><i class="bi bi-calendar-check fs-2 d-block mb-2"></i>No hay mantenimientos programados pendientes.</td></tr>`;
        return;
    }

    lista.forEach((prog, index) => {
        const tr = document.createElement('tr');
        const jsonProg = encodeURIComponent(JSON.stringify(prog));
        
        tr.innerHTML = `
            <td class="text-center fw-bold text-muted">${index + 1}</td>
            <td class="fw-bold text-dark"><i class="bi bi-building me-2 text-secondary"></i>${prog.gerencia}</td>
            <td class="fw-semibold text-primary">${formatearFecha(prog.fechaProgramada)}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="bg-light rounded-circle text-center me-2" style="width: 30px; height: 30px; line-height: 30px;"><i class="bi bi-person-fill text-muted"></i></div>
                    ${prog.analistaResponsable}
                </div>
            </td>
            <td class="text-center">
                <span class="badge rounded-pill badge-pendiente"><i class="bi bi-hourglass-split me-1"></i>${prog.estado}</span>
            </td>
            <td class="text-center">
                <div class="btn-group shadow-sm">
                    <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEditar('${jsonProg}')" title="Reprogramar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="abrirModalEliminar(${prog.id})" title="Anular Programación">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function formatearFecha(fechaStr) {
    if(!fechaStr) return "";
    const partes = fechaStr.split('-');
    if(partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return fechaStr;
}

// ==========================================
// MODALES Y LÓGICA DE EDICIÓN (PUT)
// ==========================================
function abrirModalEditar(jsonEncoded) {
    const prog = JSON.parse(decodeURIComponent(jsonEncoded));
    document.getElementById('editProgId').value = prog.id;
    document.getElementById('editProgGerencia').value = prog.gerencia;
    document.getElementById('editProgFecha').value = prog.fechaProgramada;
    document.getElementById('editProgAnalista').value = prog.analistaResponsable;
    
    new bootstrap.Modal(document.getElementById('modalEditarProg')).show();
}

async function guardarEdicion() {
    const id = document.getElementById('editProgId').value;
    const gerencia = document.getElementById('editProgGerencia').value;
    const fecha = document.getElementById('editProgFecha').value;
    const analista = document.getElementById('editProgAnalista').value;

    const modalInst = bootstrap.Modal.getInstance(document.getElementById('modalEditarProg'));
    if(modalInst) modalInst.hide();

    mostrarModal(`<div class="spinner-border text-primary me-2"></div> Guardando cambios...`, "info");

    try {
        const res = await ApiService.fetchAutenticado(`/programaciones/actualizar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gerencia, fechaProgramada: fecha, analistaResponsable: analista })
        });

        if (res.ok) {
            mostrarModal(`<strong>Programación Actualizada</strong><br>Los cambios han sido guardados.`, "success");
            await cargarPendientes();
        } else {
            throw new Error(await res.text());
        }
    } catch (error) {
        mostrarModal(`Error al actualizar: ${error.message}`, "error");
    }
}

// ==========================================
// MODALES Y LÓGICA DE ELIMINACIÓN (DELETE)
// ==========================================
function abrirModalEliminar(id) {
    // Le asignamos el ID al botón del modal de confirmación
    const btnEliminar = document.getElementById('btnEjecutarDeleteProg');
    btnEliminar.onclick = () => ejecutarBorrado(id);
    
    new bootstrap.Modal(document.getElementById('modalConfirmDeleteProg')).show();
}

async function ejecutarBorrado(id) {
    const modalInst = bootstrap.Modal.getInstance(document.getElementById('modalConfirmDeleteProg'));
    if(modalInst) modalInst.hide();

    mostrarModal(`<div class="spinner-border text-danger me-2"></div> Anulando programación...`, "info");

    try {
        const res = await ApiService.fetchAutenticado(`/programaciones/eliminar/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            mostrarModal(`<strong>Anulación Exitosa</strong><br>La programación fue eliminada.`, "success");
            await cargarPendientes();
        } else {
            throw new Error(await res.text());
        }
    } catch (error) {
        mostrarModal(`Error al eliminar: ${error.message}`, "error");
    }
}