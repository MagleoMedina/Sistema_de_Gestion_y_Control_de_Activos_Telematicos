 function toggleFormato() {
            // Lógica simple por si quieres ocultar fechas en CSV
            const fmt = document.getElementById('selFormato').value;
            // Opcional: mostrar u ocultar inputs
        }

        async function procesarExportacion() {
            const tipo = document.getElementById('selTipo').value;
            const formato = document.getElementById('selFormato').value;
            const inicio = document.getElementById('fechaInicio').value;
            const fin = document.getElementById('fechaFin').value;

            if (formato === 'pdf') {
                if(!inicio || !fin) return alert("Seleccione el rango de fechas");
                
                // 1. Fetch a tu API de rango (Ajusta tus rutas)
                // Ej: /api/recibo-equipos/rango?inicio=...&fin=...
                let url = '';
                if(tipo === 'equipos') url = `http://127.0.0.1:8081/api/buscarReciboEquipos/rangoFechas/${inicio}/${fin}`;
                else if(tipo === 'perifericos') url = `http://127.0.0.1:8081/api/buscarReciboPerifericos/rangoFechas/${inicio}/${fin}`;
                else if(tipo === 'daet') url = `http://127.0.0.1:8081/api/buscarEntregasAlDaet/rangoFechas/${inicio}/${fin}`;

                try {
                    document.getElementById('statusArea').innerHTML = '<div class="alert alert-info">Cargando datos...</div>';
                    
                    const res = await fetch(url); 
                    const data = await res.json();
                    console.log(data);
                    
                    if(data.length === 0) {
                        document.getElementById('statusArea').innerHTML = '<div class="alert alert-warning">No hay registros en ese rango.</div>';
                        return;
                    }

                    // LLAMADA A LA NUEVA FUNCIÓN EN PDF.JS
                    document.getElementById('statusArea').innerHTML = '<div class="alert alert-warning">Generando PDF masivo, por favor espere...</div>';
                    
                    await generarPDFMasivo(data, tipo);
                    
                    document.getElementById('statusArea').innerHTML = '<div class="alert alert-success">PDF Generado.</div>';

                } catch (error) {
                    console.error(error);
                    alert("Error al exportar");
                }
            } else {
               // Como es una descarga directa de archivo, usamos window.location o un enlace oculto.
        // Asumiendo que quieres un reporte general unificado o dependiendo del tipo:
        if(!inicio || !fin) return alert("Seleccione el rango de fechas para el archivo CSV");

        let url = `http://127.0.0.1:8081/api/exportarCsv/${inicio}/${fin}`;
        
        // Si necesitas diferenciar tipos en el CSV, deberías mandar el tipo al backend también:
        // let url = `http://.../api/exportar/csv?tipo=${tipo}&inicio=${inicio}&fin=${fin}`;

        // Truco para descargar sin cambiar de página:
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', ''); // El nombre lo pone el backend (Content-Disposition)
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        document.getElementById('statusArea').innerHTML = '<div class="alert alert-success">Descarga CSV iniciada.</div>';
            }
        }