// Funcionalidad de la página de reserva
document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // VERIFICAR ESTADO DE AUTENTICACIÓN
    // ============================================

    function checkAuthenticationStatus() {
        const registerContainer = document.querySelector('.register-container');
        const isLoggedIn = getJWT() !== null;

        if (isLoggedIn) {
            // Usuario autenticado - mostrar mensaje de sesión activa
            const user = getUser();
            const userName = user ? (user.username || user.email || 'Usuario') : 'Usuario';

            registerContainer.innerHTML = `
                <div class="session-active">
                    <h3>✓ Sesión Iniciada</h3>
                    <p>Bienvenido, <strong>${userName}</strong></p>
                </div>
            `;
        } else {
            // Usuario NO autenticado - mantener formulario de registro visible
            // El HTML ya tiene el formulario, solo aseguramos que esté visible
            registerContainer.classList.remove('hidden');
        }
    }

    // Ejecutar verificación al cargar la página
    checkAuthenticationStatus();

    // ============================================
    // FUNCIONALIDAD DE REGISTRO
    // ============================================

    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
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

        // Manejar el envío del formulario de registro
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Obtener valores
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = phoneInput.value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            const passField = document.getElementById('registerPassword');
            const confPassField = document.getElementById('confirmPassword');

            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                passField.style.backgroundColor = "pink";
                passField.style.border = "2px solid red";
                confPassField.style.backgroundColor = "pink";
                confPassField.style.border = "2px solid red";
                alert('Las contraseñas no coinciden');
                return;
            } else {
                passField.style = "";
                confPassField.style = "";
            }

            console.log('Registrando usuario...');

            try {
                // Registrar usuario
                const response = await fetch(`${API_BASE_URL}/api/auth/local/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: firstName,
                        email: email,
                        password: password,
                        phone: phone,
                        lastName: lastName
                    })
                });

                const data = await response.json();

                if (!response.ok) throw new Error("Error al registrar usuario");

                // Asignar rol de usuario
                const response2 = await fetch(`${API_BASE_URL}/api/posts/asignRole?p1=${data.user.id}&p2=Usuario`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok && response2.ok && data.jwt) {
                    // Guardar JWT y usuario
                    setJWT(data.jwt);
                    setUser(data.user);

                    alert('¡Registro exitoso! Ahora puedes continuar con tu reserva.');

                    // Actualizar la interfaz para mostrar sesión activa
                    checkAuthenticationStatus();
                }
            } catch (error) {
                console.error('Error al registrarse:', error);
                alert('Error al registrarse: ' + error.message);
            }
        });
    }

    // ============================================
    // FORMATEO DE CAMPOS DE PAGO
    // ============================================

    // Formatear número de tarjeta automáticamente
    const cardNumberInput = document.getElementById('cardNumber');
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join('-') || value;
        e.target.value = formattedValue;
    });

    // Formatear fecha de expiración
    const expiryInput = document.getElementById('expiry');
    expiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    // Solo permitir números en CVV
    const cvvInput = document.getElementById('cvv');
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Solo permitir números en código postal
    const postalCodeInput = document.getElementById('postalCode');
    postalCodeInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // ============================================
    // MANEJAR CONFIRMACIÓN DE RESERVA
    // ============================================

    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Verificar que el usuario esté autenticado
        if (!getJWT()) {
            alert('Por favor, inicia sesión o regístrate antes de continuar con la reserva.');
            return;
        }

        // Validar campos de pago
        const cardNumber = cardNumberInput.value.replace(/-/g, '');
        const expiry = expiryInput.value;
        const cvv = cvvInput.value;
        const postalCode = postalCodeInput.value;

        if (cardNumber.length < 16) {
            alert('Por favor ingrese un número de tarjeta válido');
            return;
        }

        if (expiry.length < 5) {
            alert('Por favor ingrese una fecha de caducidad válida');
            return;
        }

        if (cvv.length < 3) {
            alert('Por favor ingrese un CVV válido');
            return;
        }

        if (postalCode.length < 5) {
            alert('Por favor ingrese un código postal válido');
            return;
        }

        // Cambiar texto del botón
        const btnConfirm = document.querySelector('.btn-confirm');
        const originalText = btnConfirm.textContent;
        btnConfirm.textContent = 'Procesando pago...';
        btnConfirm.disabled = true;

        try {
            // Obtener información del sitio desde localStorage
            const siteId = localStorage.getItem('siteId');

            if (!siteId) {
                throw new Error('No se encontró información del sitio a reservar');
            }

            // Obtener detalles del sitio
            const sitio = await authGet(`/api/sites/${siteId}`);

            if (!sitio) {
                throw new Error('No se pudo obtener la información del sitio');
            }

            // Formatear fechas
            const fecha = new Date(sitio.arriveDate);
            const fecha2 = new Date(sitio.departureDate);

            const year1 = fecha.getFullYear();
            const month1 = String(fecha.getMonth() + 1).padStart(2, '0');
            const day1 = String(fecha.getDate()).padStart(2, '0');

            const year2 = fecha2.getFullYear();
            const month2 = String(fecha2.getMonth() + 1).padStart(2, '0');
            const day2 = String(fecha2.getDate()).padStart(2, '0');

            // Generar código de reserva
            const codigo = Math.floor(10000000 + Math.random() * 90000000);

            // Crear la reserva
            const response = await authPost(`/api/reservations`, {
                arriveDate: `${year1}-${month1}-${day1}`,
                departureDate: `${year2}-${month2}-${day2}`,
                user: getUser().id,
                site: siteId,
                codigo: codigo
            });

            if (!response) {
                throw new Error('Error al crear la reserva');
            }

            // Actualizar código en el backend
            const r = await authGet(`/api/posts/cambiarCodigo?p1=${codigo}`);

            if (!r) {
                console.warn('No se pudo actualizar el código, pero la reserva fue creada');
            }

            // Éxito - redirigir
            alert('¡Reserva confirmada exitosamente! Código de reserva: ' + codigo);

            // Limpiar localStorage
            localStorage.removeItem('siteId');

            // Redirigir después de un pequeño delay
            setTimeout(function () {
                window.location.href = '../html/home-user.html';
            }, 1000);

        } catch (error) {
            console.error('Error al procesar la reserva:', error);
            alert('Error al procesar la reserva: ' + error.message);

            // Restaurar botón
            btnConfirm.textContent = originalText;
            btnConfirm.disabled = false;
        }
    });

    // ============================================
    // CARGAR INFORMACIÓN DE LA RESERVA
    // ============================================

    async function loadReservationInfo() {
        const siteId = localStorage.getItem('siteId');

        if (!siteId) {
            console.warn('No se encontró ID del sitio en localStorage');
            return;
        }

        try {
            const sitio = await authGet(`/api/sites/${siteId}`);

            if (sitio) {
                // Actualizar fechas
                const arriveDate = new Date(sitio.arriveDate);
                const departureDate = new Date(sitio.departureDate);

                const checkInEl = document.getElementById('checkInDate');
                const checkOutEl = document.getElementById('checkOutDate');
                const totalEl = document.getElementById('totalAmount');

                if (checkInEl) {
                    checkInEl.textContent = arriveDate.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                }

                if (checkOutEl) {
                    checkOutEl.textContent = departureDate.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                }

                // Calcular días y precio total
                const days = Math.ceil((departureDate - arriveDate) / (1000 * 60 * 60 * 24));
                const pricePerDay = sitio.price || 500;
                const total = days * pricePerDay;

                if (totalEl) {
                    totalEl.textContent = `$${total.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`;
                }
            }
        } catch (error) {
            console.error('Error al cargar información de la reserva:', error);
        }
    }

    // Cargar información al iniciar
    if (getJWT()) {
        loadReservationInfo();
    }

    // ============================================
    // ANIMACIONES DE ENTRADA
    // ============================================

    document.querySelectorAll('.payment-section, .reservation-info, .register-container').forEach((section, index) => {
        setTimeout(() => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'all 0.5s ease';

            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
});