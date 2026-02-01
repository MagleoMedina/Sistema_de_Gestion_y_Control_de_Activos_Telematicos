document.addEventListener('DOMContentLoaded', () => {
    // 1. Establecer fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('inputFecha').value = hoy;
    document.getElementById('lblFechaHoy').textContent = new Date().toLocaleDateString('es-VE');
});

// Función para limpiar campos
function limpiarFormulario() {
    document.getElementById('formCasos').reset();
    document.getElementById('inputFecha').value = new Date().toISOString().split('T')[0]; // Restaurar fecha
}

// Función Principal: Guardar
async function guardarCaso() {
    // 1. Captura de Datos
    const ficha = document.getElementById('inputFicha').value.trim();
    const nombre = document.getElementById('inputNombre').value.trim();
    const gerencia = document.getElementById('inputGerencia').value.trim();
    const fecha = document.getElementById('inputFecha').value;
    const atendidoPor = document.getElementById('selectTecnico').value;
    const reporte = document.getElementById('txtReporte').value.trim();

    // 2. Validación de Campos Vacíos
    if (!ficha || !nombre || !gerencia || !fecha || !atendidoPor || !reporte) {
        mostrarModal(
            "Campos Incompletos", 
            "Todos los campos marcados con asterisco (<span class='text-danger'>*</span>) son obligatorios para procesar el registro.", 
            "warning"
        );
        return;
    }

    // 3. Validación de Longitud de Ficha (Ejemplo FMO: 5-8 dígitos)
    if (isNaN(ficha)) {
        mostrarModal("Ficha Inválida", "La Ficha es solo numerica.", "warning");
        return;
    }

    // 4. Construcción del Payload
    // Nota: 'usuario' y 'extension' son requeridos por tu DTO de Backend,
    // los autocompletamos con defaults si no están en el formulario visual.
    const payload = {
        // Datos Usuario
        ficha: parseInt(ficha),
        nombre: nombre,
        gerencia: gerencia, 
        // Datos Caso
        fecha: fecha,
        atendidoPor: atendidoPor,
        reporte: reporte
    };

    // 5. Envío al Backend
    try {
        const response = await ApiService.fetchAutenticado('/casos/guardar', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            mostrarModal(
                `El caso para el trabajador <b>${nombre}</b> ha sido guardado correctamente en el sistema.`, 
                "success"
            );
            limpiarFormulario();
        } else {
            const errorMsg = await response.text();
            mostrarModal("Error en el Servidor", `No se pudo guardar el registro: <br> ${errorMsg}`, "error");
        }

    } catch (error) {
        console.error(error);
        mostrarModal("Error de Conexión", "Ocurrió un fallo al intentar contactar con el servidor.", "error");
    }
}b