// Funcionalidad de la página de reserva
document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // VERIFICAR ESTADO DE AUTENTICACIÓN
    // ============================================

    function checkAuthenticationStatus() {
        const registerContainer = document.querySelector('.register-container');
        const isLoggedIn = getJWT() !== null;

        if (isLoggedIn) {
            // Usuario autenticado - ocultar formulario de registro
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
            registerContainer.classList.remove('hidden');
        }
    }

    // Ejecutar verificación al cargar la página
    checkAuthenticationStatus();

    // ============================================
    // FORMATEO DE CAMPOS DE REGISTRO
    // ============================================

    const phoneInput = document.getElementById('phone');

    if (phoneInput) {
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
    // FUNCIÓN AUXILIAR: PARSEAR FECHAS SIN ZONA HORARIA
    // ============================================

    function parseFechaSinZonaHoraria(dateString) {
        const [year, month, day] = dateString.split('T')[0].split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // ============================================
    // FUNCIÓN AUXILIAR: REGISTRAR USUARIO
    // ============================================

    async function registrarUsuario() {
        // Obtener valores del formulario de registro
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = parseInt(phoneInput.value.trim().replace(/[^0-9]/g, ''),10);
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const passField = document.getElementById('registerPassword');
        const confPassField = document.getElementById('confirmPassword');

        // Validar que los campos estén completos
        if (!firstName || !lastName || !email || !phone || !password) {
            throw new Error('Por favor completa todos los campos de registro');
        }

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            passField.style.backgroundColor = "pink";
            passField.style.border = "2px solid red";
            confPassField.style.backgroundColor = "pink";
            confPassField.style.border = "2px solid red";
            throw new Error('Las contraseñas no coinciden');
        } else {
            passField.style = "";
            confPassField.style = "";
        }

        console.log('Registrando usuario...');

        // Registrar usuario
        const response = await unAuthPost('/api/auth/local/register', {
                username: firstName,
                email: email,
                password: password,
                phone: phone,
                lastName: lastName
                }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Error al registrar usuario");
        }

        // Asignar rol de usuario
        const response2 = await fetch(`${API_BASE_URL}/api/posts/asignRole?p1=${data.user.id}&p2=Usuario`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response2.ok) {
            console.warn('No se pudo asignar el rol, pero el usuario fue creado');
        }

        if (data.jwt) {
            // Guardar JWT y usuario
            setJWT(data.jwt);
            setUser(data.user);

            console.log('✓ Usuario registrado e iniciado sesión exitosamente');

            // Actualizar la interfaz para mostrar sesión activa
            checkAuthenticationStatus();

            return true;
        } else {
            throw new Error('No se recibió el token de autenticación');
        }
    }

    // ============================================
    // FUNCIÓN AUXILIAR: PROCESAR RESERVA
    // ============================================

    async function procesarReserva() {
        // Obtener información del sitio desde localStorage
        const siteId = localStorage.getItem('siteId');

        if (!siteId) {
            throw new Error('No se encontró información del sitio a reservar');
        }

        // Obtener detalles del sitio
        const sitio = await unAuthGet(`/api/sites/${siteId}`);

        if (!sitio) {
            throw new Error('No se pudo obtener la información del sitio');
        }

        // Formatear fechas SIN zona horaria
        const fecha = parseFechaSinZonaHoraria(localStorage.getItem("arriveDate"));
        const fecha2 = parseFechaSinZonaHoraria(localStorage.getItem("departureDate"));

        const year1 = fecha.getFullYear();
        const month1 = String(fecha.getMonth() + 1).padStart(2, '0');
        const day1 = String(fecha.getDate()).padStart(2, '0');

        const year2 = fecha2.getFullYear();
        const month2 = String(fecha2.getMonth() + 1).padStart(2, '0');
        const day2 = String(fecha2.getDate()).padStart(2, '0');

        // Generar código de reserva
        const codigo = Math.floor(10000000 + Math.random() * 90000000);

        // Crear la reserva
        const response = await authPost(`/api/reservations`, {data:{
            arriveDate: `${year1}-${month1}-${day1}`,
            departureDate: `${year2}-${month2}-${day2}`,
            user: getUser().id,
            site: siteId,
            codigo: codigo
        }});

        if (!response) {
            throw new Error('Error al crear la reserva');
        }

        return codigo;
    }

    // ============================================
    // MANEJAR CONFIRMACIÓN DE RESERVA (UNIFICADO)
    // ============================================

    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', async function (e) {
        e.preventDefault();

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
        btnConfirm.textContent = 'Procesando...';
        btnConfirm.disabled = true;

        try {
            // PASO 1: Si el usuario NO está autenticado, registrarlo primero
            if (!getJWT()) {
                btnConfirm.textContent = 'Registrando usuario...';
                await registrarUsuario();
                btnConfirm.textContent = 'Procesando pago...';
            }

            // PASO 2: Procesar la reserva
            btnConfirm.textContent = 'Confirmando reserva...';
            const codigo = await procesarReserva();

            // PASO 3: Éxito - redirigir
            alert('¡Reserva confirmada exitosamente! Código de reserva: ' + codigo);

            // Limpiar localStorage
            localStorage.removeItem('siteId');
            localStorage.removeItem("arriveDate");
            localStorage.removeItem("departureDate");

            // Redirigir después de un pequeño delay
            setTimeout(function () {
                window.location.href = '../html/home-user.html';
            }, 1000);

        } catch (error) {
            console.error('Error al procesar:', error);
            alert('Error: ' + error.message);

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
                // Actualizar fechas usando parseo sin zona horaria
                const arriveDate = parseFechaSinZonaHoraria(localStorage.getItem("arriveDate"));
                const departureDate = parseFechaSinZonaHoraria(localStorage.getItem("departureDate"));

                const espacio1 = document.getElementById("espacio1");
                const siteName = document.getElementById('siteName');
                const location = document.getElementById('location');
                const checkInEl = document.getElementById('checkInDate');
                const checkOutEl = document.getElementById('checkOutDate');
                const totalEl = document.getElementById('totalAmount');
                if(espacio1){
                    espacio1.src = sitio.data.image;
                }
                if(siteName){
                    siteName.textContent = sitio.data.name;
                }
                if(location){
                    location.textContent = sitio.data.location;
                }
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
                const pricePerDay = sitio.data.pricePerNight || 500;
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

    // Cargar información al iniciar (sin importar si está autenticado)
    loadReservationInfo();

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