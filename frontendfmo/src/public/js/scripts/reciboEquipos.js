
       //fecha por defecto
        const fechaInput = document.getElementById('fecha');
        if(fechaInput) fechaInput.valueAsDate = new Date();
        
        // --- LÓGICA DE TAGS (BURBUJAS) ---
        
        // 1. Arrays globales para almacenar los datos
        let tagsAplicaciones = [];
        let tagsCarpetas = [];

        // 2. Función genérica para configurar un input de tags
        function setupTagInput(inputId, containerId, storageArray) {
            const inputElement = document.getElementById(inputId);
            const containerElement = document.getElementById(containerId);

            // Escuchar teclas
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

        // 3. Función para dibujar las burbujas visualmente
        function renderTags(containerId, storageArray, inputId) {
            const container = document.getElementById(containerId);
            container.innerHTML = ''; // Limpiar visualmente para redibujar

            storageArray.forEach((tag, index) => {
                // Crear la burbuja
                const badge = document.createElement('span');
                badge.className = 'tag-badge';
                badge.innerHTML = `${tag} <span class="tag-close">&times;</span>`;
                
                // Función eliminar al hacer click en la X
                badge.querySelector('.tag-close').onclick = function() {
                    // Remover del array original dependiendo de cual sea
                    if (inputId === 'inputOtraApp') tagsAplicaciones.splice(index, 1);
                    if (inputId === 'inputCarpetaRed') tagsCarpetas.splice(index, 1);
                    
                    renderTags(containerId, storageArray, inputId); // Redibujar
                };

                container.appendChild(badge);
            });
        }

        // 4. Inicializar los dos campos
        document.addEventListener('DOMContentLoaded', () => {
            setupTagInput('inputOtraApp', 'tagsAppsContainer', tagsAplicaciones);
            setupTagInput('inputCarpetaRed', 'tagsCarpetasContainer', tagsCarpetas);
        });


        // --- TU FUNCIÓN DE GUARDADO ACTUALIZADA ---
        async function guardarRecibo() {
        console.log("Generando Payload con estructura solicitada...");

        // ======================================================
        // 0. VALIDACIÓN: CAMPO OBLIGATORIO (CPU FMO)
        // ======================================================
        const fmoElement = document.getElementById('fmoEquipo');
        const fmoValor = fmoElement ? fmoElement.value.trim() : '';

        if (!fmoValor) {
            // Usamos el nuevo sistema de Modales
            mostrarModal(`
                <strong>Campo Obligatorio Faltante</strong><br>
                Por favor, ingrese el código <b>CPU FMO</b> o Identificador del equipo antes de guardar.
            `, 'error'); // Tipo 'error' para que salga rojo
            
            // Hacemos foco en el input para ayudar al usuario
            if(fmoElement) fmoElement.focus();
            return; // DETENEMOS LA EJECUCIÓN AQUÍ
        }

        // --- 1. DATOS DE USUARIO (Raíz del JSON) ---
        const usuario = document.getElementById('usuario').value;
        const clave = document.getElementById('clave').value;
        const ficha = parseInt(document.getElementById('ficha').value) || 0;
        const nombre = document.getElementById('nombre').value;
        const extension = document.getElementById('extension').value;
        const gerencia = document.getElementById('gerencia').value;

        // --- 2. LÓGICA DE APLICACIONES (IDs y Extras) ---
        
        // A. IDs de Aplicaciones (Checkboxes fijos)
        // Debes definir qué ID de base de datos corresponde a cada valor del checkbox
        const mapAppIds = {
            'Siquel': 1,
            'SAP': 2,
            'Autocad': 3,
            'Project': 4
        };
        
        const idsAplicaciones = [];
        document.querySelectorAll('.app-check:checked').forEach(chk => {
            if (mapAppIds[chk.value]) {
                idsAplicaciones.push(mapAppIds[chk.value]);
            }
        });

        // B. Aplicaciones Extra (Lo que escribiste en las burbujas)
        // Si el array está vacío, mandamos null o array vacío según prefieras.
        // El ejemplo pedía null si no hay datos, pero es más seguro mandar array vacío [].
        // Aquí usaré el array de tags que creamos en el paso anterior.
        const aplicacionesExtra = tagsAplicaciones.length > 0 ? tagsAplicaciones : null;


        // --- 3. CARPETAS DE RED ---
        // Usamos el array de burbujas global 'tagsCarpetas'
        const nombresCarpetas = tagsCarpetas.length > 0 ? tagsCarpetas : [];


        // --- 4. COMPONENTES (Cantidades) ---
        const componentes = [];
        // RAM
        if(document.getElementById('checkRam').checked) {
            componentes.push({
                idComponente: 3, 
                cantidad: parseInt(document.getElementById('cantRam').value) || 1
            });
        }
        // B. Lógica para los OTROS checkboxes usando MAPA
        // CLAVE: El 'id' del checkbox en el HTML
        // VALOR: El 'id' real en tu tabla 'componentes_computadora_internos' de la BD
        const mapComponentesIds = {
            'checkDisco': 4,
            'checkMadre': 5,
            'checkProc': 6,
            'checkVideo': 7,
            'checkFuente': 8,
            'checkRed': 9,
            'checkFan': 10,
            'checkPila': 11,
            'checkWindows': 12,
            'checkCanaima': 13
        };

        // Seleccionamos todos los marcados que NO sean la RAM
        const otrosChecks = document.querySelectorAll('.componente-check:checked:not(#checkRam)');
        
        otrosChecks.forEach((check) => {
            // Buscamos el ID de la BD usando el ID del checkbox (check.id)
            const idBD = mapComponentesIds[check.id]; 

            if (idBD) {
                componentes.push({
                    idComponente: idBD,
                    cantidad: 1 // Asumimos 1 para estos componentes
                });
            }
        });
        // --- 4.5. PERIFÉRICOS (Mapeo de Checkboxes) ---
        const idsPerifericos = [];

        // CLAVE: El 'id' del checkbox en el HTML
        // VALOR: El 'id' real en tu tabla 'perifericos' de la BD
        const mapPerifericosIds = {
            'checkMonitor': 1,
            'checkTeclado': 2,
            'checkMouse': 3,
            'checkRegulador': 4
        };

        // Seleccionamos los checkboxes marcados de la clase .periferico-check
        document.querySelectorAll('.periferico-check:checked').forEach((check) => {
            const idBD = mapPerifericosIds[check.id];
            if (idBD) {
                idsPerifericos.push(idBD);
            }
        });

        // --- 5. SERIALES ---
        const seriales = [];
        // Helper para agregar
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

        // Seriales RAM (Múltiples)
        const ramsMarcas = document.querySelectorAll('.ram-marca');
        const ramsSeriales = document.querySelectorAll('.ram-serial');
        const ramsCaps = document.querySelectorAll('.ram-capacidad');
        ramsSeriales.forEach((input, i) => {
            if(input.value) seriales.push({ idTipoComponente: 3, marca: ramsMarcas[i].value, serial: input.value, capacidad: ramsCaps[i].value });
        });

        // Seriales HDD (Múltiples)
        const hddsMarcas = document.querySelectorAll('.hdd-marca');
        const hddsSeriales = document.querySelectorAll('.hdd-serial');
        const hddsCaps = document.querySelectorAll('.hdd-capacidad');
        hddsSeriales.forEach((input, i) => {
            if(input.value) seriales.push({ idTipoComponente: 4, marca: hddsMarcas[i].value, serial: input.value, capacidad: hddsCaps[i].value });
        });

        // --- 6. CONSTRUCCIÓN DEL PAYLOAD FINAL ---
        const payload = {
            clave: clave,
            extension: extension,
            ficha: ficha,
            gerencia: gerencia,
            nombre: nombre,
            recibos: [
                {
                    asignadoA: document.getElementById('asignadoA').value,
                    entregadoPor: document.getElementById('entregadoPor').value,
                    equipos: [
                        {
                            marca: document.getElementById('marca').value,
                            respaldo: document.querySelector('input[name="respaldo"]:checked')?.value || 'NO',
                            
                            // Arrays y Listas
                            nombresCarpetas: nombresCarpetas,
                            componentes: componentes,
                            seriales: seriales,

                            // NUEVO CAMPO AGREGADO AQUÍ:
                            idsPerifericos: idsPerifericos.length > 0 ? idsPerifericos : null,
                            
                            // Campos nuevos/modificados
                            observacionSeriales: document.getElementById('observacionSeriales') ? document.getElementById('observacionSeriales').value : "",
                            idsAplicaciones: idsAplicaciones.length > 0 ? idsAplicaciones : null,
                            aplicacionesExtra: aplicacionesExtra
                        }
                    ],
                    estatus: document.getElementById('estatus').value,
                    falla: document.getElementById('falla').value,
                    fecha: document.getElementById("fecha").value,
                    fmoEquipo: document.getElementById('fmoEquipo').value,
                    observacion: document.getElementById('observacion').value,
                    recibidoPor: document.getElementById('recibidoPor').value,
                    solicitudDAET: document.getElementById('solicitudDAET').value,
                    solicitudST: document.getElementById('solicitudST').value
                }
            ],
            usuario: usuario
        };

        console.log("Payload Final:", JSON.stringify(payload, null, 2));

    function limpiarPantalla() {
    // Resetea inputs de texto y fechas
    document.querySelectorAll('input').forEach(input => input.value = '');
    // Resetea selects
    document.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
    // Reinicia la fecha actual (como haces en DOMContentLoaded)
    const fechaInput = document.getElementById('fecha');
    if(fechaInput) fechaInput.valueAsDate = new Date();
    window.location.reload()
}
        // --- 7. ENVÍO ---
        try {
            const response = await ApiService.fetchAutenticado('/crearReciboEquipos', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Error: ${response.error || response.statusText}`);
            
            const data = await response.json();
            // ======================================================
            // MODAL DE ÉXITO (Reemplaza al alert)
            // ======================================================
            mostrarModal(`
                <strong>¡Operación Exitosa!</strong><br>
                El equipo <b>${fmoValor}</b> ha sido registrado correctamente en el sistema.<br>
                <small>Listo para imprimir o consultar.</small>
            `, 'success');

            console.log("Payload Final:", JSON.stringify(payload, null, 2));
            
            // Opcional: Recargar la página después de unos segundos si lo deseas
            setTimeout(() => limpiarPantalla(), 4500);

        } catch (error) {
            console.error("Error al enviar:", error);
            
            // ======================================================
            // MODAL DE ERROR DE SERVIDOR
            // ======================================================
            mostrarModal(`
                <strong>Error de Servidor</strong><br>
                No se pudo guardar el registro.<br>
                <small>${error.message}</small>
            `, 'error');
        }
    }