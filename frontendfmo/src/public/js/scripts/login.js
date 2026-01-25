document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Lógica de Estatus (Heartbeat) - SE MANTIENE TU CÓDIGO ACTUAL
    const statusContainer = document.getElementById('statusContainer');
    const statusText = document.getElementById('statusText');

    function setServerStatus(isOnline) {
        if (isOnline) {
            statusContainer.classList.remove('status-off');
            statusContainer.classList.add('status-on');
            statusText.innerText = "SERVIDOR: ONLINE";
        } else {
            statusContainer.classList.remove('status-on');
            statusContainer.classList.add('status-off');
            statusText.innerText = "SERVIDOR: OFFLINE";
        }
    }

    async function checkServerHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const response = await fetch('/health', { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) setServerStatus(true);
            else setServerStatus(false);
        } catch (error) {
            setServerStatus(false);
        }
    }

    setInterval(checkServerHealth, 5000);
    checkServerHealth(); // Ejecutar al inicio

    // =========================================================
    // 2. NUEVA LÓGICA DE LOGIN CON API.JS
    // =========================================================
    const loginForm = document.getElementById('loginForm');
    const btnLogin = document.getElementById('btnLogin');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evitar recarga de página

            // Feedback visual
            const originalText = btnLogin.innerText;
            btnLogin.innerText = "Autenticando...";
            btnLogin.disabled = true;

            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            try {
                // Llamamos a nuestro servicio centralizado
                const token = await ApiService.login(user, pass);

                if (token) {
                    // Guardar en SessionStorage (se borra al cerrar navegador)
                    sessionStorage.setItem('jwt_token', token);
                    
                    // Redirigir al Dashboard
                    window.location.href = '/dashboard';
                }

            } catch (error) {
                alert("❌ Error de acceso: " + error.message);
                console.error(error);
            } finally {
                // Restaurar botón
                btnLogin.innerText = originalText;
                btnLogin.disabled = false;
            }
        });
    }
});
    // =========================================================
    // 3. LÓGICA DE MOSTRAR/OCULTAR CONTRASEÑA
    // =========================================================
    const btnToggle = document.getElementById('btnTogglePassword');
    const inputPass = document.getElementById('password');
    const iconEye = document.getElementById('iconEye');

    if (btnToggle && inputPass && iconEye) {
        btnToggle.addEventListener('click', () => {
            // Verificar estado actual
            const tipoActual = inputPass.getAttribute('type');
            
            if (tipoActual === 'password') {
                // CAMBIAR A TEXTO VISIBLE
                inputPass.setAttribute('type', 'text');
                
                // Cambiar icono a "Ojo Tachado" (Eye Slash)
                iconEye.classList.remove('bi-eye-fill');
                iconEye.classList.add('bi-eye-slash-fill');
            } else {
                // CAMBIAR A PASSWORD OCULTO
                inputPass.setAttribute('type', 'password');
                
                // Cambiar icono a "Ojo Normal"
                iconEye.classList.remove('bi-eye-slash-fill');
                iconEye.classList.add('bi-eye-fill');
            }
        });
    }