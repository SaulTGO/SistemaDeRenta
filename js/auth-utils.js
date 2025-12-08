// ============================================
// UTILIDADES DE AUTENTICACIÓN
// ============================================

// URL base de la API
const API_BASE_URL = 'http://10.42.0.1:1337';

// ============================================
// GESTIÓN DE JWT
// ============================================

/**
 * Obtiene el JWT almacenado en las cookies
 * @returns {string|null} El token JWT o null si no existe
 */
function getJWT() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'jwt') {
            return value;
        }
    }
    return null;
}

/**
 * Guarda el JWT en las cookies
 * @param {string} jwt - El token JWT a guardar
 * @param {number} maxAge - Tiempo de expiración en segundos (por defecto 24 horas)
 */
function setJWT(jwt, maxAge = 86400) {
    document.cookie = `jwt=${encodeURIComponent(jwt)}; path=/; max-age=${maxAge}`;
    //localStorage.setItem('jwt', jwt);
}

/**
 * Elimina el JWT de las cookies
 */
function removeJWT() {
    document.cookie = 'jwt=; path=/; max-age=0';
}

// ============================================
// GESTIÓN DE USUARIO
// ============================================

/**
 * Guarda la información del usuario en localStorage
 * @param {object} user - Objeto con datos del usuario
 */
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Obtiene la información del usuario desde localStorage
 * @returns {object|null} Datos del usuario o null si no existe
 */
function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Elimina la información del usuario de localStorage
 */
function removeUser() {
    localStorage.removeItem('user');
}

// ============================================
// VERIFICACIÓN DE AUTENTICACIÓN
// ============================================

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} true si hay un JWT válido
 */
function isAuthenticated() {
    return getJWT() !== null;
}

/**
 * Protege una página - redirige al login si no está autenticado
 * @param {string} loginUrl - URL de la página de login (opcional)
 */
function requireAuth(loginUrl = '../../html/login.html') {
    if (!isAuthenticated()) {
        window.location.href = loginUrl;
    }
}

// ============================================
// CIERRE DE SESIÓN
// ============================================

/**
 * Cierra la sesión del usuario
 * @param {string} redirectUrl - URL a la que redirigir después del logout
 */
function logout(redirectUrl = '../../index.html') {
    removeJWT();
    removeUser();
    window.location.href = redirectUrl;
}

// ============================================
// PETICIONES A LA API CON AUTENTICACIÓN
// ============================================

/**
 * Realiza una petición autenticada a la API
 * @param {string} endpoint - Ruta del endpoint (ej: '/api/espacios')
 * @param {object} options - Opciones de fetch (method, body, etc.)
 * @returns {Promise<object>} Respuesta de la API
 */
async function authenticatedFetch(endpoint, options = {}) {
    const jwt = getJWT();
    
    if (!jwt) {
        throw new Error('No hay sesión activa');
    }
    
    // Configurar headers por defecto
    const defaultHeaders = {
        'Authorization': `Bearer ${jwt}`
    };

    if (options.method && options.method !== 'GET') {
        defaultHeaders['Content-Type'] = 'application/json';
    }


    // Combinar headers personalizados con los por defecto
    const headers = {
        ...defaultHeaders,
        ...options.headers
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        // Si el token es inválido o expiró
        if (response.status === 401) {
            alert('Sesión expirada. Por favor inicia sesión nuevamente');
            logout();
            throw new Error('Sesión expirada');
        }
        
        // Si hay otro error
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Error ${response.status}`);
        }
        if(response.status === 204){
            return {};
        }
        return await response.json();
    } catch (error) {
        console.error('Error en petición autenticada:', error);
        throw error;
    }
}

/**
 * Realiza un GET autenticado
 * @param {string} endpoint - Ruta del endpoint
 * @returns {Promise<object>} Respuesta de la API
 */
async function authGet(endpoint) {
    return authenticatedFetch(endpoint, { method: 'GET' });
}

/**
 * Realiza un POST autenticado
 * @param {string} endpoint - Ruta del endpoint
 * @param {object} data - Datos a enviar
 * @returns {Promise<object>} Respuesta de la API
 */
async function authPost(endpoint, data) {
    return authenticatedFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Realiza un PUT autenticado
 * @param {string} endpoint - Ruta del endpoint
 * @param {object} data - Datos a actualizar
 * @returns {Promise<object>} Respuesta de la API
 */
async function authPut(endpoint, data) {
    return authenticatedFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Realiza un DELETE autenticado
 * @param {string} endpoint - Ruta del endpoint
 * @returns {Promise<object>} Respuesta de la API
 */
async function authDelete(endpoint) {
    return authenticatedFetch(endpoint, { method: 'DELETE' });
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Muestra información del usuario en el DOM si está autenticado
 * @param {string} selector - Selector del elemento donde mostrar el nombre
 */
function displayUserInfo(selector) {
    const user = getUser();
    if (user) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = user.username || user.email || 'Usuario';
        }
    }
}

// Exportar funciones para uso global (solo si se necesita en módulos)
// Si usas <script src="auth-utils.js"> no necesitas esto
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_BASE_URL,
        getJWT,
        setJWT,
        removeJWT,
        setUser,
        getUser,
        removeUser,
        isAuthenticated,
        requireAuth,
        logout,
        authenticatedFetch,
        authGet,
        authPost,
        authPut,
        authDelete,
        displayUserInfo
    };
}

// =========================================
// PETICIONES A LA API SIN AUTENTICACION
// =========================================
async function unAuthenticatedFetch(endpoint, options = {}) {
    // Configurar headers por defecto
    const defaultHeaders = {};

    if (options.method && options.method !== 'GET') {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    // Combinar headers personalizados con los por defecto
    const headers = {
        ...defaultHeaders,
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en petición inautenticada:', error);
        throw error;
    }
}
async function unAuthGet(endpoint) {
    return unAuthenticatedFetch(endpoint, { method: 'GET' });
}
async function unAuthPut(endpoint, data) {
    return unAuthenticatedFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}
async function unAuthPost(endpoint, data) {
    return unAuthenticatedFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}