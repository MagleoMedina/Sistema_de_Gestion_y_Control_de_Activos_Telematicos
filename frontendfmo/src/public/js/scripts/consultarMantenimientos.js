let mantenimientosAgrupados = {}; 
let programadosAgrupados = {}; // NUEVO: Para guardar los mantenimientos pendientes
let dataCruda = []; 

async function getBackendUrl() {
    if (typeof BASE_URL !== 'undefined' && BASE_URL) return BASE_URL;
    const res = await fetch('/config/backend-url');
    const data = await res.json();
    window.BASE_URL = data.BACKEND_URL;
    return data.BACKEND_URL;
}

// ==========================================
// FUNCIÓN PARA VERIFICAR SI ES ADMIN
// ==========================================
function esAdmin() {
    // Si tienes el método en ApiService, lo usamos
    if (typeof ApiService !== 'undefined' && typeof ApiService.obtenerRol === 'function') {
        const rol = ApiService.obtenerRol();
        return rol === 'ADMIN' || rol === 'ROLE_ADMIN';
    }
    // Si no, decodificamos el JWT manualmente
    const token = sessionStorage.getItem('jwt_token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Buscamos la palabra ADMIN en los claims más comunes de Spring Security
            const roles = payload.rol || payload.role || payload.authorities || "";
            return JSON.stringify(roles).toUpperCase().includes('ADMIN');
        } catch (e) { return false; }
    }
    return false;
}

document.addEventListener('DOMContentLoaded', async () => {
    const anioActual = new Date().getFullYear();
    const selector = document.getElementById('anioSelector');
    for (let i = anioActual + 1; i >= 2023; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === anioActual) option.selected = true;
        selector.appendChild(option);
    }

    selector.addEventListener('change', (e) => {
        generarCalendarioUI(parseInt(e.target.value));
    });

    await descargarMantenimientos();
    generarCalendarioUI(anioActual);
});

// ==========================================
// DESCARGAR Y AGRUPAR DATOS (HISTORIAL + PENDIENTES)
// ==========================================
async function descargarMantenimientos() {
    // mostrarModal(`<div class="spinner-border text-danger me-2"></div> Cargando datos del calendario...`, "info");
    
    try {
        const token = sessionStorage.getItem('jwt_token');
        const BACKEND_URL = await getBackendUrl();
        
        // 1. Descargar Historial (Completados)
        const resHistorial = await fetch(`${BACKEND_URL}/mantenimientos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resHistorial.ok) {
            dataCruda = await resHistorial.json();
            mantenimientosAgrupados = {};
            dataCruda.forEach(mant => {
                if (!mantenimientosAgrupados[mant.fecha]) {
                    mantenimientosAgrupados[mant.fecha] = [];
                }
                mantenimientosAgrupados[mant.fecha].push(mant);
            });
        } else if (resHistorial.status === 404) {
            mantenimientosAgrupados = {};
        }

        // 2. Descargar Programaciones (Pendientes)
        const resProg = await fetch(`${BACKEND_URL}/programaciones/pendientes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resProg.ok) {
            const dataProg = await resProg.json();
            programadosAgrupados = {};
            dataProg.forEach(prog => {
                if (!programadosAgrupados[prog.fechaProgramada]) {
                    programadosAgrupados[prog.fechaProgramada] = [];
                }
                programadosAgrupados[prog.fechaProgramada].push(prog);
            });
        }
            
        // Cerrar modal si estaba abierto
        const modalActual = bootstrap.Modal.getInstance(document.getElementById('fmoModalSystem'));
        if(modalActual) modalActual.hide();
            
    } catch (error) {
        console.error(error);
        mostrarModal("Ocurrió un error al descargar los datos del calendario.", "error");
    }
}

