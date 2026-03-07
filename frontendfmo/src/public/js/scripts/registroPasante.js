document.addEventListener('DOMContentLoaded', () => {
    // Establecer fecha de inicio a hoy por defecto
    const today = new Date().toISOString().split('T')[0];
    const fechaInicioInput = document.getElementById('fechaInicio');
    if(fechaInicioInput) fechaInicioInput.value = today;
});

async function getBackendUrl() {
    if (BASE_URL) return BASE_URL;
    const res = await fetch('/config/backend-url');
    const data = await res.json();
    BASE_URL = data.BACKEND_URL;
    return BASE_URL;
}

// --- 1. Previsualización de Imagen ---
function mostrarPreview(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewFoto').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// --- 2. Mostrar nombre del PDF seleccionado ---
function mostrarNombreArchivo(input) {
    const lbl = document.getElementById('lblNombreInforme');
    if (input.files && input.files[0]) {
        lbl.innerText = input.files[0].name;
        lbl.classList.add('text-success', 'fw-bold');
        lbl.classList.remove('text-muted');
    } else {
        lbl.innerText = "Ningún archivo seleccionado";
        lbl.classList.remove('text-success', 'fw-bold');
        lbl.classList.add('text-muted');
    }
}

// --- 3. Guardar Pasante (FormData Multipart) ---
async function guardarPasante() {
    
    // Validaciones Básicas
    const ficha = document.getElementById('ficha').value;
    const nombre = document.getElementById('nombre').value;
    const cedula = document.getElementById('cedula').value; // NUEVO CAMPO
    const instituto = document.getElementById('instituto').value;

   // if (!ficha || !nombre || !cedula || !instituto) {
    //    mostrarModal("Por favor complete los campos obligatorios: Ficha, Cédula, Nombre e Instituto.", "warning");
    //    return;
    //}

    // A. Construir el Objeto JSON con los datos de texto
    const datosPasante = {
        ficha: parseInt(ficha),
        cedula: cedula, // Agregado al payload
        nombre: nombre,
        extension: document.getElementById('extension').value,
        gerencia: document.getElementById('gerencia').value,
        nombreInstituto: instituto,
        fechaInicio: document.getElementById('fechaInicio').value,
        fechaFinalizacion: document.getElementById('fechaFin').value,
        areaAsignada: document.getElementById('areaAsignada').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        tituloPretendido: document.getElementById('titulo').value
    };

    // B. Crear el FormData
    const formData = new FormData();

    // 1. Agregar el JSON como String (Clave: 'datos')
    // IMPORTANTE: Se envía como string y el backend lo convierte con ObjectMapper
    formData.append('datos', JSON.stringify(datosPasante));

    // 2. Agregar Archivos (si existen)
    const fotoInput = document.getElementById('inputFoto');
    if (fotoInput.files[0]) {
        formData.append('fotografia', fotoInput.files[0]);
    }

    const informeInput = document.getElementById('inputInforme');
    if (informeInput.files[0]) {
        formData.append('informe', informeInput.files[0]);
    }

    // C. Enviar al Backend
    try {
        // Nota: Al enviar FormData, NO debemos establecer 'Content-Type': 'application/json' manualmente.
        // El navegador lo hará automáticamente como 'multipart/form-data'.
        // Usamos ApiService.fetchAutenticado pero ajustamos para FormData.
        
        // Como ApiService suele poner headers JSON por defecto, hacemos un fetch directo pero 
        // obteniendo el token primero.
        const token = sessionStorage.getItem('jwt_token');

        const response = await fetch(await getBackendUrl() + '/registrarPasante', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // NO poner Content-Type, dejar que el navegador ponga el boundary
            },
            body: formData
        });

        if (response.ok) {
            mostrarModal(`
                <strong>¡Registro Exitoso!</strong><br>
                El pasante <b>${nombre}</b> ha sido registrado.<br>
                <small>Archivos subidos correctamente.</small>
            `, 'success');

            setTimeout(() => window.location.reload(), 2000);
        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }

    } catch (error) {
        console.error("Error:", error);
        mostrarModal(`
            <strong>Error al Registrar</strong><br>
            ${error.message}
        `, 'error');
    }
}