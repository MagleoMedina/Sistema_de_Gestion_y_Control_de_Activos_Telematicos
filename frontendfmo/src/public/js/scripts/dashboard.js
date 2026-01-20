document.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticas();
});

async function cargarEstadisticas() {
    // Animación de carga inicial (opcional)
    const elementos = ['numEquipos', 'numPerifericos', 'numDaet', 'numPendientes'];
    elementos.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = '-';
    });

    try {
        // --- 1. Equipos ---
        // Usamos endpoint relativo porque ApiService ya tiene la BASE_URL
        const resEquipos = await ApiService.fetchAutenticado('/contador/reciboDeEquipos');
        if (resEquipos) {
            const dataEquipos = await resEquipos.json();
            animarNumero('numEquipos', dataEquipos);
        }

        // --- 2. Periféricos ---
        const resPeri = await ApiService.fetchAutenticado('/contador/reciboDePerifericos');
        if (resPeri) {
            const dataPeri = await resPeri.json();
            animarNumero('numPerifericos', dataPeri);
        }

        // --- 3. DAET ---
        const resDaet = await ApiService.fetchAutenticado('/contador/entregasAlDaet');
        if (resDaet) {
            const dataDaet = await resDaet.json();
            animarNumero('numDaet', dataDaet);
        }

        // --- 4. Pendientes ---
        const resPend = await ApiService.fetchAutenticado('/contador/pendientes');
        if (resPend) {
            const dataPend = await resPend.json();
            animarNumero('numPendientes', dataPend);
        }

    } catch (error) {
        console.error("Error cargando estadísticas:", error);
        // Si falla, ponemos 0
        elementos.forEach(id => {
            const el = document.getElementById(id);
            if(el && el.innerText === '-') el.innerText = '0';
        });
    }
}

// Función para animar el conteo (Efecto visual de 0 a N) - SE MANTIENE IGUAL
function animarNumero(idElemento, valorFinal) {
    const elemento = document.getElementById(idElemento);
    if (!elemento) return;

    const valor = parseInt(valorFinal) || 0;
    let inicio = 0;
    const duracion = 1000; // 1 segundo
    
    // Evitar división por cero si la duración es muy corta o valor es pequeño
    const pasos = duracion / 16; // Aprox 60 FPS
    const incremento = Math.ceil(valor / pasos); 

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