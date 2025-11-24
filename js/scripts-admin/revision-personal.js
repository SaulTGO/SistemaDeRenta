// ============================================
// PROTECCIÓN DE PÁGINA
// ============================================
// Verificar autenticación al cargar la página
// requireAuth();

// ============================================
// VARIABLES GLOBALES
// ============================================
let personalData = []; // Renombrado de asignacionesData a personalData

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

/**
 * Carga el personal desde la API
 */
async function cargarPersonal() { // Renombrada de cargarAsignaciones
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
        estadisticasPanel.style.display = 'none'; // Ocultamos las estadísticas
        tbody.innerHTML = '';

        // Realizar petición a la API
        // Endpoint ajustado para obtener personal/usuarios.
        const response = await authGet('/api/users?filters[role][name][$eq]=Personal&populate=role'); 
        
        // Verificar si hay datos
        if (response.data && response.data.length > 0) {
            personalData = response.data; // Actualizado a personalData
            renderizarPersonal(personalData); // Renombrado
            // No se llama a actualizarEstadisticas ya que no son relevantes.
            // estadisticasPanel.style.display = 'block';
        } else {
            // No hay datos
            noDataMessage.style.display = 'block';
        }

    } catch (error) {
        console.error('Error al cargar personal:', error);
        errorMessage.textContent = 'Error al cargar el personal. Por favor, intente nuevamente.';
        errorMessage.style.display = 'block';
    } finally {
        // Ocultar indicador de carga
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Renderiza el personal en la tabla
 * @param {Array} personal - Array de objetos con datos del personal
 */
function renderizarPersonal(personal) { // Renombrada de renderizarAsignaciones
    const tbody = document.getElementById('personalBody');
    tbody.innerHTML = '';

    personal.forEach(usuario => {
        const row = tbody.insertRow();
        
        // Extraer y asignar los campos requeridos del JSON
        const idPersonal = usuario.id || 'N/A';
        // Usamos 'username' para el nombre y 'lastname' para los apellidos
        const nombre = usuario.username || 'N/A';
        const apellidos = usuario.lastname || 'N/A'; 
        const correo = usuario.email || 'N/A';
        const telefono = usuario.phone || 'N/A';

        // Crear celdas
        row.innerHTML = `
            <td>${idPersonal}</td>
            <td>${nombre}</td>
            <td>${apellidos}</td>
            <td>${correo}</td>
            <td>${telefono}</td>
        `;
    });
}

/**
 * Obtiene la información del estado según el valor booleano
 * NOTA: Esta función y el bloque de estadísticas ya no son relevantes para el personal, 
 * pero se dejan vacíos o comentados para evitar errores si otras partes del código los usan.
 */
function obtenerEstado(estado) {
    return { texto: 'N/A', clase: '' };
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS (NO USADAS)
// ============================================

/**
 * Calcula y actualiza las estadísticas de personal
 */
function actualizarEstadisticas() {
    // Ya no es necesario calcular estadísticas de estado
    return { total: 0, aseados: 0, pendientes: 0 };
}

// ============================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO (PENDIENTE DE IMPLEMENTACIÓN)
// ============================================

/**
 * Filtra personal por nombre
 * @param {string} termino - Término de búsqueda
 */
function buscarPorNombre(termino) {
    const filtradas = personalData.filter(usuario => {
        const nombreCompleto = `${usuario.username || ''} ${usuario.lastname || ''}`.toLowerCase();
        return nombreCompleto.includes(termino.toLowerCase());
    });

    renderizarPersonal(filtradas);
}

// Las funciones de filtrado por Ubicación y Estado ya no son relevantes

// /**
//  * Restablece la vista mostrando todo el personal
//  */
function mostrarTodas() {
    renderizarPersonal(personalData);
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
 * Recarga el personal desde la API
 */
async function recargarPersonal() { // Renombrada de recargarAsignaciones
    await cargarPersonal();
}

/**
 * Exporta el personal a CSV (Ajustado)
 */
function exportarACSV() {
    if (personalData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const headers = ['ID Personal', 'Nombre', 'Apellidos', 'Correo', 'Teléfono'];
    const rows = personalData.map(u => {
        return [
            u.id,
            u.username,
            u.lastname,
            u.email,
            u.phone
        ];
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        // Asegurarse de que el teléfono no se trate como número si tiene caracteres especiales
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `personal_${new Date().getTime()}.csv`);
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
    
    // Cargar personal
    cargarPersonal(); // Renombrada
    
    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarPersonal, 300000);
});