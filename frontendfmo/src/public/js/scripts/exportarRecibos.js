// Variable global para guardar las opciones originales (Equipos, Periféricos, DAET)
let opcionesTipoOriginales = "";

document.addEventListener('DOMContentLoaded', () => {
    const selTipo = document.getElementById('selTipo');
    // 1. Guardamos el HTML original de las opciones al cargar la página
    if (selTipo) {
        opcionesTipoOriginales = selTipo.innerHTML;
    }
    // 2. Ejecutamos la validación inicial por si el navegador recordó la selección anterior
    toggleFormato();
});

function toggleFormato() {
    const formato = document.getElementById('selFormato').value;
    const selTipo = document.getElementById('selTipo');

    if (formato === 'csv') {
        // --- CASO CSV: Bloquear y poner "Todo" ---
        
        // 1. Cambiar el contenido a una única opción "Todo"
        selTipo.innerHTML = '<option value="todo" selected>Todo</option>';
        
        // 2. Deshabilitar el input (esto aplica opacidad automáticamente en Bootstrap)
        selTipo.disabled = true;

    } else {
        // --- CASO PDF: Restaurar opciones originales ---
        
        // 1. Habilitar nuevamente
        selTipo.disabled = false;
        
        // 2. Restaurar las opciones que guardamos al inicio
        if (opcionesTipoOriginales) {
            selTipo.innerHTML = opcionesTipoOriginales;
        }
    }
}

async function procesarExportacion() {
    // Nota: Aunque el select esté deshabilitado, podemos leer su valor.
    // Para CSV valdrá "todo", para PDF valdrá lo que el usuario elija.
    const tipo = document.getElementById('selTipo').value;
    const formato = document.getElementById('selFormato').value;
    const inicio = document.getElementById('fechaInicio').value;
    const fin = document.getElementById('fechaFin').value;

    if (!inicio || !fin) return alert("Seleccione el rango de fechas completo.");

    // ======================================================
    // CASO 1: EXPORTAR A PDF (Lógica Frontend)
    // ======================================================
    if (formato === 'pdf') {
        let url = '';
        if(tipo === 'equipos') url = `/buscarReciboEquipos/rangoFechas/${inicio}/${fin}`;
        else if(tipo === 'perifericos') url = `/buscarReciboPerifericos/rangoFechas/${inicio}/${fin}`;
        else if(tipo === 'daet') url = `/buscarEntregasAlDaet/rangoFechas/${inicio}/${fin}`;

        try {
            document.getElementById('statusArea').innerHTML = '<div class="alert alert-info">Cargando datos...</div>';
            
            const res = await ApiService.fetchAutenticado(url); 
            // Si el token falló, ApiService ya redirigió
            if (!res) return;

            const data = await res.json();
            
            if(data.length === 0) {
                document.getElementById('statusArea').innerHTML = '<div class="alert alert-warning">No hay registros en ese rango.</div>';
                return;
            }

            document.getElementById('statusArea').innerHTML = '<div class="alert alert-warning">Generando PDF masivo, por favor espere...</div>';
            
            await generarPDFMasivo(data, tipo); // Tu función existente
            
            document.getElementById('statusArea').innerHTML = '<div class="alert alert-success">PDF Generado correctamente.</div>';

        } catch (error) {
            console.error(error);
            document.getElementById('statusArea').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        }
    } 
    // ======================================================
    // CASO 2: EXPORTAR A CSV (Lógica Backend)
    // ======================================================
    else {
        try {
            document.getElementById('statusArea').innerHTML = '<div class="alert alert-info">Descargando CSV del servidor...</div>';

            // 1. Usamos fetchAutenticado para ir al Backend (puerto 8081) enviando el TOKEN
            // Nota: La URL es relativa (/exportarCsv), ApiService le pone la base http://...:8081/api
            const response = await ApiService.fetchAutenticado(`/exportarCsv/${inicio}/${fin}`);

            if (!response) return; // Error de token

            if (!response.ok) throw new Error("Error generando el archivo en el servidor.");

            // 2. Convertimos la respuesta a BLOB (Binary Large Object)
            const blob = await response.blob();

            // 3. Creamos una URL temporal en el navegador para ese blob
            const downloadUrl = window.URL.createObjectURL(blob);

            // 4. Creamos un enlace invisible y lo clicamos programáticamente
            const a = document.createElement('a');
            a.href = downloadUrl;
            
            // Intentamos obtener el nombre del archivo del header o generamos uno
            const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = `Reporte_${inicio}_al_${fin}.csv`;
            if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
                fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
            }
            
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            
            // 5. Limpieza
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            document.getElementById('statusArea').innerHTML = '<div class="alert alert-success">Descarga CSV completada.</div>';

        } catch (error) {
            console.error("Error descarga CSV:", error);
            document.getElementById('statusArea').innerHTML = '<div class="alert alert-danger">Error al descargar CSV. Verifique la conexión.</div>';
        }
    }
}