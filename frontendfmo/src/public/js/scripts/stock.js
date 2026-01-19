    // URL Base de tu API Spring Boot
    const API_URL = 'http://127.0.0.1:8081/api/stock';

    // Almacenes temporales para los selectores del modal
    let listaComponentesDB = [];
    let listaPerifericosDB = [];

    // --- 1. CARGA INICIAL ---
    document.addEventListener('DOMContentLoaded', async () => {
        await cargarCatalogos(); // Llenar las listas desplegables
        cargarStock();           // Llenar la tabla principal
    });

    // --- 2. CARGAR CATÁLOGOS (Para el Modal) ---
    async function cargarCatalogos() {
        try {
            // Hacemos las dos peticiones en paralelo para ser más rápidos
            const [resComp, resPeri] = await Promise.all([
                fetch(`${API_URL}/componentes`),
                fetch(`${API_URL}/perifericos`) // Asumiendo que creaste este endpoint similar al de componentes
            ]);

            if (resComp.ok) listaComponentesDB = await resComp.json();
            if (resPeri.ok) listaPerifericosDB = await resPeri.json();

            // Inicializar el select
            cargarListaItems();
        } catch (error) {
            console.error("Error cargando catálogos del sistema:", error);
            alert("Error de conexión al cargar listas de items.");
        }
    }

    // --- 3. LOGICA DEL MODAL (Dinámico) ---
    function abrirModalAgregar() {
        document.getElementById('formStock').reset();
        // Resetear selectores
        document.getElementById('selCategoria').value = "COMPONENTE";
        cargarListaItems();
        new bootstrap.Modal(document.getElementById('modalStock')).show();
    }

    // Llena el segundo select basado en la categoría elegida
    function cargarListaItems() {
        const categoria = document.getElementById('selCategoria').value;
        const select = document.getElementById('selReferencia');
        select.innerHTML = '<option value="">Seleccione...</option>';

        // Elegimos la lista correcta
        let datos = (categoria === 'COMPONENTE') ? listaComponentesDB : listaPerifericosDB;

        datos.forEach(item => {
            // --- FILTRO SOLICITADO ---
            // Si es componente, excluimos Windows y Canaima (Sistemas Operativos)
            if (categoria === 'COMPONENTE') {
                const nombreUpper = (item.nombre || "").toUpperCase();
                if (nombreUpper.includes("WINDOWS") || nombreUpper.includes("CANAIMA")) {
                    return; // No lo agregamos al select
                }
            }
            // -------------------------

            const opt = document.createElement('option');
            opt.value = item.id; // Este ID se enviará como 'idReferencia'
            opt.textContent = item.nombre;
            select.appendChild(opt);
        });
    }
    // --- 4. GUARDAR NUEVO STOCK (POST) ---
    async function guardarNuevoStock() {
        // Construimos el Payload igual al StockCreateDTO de Java
        const MINIMO_ALERTA = 5;
        const payload = {
            categoria: document.getElementById('selCategoria').value,
            idReferencia: parseInt(document.getElementById('selReferencia').value),
            marca: document.getElementById('inputMarca').value,
            caracteristicas: document.getElementById('inputModelo').value,
            cantidad: parseInt(document.getElementById('inputCantidad').value),
            minimoAlerta: MINIMO_ALERTA,
        }

        // Validaciones básicas
        if(!payload.idReferencia || !payload.marca || isNaN(payload.cantidad) || payload.cantidad < 0) {
            return alert("Por favor complete todos los campos correctamente.");
        }

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("✅ Item agregado al inventario exitosamente.");
                // Cerrar modal y recargar
                bootstrap.Modal.getInstance(document.getElementById('modalStock')).hide();
                cargarStock();
            } else {
                alert("❌ Error al guardar. Verifique los datos.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor.");
        }
    }

    // --- 5. CARGAR TABLA DE STOCK (GET) ---
    async function cargarStock() {
        const tbodyComp = document.getElementById('tablaComponentes');
        const tbodyPeri = document.getElementById('tablaPerifericos');

        // Limpieza visual antes de cargar
        tbodyComp.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';
        tbodyPeri.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';

        try {
            const res = await fetch(API_URL);
            if(!res.ok) throw new Error("Fallo al obtener stock");

            const data = await res.json(); // Array de StockDTO
            console.log(data);

            // Limpiar para llenar
            tbodyComp.innerHTML = '';
            tbodyPeri.innerHTML = '';

            let totalItems = 0;
            let totalCritico = 0;

            if (data.length === 0) {
                tbodyComp.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay stock registrado.</td></tr>';
                tbodyPeri.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay stock registrado.</td></tr>';
                actualizarResumen(0, 0);
                return;
            }

            data.forEach(item => {
                // Actualizar contadores
                totalItems += item.cantidad;
                if (item.estado === 'BAJO' || item.estado === 'AGOTADO') totalCritico++;

                // Generar HTML del estado
                let estadoHtml = '<span class="badge bg-success">En Stock</span>';
                if (item.estado === 'AGOTADO') estadoHtml = '<span class="badge bg-danger">Agotado</span>';
                else if (item.estado === 'BAJO') estadoHtml = '<span class="badge badge-low-stock">Stock Bajo</span>';

                // Fila de la tabla
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fw-bold text-primary">${item.nombreItem}</td>
                    <td>
                        <div class="fw-bold text-dark">${item.marca}</div>
                        <small class="text-muted">${item.caracteristicas}</small>
                    </td>
                    <td class="text-center">
                        <span class="fs-5 fw-bold ${item.cantidad === 0 ? 'text-danger' : 'text-dark'}">${item.cantidad}</span>
                    </td>
                    <td class="text-center">${estadoHtml}</td>
                    <td class="text-center">
                        <button class="btn btn-outline-danger btn-circle btn-sm me-1"
                                onclick="modificarStock(${item.id}, -1)"
                                ${item.cantidad === 0 ? 'disabled' : ''}
                                title="Retirar 1">
                            <i class="fas fa-minus">-</i>
                        </button>
                        <button class="btn btn-outline-success btn-circle btn-sm"
                                onclick="modificarStock(${item.id}, 1)"
                                title="Agregar 1">
                            <i class="fas fa-plus">+</i>
                        </button>
                    </td>
                `;

                // Distribuir en la pestaña correcta usando el campo 'categoria' del DTO
                if (item.categoria === 'COMPONENTE') {
                    tbodyComp.appendChild(tr);
                } else {
                    tbodyPeri.appendChild(tr);
                }
            });

            actualizarResumen(totalItems, totalCritico);

        } catch (error) {
            console.error(error);
            tbodyComp.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Error de conexión.</td></tr>';
            tbodyPeri.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Error de conexión.</td></tr>';
        }
    }

    // --- 6. MODIFICAR STOCK (Ajuste rápido) ---
    async function modificarStock(id, cantidad) {
        try {
            // Usamos el endpoint específico de ajuste
            const res = await fetch(`${API_URL}/${id}/ajustar?cantidad=${cantidad}`, {
                method: 'POST'
            });

            if (res.ok) {
                // Recargar la tabla silenciosamente para ver el cambio
                cargarStock();
            } else {
                alert("No se pudo actualizar el stock.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de red.");
        }
    }

    // --- Helper: Actualizar Tarjetas Superiores ---
    function actualizarResumen(total, critico) {
        // Animación simple de números
        document.getElementById('totalItems').innerText = total;
        document.getElementById('totalCritico').innerText = critico;
    }
