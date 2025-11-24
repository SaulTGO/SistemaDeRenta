// ============================================
// PROTECCIÓN DE PÁGINA
// ============================================
// Verificar autenticación al cargar la página
// requireAuth();

// ============================================
// VARIABLES GLOBALES
// ============================================
let asignacionesData = [];

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

/**
 * Carga las asignaciones desde la API
 */
async function cargarAsignaciones() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const noDataMessage = document.getElementById('noDataMessage');
    const tbody = document.getElementById('personalBody');
    const estadisticasPanel = document.getElementById('estadisticasPanel');

    try {
        // Mostrar indicador de carga
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        noDataMessage.style.display = 'none';
        estadisticasPanel.style.display = 'none';
        tbody.innerHTML = '';

        // Realizar petición a la API
        // Ajusta el endpoint según tu API
        const response = await authGet('/api/asignaciones');
        
        // Verificar si hay datos
        if (response.data && response.data.length > 0) {
            asignacionesData = response.data;
            renderizarAsignaciones(asignacionesData);
            actualizarEstadisticas();
            estadisticasPanel.style.display = 'block';
        } else {
            // No hay datos
            noDataMessage.style.display = 'block';
        }

    } catch (error) {
        console.error('Error al cargar asignaciones:', error);
        errorMessage.textContent = 'Error al cargar las asignaciones. Por favor, intente nuevamente.';
        errorMessage.style.display = 'block';
    } finally {
        // Ocultar indicador de carga
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Renderiza las asignaciones en la tabla
 * @param {Array} asignaciones - Array de objetos con datos de asignaciones
 */
function renderizarAsignaciones(asignaciones) {
    const tbody = document.getElementById('personalBody');
    tbody.innerHTML = '';

    asignaciones.forEach(asignacion => {
        const row = tbody.insertRow();
        
        // Extraer datos del objeto (ajusta según la estructura de tu API)
        const idAsignacion = asignacion.id || asignacion.attributes?.id || 'N/A';
        const nombreResponsable = asignacion.attributes?.nombre_responsable || 
                                 asignacion.nombre_responsable || 'N/A';
        const ubicacion = asignacion.attributes?.ubicacion || 
                         asignacion.ubicacion || 'N/A';
        const estadoBoolean = asignacion.attributes?.estado || 
                             asignacion.estado;

        // Convertir el estado booleano a texto
        const estadoInfo = obtenerEstado(estadoBoolean);

        // Crear celdas
        row.innerHTML = `
            <td>${idAsignacion}</td>
            <td>${nombreResponsable}</td>
            <td>${ubicacion}</td>
            <td class="${estadoInfo.clase}">${estadoInfo.texto}</td>
        `;
    });
}

/**
 * Obtiene la información del estado según el valor booleano
 * @param {boolean|string} estado - Estado de la asignación (true/false)
 * @returns {object} Objeto con texto y clase CSS del estado
 */
function obtenerEstado(estado) {
    // Convertir a booleano si viene como string
    let estadoBool = estado;
    if (typeof estado === 'string') {
        estadoBool = estado.toLowerCase() === 'true' || estado === '1';
    }

    if (estadoBool === true) {
        return { texto: 'ASEADO', clase: 'estado-aseado' };
    } else if (estadoBool === false) {
        return { texto: 'PENDIENTE', clase: 'estado-pendiente' };
    } else {
        return { texto: 'DESCONOCIDO', clase: 'estado-desconocido' };
    }
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS
// ============================================

/**
 * Calcula y actualiza las estadísticas de asignaciones
 */
function actualizarEstadisticas() {
    const stats = {
        total: asignacionesData.length,
        aseados: 0,
        pendientes: 0
    };

    asignacionesData.forEach(asignacion => {
        const estadoBoolean = asignacion.attributes?.estado || asignacion.estado;
        
        // Convertir a booleano si viene como string
        let estadoBool = estadoBoolean;
        if (typeof estadoBoolean === 'string') {
            estadoBool = estadoBoolean.toLowerCase() === 'true' || estadoBoolean === '1';
        }

        if (estadoBool === true) {
            stats.aseados++;
        } else if (estadoBool === false) {
            stats.pendientes++;
        }
    });

    // Actualizar el DOM
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statAseados').textContent = stats.aseados;
    document.getElementById('statPendientes').textContent = stats.pendientes;

    return stats;
}

// ============================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ============================================

/**
 * Filtra asignaciones por nombre de responsable
 * @param {string} termino - Término de búsqueda
 */
function buscarPorResponsable(termino) {
    const filtradas = asignacionesData.filter(asignacion => {
        const nombreResponsable = (asignacion.attributes?.nombre_responsable || 
                                  asignacion.nombre_responsable || '').toLowerCase();
        return nombreResponsable.includes(termino.toLowerCase());
    });

    renderizarAsignaciones(filtradas);
}

/**
 * Filtra asignaciones por ubicación
 * @param {string} termino - Término de búsqueda
 */
function buscarPorUbicacion(termino) {
    const filtradas = asignacionesData.filter(asignacion => {
        const ubicacion = (asignacion.attributes?.ubicacion || 
                          asignacion.ubicacion || '').toLowerCase();
        return ubicacion.includes(termino.toLowerCase());
    });

    renderizarAsignaciones(filtradas);
}

/**
 * Filtra asignaciones por estado
 * @param {boolean} estado - true para aseados, false para pendientes
 */
function filtrarPorEstado(estado) {
    const filtradas = asignacionesData.filter(asignacion => {
        const estadoBoolean = asignacion.attributes?.estado || asignacion.estado;
        
        // Convertir a booleano si viene como string
        let estadoBool = estadoBoolean;
        if (typeof estadoBoolean === 'string') {
            estadoBool = estadoBoolean.toLowerCase() === 'true' || estadoBoolean === '1';
        }

        return estadoBool === estado;
    });

    renderizarAsignaciones(filtradas);
}

/**
 * Restablece la vista mostrando todas las asignaciones
 */
function mostrarTodas() {
    renderizarAsignaciones(asignacionesData);
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
 * Recarga las asignaciones desde la API
 */
async function recargarAsignaciones() {
    await cargarAsignaciones();
}

/**
 * Exporta las asignaciones a CSV
 */
function exportarACSV() {
    if (asignacionesData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const headers = ['ID Asignación', 'Nombre Responsable', 'Ubicación', 'Estado'];
    const rows = asignacionesData.map(a => {
        const estadoBoolean = a.attributes?.estado || a.estado;
        const estadoInfo = obtenerEstado(estadoBoolean);
        
        return [
            a.id || a.attributes?.id,
            a.attributes?.nombre_responsable || a.nombre_responsable,
            a.attributes?.ubicacion || a.ubicacion,
            estadoInfo.texto
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
    link.setAttribute('download', `asignaciones_${new Date().getTime()}.csv`);
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
    console.log('Página de revisión de personal cargada');
    
    // Mostrar información del usuario si es necesario
    displayUserInfo('.user-name');
    
    // Cargar asignaciones
    cargarAsignaciones();
    
    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarAsignaciones, 300000);
});