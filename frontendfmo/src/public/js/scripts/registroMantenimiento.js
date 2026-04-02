let fotosLote = []; 
let estructuraGlobal = []; 
let catalogoEquipos = []; // <--- NUEVO: Almacenará Marcas y Modelos

async function getBackendUrl() {
    if (typeof BASE_URL !== 'undefined' && BASE_URL) return BASE_URL;
    const res = await fetch('/config/backend-url');
    const data = await res.json();
    window.BASE_URL = data.BACKEND_URL;
    return data.BACKEND_URL;
}

document.addEventListener('DOMContentLoaded', async () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('globalFecha').value = today;

    let nombreAnalista = "Analista FMO";
    if (typeof ApiService !== 'undefined') {
        if (typeof ApiService.obtenerUsuario === 'function') {
            nombreAnalista = ApiService.obtenerUsuario();
        } else {
            const token = sessionStorage.getItem('jwt_token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    nombreAnalista = payload.sub || payload.username || "Analista FMO";
                } catch (e) { console.error("Error leyendo token", e); }
            }
        }
    }
    document.getElementById('globalAnalista').value = nombreAnalista;

    // Cargar estructuras de base de datos
    await cargarEstructura();
    await cargarCatalogoEquipos(); // <--- NUEVO: Carga las marcas

    const selectGerencia = document.getElementById('globalGerencia');
    if (selectGerencia) {
        selectGerencia.addEventListener('change', (e) => {
            actualizarDatalistDepartamentos(e.target.value);
        });
    }
    
    agregarFila();

   // 1. ATRAPAMOS LOS PARÁMETROS DE LA URL
    const urlParams = new URLSearchParams(window.location.search);
    const progId = urlParams.get('progId');
    const gerenciaUrl = urlParams.get('gerencia');
    const fechaUrl = urlParams.get('fecha');
    const analistaUrl = urlParams.get('analista');

    // 2. SI EXISTE UN PROGRAMADO VÁLIDO, AUTOCOMPLETAMOS Y BLOQUEAMOS
    // Verificamos que el ID no sea nulo ni la palabra "undefined"
    if (progId && progId !== 'undefined' && progId !== 'null') {
        
        window.idProgramacionActiva = progId; 
        
        setTimeout(() => {
            const selectGerencia = document.getElementById('globalGerencia');
            if (selectGerencia && gerenciaUrl && gerenciaUrl !== 'undefined') {
                selectGerencia.value = gerenciaUrl;
                selectGerencia.disabled = true; 
                selectGerencia.dispatchEvent(new Event('change')); 
            }

            const inputFecha = document.getElementById('globalFecha');
            // Solo lo asignamos si trae una fecha válida, si no, dejará la fecha de hoy por defecto
            if (inputFecha && fechaUrl && fechaUrl !== 'undefined' && fechaUrl !== 'null') {
                inputFecha.value = fechaUrl;
                inputFecha.disabled = true; 
            }

            const inputAnalista = document.getElementById('globalAnalista');
            // Solo lo asignamos si trae un nombre válido
            if (inputAnalista && analistaUrl && analistaUrl !== 'undefined' && analistaUrl !== 'null') {
                inputAnalista.value = analistaUrl;
                inputAnalista.readOnly = true; 
            }
            
            mostrarModal("Modo de Ejecución Programada activado. Los datos de cabecera han sido bloqueados.", "info");
        }, 500); 
    }
});

// ==========================================
// CARGAR ESTRUCTURA Y CATÁLOGOS
// ==========================================
async function cargarEstructura() {
    try {
        const token = sessionStorage.getItem('jwt_token');
        const BACKEND_URL = await getBackendUrl();
        const res = await fetch(`${BACKEND_URL}/estructura/gerencias`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            estructuraGlobal = await res.json();
            const selectG = document.getElementById('globalGerencia');
            selectG.innerHTML = '<option value="" disabled selected>Seleccione una Gerencia...</option>';
            estructuraGlobal.forEach(g => {
                const option = document.createElement('option');
                option.value = g.nombre;
                option.textContent = g.nombre;
                selectG.appendChild(option);
            });
        }
    } catch (error) { console.error("Error cargando gerencias:", error); }
}

