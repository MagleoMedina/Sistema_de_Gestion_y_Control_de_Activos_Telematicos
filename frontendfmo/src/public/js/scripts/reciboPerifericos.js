  document.addEventListener('DOMContentLoaded', () => {
        // 1. Fecha por defecto
        const fechaInput = document.getElementById('fecha');
        if(fechaInput) fechaInput.valueAsDate = new Date();

        // 2. Iniciar Validaciones de Exclusividad
        initValidations();
    });

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
                    checkboxes.forEach(c => { if(c !== e.target) c.checked = false; });
                    
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
                    fmoSerial: document.getElementById('fmoSerial').value || "S/N"
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

                fmoEquipo: getVal('fmoAsignado') || "S/N",
                solicitudST: getVal('solicitudST'), 
                solicitudDAET: getVal('solicitudDaet'),

                entregadoPor: getVal('entregadoPor'),
                recibidoPor: getVal('recibidoPor'),
                asignadoA: getVal('asignadoA'),

                estatus: "Listo", 
                fecha: getVal("fecha"),
                
                falla: getVal('falla'),
                // Campo SERIAL GENERAL (Para periféricos o componentes)
                fmoSerial: getVal('fmoSerial'), 

                // LÓGICA DE ENVÍO MUTUO
                otro: otroFinal,
                componentePerifericos: listaComponentes, 
                perifericos: listaPerifericos.length > 0 ? listaPerifericos : null
            };

            console.log("Payload:", payload);

            // VALIDACIÓN FINAL ANTES DE ENVIAR
            const hayData = (payload.perifericos || payload.componentePerifericos || payload.otro);
            
            if (!hayData) {
                alert("⚠️ Error: No has seleccionado nada para ingresar (Periférico, Componente u Otro).");
                return;
            }

            // 4. ENVÍO
            const response = await ApiService.fetchAutenticado('/crearReciboPerifericos', { 
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if(response.ok) {
                alert("✅ ¡Guardado Exitosamente!");
                //window.location.reload();
            } else {
                const txt = await response.text();
                alert("❌ Error Backend: " + txt);
            }

        } catch (e) {
            console.error(e);
            alert("Error JS: " + e.message);
        }
    }