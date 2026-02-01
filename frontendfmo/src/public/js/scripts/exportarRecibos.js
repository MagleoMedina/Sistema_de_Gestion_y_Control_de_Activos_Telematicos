// Variable global para guardar las opciones originales del select
let opcionesTipoOriginales = "";

document.addEventListener('DOMContentLoaded', () => {
    const selTipo = document.getElementById('selTipo');
    const selFormato = document.getElementById('selFormato');

    // 1. Guardar las opciones originales (Equipos, Periféricos, etc.) al cargar
    if (selTipo) {
        opcionesTipoOriginales = selTipo.innerHTML;
    }

    // 2. Inicializar el estado (por si el navegador recuerda valores al recargar)
    gestorInteraccion('init');
});

// FUNCIÓN CENTRAL DE CONTROL DE INTERFAZ
function gestorInteraccion(origen) {
    const selTipo = document.getElementById('selTipo');
    const selFormato = document.getElementById('selFormato');

    // --- CASO A: EL USUARIO CAMBIÓ EL TIPO DE REGISTRO ---
    if (origen === 'tipo') {
        if (selTipo.value === 'casos') {
            // Regla 1: "Atención al Usuario" fuerza CSV y bloquea el formato
            selFormato.value = 'csv';
            selFormato.disabled = true;
            selFormato.classList.add('input-disabled-fmo');
        } else {
            // Regla 2: Cualquier otro tipo fuerza PDF (reseteando el bloqueo de casos)
            selFormato.disabled = false;
            selFormato.classList.remove('input-disabled-fmo');
            selFormato.value = 'pdf'; 
        }
    }

    // --- CASO B: EL USUARIO CAMBIÓ EL FORMATO ---
    if (origen === 'formato') {
        if (selFormato.value === 'csv') {
            // Regla 3: Seleccionar CSV manual cambia Tipo a "Todos los recibos" y lo bloquea
            // (Solo si no estamos en modo 'casos', aunque el disabled lo previene)
            selTipo.innerHTML = '<option value="todo" selected>Todos los recibos</option>';
            selTipo.disabled = true;
        } else {
            // Regla 4: Volver a PDF restaura las opciones originales de Tipo
            if (selTipo.disabled) { 
                selTipo.disabled = false;
                selTipo.innerHTML = opcionesTipoOriginales;
                selTipo.value = 'equipos'; // Seleccionar el primero por defecto
            }
        }
    }

    // --- CASO C: INICIALIZACIÓN ---
    if (origen === 'init') {
        if (selTipo.value === 'casos') {
            gestorInteraccion('tipo');
        } else if (selFormato.value === 'csv') {
            gestorInteraccion('formato');
        }
    }
}

// FUNCIÓN DE PROCESAMIENTO
async function procesarExportacion() {
    const tipo = document.getElementById('selTipo').value;
    const formato = document.getElementById('selFormato').value;
    const inicio = document.getElementById('fechaInicio').value;
    const fin = document.getElementById('fechaFin').value;

    // VALIDACIONES
    if (!inicio || !fin) {
        mostrarModal('<strong>Fechas Incompletas</strong><br>Seleccione rango de fechas.', 'warning');
        return;
    }
    if (new Date(inicio) > new Date(fin)) {
        mostrarModal('<strong>Rango Inválido</strong><br>Inicio no puede ser mayor a Fin.', 'warning');
        return;
    }

    // 1. EXPORTACIÓN ESPECIAL: CASOS (Endpoint Específico)
    if (tipo === 'casos') {
        try {
            mostrarModal('<strong>Exportando Casos...</strong><br>Generando reporte CSV.', 'info', 2000);
            
            // Usamos el endpoint específico que creamos para Casos
            const url = `/casos/exportar-csv?inicio=${inicio}&fin=${fin}`;
            
            // Descarga vía Blob para soportar Auth headers si es necesario
            const response = await ApiService.fetchAutenticado(url);
            if (!response.ok) throw new Error("Error al descargar el archivo.");

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `Casos_${inicio}_al_${fin}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            mostrarModal('<strong>Éxito</strong><br>Reporte de atención descargado.', 'success');

        } catch (error) {
            console.error(error);
            mostrarModal('<strong>Error</strong><br>No se pudo descargar el reporte de casos.', 'error');
        }
        return;
    }

    // 2. EXPORTACIÓN GENÉRICA (Equipos, Periféricos, DAET o "Todo")
    
    // A. Formato PDF (Solo aplica si NO es 'todo', ya que 'todo' solo existe en CSV)
    if (formato === 'pdf') {
        let url = '';
        if(tipo === 'equipos') url = `/buscarReciboEquipos/rangoFechas/${inicio}/${fin}`;
        else if(tipo === 'perifericos') url = `/buscarReciboPerifericos/rangoFechas/${inicio}/${fin}`;
        else if(tipo === 'daet') url = `/buscarEntregasAlDaet/rangoFechas/${inicio}/${fin}`;

        try {
            mostrarModal('<strong>Generando PDF...</strong><br>Espere un momento.', 'info', 3000);
            
            const res = await ApiService.fetchAutenticado(url); 
            if (!res) return;

            const textoRespuesta = await res.text();
            let data;
            try { data = JSON.parse(textoRespuesta); } catch (e) {
                mostrarModal(`<strong>Aviso</strong><br>${textoRespuesta}`, 'warning');
                return;
            }

            if(!Array.isArray(data) || data.length === 0) {
                mostrarModal('<strong>Sin Resultados</strong><br>No hay registros en ese rango.', 'warning');
                return;
            }

            await generarPDFMasivo(data, tipo); 
            mostrarModal('<strong>¡PDF Generado!</strong>', 'success');

        } catch (error) {
            console.error(error);
            mostrarModal(`<strong>Error</strong><br>${error.message}`, 'error');
        }
    }
    // B. Formato CSV Genérico ("Todos los recibos")
    else {
        try {
            mostrarModal('<strong>Descargando CSV General...</strong>', 'info', 2000);
            
            // Endpoint genérico legado (asumiendo que existe para "Todo")
            const response = await ApiService.fetchAutenticado(`/exportarCsv/${inicio}/${fin}`);
            
            if (!response.ok) throw new Error("Error del servidor.");
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `Reporte_General_${inicio}_${fin}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            mostrarModal('<strong>Éxito</strong><br>CSV General Descargado.', 'success');
        } catch (error) {
            mostrarModal('<strong>Error</strong><br>Fallo en descarga CSV genérico.', 'error');
        }
    }
}