// Función para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        // Aquí iría la lógica de cierre de sesión
        alert('Sesión cerrada exitosamente');
        window.location.href = '../../index.html';
    }
}

// Función para aplicar estilos a los estados de disponibilidad
function aplicarEstilos() {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        // Aplicar estilos a la columna DISPONIBILIDAD (columna 2)
        const disponibilidadCell = row.cells[2];
        const disponibilidadTexto = disponibilidadCell.textContent.trim();
        
        // Remover todas las clases de disponibilidad
        disponibilidadCell.classList.remove('disponibilidad-disponible', 'disponibilidad-funciones', 'disponibilidad-ausente');
        
        // Aplicar la clase correspondiente según el estado
        if (disponibilidadTexto === 'DISPONIBLE') {
            disponibilidadCell.classList.add('disponibilidad-disponible');
        } else if (disponibilidadTexto === 'EN FUNCIONES') {
            disponibilidadCell.classList.add('disponibilidad-funciones');
        } else if (disponibilidadTexto === 'AUSENTE') {
            disponibilidadCell.classList.add('disponibilidad-ausente');
        }
    });
}

// Función para agregar nuevo personal dinámicamente
function agregarPersonal(id, nombre, disponibilidad, asignaciones) {
    const tbody = document.getElementById('personalBody');
    const row = tbody.insertRow();
    
    row.innerHTML = `
        <td>${id}</td>
        <td>${nombre}</td>
        <td>${disponibilidad}</td>
        <td>${asignaciones}</td>
    `;
    
    // Aplicar estilos a la nueva fila
    aplicarEstilos();
}

// Función para eliminar personal por ID
function eliminarPersonal(id) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.cells[0].textContent === id.toString()) {
            row.remove();
        }
    });
}

// Función para actualizar la disponibilidad de un empleado
function actualizarDisponibilidad(id, nuevaDisponibilidad) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.cells[0].textContent === id.toString()) {
            row.cells[2].textContent = nuevaDisponibilidad;
            aplicarEstilos();
        }
    });
}

// Función para actualizar las asignaciones pendientes
function actualizarAsignaciones(id, nuevasAsignaciones) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.cells[0].textContent === id.toString()) {
            row.cells[3].textContent = nuevasAsignaciones;
        }
    });
}

// Función para filtrar personal por disponibilidad
function filtrarPorDisponibilidad(disponibilidad) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const disponibilidadCell = row.cells[2].textContent.trim();
        if (disponibilidad === 'TODOS' || disponibilidadCell === disponibilidad) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Función para buscar personal por nombre
function buscarPorNombre(nombre) {
    const rows = document.querySelectorAll('tbody tr');
    const nombreBusqueda = nombre.toLowerCase();
    
    rows.forEach(row => {
        const nombreCell = row.cells[1].textContent.toLowerCase();
        if (nombreBusqueda === '' || nombreCell.includes(nombreBusqueda)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Función para obtener estadísticas del personal
function obtenerEstadisticas() {
    const rows = document.querySelectorAll('tbody tr');
    const stats = {
        total: rows.length,
        disponibles: 0,
        enFunciones: 0,
        ausentes: 0,
        conAsignaciones: 0,
        sinPendientes: 0
    };
    
    rows.forEach(row => {
        const disponibilidad = row.cells[2].textContent.trim();
        const asignaciones = row.cells[3].textContent.trim();
        
        // Contar disponibilidad
        if (disponibilidad === 'DISPONIBLE') stats.disponibles++;
        else if (disponibilidad === 'EN FUNCIONES') stats.enFunciones++;
        else if (disponibilidad === 'AUSENTE') stats.ausentes++;
        
        // Contar asignaciones
        if (asignaciones === 'SIN PENDIENTES') {
            stats.sinPendientes++;
        } else {
            stats.conAsignaciones++;
        }
    });
    
    return stats;
}

// Función para obtener lista de personal disponible
function obtenerPersonalDisponible() {
    const rows = document.querySelectorAll('tbody tr');
    const disponibles = [];
    
    rows.forEach(row => {
        const disponibilidad = row.cells[2].textContent.trim();
        if (disponibilidad === 'DISPONIBLE') {
            disponibles.push({
                id: row.cells[0].textContent,
                nombre: row.cells[1].textContent,
                asignaciones: row.cells[3].textContent
            });
        }
    });
    
    return disponibles;
}

// Aplicar estilos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    aplicarEstilos();
    console.log('Página de revisión de personal cargada correctamente');
    
    // Mostrar estadísticas en consola
    const stats = obtenerEstadisticas();
    console.log('Estadísticas de personal:', stats);
    
    // Mostrar personal disponible en consola
    const disponibles = obtenerPersonalDisponible();
    console.log('Personal disponible:', disponibles);
});