async function cargarCatalogoEquipos() {
    try {
        const token = sessionStorage.getItem('jwt_token');
        const BACKEND_URL = await getBackendUrl();
        const res = await fetch(`${BACKEND_URL}/catalogo/equipos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            catalogoEquipos = await res.json();
        }
    } catch (error) { console.error("Error cargando equipos:", error); }
}

function actualizarDatalistDepartamentos(nombreGerencia) {
    const datalistD = document.getElementById('listaDepartamentos');
    datalistD.innerHTML = ''; 
    if(!nombreGerencia) return;
    const gerenciaFiltro = estructuraGlobal.find(g => g.nombre.toLowerCase() === nombreGerencia.toLowerCase());
    if (gerenciaFiltro && gerenciaFiltro.departamentos) {
        gerenciaFiltro.departamentos.forEach(d => {
            const option = document.createElement('option');
            option.value = d.nombre;
            datalistD.appendChild(option);
        });
    }
}

// ==========================================
// PREVISUALIZADOR DE FOTOS
// ==========================================
function mostrarMiniaturas(input) {
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => { fotosLote.push(file); });
        input.value = ''; 
        renderizarMiniaturas();
    }
}

function renderizarMiniaturas() {
    const container = document.getElementById('previewContainer');
    container.innerHTML = ''; 
    fotosLote.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const wrapper = document.createElement('div');
            wrapper.className = 'img-preview-wrapper';
            const img = document.createElement('img');
            img.src = e.target.result;
            img.title = file.name;

            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0';
            btnEliminar.style = 'width: 22px; height: 22px; line-height: 1; border-radius: 50%; font-weight: bold; font-size: 12px; z-index: 10;';
            btnEliminar.innerHTML = '&times;';
            btnEliminar.onclick = (event) => {
                event.stopPropagation();
                eliminarFotoDeLote(index);
            };

            wrapper.appendChild(img);
            wrapper.appendChild(btnEliminar);
            container.appendChild(wrapper);
        }
        reader.readAsDataURL(file);
    });
}

function eliminarFotoDeLote(index) {
    fotosLote.splice(index, 1); 
    renderizarMiniaturas();     
}

// ==========================================
// GESTIÓN DE FILAS (TABLA DINÁMICA)
// ==========================================
function agregarFila() {
    const tbody = document.getElementById('tablaLote');
    const tr = document.createElement('tr');
    tr.className = 'fila-mantenimiento';

    // Generamos un ID único para la fila actual (Ej: 16954201)
    const rowId = Date.now() + Math.floor(Math.random() * 1000);

    tr.innerHTML = `
        <td class="col-num row-number text-muted">1</td>
        <td class="col-ficha"><input type="number" class="in-ficha" placeholder="Ej: 9900" required></td>
        <td class="col-usuario"><input type="text" class="in-usuario" placeholder="Nombre" required></td>
        <td class="col-depto"><input type="text" class="in-depto" list="listaDepartamentos" placeholder="Depto." required></td>
        <td class="col-fmo"><input type="text" class="in-fmo" placeholder="FMO / Serial" required></td>
        <td class="col-tipo">
            <select class="in-tipo">
                <option value="CPU">CPU</option>
                <option value="Impresora">Impresora</option>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Otro">Otro</option>
            </select>
        </td>
        <td class="col-marca">
            <input type="text" class="in-marca" list="marcas-${rowId}" placeholder="Marca" autocomplete="off" required>
            <datalist id="marcas-${rowId}"></datalist>
        </td>
        <td class="col-modelo">
            <input type="text" class="in-modelo" list="modelos-${rowId}" placeholder="Modelo" autocomplete="off" required>
            <datalist id="modelos-${rowId}"></datalist>
        </td>
        <td class="col-so"><input type="text" class="in-so" placeholder="Ej: Win 10"></td>
        <td class="col-obs"><input type="text" class="in-obs" placeholder="Observaciones..."></td>
        <td class="col-accion">
            <button class="btn btn-sm btn-link text-danger w-100 h-100" onclick="eliminarFila(this)" title="Eliminar Fila">
                <i class="bi bi-x-circle-fill"></i>
            </button>
        </td>
    `;

    tbody.appendChild(tr);
    actualizarNumeros();

    // --- CASCADA: MARCA A MODELO ---
    const inputMarca = tr.querySelector('.in-marca');
    const datalistMarca = tr.querySelector(`#marcas-${rowId}`);
    const datalistModelo = tr.querySelector(`#modelos-${rowId}`);

    // 1. Poblamos la lista de Marcas de esta fila
    catalogoEquipos.forEach(marca => {
        const option = document.createElement('option');
        option.value = marca.nombre;
        datalistMarca.appendChild(option);
    });

    // 2. Al escribir/seleccionar una marca, poblamos sus modelos
    inputMarca.addEventListener('input', (e) => {
        const marcaSeleccionada = e.target.value.trim().toLowerCase();
        datalistModelo.innerHTML = ''; // Limpiamos opciones previas

        const marcaEncontrada = catalogoEquipos.find(m => m.nombre.toLowerCase() === marcaSeleccionada);
        
        if (marcaEncontrada && marcaEncontrada.modelos) {
            marcaEncontrada.modelos.forEach(mod => {
                const option = document.createElement('option');
                option.value = mod.nombre;
                datalistModelo.appendChild(option);
            });
        }
    });

    // --- AUTOCOMPLETADO DE USUARIO POR FICHA ---
    const inputFicha = tr.querySelector('.in-ficha');
    const inputUsuario = tr.querySelector('.in-usuario');

    inputFicha.addEventListener('blur', async (e) => {
        const fichaVal = e.target.value.trim();
        if (!fichaVal) return;
        try {
            const token = sessionStorage.getItem('jwt_token');
            const BACKEND_URL = await getBackendUrl();
            const res = await fetch(`${BACKEND_URL}/stock/usuario/${fichaVal}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const usuarioDB = await res.json();
                if (usuarioDB && usuarioDB.nombre) {
                    inputUsuario.value = usuarioDB.nombre;
                    inputUsuario.style.backgroundColor = '#e8f5e9'; 
                    setTimeout(() => inputUsuario.style.backgroundColor = 'transparent', 1500);
                }
            }
        } catch (error) {
            console.log("Ficha no encontrada.");
        }
    });
}

function eliminarFila(btn) {
    const tr = btn.closest('tr');
    const tbody = document.getElementById('tablaLote');
    if (tbody.children.length > 1) {
        tr.remove();
        actualizarNumeros();
    } else {
        mostrarModal("No puedes eliminar la última fila. Si deseas, solo limpia sus datos.", "warning");
    }
}

function actualizarNumeros() {
    const filas = document.querySelectorAll('#tablaLote .fila-mantenimiento');
    filas.forEach((fila, index) => {
        fila.querySelector('.row-number').textContent = index + 1;
    });
}
// ==========================================
// GUARDAR PLANILLA (UN SOLO LOTE)
// ==========================================
async function procesarLote() {
    const gerencia = document.getElementById('globalGerencia').value;
    const fecha = document.getElementById('globalFecha').value;
    const analista = document.getElementById('globalAnalista').value;

    if (!gerencia) return mostrarModal("Debe especificar la Gerencia en la cabecera.", "warning");

    const filas = document.querySelectorAll('#tablaLote .fila-mantenimiento');
    
    // 1. Armamos el objeto principal con la cabecera
    const datosLote = {
        idProgramacion: window.idProgramacionActiva ? parseInt(window.idProgramacionActiva) : null,
        gerencia: gerencia.trim(),
        fecha: fecha,
        analista: analista,
        equipos: [] // Aquí meteremos todos los equipos
    };

    const primeraFilaFmo = filas[0].querySelector('.in-fmo').value.trim();
    if (!primeraFilaFmo) return mostrarModal("La planilla está vacía. Ingrese al menos un equipo.", "warning");

    // 2. Recorremos la tabla y llenamos el arreglo
    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        const fmo = fila.querySelector('.in-fmo').value.trim();
        const fichaStr = fila.querySelector('.in-ficha').value.trim();
        
        if (!fmo || !fichaStr) continue; 

        datosLote.equipos.push({
            ficha: parseInt(fichaStr),
            nombreUsuario: fila.querySelector('.in-usuario').value.trim(),
            departamento: fila.querySelector('.in-depto').value.trim(),
            fmo: fmo,
            tipoDispositivo: fila.querySelector('.in-tipo').value,
            marca: fila.querySelector('.in-marca').value.trim(),
            modelo: fila.querySelector('.in-modelo').value.trim(),
            so: fila.querySelector('.in-so').value.trim() || "N/A",
            observaciones: fila.querySelector('.in-obs').value.trim()
        });
    }

    if (datosLote.equipos.length === 0) return mostrarModal("No hay equipos válidos para guardar.", "warning");

    mostrarModal(`<div class="spinner-border text-danger me-2"></div> Guardando lote, por favor espere...`, "info");

    const token = sessionStorage.getItem('jwt_token');
    const BACKEND_URL = await getBackendUrl();

    // 3. Empaquetamos en el FormData
    const formData = new FormData();
    formData.append('datos', JSON.stringify(datosLote));

    if (fotosLote.length > 0) {
        for (let f = 0; f < fotosLote.length; f++) {
            formData.append('fotos', fotosLote[f]);
        }
    }

    // 4. Hacemos UNA SOLA PETICIÓN al servidor
    try {
        const res = await fetch(`${BACKEND_URL}/mantenimientos/registrar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text);
        }

        mostrarModal(`
            <strong>¡Planilla Guardada Exitosamente!</strong><br>
            El mantenimiento y sus ${datosLote.equipos.length} equipos fueron registrados.
        `, "success");

        // Limpieza final
        setTimeout(() => {
            document.getElementById('tablaLote').innerHTML = '';
            document.getElementById('inputFotos').value = '';
            document.getElementById('globalGerencia').value = ''; 
            fotosLote = []; 
            renderizarMiniaturas();
            agregarFila();
        }, 2000);

    } catch (error) {
        mostrarModal(`<strong>Error al guardar:</strong><br>${error.message}`, "error");
    }
}