document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    // 1. Reactivar animaciones tras la carga
    setTimeout(() => {
        sidebar.classList.remove('no-transition');
    }, 50);

    // 2. Toggle Sidebar (Colapsar/Expandir con el botón de hamburguesa)
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const estadoActual = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebar-collapsed', estadoActual);

        if(estadoActual) {
            cerrarSubmenus(); // Helper para limpiar submenús abiertos
        }
    });

    // 3. Funciones de Auto-Expandir al hacer clic en secciones principales
    const btnRecibos = document.getElementById('btnGrupoRecibos');
    const btnCasos = document.getElementById('btnGrupoCasos'); // <--- NUEVO: Botón de Atención Usuario
    const btnPerfil = document.getElementById('dropdownUser1');

    // A. Grupo Recibos
    if(btnRecibos) {
        btnRecibos.addEventListener('click', () => {
            expandirSidebarSiEstaContraido();
        });
    }

    // B. Grupo Casos (Atención Usuario) - NUEVA LÓGICA SOLICITADA
    if(btnCasos) {
        btnCasos.addEventListener('click', () => {
            expandirSidebarSiEstaContraido();
        });
    }

    // C. Perfil de Usuario
    if(btnPerfil){
        btnPerfil.addEventListener('click', () => {
            expandirSidebarSiEstaContraido();
        });
    }

    function expandirSidebarSiEstaContraido() {
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            localStorage.setItem('sidebar-collapsed', 'false');
        }
    }

    // 4. LÓGICA DE DATOS DE USUARIO (ROL Y NOMBRE)
    if (typeof ApiService !== 'undefined') {
        const rolUsuario = ApiService.obtenerRol();
        let nombreUsuario = "Usuario";

        if (typeof ApiService.obtenerUsuario === 'function') {
            nombreUsuario = ApiService.obtenerUsuario();
        } else {
            const token = sessionStorage.getItem('jwt_token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    nombreUsuario = payload.sub || payload.username || "Usuario";
                } catch (e) { console.error("Error leyendo token", e); }
            }
        }

        const lblUser = document.getElementById('lblUsuarioSidebar');
        if (lblUser && nombreUsuario) {
            lblUser.textContent = nombreUsuario;
        }

        if (rolUsuario === 'ADMIN') {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.setProperty('display', 'block', 'important');
            });
        }
    }

    // 5. ACTIVACIÓN INTELIGENTE DEL MENÚ POR URL
    activarLinkPorUrl();

    // =========================================================
    // 6. AUTO-COLAPSO (TIMER DE 5 SEGUNDOS) - NUEVA LÓGICA
    // =========================================================
    let collapseTimer;

    // Cuando el mouse entra al sidebar, cancelamos el timer (usuario interactuando)
    sidebar.addEventListener('mouseenter', () => {
        if (collapseTimer) {
            clearTimeout(collapseTimer);
            collapseTimer = null;
        }
    });

    // Cuando el mouse sale, iniciamos la cuenta regresiva
    sidebar.addEventListener('mouseleave', () => {
        // Solo iniciamos si NO está colapsado ya
        if (!sidebar.classList.contains('collapsed')) {
            collapseTimer = setTimeout(() => {
                // Acción tras 5 segundos
                sidebar.classList.add('collapsed');
                localStorage.setItem('sidebar-collapsed', 'true');
                cerrarSubmenus(); // Cerramos acordeones para limpieza visual
            }, 5000); // 5000 ms = 5 segundos
        }
    });
});

/**
 * Cierra todos los submenús (acordeones) abiertos.
 * Útil al colapsar el sidebar para que no queden abiertos internamente.
 */
function cerrarSubmenus() {
    const submenus = document.querySelectorAll('.collapse.show'); // Busca los abiertos
    submenus.forEach(submenu => {
        // Usamos la API de Bootstrap para cerrarlos limpiamente
        new bootstrap.Collapse(submenu, { toggle: false }).hide();
    });
}

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