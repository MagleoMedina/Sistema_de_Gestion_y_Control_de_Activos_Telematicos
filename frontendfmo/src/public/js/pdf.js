/**
 * Función para generar el PDF del formulario de equipos.
 * Utiliza la librería html2pdf.js
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
        margin:       5, // Margen en mm (ajustar si se corta)
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