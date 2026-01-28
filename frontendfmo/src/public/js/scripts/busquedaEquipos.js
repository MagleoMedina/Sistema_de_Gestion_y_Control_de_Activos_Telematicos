// --- 1. FILTROS ---
function cambiarFiltro() {
    const filtro = document.getElementById('filtroSelect').value;
    const divTexto = document.getElementById('containerInputTexto');
    const divFecha = document.getElementById('containerInputFecha');
    const divVacio = document.getElementById('containerVacio');

    divTexto.style.display = 'none';
    divFecha.style.display = 'none';
    divVacio.style.display = 'none';

    if (filtro === 'fmo') divTexto.style.display = 'block';
    else if (filtro === 'fecha') divFecha.style.display = 'block';
    else divVacio.style.display = 'block';
}

// --- 2. BÚSQUEDA ---
async function buscarEquipos() {

    const filtro = document.getElementById('filtroSelect').value;
    let url = '/buscarReciboEquipos'; // Default: Listar Todo

    // Construir URL según filtro
    if (filtro === 'fmo') {
        const valRaw = document.getElementById('inputBusquedaFmo').value.trim();
        if (!valRaw) {
            mostrarModal("Campo Vacío", "Ingrese un FMO o Serial para buscar.", "warning");
            return;
        }

        // --- OPCIÓN RECOMENDADA: Reemplazar la barra por un guion o espacio ---
        const val = valRaw.replace(/\//g, '-'); 
        url = `/buscarReciboEquipos/${encodeURIComponent(val)}`;
    }
    else if (filtro === 'fecha') {
        const val = document.getElementById('inputBusquedaFecha').value;
        if (!val) {
            mostrarModal("Campo Vacío", "Seleccione una fecha válida.", "warning");
            return;
        }
        url = `/buscarReciboEquipos/fecha/${val}`;
    }

    const tbody = document.getElementById('tablaResultados');
    tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';

    try {
        const response = await ApiService.fetchAutenticado(url);

        if (!response) return; // Redirigió por token inválido

        if(response.status === 404) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No se encontraron registros.</td></tr>'; 
            return;
        }

        if (!response.ok) throw new Error(`Error de servidor: ${response.status}`);
        
        const data = await response.json();
        renderizarTabla(data);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Error: ${error.message}</td></tr>`;
    }
}

function renderizarTabla(data) {
    const tbody = document.getElementById('tablaResultados');
    tbody.innerHTML = '';
    const lista = Array.isArray(data) ? data : [data];
    
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No hay registros.</td></tr>';
        return;
    }

    lista.forEach((item, index) => {
        // Verificamos si ya está entregado para deshabilitar el botón visualmente
        const yaEntregado = (item.estatus || "").toUpperCase() === "LISTO";
        const btnClase = yaEntregado ? "btn-outline-secondary" : "btn-warning";
        const btnTexto = yaEntregado ? `<i class="bi bi-bookmark-check-fill text-success me-1"></i>Listo` : `<i class="bi bi-box-seam-fill me-1"></i> Estatus`;
        const btnDisabled = yaEntregado ? "disabled" : "";
        const onclickAction = yaEntregado ? "" : `onclick="abrirModalActualizar(${item.idEncabezado})"`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">${index + 1}</td>
            <td class="text-primary fw-bold">${item.fmoEquipo || "N/A"}</td>
            <td>${item.fecha || "N/A"}</td>
            <td>${item.usuarioNombre || "N/A"}</td>
            <td><span class="badge ${yaEntregado ? 'bg-success' : 'bg-secondary'}">${item.estatus || 'Pendiente'}</span></td>
            <td>
                <div class="d-flex gap-2 justify-content-center">
                    <button class="btn btn-sm btn-info text-white" onclick='abrirModalVer(${JSON.stringify(item)})' title="Ver Detalles">
                        <i class="bi bi-eye-fill me-1"></i>Ver
                    </button>
                    <button class="btn btn-sm ${btnClase}" ${onclickAction} ${btnDisabled} title="Actualizar Estatus">
                        ${btnTexto}
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 3. VISUALIZACIÓN (MODAL) ---
function abrirModalVer(data) {
    // A. Datos Generales
    setVal('modal_fecha', data.fecha);
    setVal('modal_usuario', data.usuario);
    setVal('modal_ficha', data.usuarioFicha);
    setVal('modal_nombre', data.usuarioNombre);
    setVal('modal_extension', data.extension);
    setVal('modal_gerencia', data.usuarioGerencia);
    setVal('modal_solicitudDAET', data.solicitudDAET);
    setVal('modal_solicitudST', data.solicitudST);
    setVal('modal_fmoEquipo', data.fmoEquipo);
    setVal('modal_falla', data.falla);
    setVal('modal_observacion', data.observacion);
    setVal('modal_asignadoA', data.asignadoA);
    setVal('modal_estatus', data.estatus);
    setVal('modal_entregadoPor', data.entregadoPor);
    setVal('modal_recibidoPor', data.recibidoPor);
    setVal("modal_clave", data.clave);

    // B. Datos del Equipo
    if (data.equipos && data.equipos.length > 0) {
        const equipo = data.equipos[0];
        setVal('modal_marca', equipo.marca);
        const respaldoEl = document.getElementById('modal_respaldo');
        if(respaldoEl) respaldoEl.textContent = equipo.respaldo || "NO";
        setVal('modal_observacionSeriales', equipo.observacionSeriales);

        // Listas Visuales (Tags)
        llenarTags('modal_lista_componentes', equipo.componentesGenericos, 'nombreComponente');
        llenarTags('modal_lista_perifericos', equipo.perifericos);
        llenarTags('modal_lista_apps', equipo.aplicaciones);
        llenarTags('modal_lista_carpetas', equipo.carpetas);

        // C. LLENADO DE TABLA SERIALES
        setVal('modal_marcaMadre', ''); setVal('modal_serialMadre', '');
        setVal('modal_marcaFuente', ''); setVal('modal_serialFuente', '');
        setVal('modal_marcaVideo', ''); setVal('modal_serialVideo', '');
        setVal('modal_marcaRed', ''); setVal('modal_serialRed', '');
        
        const rams = [];
        const hdds = [];

        if (equipo.componentesConSerial) {
            equipo.componentesConSerial.forEach(ser => {
                const tipo = (ser.tipoComponente || "").toUpperCase();

                if (tipo.includes("MADRE")) {
                    setVal('modal_marcaMadre', ser.marca);
                    setVal('modal_serialMadre', ser.serial);
                }
                else if (tipo.includes("FUENTE")) {
                    setVal('modal_marcaFuente', ser.marca);
                    setVal('modal_serialFuente', ser.serial);
                }
                else if (tipo.includes("VIDEO")) {
                    setVal('modal_marcaVideo', ser.marca);
                    setVal('modal_serialVideo', ser.serial);
                }
                else if (tipo.includes("RED")) {
                    setVal('modal_marcaRed', ser.marca);
                    setVal('modal_serialRed', ser.serial);
                }
                else if (tipo.includes("RAM") || tipo.includes("MEMORIA")) {
                    rams.push(ser);
                }
                else if (tipo.includes("DISCO") || tipo.includes("DURO")) {
                    hdds.push(ser);
                }
            });
        }

        renderSerialRows('container_ram_seriales', rams, 4);
        renderSerialRows('container_hdd_seriales', hdds, 2);
    }

    const modalEl = document.getElementById('modalVerEquipo');
    // Reutilizar instancia o crear nueva
    let myModal = bootstrap.Modal.getInstance(modalEl);
    if (!myModal) myModal = new bootstrap.Modal(modalEl);
    myModal.show();
}

// Helpers
function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
}

function llenarTags(containerId, dataArray, keyName = null) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    
    if (!dataArray || dataArray.length === 0) {
        container.innerHTML = '<span class="text-muted small">Ninguno</span>';
        return;
    }
    dataArray.forEach(item => {
        let texto = keyName ? item[keyName] : item;
        if (keyName === 'nombreComponente' && item.cantidad) {
            const nombreUpper = String(texto).toUpperCase();
            if (nombreUpper.includes("RAM") || nombreUpper.includes("MEMORIA")) {
                texto = `${texto} (${item.cantidad})`;
            }
        }
        const span = document.createElement('span');
        span.className = 'tag-badge';
        span.textContent = texto;
        container.appendChild(span);
    });
}

function renderSerialRows(containerId, dataList, minRows = 1) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';

    dataList.forEach(item => {
        const div = document.createElement('div');
        div.className = 'row row-compact';
        div.innerHTML = `
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" value="${item.marca || ''}" readonly></div>
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" value="${item.serial || ''}" readonly></div>
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" value="${item.capacidad || ''}" readonly></div>
        `;
        container.appendChild(div);
    });

    const filasRestantes = minRows - dataList.length;
    for (let i = 0; i < filasRestantes; i++) {
        const div = document.createElement('div');
        div.className = 'row row-compact';
        div.innerHTML = `
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" readonly></div>
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" readonly></div>
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" readonly></div>
        `;
        container.appendChild(div);
    }
}


// --- 4. ACTUALIZAR ESTATUS (CORREGIDO) ---
let idParaActualizar = null;

function abrirModalActualizar(idEncabezado) {
    idParaActualizar = idEncabezado;
    const modalEl = document.getElementById('modalActualizarEstatus');
    
    // IMPORTANTE: Verificar si ya existe instancia para no duplicar listeners/backdrop
    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) {
        modal = new bootstrap.Modal(modalEl);
    }
    modal.show();
}

async function confirmarActualizacion() {
    if (!idParaActualizar) return;

    const url = `/reciboDeEquipos/${idParaActualizar}/estatus`;
    const payload = { estatus: "Listo" };

    // Referencia al modal para cerrarlo
    const modalEl = document.getElementById('modalActualizarEstatus');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);

    try {
        const res = await ApiService.fetchAutenticado(url, {
            method: 'PATCH',
            body: JSON.stringify(payload)
        });
        
        // 1. CERRAR EL MODAL PRIMERO
        if (modalInstance) modalInstance.hide();

        if (!res) return;

        if (res.ok) {
            // 2. MOSTRAR NOTIFICACIÓN DESPUÉS DE CERRAR EL MODAL
            // Usamos un pequeño timeout para asegurar que la animación del modal termine
            setTimeout(() => {
                mostrarModal(`
                    <strong>¡Estatus Actualizado!</strong><br>
                    El equipo ahora está marcado como <b>LISTO</b>.
                `, 'success');
                buscarEquipos(); 
            }, 300);
        } else {
            setTimeout(() => {
                mostrarModal("Error", "No se pudo actualizar el estatus.", "error");
            }, 300);
        }
    } catch (error) {
        console.error(error);
        
        if (modalInstance) modalInstance.hide();

        setTimeout(() => {
            mostrarModal("Error de Conexión", "No se pudo conectar con el servidor.", "error");
        }, 300);
    } finally {
        idParaActualizar = null;
    }
}