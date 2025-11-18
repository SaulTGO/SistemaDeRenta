// Funcionalidad de inicio de sesión
document.addEventListener('DOMContentLoaded', function() {
    
    // ✅ NUEVO: Verificar si ya hay sesión activa
    if (isAuthenticated()) {
        window.location.href = '../index.html';
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Manejar el envío del formulario
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener valores
        const identifier = usernameInput.value;
        const password = passwordInput.value;

        // Mostrar mensaje de carga
        const btnLogin = document.querySelector('.btn-login');
        const originalText = btnLogin.textContent;
        btnLogin.textContent = 'Iniciando sesión...';
        btnLogin.disabled = true;

        try {
            // ✅ MODIFICADO: Usar API_BASE_URL de auth-utils.js
            const response = await fetch(`${API_BASE_URL}/api/auth/local`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identifier: identifier,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.jwt) {
                // ✅ MODIFICADO: Usar funciones de auth-utils.js
                setJWT(data.jwt);
                setUser(data.user);

                console.log('Inicio de sesión exitoso');

                const response = await fetch(`${API_BASE_URL}/api/users/me?populate=role`, {
                    headers: {
                        Authorization: `Bearer ${data.jwt}`,
                    },
                });
                const user = await response.json();
                try {
                    user.role.name!==null;
                    switch (user.role.name!==null ? user.role.name:'Usuario') {
                        case 'Administrador':
                            window.location.href = '../html/admin/home-admin.html';
                            break;
                        case 'Personal':
                            window.location.href = '../html/personal/home-personal.html';
                            break;
                        case 'Usuario':
                            window.location.href = '../html/reservar.html';
                            break;
                        case 'Authenticated':
                            window.location.href = '../html/reservar.html';
                            break;
                        default:
                            window.location.href = '../html/login.html';
                    }
                }catch{ window.location.href = '../index.html';}

            } else {
                // Manejar error de autenticación
                throw new Error(data.error?.message || 'Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            
            // Mostrar mensaje de error al usuario
            alert('Error al iniciar sesión: ' + error.message);
            
            // Restaurar botón
            btnLogin.textContent = originalText;
            btnLogin.disabled = false;
        }
    });

    // Animación de entrada
    const loginContainer = document.querySelector('.login-container');
    const loginImage = document.querySelector('.login-image');
    
    setTimeout(() => {
        loginContainer.style.opacity = '0';
        loginContainer.style.transform = 'translateX(-20px)';
        loginContainer.style.transition = 'all 0.6s ease';
        
        loginImage.style.opacity = '0';
        loginImage.style.transform = 'translateX(20px)';
        loginImage.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            loginContainer.style.opacity = '1';
            loginContainer.style.transform = 'translateX(0)';
            
            loginImage.style.opacity = '1';
            loginImage.style.transform = 'translateX(0)';
        }, 100);
    }, 0);
});