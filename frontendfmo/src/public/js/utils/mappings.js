// =============================================================
// HELPER: Funciones Auxiliares (Reutilizadas de tus scripts)
// =============================================================

// Escribe un valor en un input dentro del formulario específico
function setVal(form, id, val) {
    // EL TRUCO: Usamos form.querySelector en lugar de document.getElementById
    const el = form.querySelector('#' + id);
    if (el) el.value = val || "";
}

// Dibuja las burbujas (Tags) dentro del formulario específico
function llenarTags(container, dataArray, keyName = null) {
    container.innerHTML = '';
    if (!dataArray || dataArray.length === 0) {
        container.innerHTML = '<span class="text-muted small">Ninguno</span>';
        return;
    }
    dataArray.forEach(item => {
        let texto = keyName ? item[keyName] : item;
        if (keyName === 'nombreComponente' && item.cantidad) {
            const nombreUpper = String(texto).toUpperCase();
            if (nombreUpper.includes("RAM") || nombreUpper.includes("MEMORIA")) {
                texto = `${texto} (${item.cantidad})`;
            }
        }
        const span = document.createElement('span');
        span.className = 'tag-badge'; // Asegúrate que este estilo exista en tu CSS global o del PDF
        span.style.cssText = "background:#000080; color:white; padding:2px 6px; border-radius:4px; margin-right:4px; font-size:11px; display:inline-block; margin-bottom:2px;";
        span.textContent = texto;
        container.appendChild(span);
    });
}

// Dibuja las filas de seriales (RAM/HDD)
function renderSerialRows(container, dataList, minRows = 1) {
    container.innerHTML = '';
    // Dibujar datos existentes
    dataList.forEach(item => {
        const div = document.createElement('div');
        div.className = 'row row-compact';
        div.innerHTML = `
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" value="${item.marca || ''}" readonly></div>
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" value="${item.serial || ''}" readonly></div>
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" value="${item.capacidad || ''}" readonly></div>
        `;
        container.appendChild(div);
    });
    // Rellenar filas vacías
    const filasRestantes = minRows - dataList.length;
    for (let i = 0; i < filasRestantes; i++) {
        const div = document.createElement('div');
        div.className = 'row row-compact';
        div.innerHTML = `
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" readonly></div>
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" readonly></div>
            <div class="col-4 cell-border"><input type="text" class="input-line text-center" readonly></div>
        `;
        container.appendChild(div);
    }
}

