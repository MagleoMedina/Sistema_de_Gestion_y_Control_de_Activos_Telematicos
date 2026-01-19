

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

    // --- 2. LOGICA DE ENVÍO CON ESTRUCTURA JSON ESPECÍFICA ---
    async function guardarEntregaDAET() {
        console.log("Iniciando recolección de datos...");
        
        const inputEquipo = document.getElementById('nombreEquipo').value;
        const selectComp = document.getElementById('selectComponentes').value;
        const selectPeri = document.getElementById('selectPerifericos').value;
        const fmoSerial = document.getElementById('fmoSerial').value;

        // Validar selección
        if (!inputEquipo && !selectComp && !selectPeri) {
            alert("⚠️ Selecciona Equipo, Componente o Periférico.");
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

        // CASO 1: PERIFÉRICO (Monitor, etc.)
        if (selectPeri) {
            idPerifericoFinal = parseInt(selectPeri);
            componenteUnicoFinal = null;
            componentesInternosFinal = null;
        } 
        // CASO 2: COMPONENTE ÚNICO (Lista Desplegable)
        else if (selectComp) {
            idPerifericoFinal = null; // No hay periférico, es un componente suelto
            componentesInternosFinal = null;
            
            componenteUnicoFinal = [{
                idComponente: parseInt(selectComp),
                cantidad: 1 // Default para suelto
            }];
        }
        // CASO 3: EQUIPO COMPLETO (Input Texto + Checkboxes)
        else if (inputEquipo) {
            idPerifericoFinal = 1; // ID 1 representa CPU/Equipo Base
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
            
            // FMO Equipo (Encabezado)
            fmoEquipo: getVal('nombreEquipo')|| null, 
            
            observacion: getVal('observacion')|| null,
            recibidoPor: getVal('recibidoPor') || null,
            
            solicitudDAET: getVal('solicitudDAET') || null,
            solicitudST: getVal('solicitudST') || null,

            entregas: [
                {
                    actividad: document.querySelector('input[name="actividad"]:checked')?.value || "Entrega",
                    estado: document.querySelector('input[name="estado"]:checked')?.value || "Bueno",
                    
                    fmoSerial: fmoSerial,
                    identifique: getVal('identifiqueReemplazo')|| null, 
                    
                    // Aquí asignamos las variables calculadas arriba
                    idPeriferico: idPerifericoFinal,
                    componenteUnico: componenteUnicoFinal,
                    componentesInternos: componentesInternosFinal
                }
            ]
        };

        console.log("Payload generado:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch('http://127.0.0.1:8081/api/crearEntregasAlDaet', { 
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });

            if(response.ok) {
                alert("✅ Entrega DAET registrada con éxito");
               window.location.reload();
            } else {
                const text = await response.text();
                alert("❌ Error en el servidor: " + text);
            }
        } catch (e) {
            console.error(e);
            alert("❌ Error de conexión: " + e.message);
        }
    }