// =========================================================
// VARIABLES GLOBALES (TAGS)
// =========================================================
let tagsAplicaciones = [];
let tagsCarpetas = [];

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. FECHA POR DEFECTO
    const fechaInput = document.getElementById('fecha');
    if(fechaInput) fechaInput.valueAsDate = new Date();
    
    // 2. INICIALIZAR INPUTS DE TAGS (BURBUJAS)
    setupTagInput('inputOtraApp', 'tagsAppsContainer', tagsAplicaciones);
    setupTagInput('inputCarpetaRed', 'tagsCarpetasContainer', tagsCarpetas);

    // 3. NUEVO: LISTENER PARA AUTOCOMPLETADO POR FICHA
    const inputFicha = document.getElementById('ficha');
    if (inputFicha) {
        // Al cambiar el valor y salir del campo (Tab o Click fuera)
        inputFicha.addEventListener('change', buscarDatosUsuario);
    }
});

// =========================================================
// LÓGICA DE AUTOCOMPLETADO (USUARIO - UPSERT)
// =========================================================
async function buscarDatosUsuario() {
    const fichaVal = document.getElementById('ficha').value;
    
    // Referencias a los campos a llenar (Ids según tu EJS)
    const elNombre = document.getElementById('nombre');
    const elGerencia = document.getElementById('gerencia');
    const elExtension = document.getElementById('extension');

    // Si está vacío, no hacemos nada
    if (!fichaVal) return;

    // Feedback visual (Placeholder temporal)
    const placeholderOriginal = elNombre.placeholder;
    elNombre.placeholder = "Buscando...";
    elNombre.value = ""; // Limpiar visualmente mientras busca

    try {
        // Reutilizamos el endpoint existente del módulo de Stock
        const res = await ApiService.fetchAutenticado(`/stock/usuario/${fichaVal}`);
        
        if (res.ok) {
            const usuario = await res.json();
            
            // A. CASO: USUARIO EXISTE -> AUTOCOMPLETAR
            elNombre.value = usuario.nombre || "";
            elGerencia.value = usuario.gerencia || "";
            elExtension.value = usuario.extension || "";

            // Notificación discreta
            mostrarModal("Usuario encontrado. Datos cargados.", "success");
        } else {
            // B. CASO: USUARIO NUEVO -> LIMPIAR PARA CREAR
            // No mostramos error, permitimos escribir los datos nuevos
            elNombre.value = "";
            elGerencia.value = "";
            elExtension.value = "";
            
            elNombre.placeholder = "Ingrese nombre del nuevo trabajador";
        }
    } catch (error) {
        console.error("Error buscando usuario:", error);
        // En caso de error de red, permitimos escribir
        elNombre.value = ""; 
    } finally {
        // Restaurar placeholder original si el campo quedó vacío
        if(!elNombre.value) elNombre.placeholder = placeholderOriginal || "Nombre Apellido";
    }
}

// =========================================================
// LÓGICA DE TAGS (VISUAL)
// =========================================================
function setupTagInput(inputId, containerId, storageArray) {
    const inputElement = document.getElementById(inputId);
    
    if(!inputElement) return;

    inputElement.addEventListener('keydown', function(e) {
        // Detectar Espacio o Enter
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault(); // Evitar que escriba el espacio real
            
            const valor = inputElement.value.trim();
            if (valor && !storageArray.includes(valor)) {
                storageArray.push(valor);
                renderTags(containerId, storageArray, inputId); // Redibujar
                inputElement.value = ''; // Limpiar input
            }
        }
        // Detectar Backspace para borrar el último si el input está vacío
        else if (e.key === 'Backspace' && inputElement.value === '' && storageArray.length > 0) {
            storageArray.pop();
            renderTags(containerId, storageArray, inputId);
        }
    });
}

