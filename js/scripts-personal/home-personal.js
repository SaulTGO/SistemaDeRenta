// Función para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        // Aquí iría la lógica de cierre de sesión
        alert('Sesión cerrada exitosamente');
        window.location.href = '../../index.html';
    }
}

// Función para alternar el estado de un domicilio
function toggleEstado(checkbox) {
    const row = checkbox.closest('tr');
    
    if (checkbox.checked) {
        // Marcar como completado
        row.classList.add('completado');
        checkbox.disabled = true;
        
        // Notificar al usuario
        console.log('Domicilio marcado como completado:', row.cells[1].textContent);
        
        // Aquí se podría hacer una llamada al servidor para guardar el cambio
        // guardarEstadoDomicilio(row, true);
        
    }
}

// Función para agregar un nuevo domicilio asignado
function agregarDomicilio(ubicacion, completado = false) {
    const tbody = document.getElementById('domiciliosBody');
    const row = tbody.insertRow();
    
    if (completado) {
        row.classList.add('completado');
    }
    
    row.innerHTML = `
        <td class="estado-cell">
            <input type="checkbox" class="estado-check" ${completado ? 'checked disabled' : 'onclick="toggleEstado(this)"'}>
        </td>
        <td>${ubicacion}</td>
    `;
}

// Función para eliminar un domicilio por ubicación
function eliminarDomicilio(ubicacion) {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.cells[1].textContent.trim() === ubicacion.trim()) {
            row.remove();
        }
    });
}

// Función para obtener estadísticas de domicilios
function obtenerEstadisticas() {
    const rows = document.querySelectorAll('tbody tr');
    const stats = {
        total: rows.length,
        completados: 0,
        pendientes: 0,
        porcentajeCompletado: 0
    };
    
    rows.forEach(row => {
        const checkbox = row.querySelector('.estado-check');
        if (checkbox.checked) {
            stats.completados++;
        } else {
            stats.pendientes++;
        }
    });
    
    if (stats.total > 0) {
        stats.porcentajeCompletado = ((stats.completados / stats.total) * 100).toFixed(1);
    }
    
    return stats;
}

// Función para obtener lista de domicilios pendientes
function obtenerDomiciliosPendientes() {
    const rows = document.querySelectorAll('tbody tr');
    const pendientes = [];
    
    rows.forEach(row => {
        const checkbox = row.querySelector('.estado-check');
        if (!checkbox.checked) {
            pendientes.push({
                ubicacion: row.cells[1].textContent.trim()
            });
        }
    });
    
    return pendientes;
}

// Función para obtener lista de domicilios completados
function obtenerDomiciliosCompletados() {
    const rows = document.querySelectorAll('tbody tr');
    const completados = [];
    
    rows.forEach(row => {
        const checkbox = row.querySelector('.estado-check');
        if (checkbox.checked) {
            completados.push({
                ubicacion: row.cells[1].textContent.trim()
            });
        }
    });
    
    return completados;
}

// Función para filtrar domicilios por estado
function filtrarPorEstado(estado) {
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const checkbox = row.querySelector('.estado-check');
        
        if (estado === 'TODOS') {
            row.style.display = '';
        } else if (estado === 'COMPLETADOS' && checkbox.checked) {
            row.style.display = '';
        } else if (estado === 'PENDIENTES' && !checkbox.checked) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Función para marcar todos como completados (usar con precaución)
function completarTodos() {
    if (confirm('¿Está seguro que desea marcar todos los domicilios como completados?')) {
        const checkboxes = document.querySelectorAll('.estado-check:not(:disabled)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            toggleEstado(checkbox);
        });
        alert('Todos los domicilios han sido marcados como completados');
    }
}

// Cargar página y mostrar estadísticas
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de home personal cargada correctamente');
    
    // Mostrar estadísticas en consola
    const stats = obtenerEstadisticas();
    console.log('Estadísticas de domicilios:', stats);
    console.log(`Progreso: ${stats.completados}/${stats.total} (${stats.porcentajeCompletado}%)`);
    
    // Mostrar domicilios pendientes
    const pendientes = obtenerDomiciliosPendientes();
    console.log('Domicilios pendientes:', pendientes);
});