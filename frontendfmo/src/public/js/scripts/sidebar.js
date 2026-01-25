document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    // 1. Reactivar animaciones tras la carga
    setTimeout(() => {
        sidebar.classList.remove('no-transition');
    }, 50);

    // 2. Toggle Sidebar (Colapsar/Expandir)
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const estadoActual = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebar-collapsed', estadoActual);

        if(estadoActual) {
            // Cerrar submenú si se colapsa la barra
            const submenu = document.getElementById('submenuRecibos');
            if(submenu && submenu.classList.contains('show')) {
                new bootstrap.Collapse(submenu, { toggle: false }).hide();
            }
        }
    });

    // 3. Funciones de Auto-Expandir al hacer clic
    const btnRecibos = document.getElementById('btnGrupoRecibos');
    const btnPerfil = document.getElementById('dropdownUser1');

    if(btnRecibos) {
        btnRecibos.addEventListener('click', () => {
            if (sidebar.classList.contains('collapsed')) {
                sidebar.classList.remove('collapsed');
                localStorage.setItem('sidebar-collapsed', 'false');
            }
        });
    }
    if(btnPerfil){
        btnPerfil.addEventListener('click', () => {
            if (sidebar.classList.contains('collapsed')) {
                sidebar.classList.remove('collapsed');
                localStorage.setItem('sidebar-collapsed', 'false');
            }
        });
    }

    // 4. LÓGICA DE DATOS DE USUARIO (ROL Y NOMBRE)
    if (typeof ApiService !== 'undefined') {
        
        // A. Obtener Rol y Nombre
        // Nota: Asumimos que ApiService tiene estos métodos. Si no, usamos el fallback del token.
        const rolUsuario = ApiService.obtenerRol();
        let nombreUsuario = "Usuario";

        if (typeof ApiService.obtenerUsuario === 'function') {
            nombreUsuario = ApiService.obtenerUsuario();
        } else {
            // Fallback: Decodificar token manualmente si el método no existe en ApiService
            const token = sessionStorage.getItem('jwt_token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    nombreUsuario = payload.sub || payload.username || "Usuario";
                } catch (e) { console.error("Error leyendo token", e); }
            }
        }

        // B. Aplicar Nombre al Sidebar
        const lblUser = document.getElementById('lblUsuarioSidebar');
        if (lblUser && nombreUsuario) {
            lblUser.textContent = nombreUsuario;
        }

        // C. Aplicar Permisos de Admin
        if (rolUsuario === 'ADMIN') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.setProperty('display', 'block', 'important');
            });
        }
    }

    // 5. ACTIVACIÓN INTELIGENTE DEL MENÚ POR URL
    activarLinkPorUrl();
});

/**
 * Busca qué link coincide con la URL actual y lo activa.
 */
function activarLinkPorUrl() {
    const currentPath = window.location.pathname; 
    
    const links = document.querySelectorAll('#sidebar .nav-link');

    links.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href && href !== '#' && (currentPath === href || currentPath.startsWith(href))) {
            
            link.classList.add('active');

            // Abrir el acordeón si es necesario
            const parentCollapse = link.closest('.collapse');
            if (parentCollapse) {
                parentCollapse.classList.add('show');
                const toggleBtn = document.querySelector(`[data-bs-target="#${parentCollapse.id}"]`);
                if (toggleBtn) {
                    toggleBtn.classList.remove('collapsed');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                }
            }
        } else {
            link.classList.remove('active');
        }
    });
}