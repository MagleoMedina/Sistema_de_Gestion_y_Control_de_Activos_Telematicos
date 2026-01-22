
     function mostrarNotificacion(titulo, mensaje, tipo) {
            const modalEl = document.getElementById('modalNotificacion');
            const header = document.getElementById('headerNotificacion');
            const tituloEl = document.getElementById('tituloNotificacion');
            const msgEl = document.getElementById('mensajeNotificacion');
            const iconoEl = document.getElementById('iconoNotificacion');

            // 1. Configurar Textos
            tituloEl.innerText = titulo;
            msgEl.innerText = mensaje;

            // 2. Configurar Estilos según el tipo
            header.className = 'modal-header text-white'; // Reset
            
            if (tipo === 'exito') {
                header.classList.add('bg-success');
                iconoEl.innerHTML = '✅'; 
            } else if (tipo === 'error') {
                header.classList.add('bg-danger');
                iconoEl.innerHTML = '❌'; 
            } else {
                header.classList.add('bg-primary');
                iconoEl.innerHTML = 'ℹ️'; 
            }

            // 3. Mostrar Modal
            new bootstrap.Modal(modalEl).show();
        }

        // --- LÓGICA PRINCIPAL ---

        document.addEventListener('DOMContentLoaded', () => {
    listarUsuarios();
});

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

        // Agregamos el parámetro 'index' al forEach para obtener la posición secuencial
        usuarios.forEach((u, index) => {
            const tr = document.createElement('tr');
            
            // Calculamos el ID visual (index + 1 para que empiece en 1)
            const idVisual = index + 1;

            tr.innerHTML = `
                <td class="fw-bold text-secondary">#${idVisual}</td>
                <td class="fw-bold text-primary">${u.username}</td>
                <td><span class="badge bg-info text-dark">${u.tipo}</span></td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${u.id}, '${u.username}')">
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

        // 2. CREAR
        async function guardarUsuario() {
            const username = document.getElementById('inputUsername').value;
            const clave = document.getElementById('inputClave').value;
            const tipo = document.getElementById('selectTipo').value;

            if(!username || !clave) {
                mostrarNotificacion("Datos Incompletos", "Por favor complete todos los campos.", "error");
                return;
            }

            const nuevoUsuario = { username, clave, tipo };

            try {
                const res = await ApiService.fetchAutenticado("/crearUsuarioSistema", {
                    method: 'POST',
                    body: JSON.stringify(nuevoUsuario)
                });

                if(res.ok) {
                    // Cerrar modal de registro primero
                    const modalRegistro = bootstrap.Modal.getInstance(document.getElementById('modalCrearUsuario'));
                    modalRegistro.hide();
                    
                    // Mostrar modal de éxito
                    mostrarNotificacion("¡Excelente!", "Usuario creado exitosamente.", "exito");
                    
                    document.getElementById('formUsuario').reset(); 
                    listarUsuarios(); 
                } else {
                    mostrarNotificacion("Error", "No se pudo crear. Verifique si el username ya existe.", "error");
                }
            } catch (error) {
                console.error(error);
                mostrarNotificacion("Error de Conexión", "No se pudo conectar con el servidor.", "error");
            }
        }

        // 3. ELIMINAR
        async function eliminarUsuario(id, nombre) {
            // Nota: Para reemplazar este confirm nativo también necesitaríamos otro modal de "Confirmación",
            // pero por ahora mantenemos el confirm nativo para la pregunta y usamos el modal para el resultado.
            if(!confirm(`¿Está seguro de eliminar al usuario ${nombre}?`)) return;

            try {
                const res = await ApiService.fetchAutenticado(`/usuarioSistema/borrar/${nombre}`, {
                    method: 'DELETE'
                });

                if(res.ok) {
                    listarUsuarios();
                    mostrarNotificacion("Eliminado", `El usuario ${nombre} ha sido eliminado.`, "exito");
                } else {
                    mostrarNotificacion("Error", "No se pudo eliminar el usuario.", "error");
                }
            } catch (error) {
                console.error(error);
                mostrarNotificacion("Error", "Ocurrió un error al intentar eliminar.", "error");
            }
        }