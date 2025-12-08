// ============================================
// PROTECCIÓN DE PÁGINA
// ============================================
// Verificar autenticación al cargar la página
// requireAuth();

// ============================================
// VARIABLES GLOBALES
// ============================================
let reservacionesData = [];
let modoEdicion = false;
let reservacionActual = null;

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

/**
 * Carga las reservaciones desde la API
 */
async function cargarReservaciones() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const noDataMessage = document.getElementById('noDataMessage');
    const tbody = document.getElementById('reservacionesBody');

    try {
        // Mostrar indicador de carga
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        noDataMessage.style.display = 'none';
        tbody.innerHTML = '';

        // Realizar petición a la API
        const response = await authGet(`/api/reservations?populate=*`);

        // Verificar si hay datos
        if (response.data && response.data.length > 0) {
            reservacionesData = response.data;
            renderizarReservaciones(reservacionesData);
        } else {
            // No hay datos
            noDataMessage.style.display = 'block';
        }

    } catch (error) {
        console.error('Error al cargar reservaciones:', error);
        errorMessage.textContent = 'Error al cargar las reservaciones. Por favor, intente nuevamente.';
        errorMessage.style.display = 'block';
    } finally {
        // Ocultar indicador de carga
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Renderiza las reservaciones en la tabla
 * @param {Array} reservaciones - Array de objetos con datos de reservaciones
 */
function renderizarReservaciones(reservaciones) {
    const tbody = document.getElementById('reservacionesBody');
    tbody.innerHTML = '';

    reservaciones.forEach(reservacion => {
        const row = tbody.insertRow();

        // Extraer datos según la estructura del JSON proporcionado
        const id = reservacion.documentId || 'N/A';
        const nombreUsuario = reservacion.user?.username || 'N/A';
        const nombreSitio = reservacion.site?.name || 'N/A';
        const fechaLlegada = formatearFecha(reservacion.arriveDate);
        const fechaSalida = formatearFecha(reservacion.departureDate);

        // Crear celdas
        row.innerHTML = `
            <td>${id}</td>
            <td>${nombreUsuario}</td>
            <td>${nombreSitio}</td>
            <td>${fechaLlegada}</td>
            <td>${fechaSalida}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editarReservacion('\'' + ${id} + '\'')">Editar</button>
                    <button class="btn-delete" onclick="eliminarReservacion('\'' + ${id} + '\'')">Eliminar</button>
                </div>
            </td>
        `;
    });
}

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} fecha - Fecha en formato ISO o YYYY-MM-DD
 * @returns {string} Fecha formateada
 */
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';

    try {
        const fechaObj = new Date(fecha);
        const opciones = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        return fechaObj.toLocaleDateString('es-MX', opciones);
    } catch (error) {
        return fecha;
    }
}

/**
 * Convierte fecha de formato dd/mm/yyyy a yyyy-mm-dd para input date
 * @param {string} fecha - Fecha en formato dd/mm/yyyy o ISO
 * @returns {string} Fecha en formato yyyy-mm-dd
 */
