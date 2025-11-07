// Función para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        // Aquí iría la lógica de cierre de sesión
        alert('Sesión cerrada exitosamente');
        window.location.href = '../../index.html';
    }
}

// Función para aplicar estilos a los estados
function aplicarEstilos() {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        // Aplicar estilos a la columna STATUS (columna 2)
        const statusCell = row.cells[2];
        const statusTexto = statusCell.textContent.trim();
        
        // Remover todas las clases de status
        statusCell.classList.remove('status-disponible', 'status-reservado', 'status-ocupado');
        
        // Aplicar la clase correspondiente según el estado
        if (statusTexto === 'DISPONIBLE') {
            statusCell.classList.add('status-disponible');
        } else if (statusTexto === 'RESERVADO') {
            statusCell.classList.add('status-reservado');
        } else if (statusTexto === 'OCUPADO') {
            statusCell.classList.add('status-ocupado');
        }
        
        // Aplicar estilos a la columna ASEO (columna 3)
        const aseoCell = row.cells[3];
        const aseoTexto = aseoCell.textContent.trim();
        
        // Remover todas las clases de aseo
        aseoCell.classList.remove('aseo-finalizado', 'aseo-espera', 'aseo-proceso');
        
        // Aplicar la clase correspondiente según el estado de aseo
        if (aseoTexto === 'FINALIZADO') {
            aseoCell.classList.add('aseo-finalizado');
        } else if (aseoTexto === 'EN ESPERA') {
            aseoCell.classList.add('aseo-espera');
        } else if (aseoTexto === 'EN PROCESO') {
            aseoCell.classList.add('aseo-proceso');
        }
    });
}

// Función para agregar un nuevo espacio dinámicamente
function agregarEspacio(id, ubicacion, status, aseo) {
    const tbody = document.getElementById('espaciosBody');
    const row = tbody.insertRow();
    
    row.innerHTML = `
        <td>${id}</td>
        <td>${ubicacion}</td>
        <td>${status}</td>
        <td>${aseo}</td>
    `;
    
    // Aplicar estilos a la nueva fila
    aplicarEstilos();
}

// Función para eliminar un espacio por ID
function eliminarEspacio(id) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.cells[0].textContent === id.toString()) {
            row.remove();
        }
    });
}

// Función para actualizar el status de un espacio
function actualizarStatus(id, nuevoStatus) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.cells[0].textContent === id.toString()) {
            row.cells[2].textContent = nuevoStatus;
            aplicarEstilos();
        }
    });
}

// Función para actualizar el estado de aseo de un espacio
function actualizarAseo(id, nuevoAseo) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.cells[0].textContent === id.toString()) {
            row.cells[3].textContent = nuevoAseo;
            aplicarEstilos();
        }
    });
}

// Función para filtrar espacios por status
function filtrarPorStatus(status) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const statusCell = row.cells[2].textContent.trim();
        if (status === 'TODOS' || statusCell === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Función para obtener estadísticas de espacios
function obtenerEstadisticas() {
    const rows = document.querySelectorAll('tbody tr');
    const stats = {
        total: rows.length,
        disponibles: 0,
        reservados: 0,
        ocupados: 0,
        aseoFinalizado: 0,
        aseoEnProceso: 0,
        aseoEnEspera: 0
    };
    
    rows.forEach(row => {
        const status = row.cells[2].textContent.trim();
        const aseo = row.cells[3].textContent.trim();
        
        // Contar status
        if (status === 'DISPONIBLE') stats.disponibles++;
        else if (status === 'RESERVADO') stats.reservados++;
        else if (status === 'OCUPADO') stats.ocupados++;
        
        // Contar aseo
        if (aseo === 'FINALIZADO') stats.aseoFinalizado++;
        else if (aseo === 'EN PROCESO') stats.aseoEnProceso++;
        else if (aseo === 'EN ESPERA') stats.aseoEnEspera++;
    });
    
    return stats;
}

// Aplicar estilos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    aplicarEstilos();
    console.log('Página de revisión de espacios cargada correctamente');
    
    // Mostrar estadísticas en consola
    const stats = obtenerEstadisticas();
    console.log('Estadísticas de espacios:', stats);
});