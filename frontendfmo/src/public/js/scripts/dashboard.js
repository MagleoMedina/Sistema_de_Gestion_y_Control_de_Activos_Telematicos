    // Lógica para cargar los números desde el Backend
        document.addEventListener('DOMContentLoaded', () => {
            cargarEstadisticas();
        });

        async function cargarEstadisticas() {
            // Animación de carga inicial (opcional)
            const elementos = ['numEquipos', 'numPerifericos', 'numDaet', 'numPendientes'];
            elementos.forEach(id => document.getElementById(id).innerText = '-');

            try {
                // AQUÍ SE CONSUMEN TUS ENDPOINTS
                // Asumimos que tienes un controlador en Spring Boot que devuelve estos números
                // Puedes hacer 1 llamada que devuelva todo el objeto o 4 llamadas separadas.
                // Ejemplo con 4 llamadas separadas:

                // 1. Equipos
                const resEquipos = await fetch('http://127.0.0.1:8081/api/contador/reciboDeEquipos');
                const dataEquipos = await resEquipos.json(); // Se asume devuelve un entero, ej: 45
                animarNumero('numEquipos', dataEquipos);

                // 2. Periféricos
                const resPeri = await fetch('http://127.0.0.1:8081/api/contador/reciboDePerifericos');
                const dataPeri = await resPeri.json();
                animarNumero('numPerifericos', dataPeri);

                // 3. DAET
                const resDaet = await fetch('http://127.0.0.1:8081/api/contador/entregasAlDaet');
                const dataDaet = await resDaet.json();
                console.log(dataDaet);
                animarNumero('numDaet', dataDaet);

                // 4. Pendientes
                const resPend = await fetch('http://127.0.0.1:8081/api/contador/pendientes');
                const dataPend = await resPend.json();
                animarNumero('numPendientes', dataPend);

            } catch (error) {
                console.error("Error cargando estadísticas:", error);
                // Si falla, ponemos 0 o un mensaje de error
                elementos.forEach(id => {
                    if(document.getElementById(id).innerText === '-') document.getElementById(id).innerText = '0';
                });
            }
        }

        // Función para animar el conteo (Efecto visual de 0 a N)
        function animarNumero(idElemento, valorFinal) {
            const elemento = document.getElementById(idElemento);
            const valor = parseInt(valorFinal) || 0;
            let inicio = 0;
            const duracion = 1000; // 1 segundo
            const incremento = Math.ceil(valor / (duracion / 16)); // 60 FPS

            if (valor === 0) {
                elemento.innerText = 0;
                return;
            }

            const timer = setInterval(() => {
                inicio += incremento;
                if (inicio >= valor) {
                    elemento.innerText = valor;
                    clearInterval(timer);
                } else {
                    elemento.innerText = inicio;
                }
            }, 16);
        }