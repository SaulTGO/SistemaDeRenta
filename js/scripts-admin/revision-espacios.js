// ============================================
// MAPEO DE ESTADOS
// ============================================

/**
 * Mapeo de códigos numéricos a estados
 */
const ESTADOS = {
    1: { texto: 'DISPONIBLE', clase: 'estado-disponible' },
    2: { texto: 'PENDIENTE DE ASEO', clase: 'estado-pendiente-aseo' },
    3: { texto: 'OCUPADO', clase: 'estado-ocupado' },
    4: { texto: 'ASEADO', clase: 'estado-aseado' }
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
        // Ajusta el endpoint según tu API
        const response = await authGet('/api/espacios');
        
        // Verificar si hay datos
        if (response.data && response.data.length > 0) {
            espaciosData = response.data;
            renderizarEspacios(espaciosData);
            actualizarEstadisticas();
            estadisticasPanel.style.display = 'block';
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
        
        // Extraer datos del objeto (ajusta según la estructura de tu API)
        const nombreSitio = espacio.attributes?.nombre_sitio || 
                           espacio.nombre_sitio || 'N/A';
        const ubicacion = espacio.attributes?.ubicacion_sitio || 
                         espacio.ubicacion_sitio || 
                         espacio.attributes?.ubicacion || 
                         espacio.ubicacion || 'N/A';
        const codigoEstado = espacio.attributes?.estado || 
                            espacio.estado || 0;

        // Obtener información del estado
        const estadoInfo = obtenerEstado(codigoEstado);

        // Crear celdas
        row.innerHTML = `
            <td>${nombreSitio}</td>
            <td>${ubicacion}</td>
            <td class="${estadoInfo.clase}">${estadoInfo.texto}</td>
        `;
    });
}

/**
 * Normaliza el valor de disponibilidad
 * @param {string|boolean} disponibilidad - Valor de disponibilidad
 * @returns {string} Valor normalizado
 */
function normalizarDisponibilidad(disponibilidad) {
    if (typeof disponibilidad === 'boolean') {
        return disponibilidad ? 'DISPONIBLE' : 'RESERVADO';
    }
    
    const valor = String(disponibilidad).toUpperCase().trim();
    
    // Mapeo de posibles valores
    if (valor === 'TRUE' || valor === '1' || valor === 'DISPONIBLE' || valor === 'SI' || valor === 'SÍ') {
        return 'DISPONIBLE';
    } else if (valor === 'FALSE' || valor === '0' || valor === 'RESERVADO' || valor === 'NO') {
        return 'RESERVADO';
    }
    
    return valor || 'N/A';
}

/**
 * Normaliza el valor de estado de aseo
 * @param {string} estado - Valor de estado
 * @returns {string} Valor normalizado
 */
function normalizarEstado(estado) {
    const valor = String(estado).toUpperCase().trim();
    
    // Mapeo de posibles valores
    if (valor === 'ASEADO' || valor === 'LIMPIO' || valor === 'FINALIZADO' || valor === 'COMPLETO') {
        return 'ASEADO';
    } else if (valor === 'ASEO PENDIENTE' || valor === 'PENDIENTE' || valor === 'EN ESPERA' || valor === 'SUCIO') {
        return 'ASEO PENDIENTE';
    } else if (valor === 'EN PROCESO') {
        return 'EN PROCESO';
    }
    
    return valor || 'N/A';
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
        disponibles: 0,      // Estado 1
        pendientes: 0,       // Estado 2
        ocupados: 0,         // Estado 3
        aseados: 0          // Estado 4
    };

    espaciosData.forEach(espacio => {
        const codigoEstado = parseInt(espacio.attributes?.estado || espacio.estado || 0);
        
        switch(codigoEstado) {
            case 1:
                stats.disponibles++;
                break;
            case 2:
                stats.pendientes++;
                break;
            case 3:
                stats.ocupados++;
                break;
            case 4:
                stats.aseados++;
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
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ============================================

/**
 * Filtra espacios por nombre o ubicación
 * @param {string} termino - Término de búsqueda
 */
function buscarEspacios(termino) {
    const filtrados = espaciosData.filter(espacio => {
        const nombreSitio = (espacio.attributes?.nombre_sitio || espacio.nombre_sitio || '').toLowerCase();
        const ubicacion = (espacio.attributes?.ubicacion_sitio || espacio.ubicacion_sitio || 
                          espacio.attributes?.ubicacion || espacio.ubicacion || '').toLowerCase();
        
        return nombreSitio.includes(termino.toLowerCase()) || 
               ubicacion.includes(termino.toLowerCase());
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

    const headers = ['Nombre del Sitio', 'Ubicación', 'Estado'];
    const rows = espaciosData.map(e => {
        const codigoEstado = e.attributes?.estado || e.estado;
        const estadoInfo = obtenerEstado(codigoEstado);
        
        return [
            e.attributes?.nombre_sitio || e.nombre_sitio,
            e.attributes?.ubicacion_sitio || e.ubicacion_sitio || e.attributes?.ubicacion || e.ubicacion,
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
    
    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarEspacios, 300000);
});