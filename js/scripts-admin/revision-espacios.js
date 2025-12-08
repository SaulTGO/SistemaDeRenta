// ============================================
// MAPEO DE ESTADOS
// ============================================

/**
 * Mapeo de códigos numéricos a estados
 */
const ESTADOS = {
    1: { texto: 'OCUPADO', clase: 'estado-ocupado' },
    2: { texto: 'DISPONIBLE', clase: 'estado-disponible' },
    3: { texto: 'ASEADO', clase: 'estado-aseado' },
    4: { texto: 'ASEO PENDIENTE', clase: 'estado-pendiente-aseo' }
};

/**
 * Obtiene la información del estado según el código
 * @param {number|string} codigo - Código numérico del estado
 * @returns {object} Objeto con texto y clase CSS del estado
 */
function obtenerEstado(codigo) {
    const codigoNum = parseInt(codigo);
    return ESTADOS[codigoNum] || { texto: 'DESCONOCIDO', clase: 'estado-desconocido' };
}

// ============================================
// PROTECCIÓN DE PÁGINA
// ============================================
// Verificar autenticación al cargar la página
// requireAuth();

// ============================================
// VARIABLES GLOBALES
// ============================================
let espaciosData = [];
let modoEdicion = false;
let espacioActual = null;

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

/**
 * Carga los espacios desde la API
 */
