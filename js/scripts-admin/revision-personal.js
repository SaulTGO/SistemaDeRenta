// ============================================
// PROTECCIÓN DE PÁGINA
// ============================================
// Verificar autenticación al cargar la página
// requireAuth();

// ============================================
// VARIABLES GLOBALES
// ============================================
let personalData = [];
let modoEdicion = false;
let personalActual = null;

// Nota: El rol "Personal" debe tener ID 3 en tu base de datos
// Ajusta este valor según tu configuración
const ROLE_PERSONAL_ID = 3;

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

/**
 * Carga el personal desde la API
 */
async function cargarPersonal() {
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
        const response = await authGet('/api/users?filters[role][name][$eq]=Personal&populate=role');

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
            personalData = data;
            renderizarPersonal(personalData);
            actualizarEstadisticas();
            estadisticasPanel.style.display = 'grid';
            console.log(`${personalData.length} registros de personal cargados`);
        } else {
            noDataMessage.style.display = 'block';
            console.log('No se encontraron registros de personal');
        }

    } catch (error) {
        console.error('Error al cargar personal:', error);
        errorMessage.textContent = 'Error al cargar el personal. Por favor, intente nuevamente.';
        errorMessage.style.display = 'block';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Renderiza el personal en la tabla
 * @param {Array} personal - Array de objetos con datos del personal
 */
function renderizarPersonal(personal) {
    const tbody = document.getElementById('personalBody');
    tbody.innerHTML = '';

    personal.forEach(usuario => {
        const row = tbody.insertRow();

        // Extraer y asignar los campos del JSON
        const idPersonal = usuario.id || 'N/A';
        const nombre = usuario.username || 'N/A';
        const apellidos = usuario.lastname || 'N/A';
        const correo = usuario.email || 'N/A';
        const telefono = usuario.phone ? String(usuario.phone) : 'N/A';

        // Crear celdas
        row.innerHTML = `
            <td>${idPersonal}</td>
            <td>${nombre}</td>
            <td>${apellidos}</td>
            <td>${correo}</td>
            <td>${telefono}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editarPersonal(${idPersonal})">Editar</button>
                    <button class="btn-delete" onclick="eliminarPersonal(${idPersonal})">Eliminar</button>
                </div>
            </td>
        `;
    });
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS
// ============================================

/**
 * Calcula y actualiza las estadísticas de personal
 */
function actualizarEstadisticas() {
    const stats = {
        total: personalData.length
    };

    // Actualizar el DOM
    document.getElementById('statTotal').textContent = stats.total;

    return stats;
}

// ============================================
// FUNCIONES DE MODAL
// ============================================

/**
 * Abre el modal para crear nuevo personal
 */
function abrirModalNuevo() {
    modoEdicion = false;
    personalActual = null;

    document.getElementById('modalTitle').textContent = 'Nuevo Personal';
    document.getElementById('formPersonal').reset();
    document.getElementById('personalId').value = '';

    // En modo creación, la contraseña es obligatoria
    const passwordInput = document.getElementById('password');
    passwordInput.required = true;
    document.querySelector('#passwordGroup .form-hint').textContent = 'Mínimo 6 caracteres. Requerido.';

    document.getElementById('modalPersonal').style.display = 'block';
}

/**
 * Abre el modal para editar personal existente
 * @param {number} documentId - ID del personal a editar
 */
async function editarPersonal(documentId) {
    modoEdicion = true;

    try {
        // Buscar el personal en los datos cargados
        const persona = personalData.find(p => p.documentId === documentId);

        if (!persona) {
            alert('Personal no encontrado');
            return;
        }

        personalActual = persona;

        // Llenar el formulario con los datos
        document.getElementById('modalTitle').textContent = 'Editar Personal';
        document.getElementById('personalId').value = persona.documentId;
        document.getElementById('username').value = persona.username || '';
        document.getElementById('lastname').value = persona.lastname || '';
        document.getElementById('email').value = persona.email || '';
        document.getElementById('phone').value = persona.phone || '';
        document.getElementById('password').value = ''; // Dejar vacío

        // En modo edición, la contraseña es opcional
        const passwordInput = document.getElementById('password');
        passwordInput.required = false;
        document.querySelector('#passwordGroup .form-hint').textContent = 'Mínimo 6 caracteres. Dejar vacío para mantener la contraseña actual.';

        document.getElementById('modalPersonal').style.display = 'block';

    } catch (error) {
        console.error('Error al cargar datos para editar:', error);
        alert('Error al cargar los datos del personal');
    }
}

/**
 * Cierra el modal
 */
function cerrarModal() {
    document.getElementById('modalPersonal').style.display = 'none';
    document.getElementById('formPersonal').reset();
    modoEdicion = false;
    personalActual = null;
}

// ============================================
// FUNCIONES CRUD
// ============================================

/**
 * Guarda un personal (crear o actualizar)
 * @param {Event} event - Evento del formulario
 */
async function guardarPersonal(event) {
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
        role: ROLE_PERSONAL_ID // Asignar el rol de Personal
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
        if (modoEdicion) {
            // Actualizar personal existente
            const id = document.getElementById('personalId').value;
            await authPut(`/api/users/${id}`, datos);
            alert('Personal actualizado exitosamente');
        } else {
            // Crear nuevo personal
            await authPost('/api/users', datos);
            alert('Personal creado exitosamente');
        }

        cerrarModal();
        await cargarPersonal();

    } catch (error) {
        console.error('Error al guardar personal:', error);
        alert('Error al guardar el personal. Verifique los datos e intente nuevamente.');
    }
}

/**
 * Elimina un personal
 * @param {number} documentId - ID del personal a eliminar
 */
async function eliminarPersonal(documentId) {
    if (!confirm('¿Está seguro que desea eliminar este personal?')) {
        return;
    }

    try {
        await authDelete(`/api/users/${documentId}`);
        alert('Personal eliminado exitosamente');
        await cargarPersonal();

    } catch (error) {
        console.error('Error al eliminar personal:', error);
        alert('Error al eliminar el personal. Por favor, intente nuevamente.');
    }
}

// ============================================
// FUNCIONES DE BÚSQUEDA Y FILTRADO
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

/**
 * Restablece la vista mostrando todo el personal
 */
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
async function recargarPersonal() {
    await cargarPersonal();
}

/**
 * Exporta el personal a CSV
 */
function exportarACSV() {
    if (personalData.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const headers = ['ID Personal', 'Nombre', 'Apellidos', 'Correo', 'Teléfono'];
    const rows = personalData.map(u => {
        return [
            u.id || '',
            u.username || '',
            u.lastname || '',
            u.email || '',
            u.phone || ''
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
    cargarPersonal();

    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        const modal = document.getElementById('modalPersonal');
        if (event.target === modal) {
            cerrarModal();
        }
    };

    // Configurar actualización automática cada 5 minutos (opcional)
    // setInterval(cargarPersonal, 300000);
});