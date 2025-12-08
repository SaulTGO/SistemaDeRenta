// ============================================
// PROTECCIÓN DE PÁGINA
// ============================================
// Verificar autenticación al cargar la página
// requireAuth();

// ============================================
// VARIABLES GLOBALES
// ============================================
let administradoresData = [];
let modoEdicion = false;
let adminActual = null;

// Nota: El rol "Admin" debe tener ID 2 en tu base de datos
// Ajusta este valor según tu configuración
const ROLE_ADMIN_ID = 2;

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

/**
 * Carga los administradores desde la API
 */
async function cargarAdministradores() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const noDataMessage = document.getElementById('noDataMessage');
    const tbody = document.getElementById('adminBody');
    const estadisticasPanel = document.getElementById('estadisticasPanel');

    try {
        // Mostrar indicador de carga
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        noDataMessage.style.display = 'none';
        estadisticasPanel.style.display = 'none';
        tbody.innerHTML = '';

        // Realizar petición a la API filtrando por rol Admin
        const response = await authGet('/api/users?filters[role][name][$eq]=Administrador&populate=role');

        console.log('Respuesta de la API:', response);

        // La API puede devolver directamente un array o un objeto con propiedad 'data'
        let data = null;

        if (Array.isArray(response)) {
            data = response;
        } else if (response.data && Array.isArray(response.data)) {
            data = response.data;
        }

        // Verificar si hay datos
        if (data && data.length > 0) {
            administradoresData = data;
            renderizarAdministradores(administradoresData);
            actualizarEstadisticas();
            estadisticasPanel.style.display = 'grid';
            console.log(`${administradoresData.length} administradores cargados`);
        } else {
            noDataMessage.style.display = 'block';
            console.log('No se encontraron administradores');
        }

    } catch (error) {
        console.error('Error al cargar administradores:', error);
        errorMessage.textContent = 'Error al cargar los administradores. Por favor, intente nuevamente.';
        errorMessage.style.display = 'block';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Renderiza los administradores en la tabla
 * @param {Array} administradores - Array de objetos con datos de administradores
 */
function renderizarAdministradores(administradores) {
    const tbody = document.getElementById('adminBody');
    tbody.innerHTML = '';

    administradores.forEach(admin => {
        const row = tbody.insertRow();

        // Extraer datos
        const id = admin.id || 'N/A';
        const nombre = admin.username || 'N/A';
        const apellidos = admin.lastname || 'N/A';
        const correo = admin.email || 'N/A';
        const telefono = admin.phone ? String(admin.phone) : 'N/A';

        // Crear celdas
        row.innerHTML = `
            <td>${id}</td>
            <td>${nombre}</td>
            <td>${apellidos}</td>
            <td>${correo}</td>
            <td>${telefono}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editarAdministrador(${id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarAdministrador(${id})">Eliminar</button>
                </div>
            </td>
        `;
    });
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS
// ============================================

/**
 * Calcula y actualiza las estadísticas de administradores
 */
function actualizarEstadisticas() {
    const stats = {
        total: administradoresData.length
    };

    // Actualizar el DOM
    document.getElementById('statTotal').textContent = stats.total;

    return stats;
}

// ============================================
// FUNCIONES DE MODAL
// ============================================

/**
 * Abre el modal para crear nuevo administrador
 */
function abrirModalNuevo() {
    modoEdicion = false;
    adminActual = null;

    document.getElementById('modalTitle').textContent = 'Nuevo Administrador';
    document.getElementById('formAdmin').reset();
    document.getElementById('adminId').value = '';

    // En modo creación, la contraseña es obligatoria
    const passwordInput = document.getElementById('password');
    passwordInput.required = true;
    document.querySelector('#passwordGroup .form-hint').textContent = 'Mínimo 6 caracteres. Requerido.';

    document.getElementById('modalAdmin').style.display = 'block';
}

/**
 * Abre el modal para editar administrador existente
 * @param {number} id - ID del administrador a editar
 */
async function editarAdministrador(id) {
    modoEdicion = true;

    try {
        // Buscar el administrador en los datos cargados
        const admin = administradoresData.find(a => a.id === id);

        if (!admin) {
            alert('Administrador no encontrado');
            return;
        }

        adminActual = admin;

        // Llenar el formulario con los datos
        document.getElementById('modalTitle').textContent = 'Editar Administrador';
        document.getElementById('adminId').value = admin.id;
        document.getElementById('username').value = admin.username || '';
        document.getElementById('lastname').value = admin.lastname || '';
        document.getElementById('email').value = admin.email || '';
        document.getElementById('phone').value = admin.phone || '';
        document.getElementById('password').value = ''; // Dejar vacío

        // En modo edición, la contraseña es opcional
        const passwordInput = document.getElementById('password');
        passwordInput.required = false;
        document.querySelector('#passwordGroup .form-hint').textContent = 'Mínimo 6 caracteres. Dejar vacío para mantener la contraseña actual.';

        document.getElementById('modalAdmin').style.display = 'block';

    } catch (error) {
        console.error('Error al cargar datos para editar:', error);
        alert('Error al cargar los datos del administrador');
    }
}

/**
 * Cierra el modal
 */
function cerrarModal() {
    document.getElementById('modalAdmin').style.display = 'none';
    document.getElementById('formAdmin').reset();
    modoEdicion = false;
    adminActual = null;
}

// ============================================
// FUNCIONES CRUD
// ============================================

/**
 * Guarda un administrador (crear o actualizar)
 * @param {Event} event - Evento del formulario
 */
async function guardarAdministrador(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    // Validar teléfono (solo números)
    if (!/^\d+$/.test(phone)) {
        alert('El teléfono debe contener solo números');
        return;
    }

    const datos = {
        username: username,
        lastname: lastname,
        email: email,
        phone: parseInt(phone),
        role: ROLE_ADMIN_ID // Asignar el rol de Administrador
    };

    // Solo incluir contraseña si se proporcionó
    if (password && password.trim() !== '') {
        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        datos.password = password;
    } else if (!modoEdicion) {
        // Si es creación y no hay contraseña
        alert('La contraseña es requerida para crear un nuevo administrador');
        return;
    }

    try {
        datos.role = 3;
        if (modoEdicion) {
            // Actualizar administrador existente
            const id = document.getElementById('adminId').value;
            await authPut(`/api/users/${id}`, datos);
            alert('Administrador actualizado exitosamente');
        } else {
            // Crear nuevo administrador
            await authPost('/api/users', datos);
            alert('Administrador creado exitosamente');
        }

        cerrarModal();
        await cargarAdministradores();

    } catch (error) {
        console.error('Error al guardar administrador:', error);
        alert('Error al guardar el administrador. Verifique los datos e intente nuevamente.');
    }
}

/**
 * Elimina un administrador
 * @param {number} id - ID del administrador a eliminar
 */
async function eliminarAdministrador(id) {
    if (!confirm('¿Está seguro que desea eliminar este administrador?')) {
        return;
    }

    try {
        await authDelete(`/api/users/${id}`);
        alert('Administrador eliminado exitosamente');
        await cargarAdministradores();

    } catch (error) {
        console.error('Error al eliminar administrador:', error);
        alert('Error al eliminar el administrador. Por favor, intente nuevamente.');
    }
}

// ============================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ============================================

/**
 * Filtra administradores por nombre
 * @param {string} termino - Término de búsqueda
 */
function buscarPorNombre(termino) {
    const filtrados = administradoresData.filter(admin => {
        const nombreCompleto = `${admin.username || ''} ${admin.lastname || ''}`.toLowerCase();
        return nombreCompleto.includes(termino.toLowerCase());
    });

    renderizarAdministradores(filtrados);
}

/**
 * Restablece la vista mostrando todos los administradores
 */
function mostrarTodos() {
    renderizarAdministradores(administradoresData);
}

// ============================================
// FUNCIÓN DE CIERRE DE SESIÓN
// ============================================

/**
 * Cierra la sesión del usuario
 */
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        window.location.href = '../../index.html';
    }
}

// ============================================
// FUNCIONES DE ACTUALIZACIÓN
// ============================================

/**
 * Recarga los administradores desde la API
 */
async function recargarAdministradores() {
    await cargarAdministradores();
}

/**
 * Exporta los administradores a CSV
 */
function exportarACSV() {
    if (administradoresData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const headers = ['ID', 'Nombre', 'Apellidos', 'Correo', 'Teléfono'];
    const rows = administradoresData.map(a => {
        return [
            a.id || '',
            a.username || '',
            a.lastname || '',
            a.email || '',
            a.phone || ''
        ];
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `administradores_${new Date().getTime()}.csv`);
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
    console.log('Página de administradores cargada');

    // Mostrar información del usuario si es necesario
    if (typeof displayUserInfo === 'function') {
        displayUserInfo('.user-name');
    }

    // Cargar administradores
    cargarAdministradores();

    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        const modal = document.getElementById('modalAdmin');
        if (event.target === modal) {
            cerrarModal();
        }
    };

    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarAdministradores, 300000);
});