async function cargarEspacios() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const noDataMessage = document.getElementById('noDataMessage');
    const tbody = document.getElementById('espaciosBody');
    const estadisticasPanel = document.getElementById('estadisticasPanel');

    try {
        // Mostrar indicador de carga
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        noDataMessage.style.display = 'none';
        estadisticasPanel.style.display = 'none';
        tbody.innerHTML = '';

        // Realizar petición a la API
        const response = await authGet('/api/sites?populate=*');

        // Verificar si hay datos
        if (response.data && response.data.length > 0) {
            espaciosData = response.data;
            renderizarEspacios(espaciosData);
            actualizarEstadisticas();
            estadisticasPanel.style.display = 'grid';
        } else {
            // No hay datos
            noDataMessage.style.display = 'block';
        }

    } catch (error) {
        console.error('Error al cargar espacios:', error);
        errorMessage.textContent = 'Error al cargar los espacios. Por favor, intente nuevamente.';
        errorMessage.style.display = 'block';
    } finally {
        // Ocultar indicador de carga
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Renderiza los espacios en la tabla
 * @param {Array} espacios - Array de objetos con datos de espacios
 */
function renderizarEspacios(espacios) {
    const tbody = document.getElementById('espaciosBody');
    tbody.innerHTML = '';

    espacios.forEach(espacio => {
        const row = tbody.insertRow();

        // Extraer datos según la estructura del JSON
        const idSitio = espacio.documentId || 'N/A';
        const nombreSitio = espacio.name || 'N/A';
        const ubicacion = espacio.location || 'N/A';
        const precio = espacio.pricePerNight !== undefined ? `$${espacio.pricePerNight}` : 'N/A';
        const capacidad = espacio.capacity || 'N/A';
        const codigoEstado = espacio.state || 0;
        const imagenUrl = espacio.image || '';

        // Obtener información del estado
        const estadoInfo = obtenerEstado(codigoEstado);

        // Crear HTML para la imagen
        const imagenHTML = imagenUrl 
            ? `<img src="${imagenUrl}" alt="${nombreSitio}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">` 
            : `<div style="width: 60px; height: 60px; background-color: #e0e0e0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">Sin imagen</div>`;

        // Crear celdas
        row.innerHTML = `
            <td>${idSitio}</td>
            <td>${imagenHTML}</td>
            <td>${nombreSitio}</td>
            <td>${ubicacion}</td>
            <td>${precio}</td>
            <td>${capacidad}</td>
            <td class="${estadoInfo.clase}">${estadoInfo.texto}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editarEspacio('${idSitio}')">Editar</button>
                    <button class="btn-delete" onclick="eliminarEspacio('${idSitio}')">Eliminar</button>
                </div>
            </td>
        `;
    });
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS
// ============================================

/**
 * Calcula y actualiza las estadísticas de espacios
 */
function actualizarEstadisticas() {
    const stats = {
        total: espaciosData.length,
        ocupados: 0,         // Estado 1
        disponibles: 0,      // Estado 2
        aseados: 0,          // Estado 3
        pendientes: 0        // Estado 4
    };

    espaciosData.forEach(espacio => {
        const codigoEstado = parseInt(espacio.state || 0);

        switch(codigoEstado) {
            case 1:
                stats.ocupados++;
                break;
            case 2:
                stats.disponibles++;
                break;
            case 3:
                stats.aseados++;
                break;
            case 4:
                stats.pendientes++;
                break;
        }
    });

    // Actualizar el DOM
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statDisponibles').textContent = stats.disponibles;
    document.getElementById('statPendientes').textContent = stats.pendientes;
    document.getElementById('statOcupados').textContent = stats.ocupados;
    document.getElementById('statAseados').textContent = stats.aseados;

    return stats;
}

// ============================================
// FUNCIONES DE MODAL
// ============================================

/**
 * Abre el modal para crear un nuevo espacio
 */
function abrirModalNuevo() {
    modoEdicion = false;
    espacioActual = null;

    document.getElementById('modalTitle').textContent = 'Nuevo Espacio';
    document.getElementById('formEspacio').reset();
    document.getElementById('espacioId').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';

    document.getElementById('modalEspacio').style.display = 'block';
}

/**
 * Abre el modal para editar un espacio existente
 * @param {string} documentId - ID del espacio a editar
 */
async function editarEspacio(documentId) {
    modoEdicion = true;

    try {
        // Buscar el espacio en los datos cargados
        const espacio = espaciosData.find(e => e.documentId === documentId);

        if (!espacio) {
            alert('Espacio no encontrado');
            return;
        }

        espacioActual = espacio;

        // Llenar el formulario con los datos
        document.getElementById('modalTitle').textContent = 'Editar Espacio';
        document.getElementById('espacioId').value = espacio.documentId;
        document.getElementById('name').value = espacio.name || '';
        document.getElementById('location').value = espacio.location || '';
        document.getElementById('pricePerNight').value = espacio.pricePerNight || '';
        document.getElementById('capacity').value = espacio.capacity || '';
        document.getElementById('imageUrl').value = espacio.image || '';
        document.getElementById('state').value = espacio.state || '';

        // Mostrar vista previa de la imagen si existe
        if (espacio.image) {
            mostrarVistaPrevia(espacio.image);
        }

        document.getElementById('modalEspacio').style.display = 'block';

    } catch (error) {
        console.error('Error al cargar datos para editar:', error);
        alert('Error al cargar los datos del espacio');
    }
}

/**
 * Cierra el modal
 */
function cerrarModal() {
    document.getElementById('modalEspacio').style.display = 'none';
    document.getElementById('formEspacio').reset();
    document.getElementById('imagePreviewContainer').style.display = 'none';
    modoEdicion = false;
    espacioActual = null;
}

// ============================================
// FUNCIONES DE VISTA PREVIA DE IMAGEN
// ============================================

/**
 * Muestra la vista previa de una imagen
 * @param {string} url - URL de la imagen
 */
function mostrarVistaPrevia(url) {
    if (url && url.trim() !== '') {
        const preview = document.getElementById('imagePreview');
        const container = document.getElementById('imagePreviewContainer');
        
        preview.src = url;
        container.style.display = 'block';
        
        // Ocultar vista previa si la imagen no carga
        preview.onerror = function() {
            container.style.display = 'none';
        };
    } else {
        document.getElementById('imagePreviewContainer').style.display = 'none';
    }
}

// ============================================
// FUNCIONES CRUD
// ============================================

/**
 * Guarda un espacio (crear o actualizar)
 * @param {Event} event - Evento del formulario
 */
async function guardarEspacio(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const location = document.getElementById('location').value;
    const pricePerNight = parseFloat(document.getElementById('pricePerNight').value);
    const capacity = parseInt(document.getElementById('capacity').value);
    const imageUrl = document.getElementById('imageUrl').value;
    const state = parseInt(document.getElementById('state').value);

    const datos = {
        data: {
            name: name,
            location: location,
            pricePerNight: pricePerNight,
            capacity: capacity,
            image: imageUrl,
            state: state
        }
    };

    try {
        if (modoEdicion) {
            // Actualizar espacio existente
            const id = document.getElementById('espacioId').value;
            await authPut(`/api/sites/${id}`, datos);
            alert('Espacio actualizado exitosamente');
        } else {
            // Crear nuevo espacio
            await authPost('/api/sites', datos);
            alert('Espacio creado exitosamente');
        }

        cerrarModal();
        await cargarEspacios();

    } catch (error) {
        console.error('Error al guardar espacio:', error);
        alert('Error al guardar el espacio. Verifique los datos e intente nuevamente.');
    }
}

/**
 * Elimina un espacio
 * @param {string} documentId - ID del espacio a eliminar
 */
async function eliminarEspacio(documentId) {
    if (!confirm('¿Está seguro que desea eliminar este espacio?')) {
        return;
    }

    try {
        await authDelete(`/api/sites/${documentId}`);
        alert('Espacio eliminado exitosamente');
        await cargarEspacios();

    } catch (error) {
        console.error('Error al eliminar espacio:', error);
        alert('Error al eliminar el espacio. Por favor, intente nuevamente.');
    }
}

// ============================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ============================================

/**
 * Filtra espacios por nombre, ubicación o ID
 * @param {string} termino - Término de búsqueda
 */
function buscarEspacios(termino) {
    const filtrados = espaciosData.filter(espacio => {
        const nombreSitio = (espacio.name || '').toLowerCase();
        const ubicacion = (espacio.location || '').toLowerCase();
        const idSitio = (espacio.documentId || '').toString().toLowerCase();

        return nombreSitio.includes(termino.toLowerCase()) ||
            ubicacion.includes(termino.toLowerCase()) ||
            idSitio.includes(termino.toLowerCase());
    });

    renderizarEspacios(filtrados);
}

/**
 * Filtra espacios por estado
 * @param {number} codigoEstado - Código del estado a filtrar
 */
function filtrarPorEstado(codigoEstado) {
    const filtrados = espaciosData.filter(espacio => {
        return parseInt(espacio.state) === parseInt(codigoEstado);
    });

    renderizarEspacios(filtrados);
}

/**
 * Restablece la vista mostrando todos los espacios
 */
function mostrarTodos() {
    renderizarEspacios(espaciosData);
}

// ============================================
// FUNCIÓN DE CIERRE DE SESIÓN
// ============================================

/**
 * Cierra la sesión del usuario
 */
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        logout('../../index.html');
    }
}

