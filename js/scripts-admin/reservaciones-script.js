// ============================================
// PROTECCIÓN DE PÁGINA
// ============================================
// Verificar autenticación al cargar la página
// requireAuth();

// ============================================
// VARIABLES GLOBALES
// ============================================
let reservacionesData = [];

import { CONFIG } from "./config.js";
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
        const id = reservacion.id || 'N/A';
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

    const headers = ['ID', 'Nombre Usuario', 'Sitio', 'Fecha Llegada', 'Fecha Salida'];
    const rows = reservacionesData.map(r => [
        r.id,
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
    
    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarReservaciones, 300000);
});