function renderTags(containerId, storageArray, inputId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    container.innerHTML = ''; 

    storageArray.forEach((tag, index) => {
        const badge = document.createElement('span');
        badge.className = 'tag-badge';
        badge.innerHTML = `${tag} <span class="tag-close">&times;</span>`;
        
        badge.querySelector('.tag-close').onclick = function() {
            if (inputId === 'inputOtraApp') tagsAplicaciones.splice(index, 1);
            if (inputId === 'inputCarpetaRed') tagsCarpetas.splice(index, 1);
            renderTags(containerId, storageArray, inputId);
        };
        container.appendChild(badge);
    });
}

// =========================================================
// FUNCIÓN PRINCIPAL: GUARDAR RECIBO
// =========================================================
async function guardarRecibo() {
    console.log("Generando Payload con estructura solicitada...");

    // ======================================================
    // 0. VALIDACIÓN: CAMPO OBLIGATORIO (CPU FMO)
    // ======================================================
    const fmoElement = document.getElementById('fmoEquipo');
    const fmoValor = fmoElement ? fmoElement.value.trim() : '';

    if (!fmoValor) {
        mostrarModal(`
            <strong>Campo Obligatorio Faltante</strong><br>
            Por favor, ingrese el código <b>CPU FMO</b> o Identificador del equipo antes de guardar.
        `, 'error');
        if(fmoElement) fmoElement.focus();
        return;
    }

    // --- 1. DATOS DE USUARIO ---
    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;
    const ficha = parseInt(document.getElementById('ficha').value) || 0;
    const nombre = document.getElementById('nombre').value;
    const extension = document.getElementById('extension').value;
    const gerencia = document.getElementById('gerencia').value;

    // Validación básica de usuario
    if(!ficha || !nombre) {
        mostrarModal("Ficha y Nombre son obligatorios para procesar el registro.", "warning");
        return;
    }

    // --- 2. LÓGICA DE APLICACIONES ---
    const mapAppIds = { 'Siquel': 1, 'SAP': 2, 'Autocad': 3, 'Project': 4 };
    const idsAplicaciones = [];
    document.querySelectorAll('.app-check:checked').forEach(chk => {
        if (mapAppIds[chk.value]) idsAplicaciones.push(mapAppIds[chk.value]);
    });

    // Aplicaciones Extra (Tags)
    const aplicacionesExtra = tagsAplicaciones.length > 0 ? tagsAplicaciones : null;

    // --- 3. CARPETAS DE RED ---
    const nombresCarpetas = tagsCarpetas.length > 0 ? tagsCarpetas : [];

    // --- 4. COMPONENTES (Cantidades) ---
    const componentes = [];
    
    // RAM (con cantidad)
    if(document.getElementById('checkRam').checked) {
        componentes.push({
            idComponente: 3, 
            cantidad: parseInt(document.getElementById('cantRam').value) || 1
        });
    }
    
    // Otros componentes (Checkbox simple)
    const mapComponentesIds = {
        'checkDisco': 4, 'checkMadre': 5, 'checkProc': 6, 'checkVideo': 7,
        'checkFuente': 8, 'checkRed': 9, 'checkFan': 10, 'checkPila': 11,
        'checkWindows': 12, 'checkCanaima': 13
    };

    document.querySelectorAll('.componente-check:checked:not(#checkRam)').forEach((check) => {
        const idBD = mapComponentesIds[check.id]; 
        if (idBD) {
            componentes.push({ idComponente: idBD, cantidad: 1 });
        }
    });

    // --- 4.5. PERIFÉRICOS ---
    const idsPerifericos = [];
    const mapPerifericosIds = {
        'checkMonitor': 1, 'checkTeclado': 2, 'checkMouse': 3, 'checkRegulador': 4
    };

    document.querySelectorAll('.periferico-check:checked').forEach((check) => {
        const idBD = mapPerifericosIds[check.id];
        if (idBD) idsPerifericos.push(idBD);
    });

    // --- 5. SERIALES ---
    const seriales = [];
    const addSerial = (idTipo, marcaId, serialId, capId = null) => {
        const serialVal = document.getElementById(serialId)?.value;
        if(serialVal) {
            seriales.push({
                idTipoComponente: idTipo,
                marca: document.getElementById(marcaId).value || "Genérico",
                serial: serialVal,
                capacidad: capId ? document.getElementById(capId).value : "N/A"
            });
        }
    };

    // Seriales Únicos
    addSerial(5, 'marcaMadre', 'serialMadre'); 
    addSerial(8, 'marcaFuente', 'serialFuente');
    addSerial(7, 'marcaVideo', 'serialVideo');
    addSerial(9, 'marcaRed', 'serialRed');

    // Seriales Múltiples (RAM y HDD)
    const procesarMultiples = (claseMarca, claseSerial, claseCap, idTipo) => {
        const elsMarca = document.querySelectorAll(claseMarca);
        const elsSerial = document.querySelectorAll(claseSerial);
        const elsCap = document.querySelectorAll(claseCap);
        
        elsSerial.forEach((input, i) => {
            if(input.value) {
                seriales.push({ 
                    idTipoComponente: idTipo, 
                    marca: elsMarca[i].value, 
                    serial: input.value, 
                    capacidad: elsCap[i].value 
                });
            }
        });
    };

    procesarMultiples('.ram-marca', '.ram-serial', '.ram-capacidad', 3);
    procesarMultiples('.hdd-marca', '.hdd-serial', '.hdd-capacidad', 4);

    // --- 6. CONSTRUCCIÓN DEL PAYLOAD FINAL ---
    const payload = {
        // Datos Usuario (Upsert)
        ficha: ficha,
        nombre: nombre,
        gerencia: gerencia,
        extension: extension,
        usuario: usuario,
        clave: clave,
        
        // Recibos
        recibos: [
            {
                asignadoA: document.getElementById('asignadoA').value,
                entregadoPor: document.getElementById('entregadoPor').value,
                recibidoPor: document.getElementById('recibidoPor').value,
                estatus: document.getElementById('estatus').value,
                falla: document.getElementById('falla').value,
                fecha: document.getElementById("fecha").value,
                fmoEquipo: fmoValor,
                observacion: document.getElementById('observacion').value,
                solicitudDAET: document.getElementById('solicitudDAET').value,
                solicitudST: document.getElementById('solicitudST').value,
                
                equipos: [
                    {
                        marca: document.getElementById('marca').value,
                        respaldo: document.querySelector('input[name="respaldo"]:checked')?.value || 'NO',
                        nombresCarpetas: nombresCarpetas,
                        componentes: componentes,
                        seriales: seriales,
                        idsPerifericos: idsPerifericos.length > 0 ? idsPerifericos : null,
                        observacionSeriales: document.getElementById('observacionSeriales') ? document.getElementById('observacionSeriales').value : "",
                        idsAplicaciones: idsAplicaciones.length > 0 ? idsAplicaciones : null,
                        aplicacionesExtra: aplicacionesExtra
                    }
                ]
            }
        ]
    };

    console.log("Payload Final:", JSON.stringify(payload, null, 2));

    // --- 7. ENVÍO ---
    try {
        const response = await ApiService.fetchAutenticado('/crearReciboEquipos', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorTxt = await response.text();
            throw new Error(errorTxt || response.statusText);
        }
        
        const data = await response.json();
        
        mostrarModal(`
            <strong>¡Operación Exitosa!</strong><br>
            El equipo <b>${fmoValor}</b> ha sido registrado correctamente.<br>
            <small>Datos del usuario actualizados/creados.</small>
        `, 'success');

        // Recargar la página después de unos segundos
        setTimeout(() => limpiarPantalla(), 3000);

    } catch (error) {
        console.error("Error al enviar:", error);
        mostrarModal(`
            <strong>Error de Servidor</strong><br>
            No se pudo guardar el registro.<br>
            <small>${error.message}</small>
        `, 'error');
    }
}

// Función global para reiniciar el formulario
function limpiarPantalla() {
    window.location.reload();
}