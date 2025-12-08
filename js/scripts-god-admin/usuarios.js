// ============================================
// PROTECCIÓN DE PÁGINA
// ============================================
// Verificar autenticación al cargar la página
// requireAuth();

// ============================================
// VARIABLES GLOBALES
// ============================================
let usuariosData = [];
let modoEdicion = false;
let usuarioActual = null;

// Nota: El rol "User" debe tener ID 1 en tu base de datos
// Ajusta este valor según tu configuración
const ROLE_USER_ID = 1;

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

/**
 * Carga los usuarios desde la API
 */
async function cargarUsuarios() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const noDataMessage = document.getElementById('noDataMessage');
    const tbody = document.getElementById('usuariosBody');
    const estadisticasPanel = document.getElementById('estadisticasPanel');

    try {
        // Mostrar indicador de carga
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        noDataMessage.style.display = 'none';
        if (estadisticasPanel) estadisticasPanel.style.display = 'none';
        tbody.innerHTML = '';

        // Realizar petición a la API filtrando por rol User
        const response = await authGet('/api/users?filters[role][name][$eq]=Usuario&populate=role');

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
            usuariosData = data;
            renderizarUsuarios(usuariosData);
            actualizarEstadisticas();
            if (estadisticasPanel) estadisticasPanel.style.display = 'grid';
            console.log(`${usuariosData.length} usuarios cargados`);
        } else {
            noDataMessage.style.display = 'block';
            console.log('No se encontraron usuarios');
        }

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        errorMessage.textContent = 'Error al cargar los usuarios. Por favor, intente nuevamente.';
        errorMessage.style.display = 'block';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Renderiza los usuarios en la tabla
 * @param {Array} usuarios - Array de objetos con datos de usuarios
 */
function renderizarUsuarios(usuarios) {
    const tbody = document.getElementById('usuariosBody');
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
        const row = tbody.insertRow();

        // Extraer datos
        const id = usuario.id || 'N/A';
        const nombre = usuario.username || 'N/A';
        const apellidos = usuario.lastName || 'N/A';
        const correo = usuario.email || 'N/A';
        const telefono = usuario.phone ? String(usuario.phone) : 'N/A';

        // Crear celdas
        row.innerHTML = `
            <td>${id}</td>
            <td>${nombre}</td>
            <td>${apellidos}</td>
            <td>${correo}</td>
            <td>${telefono}</td>
            <td>********</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editarUsuario(${id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarUsuario(${id})">Eliminar</button>
                </div>
            </td>
        `;
    });
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS
// ============================================

/**
 * Calcula y actualiza las estadísticas de usuarios
 */
function actualizarEstadisticas() {
    const stats = {
        total: usuariosData.length
    };

    // Actualizar el DOM si existe el elemento
    const statTotal = document.getElementById('statTotal');
    if (statTotal) {
        statTotal.textContent = stats.total;
    }

    return stats;
}

// ============================================
// FUNCIONES DE MODAL
// ============================================

/**
 * Abre el modal para crear nuevo usuario
 */
function abrirModalNuevo() {
    modoEdicion = false;
    usuarioActual = null;

    document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('usuarioId').value = '';

    // En modo creación, la contraseña es obligatoria
    const passwordInput = document.getElementById('password');
    passwordInput.required = true;
    document.querySelector('#passwordGroup .form-hint').textContent = 'Mínimo 6 caracteres. Requerido.';

    document.getElementById('modalUsuario').style.display = 'block';
}

/**
 * Abre el modal para editar usuario existente
 * @param {number} id - ID del usuario a editar
 */
async function editarUsuario(id) {
    modoEdicion = true;

    try {
        // Buscar el usuario en los datos cargados
        const usuario = usuariosData.find(u => u.id === id);

        if (!usuario) {
            alert('Usuario no encontrado');
            return;
        }

        usuarioActual = usuario;

        // Llenar el formulario con los datos
        document.getElementById('modalTitle').textContent = 'Editar Usuario';
        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('username').value = usuario.username || '';
        document.getElementById('lastname').value = usuario.lastName || '';
        document.getElementById('email').value = usuario.email || '';
        document.getElementById('phone').value = usuario.phone || '';
        document.getElementById('password').value = ''; // Dejar vacío

        // En modo edición, la contraseña es opcional
        const passwordInput = document.getElementById('password');
        passwordInput.required = false;
        document.querySelector('#passwordGroup .form-hint').textContent = 'Mínimo 6 caracteres. Dejar vacío para mantener la contraseña actual.';

        document.getElementById('modalUsuario').style.display = 'block';

    } catch (error) {
        console.error('Error al cargar datos para editar:', error);
        alert('Error al cargar los datos del usuario');
    }
}

/**
 * Cierra el modal
 */
function cerrarModal() {
    document.getElementById('modalUsuario').style.display = 'none';
    document.getElementById('formUsuario').reset();
    modoEdicion = false;
    usuarioActual = null;
}

// ============================================
// FUNCIONES CRUD
// ============================================

/**
 * Guarda un usuario (crear o actualizar)
 * @param {Event} event - Evento del formulario
 */
async function guardarUsuario(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const lastName = document.getElementById('lastname').value;
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
        lastName: lastName,
        email: email,
        phone: parseInt(phone),
        role: ROLE_USER_ID // Asignar el rol de Usuario
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
        alert('La contraseña es requerida para crear un nuevo usuario');
        return;
    }

    try {
        datos.role = 4;
        if (modoEdicion) {
            // Actualizar usuario existente
            const id = document.getElementById('usuarioId').value;
            await authPut(`/api/users/${id}`, datos);
            alert('Usuario actualizado exitosamente');
        } else {
            // Crear nuevo usuario
            await authPost('/api/users', datos);
            alert('Usuario creado exitosamente');
        }

        cerrarModal();
        await cargarUsuarios();

    } catch (error) {
        console.error('Error al guardar usuario:', error);
        alert('Error al guardar el usuario. Verifique los datos e intente nuevamente.');
    }
}

/**
 * Elimina un usuario
 * @param {number} id - ID del usuario a eliminar
 */
async function eliminarUsuario(id) {
    if (!confirm('¿Está seguro que desea eliminar este usuario?')) {
        return;
    }

    try {
        await authDelete(`/api/users/${id}`);
        alert('Usuario eliminado exitosamente');
        await cargarUsuarios();

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario. Por favor, intente nuevamente.');
    }
}

// ============================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
// ============================================

/**
 * Filtra usuarios por nombre
 * @param {string} termino - Término de búsqueda
 */
function buscarPorNombre(termino) {
    const filtrados = usuariosData.filter(usuario => {
        const nombreCompleto = `${usuario.username || ''} ${usuario.lastName || ''}`.toLowerCase();
        return nombreCompleto.includes(termino.toLowerCase());
    });

    renderizarUsuarios(filtrados);
}

/**
 * Restablece la vista mostrando todos los usuarios
 */
function mostrarTodos() {
    renderizarUsuarios(usuariosData);
}

// ============================================
// FUNCIONES DE ACTUALIZACIÓN
// ============================================

/**
 * Recarga los usuarios desde la API
 */
async function recargarUsuarios() {
    await cargarUsuarios();
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa la página al cargar el DOM
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de usuarios cargada');

    // Mostrar información del usuario si es necesario
    if (typeof displayUserInfo === 'function') {
        displayUserInfo('.user-name');
    }

    // Cargar usuarios
    cargarUsuarios();

    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        const modal = document.getElementById('modalUsuario');
        if (event.target === modal) {
            cerrarModal();
        }
    };

    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarUsuarios, 300000);
});