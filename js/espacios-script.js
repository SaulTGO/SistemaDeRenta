// Funcionalidad de los calendarios
document.addEventListener('DOMContentLoaded', function() {
    // Selección de días en los calendarios
    const allDays = document.querySelectorAll('.day');
    
    allDays.forEach(day => {
        day.addEventListener('click', function() {
            if (this.textContent.trim() !== '') {
                // Remover selección de otros días en el mismo calendario
                const calendar = this.closest('.calendar');
                const daysInCalendar = calendar.querySelectorAll('.day');
                daysInCalendar.forEach(d => d.classList.remove('selected'));
                
                // Agregar selección al día clickeado
                this.classList.add('selected');
            }
        });
    });

    // Control de huéspedes
    const guestsInput = document.getElementById('guests');
    const decreaseBtn = document.getElementById('decreaseGuests');
    const increaseBtn = document.getElementById('increaseGuests');

    decreaseBtn.addEventListener('click', function() {
        let currentValue = parseInt(guestsInput.value);
        if (currentValue > 1) {
            guestsInput.value = currentValue - 1;
        }
    });

    increaseBtn.addEventListener('click', function() {
        let currentValue = parseInt(guestsInput.value);
        if (currentValue < 20) {
            guestsInput.value = currentValue + 1;
        }
    });

    // Selección de espacios
    const spaceCards = document.querySelectorAll('.space-card');
    
    spaceCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remover selección de otras tarjetas
            spaceCards.forEach(c => c.classList.remove('selected'));
            
            // Agregar selección a la tarjeta clickeada
            this.classList.add('selected');
        });
    });

    // Navegación de meses (funcionalidad básica)
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Aquí puedes agregar lógica para cambiar de mes
            console.log('Cambiar mes');
        });
    });
});