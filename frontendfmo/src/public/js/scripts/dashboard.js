document.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticas();
});

async function cargarEstadisticas() {
    // Animación de carga inicial (placeholder)
    const elementos = ['numEquipos', 'numPerifericos', 'numDaet', 'numCasos', 'numPendientes'];
    elementos.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = '-';
    });

    try {
        // --- 1. Equipos ---
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

        // --- 4. NUEVO: Casos Resueltos ---
        const resCasos = await ApiService.fetchAutenticado('/contador/casosResueltos');
        if (resCasos) {
            const dataCasos = await resCasos.json();
            animarNumero('numCasos', dataCasos);
        }

        // --- 5. Pendientes ---
        const resPend = await ApiService.fetchAutenticado('/contador/pendientes');
        if (resPend) {
            const dataPend = await resPend.json();
            animarNumero('numPendientes', dataPend);
        }

    } catch (error) {
        console.error("Error cargando estadísticas:", error);
        // Si falla, ponemos 0 a todo
        elementos.forEach(id => {
            const el = document.getElementById(id);
            if(el && el.innerText === '-') el.innerText = '0';
        });
    }
}

// Función para animar el conteo
function animarNumero(idElemento, valorFinal) {
    const elemento = document.getElementById(idElemento);
    if (!elemento) return;

    const valor = parseInt(valorFinal) || 0;
    let inicio = 0;
    const duracion = 1000; 
    
    const pasos = duracion / 16; 
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