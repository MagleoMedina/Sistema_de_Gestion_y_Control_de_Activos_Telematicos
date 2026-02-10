document.addEventListener('DOMContentLoaded', () => {
    // 1. Fecha por defecto
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) fechaInput.valueAsDate = new Date();

    // 2. Iniciar Validaciones de Exclusividad
    initValidations();

    // 3. Listener para Ficha (Opcional, ya que lo agregamos en el HTML con onchange, 
    // pero es buena práctica tenerlo aquí también por si acaso)
    const inputFicha = document.getElementById('ficha');
    if (inputFicha) {
        inputFicha.addEventListener('change', buscarDatosUsuario);
    }
});
// =========================================================
// LÓGICA DE AUTOCOMPLETADO (USUARIO - UPSERT)
// =========================================================
async function buscarDatosUsuario() {
    const fichaVal = document.getElementById('ficha').value;
    
    // Referencias usando tu nomenclatura existente
    const elUsuario = document.getElementById('usuario'); // Este actúa como Nombre
    const elGerencia = document.getElementById('gerencia');
    const elExt = document.getElementById('ext');


    if (!fichaVal) return;

    // Feedback visual
    const placeholderOriginal = elUsuario.placeholder;
    elUsuario.placeholder = "Buscando...";
    elUsuario.value = ""; 

    try {
        const res = await ApiService.fetchAutenticado(`/stock/usuario/${fichaVal}`);
        
        if (res.ok) {
            const data = await res.json();
            
            // A. EXISTE: Autocompletar
            elUsuario.value = data.nombre || "";
            elGerencia.value = data.gerencia || "";
            elExt.value = data.extension || "";
            
            mostrarModal("Usuario encontrado. Datos cargados.", "success");
        } else {
            // B. NUEVO: Limpiar para permitir escritura
            elUsuario.value = "";
            elGerencia.value = "";
            elExt.value = "";
            
            elUsuario.placeholder = "Ingrese nombre del nuevo trabajador";
        }
    } catch (error) {
        console.error("Error buscando usuario:", error);
    } finally {
        if(!elUsuario.value) elUsuario.placeholder = placeholderOriginal || "Nombre Apellido";
    }
}
// --- LÓGICA DE VALIDACIÓN VISUAL (DINÁMICA) ---
function initValidations() {
    const checkboxes = document.querySelectorAll('.peri-check');
    const selectComp = document.getElementById('selectComponentes');
    const inputOtro = document.getElementById('otrosTxt');

    // A. Lógica para Checkboxes (Periféricos)
    checkboxes.forEach(chk => {
        chk.addEventListener('change', (e) => {
            const isChecked = e.target.checked;

            if (isChecked) {
                // 1. Regla: Solo uno a la vez (Desmarcar los demás)
                checkboxes.forEach(c => { if (c !== e.target) c.checked = false; });

                // 2. Deshabilitar los otros campos
                selectComp.value = ""; // Resetear select
                selectComp.disabled = true;
                inputOtro.value = "";  // Limpiar texto
                inputOtro.disabled = true;
            } else {
                // Si el usuario desmarca el único que había, habilitar todo
                selectComp.disabled = false;
                inputOtro.disabled = false;
            }
        });
    });

    // B. Lógica para Select (Componentes)
    selectComp.addEventListener('change', (e) => {
        if (e.target.value !== "") {
            // Si seleccionó algo: Deshabilitar checkboxes y Otro
            checkboxes.forEach(c => {
                c.checked = false;
                c.disabled = true;
            });
            inputOtro.value = "";
            inputOtro.disabled = true;
        } else {
            // Si volvió a "Ninguno": Habilitar todo
            checkboxes.forEach(c => c.disabled = false);
            inputOtro.disabled = false;
        }
    });

    // C. Lógica para Input (Otros)
    inputOtro.addEventListener('input', (e) => {
        if (e.target.value.trim() !== "") {
            // Si escribió algo: Deshabilitar checkboxes y Select
            checkboxes.forEach(c => {
                c.checked = false;
                c.disabled = true;
            });
            selectComp.value = "";
            selectComp.disabled = true;
        } else {
            // Si borró el texto: Habilitar todo
            checkboxes.forEach(c => c.disabled = false);
            selectComp.disabled = false;
        }
    });
}

