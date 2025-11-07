// Función para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        // Aquí iría la lógica de cierre de sesión
        alert('Sesión cerrada exitosamente');
        window.location.href = '../../index.html';
    }
}

// Función para aplicar estilos a los estados de ocupación
function aplicarEstilos() {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const ocupacionCell = row.cells[4];
        const texto = ocupacionCell.textContent.trim();
        
        // Remover todas las clases de estado
        ocupacionCell.classList.remove('estado-ocupado', 'estado-proceso', 'estado-verificado', 'estado-no-registrado');
        
        // Aplicar la clase correspondiente según el estado
        if (texto === 'OCUPADO') {
            ocupacionCell.classList.add('estado-ocupado');
        } else if (texto === 'EN PROCESO') {
            ocupacionCell.classList.add('estado-proceso');
        } else if (texto === 'VERIFICADO') {
            ocupacionCell.classList.add('estado-verificado');
        } else if (texto === 'NO REGISTRADO') {
            ocupacionCell.classList.add('estado-no-registrado');
        }
    });
}

// Función para agregar nuevas reservaciones dinámicamente
function agregarReservacion(id, huespedes, fechaInicio, fechaSalida, ocupacion, huellaRegistrada) {
    const tbody = document.getElementById('reservacionesBody');
    const row = tbody.insertRow();
    
    row.innerHTML = `
        <td>${id}</td>
        <td>${huespedes}</td>
        <td>${fechaInicio}</td>
        <td>${fechaSalida}</td>
        <td>${ocupacion}</td>
        <td><input type="checkbox" class="huella-check" ${huellaRegistrada ? 'checked' : ''} disabled></td>
    `;
    
    // Aplicar estilos a la nueva fila
    aplicarEstilos();
}

// Función para eliminar una reservación por ID
function eliminarReservacion(id) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.cells[0].textContent === id.toString()) {
            row.remove();
        }
    });
}

// Función para actualizar el estado de una reservación
function actualizarEstado(id, nuevoEstado) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.cells[0].textContent === id.toString()) {
            row.cells[4].textContent = nuevoEstado;
            aplicarEstilos();
        }
    });
}

// Aplicar estilos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    aplicarEstilos();
    console.log('Página de reservaciones cargada correctamente');
});