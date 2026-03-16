let fotosLote = []; // Almacenará todas las fotos acumuladas
let estructuraGlobal = []; // Almacena las Gerencias y sus Departamentos

async function getBackendUrl() {
    // Verificación segura para evitar que la página se rompa si BASE_URL no existe
    if (typeof BASE_URL !== 'undefined' && BASE_URL) return BASE_URL;
    const res = await fetch('/config/backend-url');
    const data = await res.json();
    window.BASE_URL = data.BACKEND_URL;
    return data.BACKEND_URL;
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Establecer fecha por defecto y analista en la cabecera
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('globalFecha').value = today;

    if (typeof ApiService !== 'undefined') {
        document.getElementById('globalAnalista').value = ApiService.obtenerUsuario() || "Analista FMO";
    }

    // 2. Cargar estructura organizativa desde el backend
    await cargarEstructura();

    // 3. Detectar cuando el usuario escriba la gerencia para cargar sus departamentos
    const inputGerencia = document.getElementById('globalGerencia');
    if (inputGerencia) {
        inputGerencia.addEventListener('input', (e) => {
            actualizarDatalistDepartamentos(e.target.value);
        });
    }
    
    // 4. Agregar la primera fila en blanco por defecto
    agregarFila();
});

// ==========================================
// CARGAR DATALISTS DINÁMICAMENTE
// ==========================================
async function cargarEstructura() {
    try {
        const token = sessionStorage.getItem('jwt_token');
        const BACKEND_URL = await getBackendUrl();
        
        // Hacemos un fetch directo para evitar errores de prefijos en ApiService
        // Si tu controlador usa "/api", cámbialo a `${BACKEND_URL}/api/estructura/gerencias`
        const res = await fetch(`${BACKEND_URL}/estructura/gerencias`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            estructuraGlobal = await res.json();
            const datalistG = document.getElementById('listaGerencias');
            datalistG.innerHTML = ''; 
            
            // Llenamos la lista de gerencias
            estructuraGlobal.forEach(g => {
                const option = document.createElement('option');
                option.value = g.nombre;
                datalistG.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error cargando estructura de gerencias:", error);
    }
}

function actualizarDatalistDepartamentos(nombreGerencia) {
    const datalistD = document.getElementById('listaDepartamentos');
    datalistD.innerHTML = ''; // Limpiamos los departamentos anteriores
    
    if(!nombreGerencia) return;

    // Buscamos la gerencia que el usuario acaba de escribir
    const gerenciaFiltro = estructuraGlobal.find(g => g.nombre.toLowerCase() === nombreGerencia.trim().toLowerCase());
    
    if (gerenciaFiltro && gerenciaFiltro.departamentos) {
        // Llenamos el datalist solo con los departamentos de ESA gerencia
        gerenciaFiltro.departamentos.forEach(d => {
            const option = document.createElement('option');
            option.value = d.nombre;
            datalistD.appendChild(option);
        });
    }
}

// ==========================================
// PREVISUALIZADOR DE MÚLTIPLES FOTOS
// ==========================================
function mostrarMiniaturas(input) {
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            fotosLote.push(file);
        });
        
        input.value = ''; 
        renderizarMiniaturas();
    }
}

function renderizarMiniaturas() {
    const container = document.getElementById('previewContainer');
    container.innerHTML = ''; 

    fotosLote.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const wrapper = document.createElement('div');
            wrapper.className = 'img-preview-wrapper';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.title = file.name;

            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0';
            btnEliminar.style = 'width: 22px; height: 22px; line-height: 1; border-radius: 50%; font-weight: bold; font-size: 12px; z-index: 10;';
            btnEliminar.innerHTML = '&times;';
            btnEliminar.onclick = (event) => {
                event.stopPropagation();
                eliminarFotoDeLote(index);
            };

            wrapper.appendChild(img);
            wrapper.appendChild(btnEliminar);
            container.appendChild(wrapper);
        }
        reader.readAsDataURL(file);
    });
}

function eliminarFotoDeLote(index) {
    fotosLote.splice(index, 1); 
    renderizarMiniaturas();     
}

