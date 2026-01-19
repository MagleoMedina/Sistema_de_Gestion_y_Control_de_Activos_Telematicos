
   // --- LÓGICA DE ESTATUS DEL SERVIDOR (Heartbeat Pasivo) ---
        
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

        /**
         * ESTRATEGIA: "Heartbeat Perezoso"
         * 1. Al cargar, asumimos ON (porque el servidor entregó la página).
         * 2. Solo verificamos si la conexión se pierde.
         * 3. Hacemos un ping ligero cada 60 segundos (muy bajo consumo).
         * 4. Verificamos también eventos del navegador (offline/online).
         */

        // 1. Check de API ligero (Endpoint que crearemos en backend)
        async function checkServerHealth() {
            try {
                // Timeout corto: si no responde en 3s, asumimos caído
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch('/health', { 
                    method: 'HEAD', // HEAD es más ligero que GET, solo pide cabeceras
                    signal: controller.signal 
                });
                clearTimeout(timeoutId);

                if (response.ok) setServerStatus(true);
                else setServerStatus(false);

            } catch (error) {
                console.error("Server check failed", error);
                setServerStatus(false);
            }
        }

        // 2. Intervalo largo (Cada 60 segundos)
        // Esto no satura la red pero te avisa si el servidor murió hace rato.
        setInterval(checkServerHealth, 5000);

        // 3. Eventos del Navegador (Instantáneo si se cae el cable de red)
        window.addEventListener('offline', () => setServerStatus(false));
        window.addEventListener('online', () => checkServerHealth()); // Al volver, verificamos con el server real

    // Ejecutar verificación inmediata al cargar para saber el estado real de Java
    document.addEventListener('DOMContentLoaded', checkServerHealth);