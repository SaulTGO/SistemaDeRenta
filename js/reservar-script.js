// Funcionalidad de la página de reserva
document.addEventListener('DOMContentLoaded', function() {
    
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

    // Manejar el envío del formulario
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar campos
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

        // Simular procesamiento
        alert('Procesando pago...');
        
        // Redirigir al index después de un pequeño delay
        setTimeout(function() {
            alert('¡Reserva confirmada exitosamente!');
            window.location.href = '../index.html';
        }, 1000);
    });

    // Animación al cargar
    document.querySelectorAll('.payment-section, .reservation-info').forEach((section, index) => {
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