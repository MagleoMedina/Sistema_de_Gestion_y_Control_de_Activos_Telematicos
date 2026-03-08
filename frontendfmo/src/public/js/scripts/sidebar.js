document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle'); // El botón de ADENTRO
    const mobileToggleBtn = document.getElementById('mobileToggleBtn'); // NUEVO: El botón de AFUERA
    const overlay = document.getElementById('sidebarOverlay');
    
    // 1. Reactivar animaciones tras la carga
    setTimeout(() => {
        sidebar.classList.remove('no-transition');
    }, 50);

    // 2. Toggle Sidebar (Comportamiento Desktop vs Mobile)
    
    // Si tocan el botón flotante de AFUERA (Solo visible en móviles)
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', () => {
            sidebar.classList.add('mobile-open');
            if (overlay) overlay.classList.add('active');
        });
    }

    // Si tocan el botón de ADENTRO del menú
    toggleBtn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            // En móvil, este botón sirve para CERRAR el menú
            sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');
        } else {
            // Comportamiento normal en Computadora
            sidebar.classList.toggle('collapsed');
            const estadoActual = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebar-collapsed', estadoActual);

            if(estadoActual) {
                cerrarSubmenus(); 
            }
        }
    });

    // 2.1 Cerrar sidebar al hacer clic en el fondo oscuro (Solo Mobile)
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        });
    }

    // 3. Funciones de Auto-Expandir al hacer clic en secciones principales
    const btnRecibos = document.getElementById('btnGrupoRecibos');
    const btnCasos = document.getElementById('btnGrupoCasos'); 
    const btnPasantes = document.getElementById('btnGrupoPasantes'); // NUEVO: Botón de Pasantes
    const btnPerfil = document.getElementById('dropdownUser1');

    function expandirSidebarSiEstaContraido() {
        // Solo aplica en Desktop, en mobile siempre está expandido cuando se ve
        if (window.innerWidth > 768 && sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            localStorage.setItem('sidebar-collapsed', 'false');
        }
    }

    if(btnRecibos) btnRecibos.addEventListener('click', expandirSidebarSiEstaContraido);
    if(btnCasos) btnCasos.addEventListener('click', expandirSidebarSiEstaContraido);
    if(btnPasantes) btnPasantes.addEventListener('click', expandirSidebarSiEstaContraido);
    if(btnPerfil) btnPerfil.addEventListener('click', expandirSidebarSiEstaContraido);

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
    // 6. AUTO-COLAPSO (TIMER DE 5 SEGUNDOS)
    // =========================================================
    let collapseTimer;

    // Cuando el mouse entra al sidebar, cancelamos el timer
    sidebar.addEventListener('mouseenter', () => {
        if (collapseTimer) {
            clearTimeout(collapseTimer);
            collapseTimer = null;
        }
    });

    // Cuando el mouse sale, iniciamos la cuenta regresiva
    sidebar.addEventListener('mouseleave', () => {
        // Aseguramos que el auto-colapso solo ocurra en PC (pantallas grandes)
        if (window.innerWidth > 768 && !sidebar.classList.contains('collapsed')) {
            collapseTimer = setTimeout(() => {
                sidebar.classList.add('collapsed');
                localStorage.setItem('sidebar-collapsed', 'true');
                cerrarSubmenus(); 
            }, 5000); 
        }
    });
});

/**
 * Cierra todos los submenús (acordeones) abiertos.
 */
function cerrarSubmenus() {
    const submenus = document.querySelectorAll('.collapse.show'); 
    submenus.forEach(submenu => {
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
        
        // --- CAMBIO AQUÍ: Validación más estricta ---
        // Ahora exigimos que la URL sea EXACTAMENTE igual (currentPath === href)
        // O si usamos startsWith, nos aseguramos de que termine ahí o siga con un slash (ej. /casos/crear)
        if (href && href !== '#' && (currentPath === href || currentPath.startsWith(href + '/'))) {
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