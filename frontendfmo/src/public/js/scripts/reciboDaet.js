document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fecha');
    if(fechaInput) fechaInput.valueAsDate = new Date();
    initValidations(); // Inicializar exclusividad de campos
});

// --- 1. VALIDACIÓN VISUAL (Mutua Exclusividad) ---
function initValidations() {
    const inputEquipo = document.getElementById('nombreEquipo');
    const selectComp = document.getElementById('selectComponentes');
    const selectPeri = document.getElementById('selectPerifericos');
    const wrapperCpu = document.getElementById('wrapperEntregaCpu');
    
    const toggleCpuCheckboxes = (disable) => {
        if (disable) {
            wrapperCpu.classList.add('disabled-section');
            wrapperCpu.querySelectorAll('input').forEach(chk => {
                chk.disabled = true;
                chk.checked = false;
            });
        } else {
            wrapperCpu.classList.remove('disabled-section');
            wrapperCpu.querySelectorAll('input').forEach(chk => chk.disabled = false);
        }
    };

    inputEquipo.addEventListener('input', (e) => {
        if (e.target.value.trim() !== "") {
            selectComp.disabled = true; selectComp.value = "";
            selectPeri.disabled = true; selectPeri.value = "";
            toggleCpuCheckboxes(false); // Habilitar checkboxes para equipo
        } else {
            selectComp.disabled = false;
            selectPeri.disabled = false;
        }
    });

    selectComp.addEventListener('change', (e) => {
        if (e.target.value !== "") {
            inputEquipo.disabled = true; inputEquipo.value = "";
            selectPeri.disabled = true; selectPeri.value = "";
            toggleCpuCheckboxes(true); // Deshabilitar checkboxes
        } else {
            inputEquipo.disabled = false;
            selectPeri.disabled = false;
            toggleCpuCheckboxes(false);
        }
    });

    selectPeri.addEventListener('change', (e) => {
        if (e.target.value !== "") {
            inputEquipo.disabled = true; inputEquipo.value = "";
            selectComp.disabled = true; selectComp.value = "";
            toggleCpuCheckboxes(true); // Deshabilitar checkboxes
        } else {
            inputEquipo.disabled = false;
            selectComp.disabled = false;
            toggleCpuCheckboxes(false);
        }
    });
}

// --- 2. LOGICA DE ENVÍO ---
async function guardarEntregaDAET() {
    console.log("Iniciando recolección de datos...");
    
    // Obtener valores limpios
    const inputEquipoVal = document.getElementById('nombreEquipo').value.trim();
    const selectComp = document.getElementById('selectComponentes').value;
    const selectPeri = document.getElementById('selectPerifericos').value;
    const fmoSerialVal = document.getElementById('fmoSerial').value.trim();

    // ======================================================
    // 0. VALIDACIÓN SOLICITADA: AL MENOS UN IDENTIFICADOR
    // ======================================================
    // "Los campos que no pueden faltar son FMOSERIAL y equipo, valida que al menos uno no esté vacío"
    if (!fmoSerialVal && !inputEquipoVal) {
        mostrarModal(`
            <strong>Identificación Requerida</strong><br>
            Para realizar el envío, debe especificar al menos:<br>
            • El <b>FMO/SERIAL</b> del componente/periférico.<br>
            • O el <b>FMO del equipo</b> (si es un CPU completo).
        `, 'error');
        
        // Foco inteligente
        if(!document.getElementById('nombreEquipo').disabled) {
            document.getElementById('nombreEquipo').focus();
        } else {
            document.getElementById('fmoSerial').focus();
        }
        return;
    }

    // Validación de Tipo de Envío (Debe haber seleccionado algo)
    if (!inputEquipoVal && !selectComp && !selectPeri) {
        mostrarModal(`
            <strong>Selección Vacía</strong><br>
            Indique qué está enviando (Equipo, Componente o Periférico).
        `, 'warning');
        return;
    }

    // Mapa IDs Checkboxes
    const mapComponentesIds = {
        'chkRam': 3, 'chkDisco': 4, 'chkMadre': 5, 'chkProc': 6,
        'chkVideo': 7, 'chkFuente': 8, 'chkRed': 9, 'chkFan': 10, 'chkPila': 11
    };

    // --- VARIABLES DEL PAYLOAD ---
    let idPerifericoFinal = null;
    let componenteUnicoFinal = null;
    let componentesInternosFinal = null;

    // CASO 1: PERIFÉRICO
    if (selectPeri) {
        idPerifericoFinal = parseInt(selectPeri);
        componenteUnicoFinal = null;
        componentesInternosFinal = null;
    } 
    // CASO 2: COMPONENTE ÚNICO
    else if (selectComp) {
        idPerifericoFinal = null;
        componentesInternosFinal = null;
        
        componenteUnicoFinal = [{
            idComponente: parseInt(selectComp),
            cantidad: 1 
        }];
    }
    // CASO 3: EQUIPO COMPLETO
    else if (inputEquipoVal) {
        idPerifericoFinal = 1; // CPU Base
        componenteUnicoFinal = null;
        componentesInternosFinal = [];

        // RAM
        const ramCheck = document.getElementById('chkRam');
        if (ramCheck && ramCheck.checked) {
            componentesInternosFinal.push({
                idComponente: mapComponentesIds['chkRam'],
                cantidad: parseInt(document.getElementById('cantRam').value) || 1
            });
        }
        // Otros Checkboxes
        document.querySelectorAll('.daet-check:checked:not(#chkRam)').forEach(chk => {
            const id = mapComponentesIds[chk.id];
            if (id) componentesInternosFinal.push({ idComponente: id, cantidad: 1 });
        });
    }

    const getVal = (id) => document.getElementById(id)?.value || "";

    // --- CONSTRUCCIÓN DEL PAYLOAD FINAL ---
    const payload = {
        asignadoA: getVal('analista') || null,
        estatus: "Listo", 
        fecha: getVal("fecha"),
        ficha: getVal('fichaRecibido') || null,
        
        fmoEquipo: inputEquipoVal || null, 
        
        observacion: getVal('observacion')|| null,
        recibidoPor: getVal('recibidoPor') || null,
        
        solicitudDAET: getVal('solicitudDAET') || null,
        solicitudST: getVal('solicitudST') || null,

        entregas: [
            {
                actividad: document.querySelector('input[name="actividad"]:checked')?.value || "Entrega",
                estado: document.querySelector('input[name="estado"]:checked')?.value || "Bueno",
                
                fmoSerial: fmoSerialVal, // Usamos el valor validado
                identifique: getVal('identifiqueReemplazo')|| null, 
                
                idPeriferico: idPerifericoFinal,
                componenteUnico: componenteUnicoFinal,
                componentesInternos: componentesInternosFinal
            }
        ]
    };
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
    console.log("Payload generado:", JSON.stringify(payload, null, 2));

    try {
        const response = await ApiService.fetchAutenticado('/crearEntregasAlDaet', { 
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if(response.ok) {
            mostrarModal(`
                <strong>¡Entrega Registrada!</strong><br>
                El envío al DAET se ha guardado correctamente.
            `, 'success');
            
            setTimeout(() => limpiarPantalla(), 4500);
        } else {
            const text = await response.text();
            mostrarModal(`
                <strong>Error del Servidor</strong><br>
                ${text}
            `, 'error');
        }
    } catch (e) {
        console.error(e);
        mostrarModal(`
            <strong>Error de Conexión</strong><br>
            ${e.message}
        `, 'error');
    }
}