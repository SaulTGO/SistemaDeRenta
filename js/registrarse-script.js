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
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Obtener valores
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = phoneInput.value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        const passField = document.getElementById('registerPassword');
        const confPassField = document.getElementById('confirmPassword');
        if (password !== confirmPassword) {
            passField.style.backgroundColor = "pink";
            passField.style.border = "2px solid red";

            confPassField.style.backgroundColor = "pink";
            confPassField.style.border = "2px solid red";
            return;
        } else {
            passField.style = "";
            confPassField.style = "";
        }
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


        try {
            // ✅ MODIFICADO: Usar API_BASE_URL de auth-utils.js
            const response = await fetch(`${API_BASE_URL}/api/auth/local/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: firstName,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();
            console.log(data)
            if (!response.ok) throw "Error inesperado";
            const response2 = await fetch(`${API_BASE_URL}/api/posts/asignRole?p1=${data.user.id}&p2=Usuario`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });


            if (response.ok && response2.ok && data.jwt) {
                window.location.href = '../html/login.html';
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