// ==========================================
// GENERADOR DEL CALENDARIO HTML
// ==========================================
function generarCalendarioUI(anio) {
    const contenedor = document.getElementById('calendarioAnual');
    contenedor.innerHTML = ''; 

    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    for (let mes = 0; mes < 12; mes++) {
        const mesCard = document.createElement('div');
        mesCard.className = 'mes-card';

        const titulo = document.createElement('div');
        titulo.className = 'mes-titulo';
        titulo.textContent = nombresMeses[mes];
        mesCard.appendChild(titulo);

        const headerDias = document.createElement('div');
        headerDias.className = 'dias-semana';
        ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].forEach(d => {
            const span = document.createElement('span');
            span.textContent = d;
            headerDias.appendChild(span);
        });
        mesCard.appendChild(headerDias);

        const diasGrid = document.createElement('div');
        diasGrid.className = 'dias-grid';

        const primerDiaSemana = new Date(anio, mes, 1).getDay(); 
        const totalDiasMes = new Date(anio, mes + 1, 0).getDate();

        for (let i = 0; i < primerDiaSemana; i++) {
            const vacio = document.createElement('div');
            vacio.className = 'dia-celda dia-vacio';
            diasGrid.appendChild(vacio);
        }

        for (let dia = 1; dia <= totalDiasMes; dia++) {
            const celda = document.createElement('div');
            celda.className = 'dia-celda fw-semibold';
            celda.textContent = dia;

            const mesFormat = String(mes + 1).padStart(2, '0');
            const diaFormat = String(dia).padStart(2, '0');
            const fechaString = `${anio}-${mesFormat}-${diaFormat}`;

            // Lógica de colores: Naranja si hay completados, Azul si solo hay pendientes
            if (mantenimientosAgrupados[fechaString]) {
                celda.classList.add('dia-mantenimiento'); 
            } else if (programadosAgrupados[fechaString]) {
                celda.classList.add('dia-programado'); 
            }

            celda.onclick = () => manejarClicDia(fechaString, `${dia} de ${nombresMeses[mes]} de ${anio}`);
            diasGrid.appendChild(celda);
        }

        mesCard.appendChild(diasGrid);
        contenedor.appendChild(mesCard);
    }
}

// ==========================================
// REDIRECCIÓN A REGISTRO
// ==========================================
function irARegistrar(idProgramacion, gerencia) {
    // Redirige a la vista de registro llevando el ID y la Gerencia en la URL
    window.location.href = `/registro-mantenimiento?progId=${idProgramacion}&gerencia=${encodeURIComponent(gerencia)}`;
}

