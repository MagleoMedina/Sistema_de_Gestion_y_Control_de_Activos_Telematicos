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
    // CAMBIO: Usamos rutas relativas (ApiService agrega la base URL)
    let url = '/buscarReciboEquipos'; // Default: Listar Todo

    // Construir URL según filtro
    if (filtro === 'fmo') {
        const val = document.getElementById('inputBusquedaFmo').value;
        if (!val) return alert("Ingrese un FMO o Serial");
        url = `/buscarReciboEquipos/${val}`;
    }
    else if (filtro === 'fecha') {
        const val = document.getElementById('inputBusquedaFecha').value;
        if (!val) return alert("Seleccione una fecha");

        url = `/buscarReciboEquipos/fecha/${val}`;
    }

    const tbody = document.getElementById('tablaResultados');
    tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>'; // Ajustado colspan a 6

    try {
        // CAMBIO: fetchAutenticado
        const response = await ApiService.fetchAutenticado(url);

        // Si es null, es que el token falló y redirigió
        if (!response) return;

        if(response.status === 404) {
            tbody.innerHTML = '<tr><td colspan="6">No hay registros.</td></tr>'; 
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
        // Verificamos si ya está entregado para deshabilitar el botón visualmente (opcional)
        const yaEntregado = (item.estatus || "").toUpperCase() === "LISTO";
        const btnClase = yaEntregado ? "btn-outline-secondary" : "btn-warning";
        const btnTexto = yaEntregado ? "✅ Listo" : "📦 Estatus";
        const btnDisabled = yaEntregado ? "disabled" : "";

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
                        👁️ Ver
                    </button>
                    <button class="btn btn-sm ${btnClase}" 
                        onclick="abrirModalActualizar(${item.idEncabezado})" 
                        ${btnDisabled}
                        title="Actualizar Estatus">
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
    setVal('modal_usuario', data.usuarioNombre);
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
        document.getElementById('modal_respaldo').textContent = equipo.respaldo || "NO";
        setVal('modal_observacionSeriales', equipo.observacionSeriales);

        // Listas Visuales (Tags)
        llenarTags('modal_lista_componentes', equipo.componentesGenericos, 'nombreComponente');
        llenarTags('modal_lista_perifericos', equipo.perifericos);
        llenarTags('modal_lista_apps', equipo.aplicaciones);
        llenarTags('modal_lista_carpetas', equipo.carpetas);

        // ============================================
        // C. LLENADO DE TABLA SERIALES
        // ============================================

        // Limpiar campos únicos primero
        setVal('modal_marcaMadre', '');
        setVal('modal_serialMadre', '');
        setVal('modal_marcaFuente', ''); setVal('modal_serialFuente', '');
        setVal('modal_marcaVideo', ''); setVal('modal_serialVideo', '');
        setVal('modal_marcaRed', ''); setVal('modal_serialRed', '');
        // Arrays temporales para RAM y HDD
        const rams = [];
        const hdds = [];

        if (equipo.componentesConSerial) {
            equipo.componentesConSerial.forEach(ser => {
                const tipo = (ser.tipoComponente || "").toUpperCase();

                // 1. Campos Únicos
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
                // 2. Acumular RAMs
                else if (tipo.includes("RAM") || tipo.includes("MEMORIA")) {
                    rams.push(ser);
                }
                // 3. Acumular Discos
                else if (tipo.includes("DISCO") || tipo.includes("DURO")) {
                    hdds.push(ser);
                }
            });
        }

        // Renderizar RAMs
        renderSerialRows('container_ram_seriales', rams, 4);
        // Renderizar HDDs
        renderSerialRows('container_hdd_seriales', hdds, 2);
    }

    const myModal = new bootstrap.Modal(document.getElementById('modalVerEquipo'));
    myModal.show();
}

// Helpers
function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
}

function llenarTags(containerId, dataArray, keyName = null) {
    const container = document.getElementById(containerId);
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

// Función para dibujar filas de seriales (RAM/HDD)
function renderSerialRows(containerId, dataList, minRows = 1) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Dibujar datos existentes
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

    // Rellenar filas vacías si hay pocas (para mantener estética de la hoja)
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

// --- HELPER PARA MOSTRAR NOTIFICACIONES ---
function mostrarNotificacion(titulo, mensaje, tipo) {
    const modalEl = document.getElementById('modalNotificacion');
    const header = document.getElementById('headerNotificacion');
    const tituloEl = document.getElementById('tituloNotificacion');
    const msgEl = document.getElementById('mensajeNotificacion');
    
    // 1. Configurar textos
    tituloEl.innerText = titulo;
    msgEl.innerText = mensaje;

    // 2. Configurar estilos según tipo
    // Reseteamos clases base
    header.className = 'modal-header text-white'; 
    
    if (tipo === 'exito') {
        header.classList.add('bg-success');
    } else if (tipo === 'error') {
        header.classList.add('bg-danger');
    } else {
        header.classList.add('bg-primary');
    }

    // 3. Mostrar
    new bootstrap.Modal(modalEl).show();
}

// --- 4. ACTUALIZAR ESTATUS (Modificado) ---

let idParaActualizar = null;

function abrirModalActualizar(idEncabezado) {
    idParaActualizar = idEncabezado;
    const modal = new bootstrap.Modal(document.getElementById('modalActualizarEstatus'));
    modal.show();
}

async function confirmarActualizacion() {
    if (!idParaActualizar) return;

    // CAMBIO: URL relativa
    const url = `/reciboDeEquipos/${idParaActualizar}/estatus`;
    const payload = { estatus: "Listo" };

    try {
        // CAMBIO: fetchAutenticado
        const res = await ApiService.fetchAutenticado(url, {
            method: 'PATCH',
            body: JSON.stringify(payload)
        });
        
        // Primero cerramos el modal de confirmación
        const modalConfirmEl = document.getElementById('modalActualizarEstatus');
        if (modalConfirmEl) {
            const modalConfirm = bootstrap.Modal.getInstance(modalConfirmEl);
            if (modalConfirm) modalConfirm.hide();
        }

        // Si res es null, fue token inválido y ya redirigió
        if (!res) return;

        if (res.ok) {
            mostrarNotificacion("¡Operación Exitosa!", "El estatus del equipo ha sido actualizado a LISTO.", "exito");
            
            // Recargar tabla
            buscarEquipos(); 
        } else {
            mostrarNotificacion("Error", "No se pudo actualizar el estatus. Intente nuevamente.", "error");
        }
    } catch (error) {
        console.error(error);
        
        // Cerrar modal de confirmación si sigue abierto por error de red
        const modalConfirmEl = document.getElementById('modalActualizarEstatus');
        if (modalConfirmEl) {
            const modalConfirm = bootstrap.Modal.getInstance(modalConfirmEl);
            if (modalConfirm) modalConfirm.hide();
        }

        mostrarNotificacion("Error de Conexión", "No se pudo conectar con el servidor.", "error");
    } finally {
        idParaActualizar = null;
    }
}