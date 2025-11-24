// ============================================
// PROTECCIÓN DE PÁGINA
// ============================================
// Verificar autenticación al cargar la página
// requireAuth();

// ============================================
// VARIABLES GLOBALES
// ============================================
let reservacionesData = [];

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
        // Ajusta el endpoint según tu API
        const response = await authGet('/api/reservaciones');
        
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
        
        // Extraer datos del objeto (ajusta según la estructura de tu API)
        const id = reservacion.id || reservacion.attributes?.id || 'N/A';
        const nombreUsuario = reservacion.attributes?.nombre_usuario || 
                             reservacion.nombre_usuario || 'N/A';
        const nombreDomicilio = reservacion.attributes?.nombre_domicilio || 
                               reservacion.nombre_domicilio || 'N/A';
        const fechaLlegada = formatearFecha(
            reservacion.attributes?.fecha_llegada || 
            reservacion.fecha_llegada
        );
        const fechaSalida = formatearFecha(
            reservacion.attributes?.fecha_salida || 
            reservacion.fecha_salida
        );
        const huellasRegistradas = reservacion.attributes?.huellas_registradas || 
                                  reservacion.huellas_registradas || false;

        // Crear celdas
        row.innerHTML = `
            <td>${id}</td>
            <td>${nombreUsuario}</td>
            <td>${nombreDomicilio}</td>
            <td>${fechaLlegada}</td>
            <td>${fechaSalida}</td>
            <td class="huella-status">
                <input type="checkbox" class="huella-check" ${huellasRegistradas ? 'checked' : ''} disabled>
                <span class="huella-text">${huellasRegistradas ? 'Sí' : 'No'}</span>
            </td>
        `;
    });
}

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'N/A';
    
    try {
        const fecha = new Date(fechaISO);
        const opciones = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-MX', opciones);
    } catch (error) {
        return fechaISO;
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
        const nombreUsuario = (reservacion.attributes?.nombre_usuario || 
                              reservacion.nombre_usuario || '').toLowerCase();
        return nombreUsuario.includes(termino.toLowerCase());
    });
    renderizarReservaciones(filtradas);
}

/**
 * Filtra reservaciones por domicilio
 * @param {string} termino - Término de búsqueda
 */
function filtrarPorDomicilio(termino) {
    const filtradas = reservacionesData.filter(reservacion => {
        const nombreDomicilio = (reservacion.attributes?.nombre_domicilio || 
                                reservacion.nombre_domicilio || '').toLowerCase();
        return nombreDomicilio.includes(termino.toLowerCase());
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

/**
 * Cierra la sesión del usuario
 */
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        logout('../../index.html');
    }
}

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

    const headers = ['ID', 'Nombre Usuario', 'Domicilio', 'Fecha Llegada', 'Fecha Salida', 'Huellas Registradas'];
    const rows = reservacionesData.map(r => [
        r.id || r.attributes?.id,
        r.attributes?.nombre_usuario || r.nombre_usuario,
        r.attributes?.nombre_domicilio || r.nombre_domicilio,
        r.attributes?.fecha_llegada || r.fecha_llegada,
        r.attributes?.fecha_salida || r.fecha_salida,
        (r.attributes?.huellas_registradas || r.huellas_registradas) ? 'Sí' : 'No'
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
    
    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarReservaciones, 300000);
});