// ==========================================
// INTERACTIVIDAD Y AGRUPACIÓN POR LOTE
// ==========================================
function manejarClicDia(fechaDb, fechaLegible) {
    const completados = mantenimientosAgrupados[fechaDb] || [];
    const pendientes = programadosAgrupados[fechaDb] || [];

    if (completados.length === 0 && pendientes.length === 0) {
        return mostrarModal(`No hay eventos registrados el <b>${fechaLegible}</b>.`, "warning");
    }

    document.getElementById('tituloDiaModal').textContent = fechaLegible;
    const contenedorLotes = document.getElementById('contenedorLotesDia');
    contenedorLotes.innerHTML = ''; 

    // 1. RENDERIZAR PENDIENTES (Tarjetas Azules)
    if (pendientes.length > 0) {
        pendientes.forEach(prog => {
            contenedorLotes.innerHTML += `
                <div class="card mb-4 border-0 shadow-sm rounded-4 overflow-hidden" style="border-left: 5px solid #0d6efd !important;">
                    <div class="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center bg-light">
                        <div class="mb-3 mb-md-0">
                            <h5 class="fw-bold m-0 text-primary"><i class="bi bi-clock-history me-2"></i>Mantenimiento Programado</h5>
                            <h6 class="text-dark fw-bold mt-1 mb-0">${prog.gerencia}</h6>
                            <small class="text-muted"><i class="bi bi-person me-1"></i>Analista Asignado: ${prog.analistaResponsable}</small>
                        </div>
                        <button class="btn btn-primary rounded-pill px-4 shadow-sm fw-bold" onclick="irARegistrar(${prog.id}, '${prog.gerencia}')">
                            <i class="bi bi-play-circle-fill me-2"></i> Ejecutar Mantenimiento
                        </button>
                    </div>
                </div>
            `;
        });
    }

    // 2. RENDERIZAR COMPLETADOS (Tarjetas Originales)
    if (completados.length > 0) {
        const lotesPorId = {};
        completados.forEach(mant => {
            if (!lotesPorId[mant.id]) {
                lotesPorId[mant.id] = {
                    id: mant.id,
                    gerencia: mant.gerencia,
                    analista: mant.analista,
                    fotos: mant.fotos || [], 
                    equipos: []
                };
            }
            lotesPorId[mant.id].equipos.push(mant);
        });

        // Verificamos si el usuario es ADMIN una sola vez
        const elUsuarioEsAdmin = esAdmin();

        Object.values(lotesPorId).forEach((lote, indexLote) => {
            
            const jsonLoteParaFotos = encodeURIComponent(JSON.stringify({ fotos: lote.fotos }));
            const tieneFotos = lote.fotos && lote.fotos.length > 0;
            
            const btnFotosLote = tieneFotos 
                ? `<button class="btn btn-sm btn-danger px-3 rounded-pill shadow-sm" onclick="abrirGaleria('${jsonLoteParaFotos}')" title="Ver Fotos"><i class="bi bi-images me-1"></i>Ver ${lote.fotos.length} Fotos</button>`
                : `<span class="badge bg-secondary rounded-pill px-3 py-2"><i class="bi bi-camera-video-off me-1"></i>Sin fotos</span>`;

            // BOTÓN: EXPORTAR LOTE INDIVIDUAL
            const btnExportarLote = `<button class="btn btn-sm btn-outline-success px-3 rounded-pill shadow-sm ms-2" onclick="exportarLoteCSV(${lote.id})" title="Exportar este lote a Excel"><i class="bi bi-filetype-csv me-1"></i>CSV</button>`;
                
            // Si es ADMIN, creamos el botón de eliminar apuntando al ID del Lote
            const btnEliminarLote = elUsuarioEsAdmin 
                ? `<button class="btn btn-sm btn-outline-danger px-3 rounded-pill shadow-sm ms-2" onclick="borrarMantenimiento(${lote.id})" title="Eliminar Lote Completo y sus fotos"><i class="bi bi-trash-fill"></i></button>`
                : '';

            let filasHtml = '';

            lote.equipos.forEach((mant, indexEquipo) => {
                const jsonMant = encodeURIComponent(JSON.stringify(mant));
                filasHtml += `
                    <tr>
                        <td class="text-center fw-bold text-muted">${indexEquipo + 1}</td>
                        <td>
                            <div class="fw-bold text-dark">${mant.nombreUsuario || 'N/A'}</div>
                            <small class="text-muted">Ficha: ${mant.ficha || 'S/N'}</small>
                        </td>
                        <td><span class="badge bg-light text-dark border">${mant.departamento || 'N/A'}</span></td>
                        <td>
                            <div class="text-primary fw-bold">${mant.fmo || 'S/N'}</div>
                            <small class="text-muted">${mant.tipoDispositivo || 'N/A'} - ${mant.marca || ''}</small>
                        </td>
                        <td><span class="text-truncate d-inline-block text-muted" style="max-width: 250px;" title="${mant.observaciones || ''}">${mant.observaciones || 'Sin observaciones'}</span></td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-danger" onclick="abrirDetalles('${jsonMant}')" title="Ver Detalles">
                                <i class="bi bi-eye-fill"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            const loteHtml = `
                <div class="card mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="card-header bg-white border-bottom-0 pt-3 pb-2">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                            <div class="mb-2 mb-md-0">
                                <h5 class="fw-bold m-0" style="color: var(--fmo-red-dark);"><i class="bi bi-building me-2"></i>${lote.gerencia}</h5>
                                <small class="text-muted fw-semibold">
                                    <i class="bi bi-person-badge me-1"></i>Analista: ${lote.analista} 
                                    <span class="mx-2">|</span> 
                                    <i class="bi bi-pc-display me-1"></i>Equipos: ${lote.equipos.length}
                                </small>
                            </div>
                            <div>
                                ${btnFotosLote}
                                ${btnExportarLote}
                                ${btnEliminarLote}
                            </div>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-custom align-middle mb-0 table-hover bg-white border-top">
                                <thead class="bg-light text-muted" style="font-size: 0.85rem;">
                                    <tr>
                                        <th class="text-center bg-light text-secondary" width="5%">#</th>
                                        <th class="bg-light text-secondary" width="20%">Usuario</th>
                                        <th class="bg-light text-secondary" width="15%">Departamento</th>
                                        <th class="bg-light text-secondary" width="20%">Equipo</th>
                                        <th class="bg-light text-secondary" width="30%">Observaciones</th>
                                        <th class="text-center bg-light text-secondary" width="10%">Detalle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filasHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            contenedorLotes.innerHTML += loteHtml;
        });
    }

    new bootstrap.Modal(document.getElementById('modalListaDia')).show();
}

// ==========================================
// FUNCIÓN PARA ELIMINAR (SOLO ADMIN)
// ==========================================
function borrarMantenimiento(idMantenimiento) {
    let modalExistente = document.getElementById('modalConfirmacionDelete');
    if (modalExistente) modalExistente.remove();

    const modalHtml = `
        <div class="modal fade" id="modalConfirmacionDelete" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title fw-bold"><i class="bi bi-exclamation-triangle-fill me-2"></i>Confirmar Eliminación</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4 text-center bg-light">
                        <i class="bi bi-trash3-fill text-danger mb-3 d-block" style="font-size: 4rem;"></i>
                        <h5 class="fw-bold">¿Está completamente seguro?</h5>
                        <p class="text-muted">Se eliminará este lote de mantenimiento junto con <b>todas sus fotografías</b>.<br>Esta acción no se puede deshacer.</p>
                    </div>
                    <div class="modal-footer justify-content-center border-0 pb-4 bg-light">
                        <button type="button" class="btn btn-secondary px-4 rounded-pill shadow-sm" data-bs-dismiss="modal">Cancelar</button>
                        
                        <button type="button" class="btn btn-danger px-4 rounded-pill shadow-sm" onclick="ejecutarBorradoDefinitivo(${idMantenimiento})">
                            <i class="bi bi-trash-fill me-1"></i> Sí, Eliminar Lote
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmacionDelete'));
    modal.show();
}

// ==========================================
// EJECUCIÓN DEL BORRADO (DESPUÉS DE CONFIRMAR)
// ==========================================
async function ejecutarBorradoDefinitivo(idMantenimiento) {
    const modalConfirmacion = bootstrap.Modal.getInstance(document.getElementById('modalConfirmacionDelete'));
    if (modalConfirmacion) modalConfirmacion.hide();

    try {
        const token = sessionStorage.getItem('jwt_token');
        const BACKEND_URL = await getBackendUrl();
        
        const res = await fetch(`${BACKEND_URL}/mantenimientos/eliminar/${idMantenimiento}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const modalDiaInst = bootstrap.Modal.getInstance(document.getElementById('modalListaDia'));
            if(modalDiaInst) modalDiaInst.hide();

            mostrarModal("Mantenimiento y fotografías eliminados exitosamente.", "success");
            
            await descargarMantenimientos(); 
            generarCalendarioUI(parseInt(document.getElementById('anioSelector').value));
        } else {
            const errorText = await res.text();
            throw new Error(errorText || "No se pudo eliminar el registro");
        }
    } catch (error) {
        mostrarModal(`Error al eliminar: ${error.message}`, "error");
    }
}

