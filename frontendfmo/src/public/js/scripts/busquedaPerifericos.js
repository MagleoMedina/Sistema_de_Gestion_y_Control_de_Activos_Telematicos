    // --- 1. LÓGICA DE FILTROS ---
    function cambiarFiltro() {
        const filtro = document.getElementById('filtroSelect').value;
        const divSerial = document.getElementById('containerInputSerial');
        const divFecha = document.getElementById('containerInputFecha');
        const divVacio = document.getElementById('containerVacio');

        divSerial.style.display = 'none';
        divFecha.style.display = 'none';
        divVacio.style.display = 'none';

        if (filtro === 'serial') divSerial.style.display = 'block';
        else if (filtro === 'fecha') divFecha.style.display = 'block';
        else divVacio.style.display = 'block';
    }

    // --- 2. LÓGICA DE BÚSQUEDA ---
    async function buscarPerifericos() {
        const filtro = document.getElementById('filtroSelect').value;
        let url = '/buscarReciboPerifericos'; 

        if (filtro === 'serial') {
            const val = document.getElementById('inputBusquedaSerial').value;
            if(!val) return alert("Ingrese Serial");
            url = `/buscarReciboPerifericos/${val}`;
        } 
        else if (filtro === 'fecha') {
            const val = document.getElementById('inputBusquedaFecha').value;
            if(!val) return alert("Seleccione Fecha");
            url = `/buscarReciboPerifericos/fecha/${val}`;
        }

        const tbody = document.getElementById('tablaResultados');
        tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';

        try {
            const response = await ApiService.fetchAutenticado(url);
            if(response.status === 404) {
                tbody.innerHTML = '<tr><td colspan="6">No hay registros.</td></tr>';
                return;
            }
            if(!response.ok) throw new Error("Error de servidor.");
            const data = await response.json();
            renderizarTabla(data);
        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="6" class="text-danger">${error.message}</td></tr>`;
        }
    }

    function renderizarTabla(data) {
        const tbody = document.getElementById('tablaResultados');
        tbody.innerHTML = '';
        const lista = Array.isArray(data) ? data : [data];

        if(lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No hay registros.</td></tr>';
            return;
        }

        lista.forEach((item, index) => {
            // Lógica para determinar qué mostrar en la columna "Tipo"
            let tipoMostrar = "Varios";
            if (item.componentePerifericos && item.componentePerifericos.length > 0) tipoMostrar = "Componente Interno";
            else if (item.perifericos && item.perifericos.length > 0) tipoMostrar = "Periférico";
            else if (item.otro) tipoMostrar = "Otro";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold">${index + 1}</td>
                <td class="text-primary fw-bold">${item.fmoSerial || "S/N"}</td>
                <td><span class="badge bg-secondary">${tipoMostrar}</span></td>
                <td>${item.fecha || "N/A"}</td>
                <td>${item.usuario || "N/A"}</td>
                <td>
                    <button class="btn btn-sm btn-info text-white" onclick='abrirModalVer(${JSON.stringify(item)})'>
                        <i class="bi bi-eye-fill" style="vertical-align: bottom; margin-right: 3px;" ></i>Ver
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- 3. LÓGICA DE VISUALIZACIÓN (MODAL) ---
    function abrirModalVer(data) {
        console.log("Datos recibidos en modal:", data);

        // A. RESETEAR CAMPOS (Limpieza previa)
        document.querySelectorAll('.modal-peri-check').forEach(c => c.checked = false);
        setVal('modal_componenteTexto', "");
        setVal('modal_otros', "");

        // B. MAPEO DE CAMPOS SIMPLES
        setVal('modal_fecha', data.fecha);
        setVal('modal_usuario', data.usuario); // El payload dice 'nombre', no 'usuario' (aunque hay campo usuario)
        setVal('modal_ficha', data.ficha);
        setVal('modal_ext', data.extension); 
        
        setVal('modal_fmoSerial', data.fmoSerial);
        setVal('modal_fmoAsignado', data.fmoEquipo); // A veces no viene en payload plano, verificar
        setVal('modal_gerencia', data.gerencia);
        setVal('modal_falla', data.falla);
        setVal('modal_solicitudST', data.solicitudST);
        setVal('modal_solicitudDaet', data.solicitudDAET);
        
        setVal('modal_asignadoA', data.asignadoA);
        setVal('modal_entregadoPor', data.entregadoPor);
        setVal('modal_recibidoPor', data.recibidoPor);

        // C. MAPEO DE PERIFÉRICOS (Checkboxes)
        // El payload trae: "perifericos": [ { "id": 1 }, { "id": 5 } ]
        if (data.perifericos && data.perifericos.length > 0) {
            data.perifericos.forEach(p => {
                // Construimos el ID del checkbox: 'chk_' + id
                // Ejemplo: ID 1 -> busca 'chk_1' (Monitor) y lo marca.
                const checkId = 'chk_' + p.id;
                const checkbox = document.getElementById(checkId);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }

        // D. MAPEO DE COMPONENTES INTERNOS (Texto)
        // El payload trae: "componentePerifericos": [ { "idComponente": 10 } ]
        // Necesitamos convertir ID 10 -> "FAN COOLER"
        const mapNombresComponentes = {
            3: "MEMORIA RAM",
            4: "DISCO DURO",
            5: "TARJETA MADRE",
            6: "PROCESADOR",
            7: "TARJETA DE VIDEO",
            8: "FUENTE DE PODER",
            9: "TARJETA DE RED",
            10: "FAN COOLER",
            11: "PILA"
        };

        if (data.componentePerifericos && data.componentePerifericos.length > 0) {
            // Creamos un array con los nombres encontrados
            const nombres = data.componentePerifericos.map(c => {
                return mapNombresComponentes[c.idComponente] || ("ID " + c.idComponente);
            });
            // Los unimos con comas por si hay más de uno
            setVal('modal_componenteTexto', nombres.join(", "));
        }

        // E. MAPEO DE OTROS
        // El payload trae: "otro": "Incluye regleta"
        if (data.otro) {
            setVal('modal_otros', data.otro);
        }

        // F. MOSTRAR MODAL
        const myModal = new bootstrap.Modal(document.getElementById('modalVerPeriferico'));
        myModal.show();
    }

    // Helper para setear valor seguro (si es null pone vacío)
    function setVal(id, val) {
        const el = document.getElementById(id);
        if(el) el.value = val || "";
    }