// ==========================================
// GESTIÓN DE FILAS (TABLA DINÁMICA)
// ==========================================
function agregarFila() {
    const tbody = document.getElementById('tablaLote');
    const tr = document.createElement('tr');
    tr.className = 'fila-mantenimiento';

    tr.innerHTML = `
        <td class="col-num row-number text-muted">1</td>
        <td class="col-ficha"><input type="number" class="in-ficha" placeholder="Ej: 9900" required></td>
        <td class="col-usuario"><input type="text" class="in-usuario" placeholder="Nombre" required></td>
        <td class="col-depto"><input type="text" class="in-depto" list="listaDepartamentos" placeholder="Depto." required></td>
        <td class="col-fmo"><input type="text" class="in-fmo" placeholder="FMO / Serial" required></td>
        <td class="col-tipo">
            <select class="in-tipo">
                <option value="CPU">CPU</option>
                <option value="Impresora">Impresora</option>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Otro">Otro</option>
            </select>
        </td>
        <td class="col-marca"><input type="text" class="in-marca" list="listaMarcas" placeholder="Marca" required></td>
        <td class="col-modelo"><input type="text" class="in-modelo" list="listaModelos" placeholder="Modelo" required></td>
        <td class="col-so"><input type="text" class="in-so" placeholder="Ej: Win 10"></td>
        <td class="col-obs"><input type="text" class="in-obs" placeholder="Observaciones..."></td>
        <td class="col-accion">
            <button class="btn btn-sm btn-link text-danger w-100 h-100" onclick="eliminarFila(this)" title="Eliminar Fila">
                <i class="bi bi-x-circle-fill"></i>
            </button>
        </td>
    `;

    tbody.appendChild(tr);
    actualizarNumeros();

    // --- MAGIA: EVENTO PARA AUTOCOMPLETAR USUARIO POR FICHA ---
    const inputFicha = tr.querySelector('.in-ficha');
    const inputUsuario = tr.querySelector('.in-usuario');

    inputFicha.addEventListener('blur', async (e) => {
        const fichaVal = e.target.value.trim();
        if (!fichaVal) return;

        try {
            const token = sessionStorage.getItem('jwt_token');
            const BACKEND_URL = await getBackendUrl();
            
            // Llama al endpoint de consultar usuario por ficha
            const res = await fetch(`${BACKEND_URL}/usuarios/ficha/${fichaVal}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const usuarioDB = await res.json();
                if (usuarioDB && usuarioDB.nombre) {
                    // Autocompleta el nombre y hace un pequeño destello verde para confirmar
                    inputUsuario.value = usuarioDB.nombre;
                    inputUsuario.style.backgroundColor = '#e8f5e9'; 
                    setTimeout(() => inputUsuario.style.backgroundColor = 'transparent', 1500);
                }
            }
        } catch (error) {
            // Falla silenciosamente si no lo encuentra, permitiendo al analista escribir el nombre a mano
            console.log("Ficha nueva, proceda a escribir el nombre.");
        }
    });
}

function eliminarFila(btn) {
    const tr = btn.closest('tr');
    const tbody = document.getElementById('tablaLote');
    
    if (tbody.children.length > 1) {
        tr.remove();
        actualizarNumeros();
    } else {
        mostrarModal("No puedes eliminar la última fila. Si deseas, solo limpia sus datos.", "warning");
    }
}

function actualizarNumeros() {
    const filas = document.querySelectorAll('#tablaLote .fila-mantenimiento');
    filas.forEach((fila, index) => {
        fila.querySelector('.row-number').textContent = index + 1;
    });
}

// ==========================================
// PROCESAR LOTE COMPLETO (GUARDAR MÚLTIPLES)
// ==========================================
async function procesarLote() {
    const gerencia = document.getElementById('globalGerencia').value.trim();
    const fecha = document.getElementById('globalFecha').value;
    const analista = document.getElementById('globalAnalista').value;

    if (!gerencia) return mostrarModal("Debe especificar la Gerencia en la cabecera.", "warning");

    const filas = document.querySelectorAll('#tablaLote .fila-mantenimiento');
    let tareasPendientes = [];
    let errores = [];

    const primeraFilaFmo = filas[0].querySelector('.in-fmo').value.trim();
    if (!primeraFilaFmo) return mostrarModal("La planilla está vacía. Ingrese al menos un equipo.", "warning");

    mostrarModal(`<div class="spinner-border text-danger me-2"></div> Guardando lote, por favor espere...`, "info");

    const token = sessionStorage.getItem('jwt_token');
    const BACKEND_URL = await getBackendUrl();

    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        const fmo = fila.querySelector('.in-fmo').value.trim();
        const fichaStr = fila.querySelector('.in-ficha').value.trim();
        
        if (!fmo || !fichaStr) continue; 

        const datosEquipo = {
            ficha: parseInt(fichaStr),
            nombreUsuario: fila.querySelector('.in-usuario').value.trim(),
            gerencia: gerencia, 
            departamento: fila.querySelector('.in-depto').value.trim(),
            fmo: fmo,
            tipoDispositivo: fila.querySelector('.in-tipo').value,
            marca: fila.querySelector('.in-marca').value.trim(),
            modelo: fila.querySelector('.in-modelo').value.trim(),
            fecha: fecha, 
            analista: analista, 
            so: fila.querySelector('.in-so').value.trim() || "N/A",
            observaciones: fila.querySelector('.in-obs').value.trim()
        };

        const formData = new FormData();
        formData.append('datos', JSON.stringify(datosEquipo));

        if (fotosLote.length > 0) {
            for (let f = 0; f < fotosLote.length; f++) {
                formData.append('fotos', fotosLote[f]);
            }
        }

        // Importante: Asegúrate de usar la URL que corresponde a tu controlador (con o sin /api)
        const peticion = fetch(`${BACKEND_URL}/mantenimientos/registrar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // Sin Content-Type
            body: formData
        }).then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Equipo ${fmo}: ${text}`);
            }
        }).catch(err => {
            errores.push(err.message);
        });

        tareasPendientes.push(peticion);
    }

    await Promise.all(tareasPendientes);

    if (errores.length > 0) {
        mostrarModal(`
            <strong>Se guardó parcialmente con errores:</strong><br>
            <ul class="text-start mt-2" style="font-size:0.85rem;">
                ${errores.map(e => `<li>${e}</li>`).join('')}
            </ul>
        `, "error");
    } else {
        mostrarModal(`
            <strong>¡Planilla Guardada Exitosamente!</strong><br>
            Todos los equipos fueron registrados.
        `, "success");

        setTimeout(() => {
            document.getElementById('tablaLote').innerHTML = '';
            document.getElementById('inputFotos').value = '';
            fotosLote = []; 
            renderizarMiniaturas();
            agregarFila();
        }, 2000);
    }
}