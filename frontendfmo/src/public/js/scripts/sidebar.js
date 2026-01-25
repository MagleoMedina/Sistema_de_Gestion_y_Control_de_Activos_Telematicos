   document.addEventListener('DOMContentLoaded', () => {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebarToggle');
        
        setTimeout(() => {
            sidebar.classList.remove('no-transition');
        }, 50);

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const estadoActual = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebar-collapsed', estadoActual);

            if(estadoActual) {
                const submenu = document.getElementById('submenuRecibos');
                if(submenu.classList.contains('show')) {
                    new bootstrap.Collapse(submenu, { toggle: false }).hide();
                }
            }
        });

        const btnRecibos = document.querySelector('[data-bs-target="#submenuRecibos"]');
        if(btnRecibos){
            btnRecibos.addEventListener('click', () => {
                if (sidebar.classList.contains('collapsed')) {
                    sidebar.classList.remove('collapsed');
                    localStorage.setItem('sidebar-collapsed', 'false');
                }
            });
        }
    });

    // 4. NUEVO: Auto-Expandir al hacer clic en "Perfil"
        const btnPerfil = document.getElementById('dropdownUser1');
        if(btnPerfil){
            btnPerfil.addEventListener('click', () => {
                // Solo expandimos si ACTUALMENTE está colapsado
                if (sidebar.classList.contains('collapsed')) {
                    sidebar.classList.remove('collapsed');
                    localStorage.setItem('sidebar-collapsed', 'false');
                }
                // Si ya estaba expandido, no entra al IF y solo abre el dropdown (comportamiento normal)
            });
        }

const rolUsuario = ApiService.obtenerRol(); // Leemos el rol
       // Validamos si es ADMIN
        if (rolUsuario !== 'ADMIN') {
            // Si NO es admin, ocultamos todos los elementos con clase .admin-only
            document.querySelectorAll('.admin-only').forEach(el => {
                el.classList.add('d-none-role'); // O usar el.remove() para borrarlos del DOM
            });
        }
        // --- LÓGICA DE ROLES SIN PARPADEO ---
    if (typeof ApiService !== 'undefined') {
        const rolUsuario = ApiService.obtenerRol(); 
        
        // CAMBIO CLAVE: Solo si es ADMIN quitamos el 'display: none'
        if (rolUsuario === 'ADMIN') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'block'; // O el.classList.remove('admin-only') si prefieres
                // Nota: usamos style.display explícito para sobreescribir el !important del CSS
                el.style.setProperty('display', 'block', 'important');
            });
        }
    }
        // Opcional: Poner el nombre del usuario en el sidebar si viene en el token (campo "sub" usualmente)
        const token = sessionStorage.getItem('jwt_token');
        if(token) {
           const payload = JSON.parse(atob(token.split('.')[1]));
           document.getElementById('lblUsuarioSidebar').innerText = payload.sub || "Usuario";
        }

        // Restaurar estado del sidebar desde localStorage
            (function() {
            try {
                const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
                if (isCollapsed) {
                    document.getElementById('sidebar').classList.add('collapsed');
                }
            } catch (e) {}
        })();