// --- FUNCIÓN DE GUARDADO ---
async function guardarPerifericos() {
    console.log("Iniciando guardado...");

    // ======================================================
    // 0. VALIDACIÓN: CAMPOS OBLIGATORIOS
    // ======================================================
    const fmoSerialEl = document.getElementById('fmoSerial');
    const fmoAsignadoEl = document.getElementById('fmoAsignado');
    
    const valSerial = fmoSerialEl ? fmoSerialEl.value.trim() : '';
    const valAsignado = fmoAsignadoEl ? fmoAsignadoEl.value.trim() : '';

    if (!valSerial || !valAsignado) {
        mostrarModal(`
            <strong>Datos Incompletos</strong><br>
            Los campos <b>FMO/SERIAL</b> y <b>FMO ASIGNADO</b> son obligatorios para el control de inventario.
        `, 'error');
        
        // Foco al primero que falte
        if(!valSerial) fmoSerialEl.focus();
        else fmoAsignadoEl.focus();
        
        return; // DETENER PROCESO
    }

    try {
        // 1. MAPAS
        const mapPerifericosIds = {
            'Monitor': 1, 'Teclado': 2, 'Mouse': 3, 'Regulador': 4,
            'Impresora': 5, 'Scaner': 6, 'Pendrive': 7, 'Toner': 8
        };

        // 2. RECOLECTAR DATOS (Solo capturamos lo que esté habilitado y lleno)
        
        // A. Periféricos
        const listaPerifericos = [];
        document.querySelectorAll('.peri-check:checked').forEach(chk => {
            const idBd = mapPerifericosIds[chk.value];
            if (idBd) listaPerifericos.push({ id: idBd });
        });

        // B. Componentes
        const idComp = document.getElementById('selectComponentes').value;
        let listaComponentes = null;
        // Solo si tiene valor y NO está deshabilitado
        if (idComp && !document.getElementById('selectComponentes').disabled) {
            listaComponentes = [{
                idComponente: parseInt(idComp),
                // Usamos el serial general si es un componente interno
                fmoSerial: valSerial || "S/N"
            }];
        }

        // C. Otros
        const valOtro = document.getElementById('otrosTxt').value;
        // Solo enviamos si no está deshabilitado
        const otroFinal = (!document.getElementById('otrosTxt').disabled && valOtro) ? valOtro : null;

        const getVal = (id) => document.getElementById(id)?.value || "";

        // 3. PAYLOAD
        const payload = {
            usuario: getVal('usuario'),
            ficha: parseInt(getVal('ficha')) || 0,
            //nombre: getVal('usuario'), 
            gerencia: getVal('gerencia'),
            extension: getVal('ext'),

            fmoEquipo: valAsignado, // Usamos la variable validada
            solicitudST: getVal('solicitudST'), 
            solicitudDAET: getVal('solicitudDaet'),

            entregadoPor: getVal('entregadoPor'),
            recibidoPor: getVal('recibidoPor'),
            asignadoA: getVal('asignadoA'),

            estatus: "Listo", 
            fecha: getVal("fecha"),
            
            falla: getVal('falla'),
            // Campo SERIAL GENERAL
            fmoSerial: valSerial, // Usamos la variable validada

            // LÓGICA DE ENVÍO MUTUO
            otro: otroFinal,
            componentePerifericos: listaComponentes, 
            perifericos: listaPerifericos.length > 0 ? listaPerifericos : null
        };

        console.log("Payload:", payload);

        // VALIDACIÓN DE CONTENIDO (Debe haber seleccionado al menos 1 item)
        const hayData = (payload.perifericos || payload.componentePerifericos || payload.otro);
        
        if (!hayData) {
            mostrarModal(`
                <strong>Selección Vacía</strong><br>
                Debe seleccionar al menos un Periférico, un Componente o especificar "Otro" para guardar el recibo.
            `, 'warning');
            return;
        }

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
        // 4. ENVÍO
        const response = await ApiService.fetchAutenticado('/crearReciboPerifericos', { 
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if(response.ok) {
            // MODAL DE ÉXITO
            mostrarModal(`
                <strong>¡Guardado Exitosamente!</strong><br>
                Se ha registrado la entrega asociada al FMO <b>${valAsignado}</b>.
            `, 'success');
            
            setTimeout(() => limpiarPantalla(), 4500);
        } else {
            const txt = await response.text();
            mostrarModal(`
                <strong>Error del Servidor</strong><br>
                ${txt}
            `, 'error');
        }

    } catch (e) {
        console.error(e);
        mostrarModal(`
            <strong>Error de Aplicación</strong><br>
            ${e.message}
        `, 'error');
    }
}