// ============================================
// FUNCIONES DE ACTUALIZACIÓN
// ============================================

/**
 * Recarga los espacios desde la API
 */
async function recargarEspacios() {
    await cargarEspacios();
}

/**
 * Exporta los espacios a CSV
 */
function exportarACSV() {
    if (espaciosData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const headers = ['ID Sitio', 'Nombre', 'Ubicación', 'Precio/Noche', 'Capacidad', 'Estado', 'URL Imagen'];
    const rows = espaciosData.map(e => {
        const codigoEstado = e.state;
        const estadoInfo = obtenerEstado(codigoEstado);

        return [
            e.documentId,
            e.name,
            e.location,
            e.pricePerNight || 0,
            e.capacity || 0,
            estadoInfo.texto,
            e.image || ''
        ];
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `espacios_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa la página al cargar el DOM
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de revisión de espacios cargada');
    console.log('Mapeo de estados:', ESTADOS);

    // Mostrar información del usuario si es necesario
    displayUserInfo('.user-name');

    // Cargar espacios
    cargarEspacios();

    // Event listener para vista previa de imagen
    const imageUrlInput = document.getElementById('imageUrl');
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', function(e) {
            mostrarVistaPrevia(e.target.value);
        });
    }

    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        const modal = document.getElementById('modalEspacio');
        if (event.target === modal) {
            cerrarModal();
        }
    };

    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarEspacios, 300000);
});