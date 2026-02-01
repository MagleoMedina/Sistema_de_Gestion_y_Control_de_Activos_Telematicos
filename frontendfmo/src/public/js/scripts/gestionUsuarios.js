document.addEventListener('DOMContentLoaded', () => {
    listarUsuarios();
});

// VARIABLES GLOBALES PARA LA ELIMINACIÓN
let usuarioIdParaBorrar = null;
let usuarioNombreParaBorrar = '';

// 1. LISTAR USUARIOS
async function listarUsuarios() {
    const tbody = document.getElementById('tablaUsuarios');
    try {
        const res = await ApiService.fetchAutenticado('/usuarioSistema');
        if(!res.ok) throw new Error("Error al obtener usuarios");
        const usuarios = await res.json();

        tbody.innerHTML = '';
        if(usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No hay usuarios registrados.</td></tr>';
            return;
        }

        usuarios.forEach((u, index) => {
            const tr = document.createElement('tr');
            const idVisual = index + 1;

            tr.innerHTML = `
                <td class="fw-bold text-secondary">#${idVisual}</td>
                <td class="fw-bold text-primary">${u.username}</td>
                <td><span class="badge bg-info text-dark">${u.tipo}</span></td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="solicitarEliminacion(${u.id}, '${u.username}')">
                        <i class="bi bi-trash3-fill" style="vertical-align: bottom;"></i>
                         Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-danger">Error de conexión con el servidor.</td></tr>`;
    }
}

// 2. CREAR USUARIO (CON VALIDACIÓN 400)
async function guardarUsuario() {
    const username = document.getElementById('inputUsername').value.trim();
    const clave = document.getElementById('inputClave').value.trim();
    const tipo = document.getElementById('selectTipo').value;

    // --- VALIDACIÓN DE CAMPOS VACÍOS ---
    if(!username || !clave) {
        mostrarModal(`
            <strong>Datos Incompletos</strong><br>
            El nombre de usuario y la contraseña son obligatorios.
        `, 'warning');
        return;
    }

    // --- NUEVA VALIDACIÓN: RESTRICCIÓN DE "/" ---
    if (username.includes('/')) {
        mostrarModal(`
            <strong>Carácter no permitido</strong><br>
            El nombre de usuario no puede contener barras diagonales (<b>/</b>).
        `, 'warning');
        return; // Detenemos la ejecución
    }

    const nuevoUsuario = { username, clave, tipo };

    try {
        const res = await ApiService.fetchAutenticado("/crearUsuarioSistema", {
            method: 'POST',
            body: JSON.stringify(nuevoUsuario)
        });

        // --- VALIDACIÓN ESPECÍFICA ERROR 400 ---
        if (res.status === 400) {
            mostrarModal(`
                <strong>Usuario Duplicado</strong><br>
                El nombre de usuario <b>"${username}"</b> ya se encuentra registrado en el sistema.<br>
                <small>Intente con otro nombre.</small>
            `, 'error');
            return; 
        }

        if(res.ok) {
            const modalRegistro = bootstrap.Modal.getInstance(document.getElementById('modalCrearUsuario'));
            modalRegistro.hide();
            
            mostrarModal(`
                <strong>¡Usuario Registrado!</strong><br>
                El usuario <b>${username}</b> (${tipo}) ha sido creado exitosamente.
            `, 'success');
            
            document.getElementById('formUsuario').reset(); 
            listarUsuarios(); 

        } else {
            const errorText = await res.text();
            mostrarModal(`
                <strong>Error al Guardar</strong><br>
                Ocurrió un problema inesperado.<br>
                <small>${errorText}</small>
            `, 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarModal(`
            <strong>Error de Conexión</strong><br>
            ${error.message}
        `, 'error');
    }
}

// 3. PASO A: SOLICITAR ELIMINACIÓN (ABRIR MODAL)
// Esta función se llama desde el botón de la tabla
function solicitarEliminacion(id, nombre) {
    // Guardamos los datos en variables globales
    usuarioIdParaBorrar = id;
    usuarioNombreParaBorrar = nombre;

    // Actualizamos el texto del modal
    document.getElementById('lblUsuarioEliminar').textContent = nombre;

    // Abrimos el modal de confirmación
    const modalEl = document.getElementById('modalConfirmarEliminacion');
    new bootstrap.Modal(modalEl).show();
}

// 3. PASO B: EJECUTAR ELIMINACIÓN (CLICK EN "SÍ")
async function ejecutarEliminacion() {
    // Cerramos el modal de confirmación
    const modalEl = document.getElementById('modalConfirmarEliminacion');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

    if (!usuarioNombreParaBorrar) return;

    try {
        const res = await ApiService.fetchAutenticado(`/usuarioSistema/borrar/${usuarioNombreParaBorrar}`, {
            method: 'DELETE'
        });

        if(res.ok) {
            listarUsuarios();
            mostrarModal(`
                <strong>Usuario Eliminado</strong><br>
                El usuario <b>${usuarioNombreParaBorrar}</b> ha sido borrado del sistema correctamente.
            `, 'success');
        } else {
            mostrarModal(`
                <strong>Error al Eliminar</strong><br>
                No se pudo eliminar el registro.
            `, 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarModal(`
            <strong>Error de Servidor</strong><br>
            ${error.message}
        `, 'error');
    } finally {
        // Limpiamos variables
        usuarioIdParaBorrar = null;
        usuarioNombreParaBorrar = '';
    }
}