// =============================================================
// 1. LÓGICA DE EQUIPOS (Copiada de busqueda-equipos.ejs)
// =============================================================
function mapearDatosEquipos(form, data) {
    setVal(form, 'modal_fecha', data.fecha);
    setVal(form, 'modal_usuario', data.usuarioNombre);
    setVal(form, 'modal_ficha', data.usuarioFicha);
    setVal(form, 'modal_nombre', data.usuarioNombre);
    setVal(form, 'modal_extension', data.extension);
    setVal(form, 'modal_gerencia', data.usuarioGerencia);
    setVal(form, 'modal_solicitudDAET', data.solicitudDAET);
    setVal(form, 'modal_solicitudST', data.solicitudST);
    setVal(form, 'modal_fmoEquipo', data.fmoEquipo);
    setVal(form, 'modal_falla', data.falla);
    setVal(form, 'modal_observacion', data.observacion);
    setVal(form, 'modal_asignadoA', data.asignadoA);
    setVal(form, 'modal_estatus', data.estatus);
    setVal(form, 'modal_entregadoPor', data.entregadoPor);
    setVal(form, 'modal_recibidoPor', data.recibidorPor);
    setVal(form, 'modal_clave', data.clave);

    if (data.equipos && data.equipos.length > 0) {
        const equipo = data.equipos[0];
        setVal(form, 'modal_marca', equipo.marca);
        
        const spanRespaldo = form.querySelector('#modal_respaldo');
        if(spanRespaldo) spanRespaldo.textContent = equipo.respaldo || "NO";
        
        setVal(form, 'modal_observacionSeriales', equipo.observacionSeriales);

        // Listas (Tags) - Usamos querySelector para encontrar el contenedor dentro del form
        llenarTags(form.querySelector('#modal_lista_componentes'), equipo.componentesGenericos, 'nombreComponente');
        llenarTags(form.querySelector('#modal_lista_perifericos'), equipo.perifericos);
        llenarTags(form.querySelector('#modal_lista_apps'), equipo.aplicaciones);
        llenarTags(form.querySelector('#modal_lista_carpetas'), equipo.carpetas);

        // Tabla Seriales
        setVal(form, 'modal_marcaMadre', ''); setVal(form, 'modal_serialMadre', '');
        setVal(form, 'modal_marcaFuente', ''); setVal(form, 'modal_serialFuente', '');
        setVal(form, 'modal_marcaVideo', ''); setVal(form, 'modal_serialVideo', '');
        setVal(form, 'modal_marcaRed', ''); setVal(form, 'modal_serialRed', '');
        
        const rams = [];
        const hdds = [];

        if (equipo.componentesConSerial) {
            equipo.componentesConSerial.forEach(ser => {
                const tipo = (ser.tipoComponente || "").toUpperCase();
                if (tipo.includes("MADRE")) {
                    setVal(form, 'modal_marcaMadre', ser.marca); setVal(form, 'modal_serialMadre', ser.serial);
                } else if (tipo.includes("FUENTE")) {
                    setVal(form, 'modal_marcaFuente', ser.marca); setVal(form, 'modal_serialFuente', ser.serial);
                } else if (tipo.includes("VIDEO")) {
                    setVal(form, 'modal_marcaVideo', ser.marca); setVal(form, 'modal_serialVideo', ser.serial);
                } else if (tipo.includes("RED")) {
                    setVal(form, 'modal_marcaRed', ser.marca); setVal(form, 'modal_serialRed', ser.serial);
                } else if (tipo.includes("RAM") || tipo.includes("MEMORIA")) {
                    rams.push(ser);
                } else if (tipo.includes("DISCO") || tipo.includes("DURO")) {
                    hdds.push(ser);
                }
            });
        }
        renderSerialRows(form.querySelector('#container_ram_seriales'), rams, 4);
        renderSerialRows(form.querySelector('#container_hdd_seriales'), hdds, 2);
    }
}

// =============================================================
// 2. LÓGICA DE PERIFÉRICOS (Copiada de busqueda-perifericos.ejs)
// =============================================================
function mapearDatosPerifericos(form, data) {
    // Resetear checkboxes del form actual
    form.querySelectorAll('.modal-peri-check').forEach(c => c.checked = false);
    setVal(form, 'modal_componenteTexto', "");
    setVal(form, 'modal_otros', "");

    setVal(form, 'modal_fecha', data.fecha);
    setVal(form, 'modal_usuario', data.nombre);
    setVal(form, 'modal_ficha', data.ficha);
    setVal(form, 'modal_ext', data.extension);
    setVal(form, 'modal_fmoSerial', data.fmoSerial);
    setVal(form, 'modal_fmoAsignado', data.fmoEquipo);
    setVal(form, 'modal_gerencia', data.gerencia);
    setVal(form, 'modal_falla', data.falla);
    setVal(form, 'modal_solicitudST', data.solicitudST);
    setVal(form, 'modal_solicitudDaet', data.solicitudDAET);
    setVal(form, 'modal_asignadoA', data.asignadoA);
    setVal(form, 'modal_entregadoPor', data.entregadoPor);
    setVal(form, 'modal_recibidoPor', data.recibidoPor);

    if (data.itemsComponente && data.itemsComponente.length > 0) {
        data.itemsComponente.forEach(item => {
            const nombre = (item.nombre || "").toUpperCase().trim();
            
            if (nombre.startsWith("OTRO:")) {
                setVal(form, 'modal_otros', nombre.replace("OTRO:", "").trim());
                return;
            }

            // Usamos querySelector sobre el FORM para marcar el checkbox correcto
            if (nombre.includes("MONITOR")) form.querySelector('#chk_1').checked = true;
            else if (nombre.includes("TECLADO")) form.querySelector('#chk_2').checked = true;
            else if (nombre.includes("MOUSE")) form.querySelector('#chk_3').checked = true;
            else if (nombre.includes("REGULADOR")) form.querySelector('#chk_4').checked = true;
            else if (nombre.includes("IMPRESORA")) form.querySelector('#chk_5').checked = true;
            else if (nombre.includes("SCANER")) form.querySelector('#chk_6').checked = true;
            else if (nombre.includes("PENDRIVE")) form.querySelector('#chk_7').checked = true;
            else if (nombre.includes("TONER")) form.querySelector('#chk_8').checked = true;
            else if (["RAM", "DISCO", "TARJETA", "FUENTE", "PILA", "FAN", "PROCESADOR"].some(x => nombre.includes(x))) {
                setVal(form, 'modal_componenteTexto', nombre);
            }
        });
    }
}