// ==========================================
// MODALES HIJOS (DETALLES Y GALERÍA)
// ==========================================
function abrirDetalles(jsonEncoded) {
    try {
        const mant = JSON.parse(decodeURIComponent(jsonEncoded));
        
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

        const modalDiaEl = document.getElementById('modalListaDia');
        const modalDiaInst = bootstrap.Modal.getInstance(modalDiaEl);
        if(modalDiaInst) modalDiaInst.hide();

        const modalDetalles = new bootstrap.Modal(document.getElementById('modalDetalles'));
        modalDetalles.show();

        document.getElementById('modalDetalles').addEventListener('hidden.bs.modal', function onHide() {
            modalDiaInst.show();
            document.getElementById('modalDetalles').removeEventListener('hidden.bs.modal', onHide);
        });

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
            const urlFoto = `${BACKEND_URL}/mantenimientos/fotos/${nombreArchivo}`;
            const img = document.createElement('img');
            img.src = urlFoto;
            img.className = 'foto-galeria';
            img.title = "Clic para abrir en nueva pestaña";
            img.onclick = () => window.open(urlFoto, '_blank');
            contenedor.appendChild(img);
        });

        const modalDiaEl = document.getElementById('modalListaDia');
        const modalDiaInst = bootstrap.Modal.getInstance(modalDiaEl);
        if(modalDiaInst) modalDiaInst.hide();

        const modalGaleria = new bootstrap.Modal(document.getElementById('modalGaleria'));
        modalGaleria.show();

        document.getElementById('modalGaleria').addEventListener('hidden.bs.modal', function onHide() {
            modalDiaInst.show();
            document.getElementById('modalGaleria').removeEventListener('hidden.bs.modal', onHide);
        });

    } catch (e) {
        console.error("Error al cargar fotos:", e);
    }
}

