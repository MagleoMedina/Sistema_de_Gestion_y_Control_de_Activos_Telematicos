// Variable global para guardar las opciones originales
let opcionesTipoOriginales = "";

document.addEventListener('DOMContentLoaded', () => {
    const selTipo = document.getElementById('selTipo');
    if (selTipo) {
        opcionesTipoOriginales = selTipo.innerHTML;
    }
    toggleFormato();
});

function toggleFormato() {
    const formato = document.getElementById('selFormato').value;
    const selTipo = document.getElementById('selTipo');

    if (formato === 'csv') {
        selTipo.innerHTML = '<option value="todo" selected>Todo</option>';
        selTipo.disabled = true;
    } else {
        selTipo.disabled = false;
        if (opcionesTipoOriginales) {
            selTipo.innerHTML = opcionesTipoOriginales;
        }
    }
}

async function procesarExportacion() {
    const tipo = document.getElementById('selTipo').value;
    const formato = document.getElementById('selFormato').value;
    const inicio = document.getElementById('fechaInicio').value;
    const fin = document.getElementById('fechaFin').value;

    // 1. VALIDACIÓN DE CAMPOS VACÍOS
    if (!inicio || !fin) {
        mostrarModal(`
            <strong>Fechas Incompletas</strong><br>
            Debe seleccionar una fecha de inicio y una fecha de fin.
        `, 'warning');
        return;
    }

    // 2. NUEVA VALIDACIÓN: RANGO LÓGICO
    if (new Date(inicio) > new Date(fin)) {
        mostrarModal(`
            <strong>Rango Inválido</strong><br>
            La fecha de inicio (${inicio}) no puede ser mayor a la fecha de fin (${fin}).<br>
            <small>Por favor corrija el rango seleccionado.</small>
        `, 'warning');
        return;
    }

    // Limpiamos el área de estado
    const statusArea = document.getElementById('statusArea');
    if(statusArea) statusArea.innerHTML = ''; 

    // ======================================================
    // CASO 1: EXPORTAR A PDF (Lógica Frontend)
    // ======================================================
    if (formato === 'pdf') {
        let url = '';
        if(tipo === 'equipos') url = `/buscarReciboEquipos/rangoFechas/${inicio}/${fin}`;
        else if(tipo === 'perifericos') url = `/buscarReciboPerifericos/rangoFechas/${inicio}/${fin}`;
        else if(tipo === 'daet') url = `/buscarEntregasAlDaet/rangoFechas/${inicio}/${fin}`;

        try {
            mostrarModal(`
                <strong>Procesando...</strong><br>
                Buscando registros y generando PDF. Esto puede tardar unos segundos.
            `, 'info', 3000);
            
            const res = await ApiService.fetchAutenticado(url); 
            if (!res) return;

            // --- CORRECCIÓN AQUÍ ---
            // 1. Leemos la respuesta cruda como texto primero
            const textoRespuesta = await res.text();
            let data;

            try {
                // 2. Intentamos convertir ese texto a JSON
                data = JSON.parse(textoRespuesta);
            } catch (e) {
                // 3. Si falla, es porque el servidor envió un mensaje de texto plano (ej: "No se encontraron...")
                // Mostramos ese mensaje como advertencia y detenemos.
                mostrarModal(`
                    <strong>Aviso del Servidor</strong><br>
                    ${textoRespuesta}
                `, 'warning');
                return;
            }

            // 4. Si llegamos aquí, es JSON válido. Verificamos si está vacío.
            if(!Array.isArray(data) || data.length === 0) {
                mostrarModal(`
                    <strong>Sin Resultados</strong><br>
                    No se encontraron registros en el rango seleccionado.
                `, 'warning');
                return;
            }

            // 5. Generar PDF
            await generarPDFMasivo(data, tipo); 
            
            mostrarModal(`
                <strong>¡PDF Generado!</strong><br>
                El archivo se ha descargado correctamente.
            `, 'success');

        } catch (error) {
            console.error(error);
            mostrarModal(`
                <strong>Error al Generar PDF</strong><br>
                ${error.message}
            `, 'error');
        }
    }
    // ======================================================
    // CASO 2: EXPORTAR A CSV
    // ======================================================
    else {
        try {
            mostrarModal(`
                <strong>Conectando...</strong><br>
                Solicitando archivo CSV al servidor.
            `, 'info', 2000);

            const response = await ApiService.fetchAutenticado(`/exportarCsv/${inicio}/${fin}`);

            if (!response) return; 
            if (!response.ok) throw new Error("Error generando el archivo en el servidor.");

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            
            const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = `Reporte_${inicio}_al_${fin}.csv`;
            if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
                fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
            }
            
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            mostrarModal(`
                <strong>¡Exportación Exitosa!</strong><br>
                El archivo CSV se ha descargado a su equipo.
            `, 'success');

        } catch (error) {
            console.error("Error descarga CSV:", error);
            mostrarModal(`
                <strong>Fallo en Descarga</strong><br>
                No se pudo descargar el archivo CSV. Verifique la conexión.
            `, 'error');
        }
    }
}