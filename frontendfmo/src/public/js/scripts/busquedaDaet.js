
 // --- 1. LÓGICA DE FILTROS ---
        function cambiarFiltro() {
            const filtro = document.getElementById('filtroSelect').value;
            const divSerial = document.getElementById('containerInputSerial');
            const divLote = document.getElementById('containerInputLote');
            const divFecha = document.getElementById('containerInputFecha');
            const divVacio = document.getElementById('containerVacio');

            divSerial.style.display = 'none';
            divLote.style.display = 'none';
            divFecha.style.display = 'none';
            divVacio.style.display = 'none';

            if (filtro === 'fmoSerial') divSerial.style.display = 'block';
            else if (filtro === 'fmoEquipo') divLote.style.display = 'block';
            else if (filtro === 'fecha') divFecha.style.display = 'block';
            else divVacio.style.display = 'block'; 
        }

        // --- 2. LÓGICA DE BÚSQUEDA ---
        async function buscarDaet() {
            const filtro = document.getElementById('filtroSelect').value;
            let url = '/buscarEntregasAlDaet'; 

            if (filtro === 'fmoSerial') {
                const val = document.getElementById('inputBusquedaSerial').value;
                if(!val) return alert("Ingrese el Serial");
                url = `/buscarEntregasAlDaet/fmoSerial/${val}`;
            }
            else if (filtro === 'fmoEquipo') {
                const val = document.getElementById('inputBusquedaLote').value;
                if(!val) return alert("Ingrese el FMO Equipo");
                url = `/buscarEntregasAlDaet/fmoEquipo/${val}`; 
            }
            else if (filtro === 'fecha') {
                const val = document.getElementById('inputBusquedaFecha').value;
                if(!val) return alert("Seleccione Fecha");
                url = `/buscarEntregasAlDaet/fecha/${val}`;
            }

            const tbody = document.getElementById('tablaResultados');
            tbody.innerHTML = '<tr><td colspan="7">Cargando...</td></tr>';

            try {
                const response = await ApiService.fetchAutenticado(url);
                if(!response.ok) throw new Error("Sin resultados o error de conexión.");
                const data = await response.json();
                renderizarTabla(data);
            } catch (error) {
                console.error(error);
                tbody.innerHTML = `<tr><td colspan="7" class="text-danger">${error.message}</td></tr>`;
            }
        }

        function renderizarTabla(data) {
            const tbody = document.getElementById('tablaResultados');
            tbody.innerHTML = '';
            const lista = Array.isArray(data) ? data : [data];

            if(lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7">No hay registros.</td></tr>';
                return;
            }

            lista.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fw-bold">${index + 1}</td>
                    <td>${item.solicitudDAET || "N/A"}</td>
                    <td class="text-primary fw-bold">${item.fmoEquipoLote || "N/A"}</td>
                    <td>${item.fmoSerial || "S/N"}</td>
                    <td><span class="badge bg-secondary">${item.actividad}</span></td>
                    <td>${item.fecha}</td>
                    <td>
                        <button class="btn btn-sm btn-info text-white" onclick='abrirModalVer(${JSON.stringify(item)})'>
                            👁️ Ver
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // --- 3. LÓGICA DE VISUALIZACIÓN ---
        function abrirModalVer(data) {
            // A. Datos Generales
            setVal('modal_fecha', data.fecha);
            setVal('modal_solicitudDAET', data.solicitudDAET);
            setVal('modal_solicitudST', data.solicitudST);
            setVal('modal_analista', data.asignadoA); // Analista es el asignado
            
            
            // B. Mapeo Inteligente de TIPO (Equipo / Componente / Periférico)
            setVal('modal_nombreEquipo', "");
            setVal('modal_componentesTexto', "");
            setVal('modal_perifericosTexto', "");
            
            // Si el nombre del periférico base es "CPU", "LAPTOP", etc., va en EQUIPO
            const tipo = (data.tipoPeriferico || "").toUpperCase();
            if (tipo.includes("CPU") || tipo.includes("LAPTOP") || tipo.includes("EQUIPO")) {
                setVal('modal_nombreEquipo', data.fmoEquipoLote || data.fmoSerial); // Usamos lote o serial como nombre ref
            } else if (data.componenteUnico && data.componenteUnico.length > 0) {
                // Es un componente suelto
                const unico = data.componenteUnico[0];
                setVal('modal_componentesTexto', unico.nombreComponente + (unico.cantidad > 1 ? ` (${unico.cantidad})` : ""));
            } else if (tipo) {
                // Es un periférico suelto (Monitor, etc.)
                setVal('modal_perifericosTexto', tipo);
            }

            setVal('modal_fmoSerial', data.fmoSerial);
            setVal('modal_observacion', data.observacion);
            setVal('modal_identifique', data.identifique);
            setVal('modal_recibidoPor', data.recibidoPor);
            setVal('modal_fichaRecibido', data.ficha);
            

            // C. Radios Actividad / Estado
            document.querySelectorAll('.modal-radio').forEach(r => r.checked = false);
            if(data.actividad === 'Reemplazo') document.getElementById('modal_act_reemplazo').checked = true;
            else document.getElementById('modal_act_entrega').checked = true;

            if(data.estado === 'Bueno') document.getElementById('modal_est_bueno').checked = true;
            else document.getElementById('modal_est_danado').checked = true;

            // D. Radios Reemplazo (Abajo)
            if(data.identifique && data.identifique.length > 0 && data.identifique !== "N/A") {
                document.getElementById('modal_reemplazoSi').checked = true;
            } else {
                document.getElementById('modal_reemplazoNo').checked = true;
            }

            // E. Detalles de CPU (Checkboxes)
            document.querySelectorAll('.modal-cpu-check').forEach(c => c.checked = false);
            setVal('modal_cantRam', "");

            if(data.componentesInternos && data.componentesInternos.length > 0) {
                data.componentesInternos.forEach(comp => {
                    const nombre = (comp.nombreComponente || "").toUpperCase();
                    
                    if(nombre.includes("DISCO")) document.getElementById('chk_disco').checked = true;
                    if(nombre.includes("RAM") || nombre.includes("MEMORIA")) {
                        document.getElementById('chk_ram').checked = true;
                        setVal('modal_cantRam', comp.cantidad);
                    }
                    if(nombre.includes("MADRE")) document.getElementById('chk_madre').checked = true;
                    if(nombre.includes("PROCESADOR")) document.getElementById('chk_procesador').checked = true;
                    if(nombre.includes("FAN") || nombre.includes("COOLER")) document.getElementById('chk_fan').checked = true;
                    if(nombre.includes("VIDEO")) document.getElementById('chk_video').checked = true;
                    if(nombre.includes("FUENTE")) document.getElementById('chk_fuente').checked = true;
                    if(nombre.includes("PILA")) document.getElementById('chk_pila').checked = true;
                    if(nombre.includes("RED")) document.getElementById('chk_red').checked = true;
                });
            }

            const myModal = new bootstrap.Modal(document.getElementById('modalVerDaet'));
            myModal.show();
        }

        function setVal(id, val) {
            const el = document.getElementById(id);
            if(el) el.value = val || "";
        }