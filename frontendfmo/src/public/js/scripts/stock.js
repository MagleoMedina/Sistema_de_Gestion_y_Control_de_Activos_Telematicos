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
            const resComp = await ApiService.fetchAutenticado('/stock/componentes');
            const resPeri = await ApiService.fetchAutenticado('/stock/perifericos');

            if (resComp && resComp.ok) listaComponentesDB = await resComp.json();
            if (resPeri && resPeri.ok) listaPerifericosDB = await resPeri.json();

            // Inicializar el select
            cargarListaItems();
        } catch (error) {
            console.error("Error cargando catálogos del sistema:", error);
            // No alertamos aquí para no ser intrusivos al cargar
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

    function cargarListaItems() {
        const categoria = document.getElementById('selCategoria').value;
        const select = document.getElementById('selReferencia');
        select.innerHTML = '<option value="">Seleccione...</option>';

        let datos = (categoria === 'COMPONENTE') ? listaComponentesDB : listaPerifericosDB;

        datos.forEach(item => {
            if (categoria === 'COMPONENTE') {
                const nombreUpper = (item.nombre || "").toUpperCase();
                if (nombreUpper.includes("WINDOWS") || nombreUpper.includes("CANAIMA")) {
                    return; 
                }
            }
            const opt = document.createElement('option');
            opt.value = item.id; 
            opt.textContent = item.nombre;
            select.appendChild(opt);
        });
    }

    // --- 4. GUARDAR NUEVO STOCK (POST) ---
    async function guardarNuevoStock() {
        const MINIMO_ALERTA = 5;
        const payload = {
            categoria: document.getElementById('selCategoria').value,
            idReferencia: parseInt(document.getElementById('selReferencia').value),
            marca: document.getElementById('inputMarca').value,
            caracteristicas: document.getElementById('inputModelo').value,
            cantidad: parseInt(document.getElementById('inputCantidad').value),
            minimoAlerta: MINIMO_ALERTA,
        }

        if(!payload.idReferencia || !payload.marca || isNaN(payload.cantidad) || payload.cantidad < 0) {
            return alert("Por favor complete todos los campos correctamente.");
        }

        try {
            const res = await ApiService.fetchAutenticado('/stock', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res && res.ok) {
                alert("✅ Item agregado al inventario exitosamente.");
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

        tbodyComp.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';
        tbodyPeri.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';

        try {
            const res = await ApiService.fetchAutenticado('/stock');
            
            // Si el servidor responde 404 (No encontrado) o la lista está vacía
            if (!res || res.status === 404) {
                mostrarVacio(tbodyComp, tbodyPeri);
                return;
            }

            if(!res.ok) throw new Error("Fallo al obtener stock");

            const data = await res.json(); 

            tbodyComp.innerHTML = '';
            tbodyPeri.innerHTML = '';

            let totalItems = 0;
            let totalCritico = 0;

            if (!data || data.length === 0) {
                mostrarVacio(tbodyComp, tbodyPeri);
                actualizarResumen(0, 0);
                return;
            }

            data.forEach(item => {
                totalItems += item.cantidad;
                if (item.estado === 'BAJO' || item.estado === 'AGOTADO') totalCritico++;

                let estadoHtml = '<span class="badge bg-success">En Stock</span>';
                if (item.estado === 'AGOTADO') estadoHtml = '<span class="badge bg-danger">Agotado</span>';
                else if (item.estado === 'BAJO') estadoHtml = '<span class="badge badge-low-stock">Stock Bajo</span>';

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
                        <button class="btn btn-outline-success btn-circle btn-sm me-2"
                                onclick="modificarStock(${item.id}, 1)"
                                title="Agregar 1">
                            <i class="fas fa-plus">+</i>
                        </button>

                        <button class="btn btn-outline-danger btn-sm"
                                onclick="eliminarItemStock(${item.id})"
                                title="Eliminar registro permanentemente">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;

                if (item.categoria === 'COMPONENTE') {
                    tbodyComp.appendChild(tr);
                } else {
                    tbodyPeri.appendChild(tr);
                }
            });

            // Si después de filtrar no quedó nada en alguna tabla, mostrar mensaje
            if (tbodyComp.innerHTML === '') mostrarVacio(tbodyComp, null);
            if (tbodyPeri.innerHTML === '') mostrarVacio(null, tbodyPeri);

            actualizarResumen(totalItems, totalCritico);

        } catch (error) {
            console.error(error);
            // En caso de error de red, mostramos mensaje amigable en vez de error rojo
            mostrarVacio(tbodyComp, tbodyPeri);
        }
    }

    // --- 6. MODIFICAR STOCK (Ajuste rápido) ---
    async function modificarStock(id, cantidad) {
        try {
            const res = await ApiService.fetchAutenticado(`/stock/${id}/ajustar?cantidad=${cantidad}`, {
                method: 'POST'
            });

            if (res && res.ok) {
                cargarStock();
            } else {
                alert("No se pudo actualizar el stock.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de red.");
        }
    }

    // --- 7. NUEVO: ELIMINAR ITEM (DELETE) ---
    async function eliminarItemStock(id) {
        // Pedir confirmación al usuario
        const confirmacion = confirm("¿Estás seguro de que deseas eliminar este registro?\nEsta acción no se puede deshacer.");
        
        if (!confirmacion) return;

        try {
            // Llamada al endpoint DELETE /api/stock/{id}
            const res = await ApiService.fetchAutenticado(`/stock/${id}`, {
                method: 'DELETE'
            });

            if (res && res.ok) {
                alert("Registro eliminado correctamente.");
                cargarStock(); // Recargar la tabla para reflejar cambios
            } else {
                alert("No se pudo eliminar el registro. Intente nuevamente.");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error de conexión al intentar eliminar.");
        }
    }

    // --- Helper: Actualizar Tarjetas Superiores ---
    function actualizarResumen(total, critico) {
        const elTotal = document.getElementById('totalItems');
        const elCritico = document.getElementById('totalCritico');
        if(elTotal) elTotal.innerText = total;
        if(elCritico) elCritico.innerText = critico;
    }

    // --- Helper: Mostrar mensaje vacío ---
    function mostrarVacio(compBody, periBody) {
        const msg = '<tr><td colspan="5" class="text-center text-muted p-4">No se encontraron elementos</td></tr>';
        if (compBody) compBody.innerHTML = msg;
        if (periBody) periBody.innerHTML = msg;
    }