/**
 * Función genérica para exportar PDF (Individual).
 */
function generarPDFRecibo() {
    let element = null;
    let nombreBase = "Documento";
    let identificador = "SinID";
    let fecha = "Fecha";

    // --- 1. DETECCIÓN DEL CONTEXTO (¿Qué vista es?) ---

    // A. CASO EQUIPOS
    const formEquipos = document.getElementById('formularioPapel');
    if (formEquipos) {
        element = formEquipos;
        nombreBase = "Recibo_Equipos";
        // Intentamos obtener el FMO
        const inputFmo = document.getElementById('modal_fmoEquipo');
        if (inputFmo && inputFmo.value) identificador = inputFmo.value;
        
        const inputFecha = document.getElementById('modal_fecha');
        if (inputFecha && inputFecha.value) fecha = inputFecha.value;
    }

    // B. CASO PERIFÉRICOS
    const formPerifericos = document.getElementById('formPerifericosModal');
    if (!element && formPerifericos) {
        element = formPerifericos;
        nombreBase = "Recibo_Perifericos";
        // Intentamos obtener el Serial
        const inputSerial = document.getElementById('modal_fmoSerial');
        if (inputSerial && inputSerial.value) identificador = inputSerial.value;
        
        const inputFecha = document.getElementById('modal_fecha');
        if (inputFecha && inputFecha.value) fecha = inputFecha.value;
    }

    // C. CASO DAET
    const formDaet = document.getElementById('formDaetModal');
    if (!element && formDaet) {
        element = formDaet;
        nombreBase = "Entrega_DAET";
        // En DAET usamos Serial o Solicitud como identificador
        const inputSerial = document.getElementById('modal_fmoSerial');
        const inputSolicitud = document.getElementById('modal_solicitudDAET');
        
        if (inputSerial && inputSerial.value) identificador = inputSerial.value;
        else if (inputSolicitud && inputSolicitud.value) identificador = inputSolicitud.value;
        
        const inputFecha = document.getElementById('modal_fecha');
        if (inputFecha && inputFecha.value) fecha = inputFecha.value;
    }

    // --- 2. VALIDACIÓN ---
    if (!element) {
        alert("Error: No se detectó ningún formulario compatible para generar el PDF.");
        return;
    }

    // Limpieza de caracteres inválidos para nombre de archivo
    identificador = identificador.trim().replace(/[\/\\]/g, '-'); 
    fecha = fecha.trim().replace(/[\/\\]/g, '-');
    const nombreArchivo = `${nombreBase}_${identificador}_${fecha}.pdf`;

    // 3. Configuración de html2pdf
    const opciones = {
        margin:       3, // Margen en mm (ajustar si se corta)
        filename:     nombreArchivo,
        image:        { type: 'jpeg', quality: 0.98 }, // Calidad de imagen
        html2canvas:  { 
            scale: 2, // Mayor escala = Mejor calidad pero más peso
            useCORS: true, // Importante si hay imágenes externas
            logging: true,
            letterRendering: true
        },
        jsPDF:        { 
            unit: 'mm', 
            format: 'letter', // Tamaño Carta
            orientation: 'portrait' // Vertical
        }
    };

    // 4. Ejecutar la generación
    // El .save() descarga el archivo automáticamente
    html2pdf().set(opciones).from(element).save().catch(err => {
        console.error("Error al generar PDF:", err);
        alert("Ocurrió un error al generar el PDF.");
    });
}
/**
 * NUEVA LÓGICA ITERATIVA (Página por Página)
 * Soluciona el problema de PDF en blanco con muchos registros.
 */
async function generarPDFMasivo(datos, tipo) {
    // 1. Validar Templates
    let templateId = '';
    if (tipo === 'equipos') templateId = 'template-equipos-wrapper';
    else if (tipo === 'perifericos') templateId = 'template-perifericos-wrapper';
    else if (tipo === 'daet') templateId = 'template-daet-wrapper';

    const templateSource = document.getElementById(templateId);
    if (!templateSource || !templateSource.firstElementChild) {
        return alert("Error crítico: No se encontraron los templates HTML.");
    }

    // 2. Configurar jsPDF
    const { jsPDF } = window.jspdf; // Accedemos a la librería global
    const pdf = new jsPDF('p', 'mm', 'letter'); // Portrait, milímetros, Carta
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 3. Telón de Carga
    let telon = document.getElementById('pdf-loading-overlay');
    if (!telon) {
        telon = document.createElement('div');
        telon.id = 'pdf-loading-overlay';
        telon.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:white; z-index: 99999; display:flex; justify-content:center; align-items:center; flex-direction:column;";
        document.body.appendChild(telon);
    }
    const updateTelon = (msg) => {
        telon.innerHTML = `
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <h4 style="color:#333;">Generando PDF...</h4>
            <div style="color:#666;">${msg}</div>
        `;
    };
    updateTelon(`Iniciando... (0/${datos.length})`);
    telon.style.display = 'flex';

    // 4. Staging Area (Un solo contenedor visible)
    const stagingArea = document.getElementById('print-staging-area');
    stagingArea.innerHTML = '';
    
    // Lo posicionamos absoluto fuera de la vista pero VISIBLE al renderizador
    stagingArea.style.position = 'absolute';
    stagingArea.style.top = '0';
    stagingArea.style.left = '0'; // En pantalla (tapado por telón)
    stagingArea.style.width = '816px'; // Ancho fijo carta (aprox)
    stagingArea.style.zIndex = '10000'; // Debajo del telón (99999)
    stagingArea.style.background = '#ffffff';
    stagingArea.style.display = 'block';

    window.scrollTo(0,0); // Reset scroll

    try {
        // --- BUCLE PRINCIPAL ---
        for (let i = 0; i < datos.length; i++) {
            const registro = datos[i];
            
            // Actualizar mensaje de carga
            updateTelon(`Procesando registro ${i + 1} de ${datos.length}`);

            // A. Limpiar y Montar UN SOLO formulario
            stagingArea.innerHTML = ''; 
            const wrapper = document.createElement('div');
            // Usamos estilos simples inline para asegurar limpieza
            wrapper.style.padding = "10px";
            wrapper.style.background = "white";
            wrapper.style.width = "100%"; 

            const clone = templateSource.firstElementChild.cloneNode(true);
            clone.style.display = 'block';
            
            if (tipo === 'equipos') mapearDatosEquipos(clone, registro); 
            else if (tipo === 'perifericos') mapearDatosPerifericos(clone, registro);
            else if (tipo === 'daet') mapearDatosDaet(clone, registro);

            wrapper.appendChild(clone);
            stagingArea.appendChild(wrapper);

            // B. Espera técnica (necesaria para renderizado de fuentes/imágenes)
            await new Promise(r => setTimeout(r, 100)); // 100ms es suficiente por registro

            // C. Tomar foto (Canvas)
            const canvas = await html2canvas(stagingArea, {
                scale: 2, // Calidad alta
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: 816 // Forzar ancho
            });

            // D. Agregar al PDF
            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            // Calcular altura proporcional para que ajuste al ancho del PDF
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Si no es la primera página, añadir nueva
            if (i > 0) pdf.addPage();

            // Pegar imagen (Margen superior 0mm)
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
        }

        // 5. Guardar
        const fechaStr = new Date().toISOString().slice(0,10);
        pdf.save(`Reporte_${tipo}_${fechaStr}.pdf`);

    } catch (e) {
        console.error(e);
        alert("Error generando PDF: " + e.message);
    } finally {
        // 6. Restaurar
        stagingArea.innerHTML = '';
        stagingArea.style.display = 'none';
        telon.style.display = 'none';
    }
}