// Funcionalidad de registro
document.addEventListener('DOMContentLoaded', function() {
    
    const registerForm = document.getElementById('registerForm');
    const phoneInput = document.getElementById('phone');

    // Formatear teléfono automáticamente
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.substring(0, 10);
        
        if (value.length >= 6) {
            value = value.substring(0, 2) + ' ' + value.substring(2, 6) + ' ' + value.substring(6);
        } else if (value.length >= 2) {
            value = value.substring(0, 2) + ' ' + value.substring(2);
        }
        
        e.target.value = value;
    });

    // Manejar el envío del formulario
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = phoneInput.value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        // Log para debugging (sin validación real)
        console.log('Registrando usuario...');
        console.log('Nombre:', firstName, lastName);
        console.log('Email:', email);
        console.log('Teléfono:', phone);

        // Simular proceso de registro
        const btnRegister = document.querySelector('.btn-register');
        const originalText = btnRegister.textContent;
        btnRegister.textContent = 'Creando cuenta...';
        btnRegister.disabled = true;

        // Simular delay de registro y redirigir
        setTimeout(function() {
            alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
            
            // Redirigir a la página de inicio de sesión
            window.location.href = '../html/login.html';
        }, 1500);
    });

    // Animación de entrada
    const registerContainer = document.querySelector('.register-container');
    const registerImage = document.querySelector('.register-image');
    
    setTimeout(() => {
        registerContainer.style.opacity = '0';
        registerContainer.style.transform = 'translateX(-20px)';
        registerContainer.style.transition = 'all 0.6s ease';
        
        registerImage.style.opacity = '0';
        registerImage.style.transform = 'translateX(20px)';
        registerImage.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            registerContainer.style.opacity = '1';
            registerContainer.style.transform = 'translateX(0)';
            
            registerImage.style.opacity = '1';
            registerImage.style.transform = 'translateX(0)';
        }, 100);
    }, 0);
});