// =============================================================
// 3. LÓGICA DE DAET (Copiada de busqueda-daet.ejs)
// =============================================================
function mapearDatosDaet(form, data) {
    setVal(form, 'modal_fecha', data.fecha);
    setVal(form, 'modal_solicitudDAET', data.solicitudDAET);
    setVal(form, 'modal_solicitudST', data.solicitudST);
    setVal(form, 'modal_analista', data.asignadoA);
    
    setVal(form, 'modal_nombreEquipo', "");
    setVal(form, 'modal_componentesTexto', "");
    setVal(form, 'modal_perifericosTexto', "");

    const tipo = (data.tipoPeriferico || "").toUpperCase();
    if (tipo.includes("CPU") || tipo.includes("LAPTOP") || tipo.includes("EQUIPO")) {
        setVal(form, 'modal_nombreEquipo', data.fmoEquipoLote || data.fmoSerial);
    } else if (data.componenteUnico && data.componenteUnico.length > 0) {
        const unico = data.componenteUnico[0];
        setVal(form, 'modal_componentesTexto', unico.nombreComponente + (unico.cantidad > 1 ? ` (${unico.cantidad})` : ""));
    } else if (tipo) {
        setVal(form, 'modal_perifericosTexto', tipo);
    }

    setVal(form, 'modal_fmoSerial', data.fmoSerial);
    setVal(form, 'modal_observacion', data.observacion);
    setVal(form, 'modal_identifique', data.identifique);
    setVal(form, 'modal_recibidoPor', data.recibidoPor);
    setVal(form, 'modal_fichaRecibido', data.ficha || ""); // Si el backend no manda ficha, queda vacío

    // Radios
    form.querySelectorAll('.modal-radio').forEach(r => r.checked = false);
    if(data.actividad === 'Reemplazo') form.querySelector('#modal_act_reemplazo').checked = true;
    else form.querySelector('#modal_act_entrega').checked = true;

    if(data.estado === 'Bueno') form.querySelector('#modal_est_bueno').checked = true;
    else form.querySelector('#modal_est_danado').checked = true;

    if(data.identifique && data.identifique.length > 0 && data.identifique !== "N/A") {
        form.querySelector('#modal_reemplazoSi').checked = true;
    } else {
        form.querySelector('#modal_reemplazoNo').checked = true;
    }

    // CPU Checkboxes
    form.querySelectorAll('.modal-cpu-check').forEach(c => c.checked = false);
    setVal(form, 'modal_cantRam', "");

    if(data.componentesInternos && data.componentesInternos.length > 0) {
        data.componentesInternos.forEach(comp => {
            const nombre = (comp.nombreComponente || "").toUpperCase();
            if(nombre.includes("DISCO")) form.querySelector('#chk_disco').checked = true;
            if(nombre.includes("RAM") || nombre.includes("MEMORIA")) {
                form.querySelector('#chk_ram').checked = true;
                setVal(form, 'modal_cantRam', comp.cantidad);
            }
            if(nombre.includes("MADRE")) form.querySelector('#chk_madre').checked = true;
            if(nombre.includes("PROCESADOR")) form.querySelector('#chk_procesador').checked = true;
            if(nombre.includes("FAN") || nombre.includes("COOLER")) form.querySelector('#chk_fan').checked = true;
            if(nombre.includes("VIDEO")) form.querySelector('#chk_video').checked = true;
            if(nombre.includes("FUENTE")) form.querySelector('#chk_fuente').checked = true;
            if(nombre.includes("PILA")) form.querySelector('#chk_pila').checked = true;
            if(nombre.includes("RED")) form.querySelector('#chk_red').checked = true;
        });
    }
}