// ==========================================
// EXPORTAR A CSV (MEDIANTE EL BACKEND)
// ==========================================
async function exportarCSV() {
    if (!dataCruda || dataCruda.length === 0) {
        return mostrarModal("No hay datos disponibles para exportar.", "warning");
    }

    const anioSeleccionado = document.getElementById('anioSelector').value;
    const dataAExportar = dataCruda.filter(mant => mant.fecha.startsWith(anioSeleccionado));

    if (dataAExportar.length === 0) {
        return mostrarModal(`No se registraron mantenimientos en el año ${anioSeleccionado} para exportar.`, "warning");
    }

    mostrarModal(`<div class="spinner-border text-success me-2"></div> Generando archivo Excel (CSV)...`, "info");

    try {
        const token = sessionStorage.getItem('jwt_token');
        const BACKEND_URL = await getBackendUrl();
        
        const res = await fetch(`${BACKEND_URL}/mantenimientos/exportar/csv/resumen`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(dataAExportar)
        });

        if (res.ok) {
            const blob = await res.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Mantenimientos_FMO_${anioSeleccionado}.csv`; 
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            const modalActual = bootstrap.Modal.getInstance(document.getElementById('fmoModalSystem'));
            if(modalActual) modalActual.hide();

        } else {
            throw new Error("El servidor no pudo generar el archivo CSV.");
        }
    } catch (error) {
        console.error(error);
        mostrarModal(`Error al exportar: ${error.message}`, "error");
    }
}

// ==========================================
// EXPORTAR UN SOLO LOTE A CSV
// ==========================================
async function exportarLoteCSV(idLote) {
    const dataAExportar = dataCruda.filter(mant => mant.id === idLote);

    if (!dataAExportar || dataAExportar.length === 0) {
        return mostrarModal("No se encontraron datos para este lote.", "warning");
    }

    mostrarModal(`<div class="spinner-border text-success me-2"></div> Generando archivo Excel (CSV)...`, "info");

    try {
        const token = sessionStorage.getItem('jwt_token');
        const BACKEND_URL = await getBackendUrl();
        
        const res = await fetch(`${BACKEND_URL}/mantenimientos/exportar/csv`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(dataAExportar)
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            const nombreGerenciaLimpio = dataAExportar[0].gerencia.replace(/\s+/g, '_'); 
            const fecha = dataAExportar[0].fecha;
            a.download = `Mantenimiento_${nombreGerenciaLimpio}_${fecha}.csv`;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            const modalActual = bootstrap.Modal.getInstance(document.getElementById('fmoModalSystem'));
            if(modalActual) modalActual.hide();

        } else {
            throw new Error("El servidor no pudo generar el archivo CSV.");
        }
    } catch (error) {
        console.error(error);
        mostrarModal(`Error al exportar: ${error.message}`, "error");
    }
}