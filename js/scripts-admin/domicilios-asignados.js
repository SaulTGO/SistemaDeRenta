// ============================================
// PROTECCIÓN DE PÁGINA
// ============================================
// Verificar autenticación al cargar la página
// requireAuth();

// ============================================
// VARIABLES GLOBALES
// ============================================
let domiciliosData = [];
let modoEdicion = false;
let domicilioActual = null;

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

/**
 * Carga los domicilios asignados desde la API
 */
async function cargarDomicilios() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const noDataMessage = document.getElementById('noDataMessage');
    const tbody = document.getElementById('domiciliosBody');

    try {
        // Mostrar indicador de carga
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        noDataMessage.style.display = 'none';
        tbody.innerHTML = '';

        // Realizar petición a la API
        // Ajusta el endpoint según tu API - aquí asumo que existe un endpoint /api/assigned-homes
        const response = await authGet(`/api/assigned-homes?populate=*`);

        // Verificar si hay datos
        if (response.data && response.data.length > 0) {
            domiciliosData = response.data;
            renderizarDomicilios(domiciliosData);
        } else {
            // No hay datos
            noDataMessage.style.display = 'block';
        }

    } catch (error) {
        console.error('Error al cargar domicilios asignados:', error);
        errorMessage.textContent = 'Error al cargar los domicilios asignados. Por favor, intente nuevamente.';
        errorMessage.style.display = 'block';
    } finally {
        // Ocultar indicador de carga
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Renderiza los domicilios asignados en la tabla
 * @param {Array} domicilios - Array de objetos con datos de domicilios asignados
 */
function renderizarDomicilios(domicilios) {
    const tbody = document.getElementById('domiciliosBody');
    tbody.innerHTML = '';

    domicilios.forEach(domicilio => {
        const row = tbody.insertRow();

        // Extraer datos según la estructura de tu API
        const id = domicilio.documentId || domicilio.id || 'N/A';
        const userId = domicilio.user?.id || 'N/A';
        const nombreUsuario = domicilio.user?.username || 'N/A';
        const siteId = domicilio.site?.documentId || domicilio.site?.id || 'N/A';
        const ubicacionSitio = domicilio.site?.location || domicilio.site?.address || domicilio.site?.name || 'N/A';

        // Crear celdas
        row.innerHTML = `
            <td>${id}</td>
            <td>${userId}</td>
            <td>${nombreUsuario}</td>
            <td>${siteId}</td>
            <td>${ubicacionSitio}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editarDomicilio('${id}')">Editar</button>
                    <button class="btn-delete" onclick="eliminarDomicilio('${id}')">Eliminar</button>
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
 * Abre el modal para crear una nueva asignación de domicilio
 */
function abrirModalNuevo() {
    modoEdicion = false;
    domicilioActual = null;

    document.getElementById('modalTitle').textContent = 'Asignar Nuevo Domicilio';
    document.getElementById('formDomicilio').reset();
    document.getElementById('domicilioId').value = '';

    // Establecer fecha actual por defecto

    document.getElementById('modalDomicilio').style.display = 'block';
}

/**
 * Abre el modal para editar un domicilio asignado existente
 * @param {string|number} documentId - ID del domicilio asignado a editar
 */
async function editarDomicilio(documentId) {
    modoEdicion = true;

    try {
        // Buscar el domicilio en los datos cargados
        const domicilio = domiciliosData.find(d => 
            d.documentId === documentId || d.id === documentId
        );

        if (!domicilio) {
            alert('Domicilio asignado no encontrado');
            return;
        }

        domicilioActual = domicilio;

        // Llenar el formulario con los datos
        document.getElementById('modalTitle').textContent = 'Editar Domicilio Asignado';
        document.getElementById('domicilioId').value = domicilio.documentId || domicilio.id;
        document.getElementById('userId').value = domicilio.user?.id || '';
        document.getElementById('siteId').value = domicilio.site?.documentId || domicilio.site?.id || '';

        document.getElementById('modalDomicilio').style.display = 'block';

    } catch (error) {
        console.error('Error al cargar datos para editar:', error);
        alert('Error al cargar los datos del domicilio asignado');
    }
}

/**
 * Cierra el modal
 */
function cerrarModal() {
    document.getElementById('modalDomicilio').style.display = 'none';
    document.getElementById('formDomicilio').reset();
    modoEdicion = false;
    domicilioActual = null;
}

// ============================================
// FUNCIONES CRUD
// ============================================

/**
 * Guarda un domicilio asignado (crear o actualizar)
 * @param {Event} event - Evento del formulario
 */
async function guardarDomicilio(event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const siteId = document.getElementById('siteId').value;

    const datos = {
        data: {
            user: userId,
            site: siteId,
        }
    };

    try {
        if (modoEdicion) {
            // Actualizar domicilio existente
            const id = document.getElementById('domicilioId').value;
            await authPut(`/api/assigned-homes/${id}`, datos);
            alert('Domicilio asignado actualizado exitosamente');
        } else {
            // Crear nueva asignación
            await authPost('/api/assigned-homes', datos);
            alert('Domicilio asignado creado exitosamente');
        }

        cerrarModal();
        await cargarDomicilios();

    } catch (error) {
        console.error('Error al guardar domicilio asignado:', error);
        alert('Error al guardar el domicilio asignado. Verifique los datos e intente nuevamente.');
    }
}

/**
 * Elimina un domicilio asignado
 * @param {string|number} documentId - ID del domicilio asignado a eliminar
 */
async function eliminarDomicilio(documentId) {
    if (!confirm('¿Está seguro que desea eliminar esta asignación de domicilio?')) {
        return;
    }

    try {
        await authDelete(`/api/assigned-homes/${documentId}`);
        alert('Domicilio asignado eliminado exitosamente');
        await cargarDomicilios();

    } catch (error) {
        console.error('Error al eliminar domicilio asignado:', error);
        alert('Error al eliminar el domicilio asignado. Por favor, intente nuevamente.');
    }
}

// ============================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ============================================

/**
 * Filtra domicilios por nombre de usuario
 * @param {string} termino - Término de búsqueda
 */
function filtrarPorUsuario(termino) {
    const filtradas = domiciliosData.filter(domicilio => {
        const nombreUsuario = (domicilio.user?.username || '').toLowerCase();
        return nombreUsuario.includes(termino.toLowerCase());
    });
    renderizarDomicilios(filtradas);
}

/**
 * Filtra domicilios por ubicación de sitio
 * @param {string} termino - Término de búsqueda
 */
function filtrarPorUbicacion(termino) {
    const filtradas = domiciliosData.filter(domicilio => {
        const ubicacion = (domicilio.site?.location || domicilio.site?.address || '').toLowerCase();
        return ubicacion.includes(termino.toLowerCase());
    });
    renderizarDomicilios(filtradas);
}

/**
 * Restablece la vista mostrando todos los domicilios
 */
function mostrarTodos() {
    renderizarDomicilios(domiciliosData);
}

// ============================================
// FUNCIÓN DE NAVEGACIÓN
// ============================================

/**
 * Redirige al home correspondiente según el rol del usuario
 */
async function regresarHome() {
    try {
        const jwt = getJWT();
        const response = await fetch(`${API_BASE_URL}/api/users/me?populate=role`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        const user = await response.json();
        
        const roleName = user.role?.name || 'Usuario';
        
        switch (roleName) {
            case 'AdministradorGod':
                window.location.href = '../god-admin/home_god_admin.html';
                break;
            case 'Administrador':
                window.location.href = '../admin/home-admin.html';
                break;
            case 'Personal':
                window.location.href = '../personal/home-personal.html';
                break;
            default:
                window.location.href = '../admin/home-admin.html';
        }
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        // Fallback a admin si hay error
        window.location.href = '../admin/home-admin.html';
    }
}

// ============================================
// FUNCIONES DE ACTUALIZACIÓN MANUAL
// ============================================

/**
 * Recarga los domicilios desde la API
 */
async function recargarDomicilios() {
    await cargarDomicilios();
}

/**
 * Exporta los domicilios a CSV
 */
function exportarACSV() {
    if (domiciliosData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const headers = ['ID', 'Usuario ID', 'Nombre Usuario', 'Sitio ID', 'Ubicación'];
    const rows = domiciliosData.map(d => [
        d.documentId || d.id || '',
        d.user?.id || '',
        d.user?.username || '',
        d.site?.documentId || d.site?.id || '',
        d.site?.location || d.site?.address || d.site?.name || '',
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `domicilios_asignados_${new Date().getTime()}.csv`);
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
    console.log('Página de domicilios asignados cargada');

    // Mostrar información del usuario si es necesario
    displayUserInfo('.user-name');

    // Cargar domicilios
    cargarDomicilios();

    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        const modal = document.getElementById('modalDomicilio');
        if (event.target === modal) {
            cerrarModal();
        }
    };

    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarDomicilios, 300000);
});