function convertirFechaParaInput(fecha) {
    if (!fecha || fecha === 'N/A') return '';

    // Si la fecha ya está en formato ISO (YYYY-MM-DD), retornarla directamente
    if (fecha.match(/^\d{4}-\d{2}-\d{2}/)) {
        return fecha.split('T')[0];
    }

    // Si está en formato dd/mm/yyyy, convertir
    const partes = fecha.split('/');
    if (partes.length === 3) {
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    return '';
}

// ============================================
// FUNCIONES DE MODAL
// ============================================

/**
 * Abre el modal para crear una nueva reservación
 */
function abrirModalNuevo() {
    modoEdicion = false;
    reservacionActual = null;

    document.getElementById('modalTitle').textContent = 'Nueva Reservación';
    document.getElementById('formReservacion').reset();
    document.getElementById('reservacionId').value = '';

    document.getElementById('modalReservacion').style.display = 'block';
}

/**
 * Abre el modal para editar una reservación existente
 * @param {number} documentId - ID de la reservación a editar
 */
async function editarReservacion(documentId) {
    modoEdicion = true;

    try {
        // Buscar la reservación en los datos cargados
        const reservacion = reservacionesData.find(r => r.documentId === documentId);

        if (!reservacion) {
            alert('Reservación no encontrada');
            return;
        }

        reservacionActual = reservacion;

        // Llenar el formulario con los datos
        document.getElementById('modalTitle').textContent = 'Editar Reservación';
        document.getElementById('reservacionId').value = reservacion.documentId;
        document.getElementById('userId').value = reservacion.user?.documentId || '';
        document.getElementById('siteId').value = reservacion.site?.documentId || '';
        document.getElementById('arriveDate').value = convertirFechaParaInput(reservacion.arriveDate);
        document.getElementById('departureDate').value = convertirFechaParaInput(reservacion.departureDate);

        document.getElementById('modalReservacion').style.display = 'block';

    } catch (error) {
        console.error('Error al cargar datos para editar:', error);
        alert('Error al cargar los datos de la reservación');
    }
}

/**
 * Cierra el modal
 */
function cerrarModal() {
    document.getElementById('modalReservacion').style.display = 'none';
    document.getElementById('formReservacion').reset();
    modoEdicion = false;
    reservacionActual = null;
}

// ============================================
// FUNCIONES CRUD
// ============================================

/**
 * Guarda una reservación (crear o actualizar)
 * @param {Event} event - Evento del formulario
 */
async function guardarReservacion(event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const siteId = document.getElementById('siteId').value;
    const arriveDate = document.getElementById('arriveDate').value;
    const departureDate = document.getElementById('departureDate').value;

    // Validar que la fecha de salida sea posterior a la de llegada
    if (new Date(departureDate) <= new Date(arriveDate)) {
        alert('La fecha de salida debe ser posterior a la fecha de llegada');
        return;
    }

    const datos = {
        data: {
            user: userId,
            site: siteId,
            arriveDate: arriveDate,
            departureDate: departureDate
        }
    };

    try {
        if (modoEdicion) {
            // Actualizar reservación existente
            const id = document.getElementById('reservacionId').value;
            await authPut(`/api/reservations/${id}`, datos);
            alert('Reservación actualizada exitosamente');
        } else {
            // Crear nueva reservación
            await authPost('/api/reservations', datos);
            alert('Reservación creada exitosamente');
        }

        cerrarModal();
        await cargarReservaciones();

    } catch (error) {
        console.error('Error al guardar reservación:', error);
        alert('Error al guardar la reservación. Verifique los datos e intente nuevamente.');
    }
}

/**
 * Elimina una reservación
 * @param {number} documentId - ID de la reservación a eliminar
 */
async function eliminarReservacion(documentId) {
    if (!confirm('¿Está seguro que desea eliminar esta reservación?')) {
        return;
    }

    try {
        await authDelete(`/api/reservations/${documentId}`);
        alert('Reservación eliminada exitosamente');
        await cargarReservaciones();

    } catch (error) {
        console.error('Error al eliminar reservación:', error);
        alert('Error al eliminar la reservación. Por favor, intente nuevamente.');
    }
}

// ============================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ============================================

/**
 * Filtra reservaciones por nombre de usuario
 * @param {string} termino - Término de búsqueda
 */
function filtrarPorUsuario(termino) {
    const filtradas = reservacionesData.filter(reservacion => {
        const nombreUsuario = (reservacion.user?.username || '').toLowerCase();
        return nombreUsuario.includes(termino.toLowerCase());
    });
    renderizarReservaciones(filtradas);
}

/**
 * Filtra reservaciones por sitio
 * @param {string} termino - Término de búsqueda
 */
function filtrarPorSitio(termino) {
    const filtradas = reservacionesData.filter(reservacion => {
        const nombreSitio = (reservacion.site?.name || '').toLowerCase();
        return nombreSitio.includes(termino.toLowerCase());
    });
    renderizarReservaciones(filtradas);
}

/**
 * Restablece la vista mostrando todas las reservaciones
 */
function mostrarTodas() {
    renderizarReservaciones(reservacionesData);
}

// ============================================
// FUNCIÓN DE CIERRE DE SESIÓN
// ============================================


// ============================================
// FUNCIONES DE ACTUALIZACIÓN MANUAL
// ============================================

/**
 * Recarga las reservaciones desde la API
 */
async function recargarReservaciones() {
    await cargarReservaciones();
}

/**
 * Exporta las reservaciones a CSV
 */
function exportarACSV() {
    if (reservacionesData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const headers = ['ID', 'Nombre Usuario', 'Sitio', 'Fecha Llegada', 'Fecha Salida'];
    const rows = reservacionesData.map(r => [
        r.documentId,
        r.user?.username || '',
        r.site?.name || '',
        r.arriveDate || '',
        r.departureDate || ''
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `reservaciones_${new Date().getTime()}.csv`);
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
    console.log('Página de reservaciones cargada');

    // Mostrar información del usuario si es necesario
    displayUserInfo('.user-name');

    // Cargar reservaciones
    cargarReservaciones();

    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        const modal = document.getElementById('modalReservacion');
        if (event.target === modal) {
            cerrarModal();
        }
    };

    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarReservaciones, 300000);
});