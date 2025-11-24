// Datos de ejemplo de reservaciones
const sampleReservations = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
        fechaLlegada: '15/12/2024',
        fechaSalida: '18/12/2024',
        total: '$3,500.00',
        huespedes: 2
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop',
        fechaLlegada: '20/12/2024',
        fechaSalida: '22/12/2024',
        total: '$2,800.00',
        huespedes: 3
    }
];

// Funcion para crear una tarjeta de reservacion
function createReservationCard(reservation) {
    const card = document.createElement('div');
    card.className = 'reservation-card';
    const fechaLlegada = reservation.arriveDate;
    const fechaSalida = reservation.departureDate;
    const total = (fechaSalida-fechaLlegada)*reservation.site.pricePerNight;
    card.innerHTML = `
        <div class="reservation-image">
            ${reservation.site.image 
                ? `<img src="${reservation.image}" alt="Espacio reservado">`
                : `<div class="image-placeholder">
                    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="200" height="150" fill="#000000"/>
                        <circle cx="70" cy="50" r="15" fill="white"/>
                        <path d="M30 120 L80 80 L120 100 L170 60 L170 120 Z" fill="white"/>
                    </svg>
                   </div>`
            }
        </div>
        <div class="reservation-details">
            <p><strong>Fecha de llegada</strong> ${fechaLlegada}</p>
            <p><strong>Fecha de salida</strong> ${fechaSalida}</p>
            <p><strong>Total a pagar</strong> ${total}</p>
        </div>
    `;
    
    // Agregar evento click
    card.addEventListener('click', () => {
        alert(`Ver detalles de la reservación #${reservation.id}`);
        // Aquí podrías redirigir a una página de detalles
        // window.location.href = `detalles-reservacion.html?id=${reservation.id}`;
    });
    
    return card;
}

// FunciÃ³n para cargar las reservaciones
async function loadReservations() {
    const grid = document.getElementById('reservationsGrid');
    const noReservations = document.getElementById('noReservations');

    // Intentar cargar reservaciones del almacenamiento local
    // o usar datos de ejemplo
    const reservations = await authGet(`/api/reservations?filters[user][id][$eq]=11&populate=*`);

    if (reservations.data && reservations.data.length > 0) {
        grid.style.display = 'grid';
        noReservations.style.display = 'none';

        reservations.data.forEach(reservation => {
            const card = createReservationCard(reservation);
            grid.appendChild(card);
        });
    } else {
        grid.style.display = 'none';
        noReservations.style.display = 'block';
    }
}

// Función para cerrar sesión
function logout() {
    if (confirm('¿Estas seguro de que deseas cerrar sesion?')) {

        removeJWT();
        removeUser();

        window.location.href = '../html/login.html';
    }
}

// Función para ir a nueva reservación
function goToNewReservation() {
    // Redirigir a la página de nueva reservación
    window.location.href = '../html/espacios.html';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cargar reservaciones
    loadReservations();
    
    // BotÃ³n de cerrar sesiÃ³n
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Botones de nueva reservaciÃ³n
    const newReservationBtns = document.querySelectorAll('.btn-new-reservation');
    newReservationBtns.forEach(btn => {
        btn.addEventListener('click', goToNewReservation);
    });
});