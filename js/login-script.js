// Funcionalidad de inicio de sesión
document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Manejar el envío del formulario
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores (sin validación por ahora)
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Simular proceso de inicio de sesión
        console.log('Iniciando sesión...');
        console.log('Usuario:', username);
        
        // Mostrar mensaje de carga
        const btnLogin = document.querySelector('.btn-login');
        const originalText = btnLogin.textContent;
        btnLogin.textContent = 'Iniciando sesión...';
        btnLogin.disabled = true;

        // Simular delay de autenticación y redirigir
        setTimeout(function() {
            // Redirigir a la página de espacios (o dashboard)
            window.location.href = '../html/admin/home-admin.html';
        }, 1000);
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