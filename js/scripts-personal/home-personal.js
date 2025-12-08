// ============================================
// CARGAR Y MOSTRAR ASIGNACIONES DESDE LA API
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Página de home personal cargada correctamente');
    

    // Cargar asignaciones del personal
    await cargarAsignaciones();
});

// Función para cargar asignaciones desde la API
async function cargarAsignaciones() {
    const tbody = document.getElementById('domiciliosBody');
    const user = getUser();

    if (!user || !user.id) {
        console.error('No se pudo obtener información del usuario');
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Error al cargar usuario</td></tr>';
        return;
    }

    try {
        // Mostrar indicador de carga
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Cargando asignaciones...</td></tr>';

        // Obtener reservas asignadas al personal
        // Ajusta el endpoint según tu API - este es un ejemplo basado en el patrón de reservar.js
        const reservas = await authGet(`/api/users/${user.id}?populate=assignments`);

        // Limpiar tabla
        tbody.innerHTML = '';

        if (!reservas || !reservas.data || reservas.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No tienes asignaciones pendientes</td></tr>';
            return;
        }

        // Llenar tabla con las asignaciones
        reservas.assignments.forEach(reserva => {
            const row = tbody.insertRow();
            const completado = reserva.attributes.estado === 'completado' || reserva.attributes.completed || false;
            
            if (completado) {
                row.classList.add('completado');
            }

            // Obtener ubicación del sitio
            const sitio = reserva.attributes.site?.data;
            const ubicacion = sitio ? sitio.attributes.location : 'Ubicación no disponible';
            
            // Obtener observaciones si existen
            const observaciones = reserva.attributes.observaciones || '';

            row.innerHTML = `
                <td class="estado-cell">
                    <input type="checkbox" 
                           class="estado-check" 
                           data-reserva-id="${reserva.documentId}"
                           ${completado ? 'checked disabled' : 'onclick="toggleEstado(this)"'}>
                </td>
                <td>${ubicacion}</td>
                <td class="observaciones-cell">
                    <input type="text" 
                           class="observaciones-input" 
                           data-reserva-id="${reserva.documentId}"
                           value="${observaciones}"
                           placeholder="Agregar observaciones..."
                           ${completado ? 'disabled' : 'onblur="guardarObservaciones(this)"'}>
                </td>
            `;
        });

        // Mostrar estadísticas en consola
        const stats = obtenerEstadisticas();
        console.log('Estadísticas de domicilios:', stats);
        console.log(`Progreso: ${stats.completados}/${stats.total} (${stats.porcentajeCompletado}%)`);

    } catch (error) {
        console.error('Error al cargar asignaciones:', error);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Error al cargar asignaciones. Por favor, intenta de nuevo.</td></tr>';
    }
}

// ============================================
// FUNCIÓN PARA ALTERNAR EL ESTADO
// ============================================

async function toggleEstado(checkbox) {
    const row = checkbox.closest('tr');
    const reservaId = checkbox.getAttribute('data-reserva-id');
    
    if (checkbox.checked) {
        // Deshabilitar checkbox mientras se procesa
        checkbox.disabled = true;
        
        try {
            // Actualizar estado en la API
            const response = await authPut(`/api/reservations/${reservaId}`, {
                data: {
                    estado: 'completado',
                    completed: true
                }
            });

            if (response) {
                // Marcar como completado en la interfaz
                row.classList.add('completado');
                
                // Deshabilitar input de observaciones
                const observacionesInput = row.querySelector('.observaciones-input');
                if (observacionesInput) {
                    observacionesInput.disabled = true;
                }
                
                console.log('Domicilio marcado como completado:', row.cells[1].textContent);
                
                // Actualizar estadísticas
                const stats = obtenerEstadisticas();
                console.log(`Progreso actualizado: ${stats.completados}/${stats.total} (${stats.porcentajeCompletado}%)`);
            } else {
                throw new Error('No se recibió respuesta del servidor');
            }
            
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert('Error al actualizar el estado. Por favor, intenta de nuevo.');
            
            // Revertir cambio
            checkbox.checked = false;
            checkbox.disabled = false;
        }
    }
}

// ============================================
// FUNCIÓN PARA GUARDAR OBSERVACIONES
// ============================================

async function guardarObservaciones(input) {
    const reservaId = input.getAttribute('data-reserva-id');
    const observaciones = input.value.trim();
    
    try {
        // Actualizar observaciones en la API
        await authPut(`/api/reservations/${reservaId}`, {
            data: {
                observaciones: observaciones
            }
        });
        
        console.log('Observaciones guardadas para reserva:', reservaId);
        
    } catch (error) {
        console.error('Error al guardar observaciones:', error);
        alert('Error al guardar observaciones. Por favor, intenta de nuevo.');
    }
}

// ============================================
// FUNCIÓN PARA OBTENER ESTADÍSTICAS
// ============================================

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
        if (checkbox && checkbox.checked) {
            stats.completados++;
        } else if (checkbox) {
            stats.pendientes++;
        }
    });
    
    if (stats.total > 0) {
        stats.porcentajeCompletado = ((stats.completados / stats.total) * 100).toFixed(1);
    }
    
    return stats;
}

// ============================================
// FUNCIÓN PARA OBTENER DOMICILIOS PENDIENTES
// ============================================

function obtenerDomiciliosPendientes() {
    const rows = document.querySelectorAll('tbody tr');
    const pendientes = [];
    
    rows.forEach(row => {
        const checkbox = row.querySelector('.estado-check');
        if (checkbox && !checkbox.checked) {
            pendientes.push({
                ubicacion: row.cells[1].textContent.trim(),
                reservaId: checkbox.getAttribute('data-reserva-id')
            });
        }
    });
    
    return pendientes;
}

// ============================================
// FUNCIÓN PARA OBTENER DOMICILIOS COMPLETADOS
// ============================================

function obtenerDomiciliosCompletados() {
    const rows = document.querySelectorAll('tbody tr');
    const completados = [];
    
    rows.forEach(row => {
        const checkbox = row.querySelector('.estado-check');
        if (checkbox && checkbox.checked) {
            completados.push({
                ubicacion: row.cells[1].textContent.trim(),
                reservaId: checkbox.getAttribute('data-reserva-id')
            });
        }
    });
    
    return completados;
}

// ============================================
// FUNCIÓN PARA FILTRAR POR ESTADO
// ============================================

function filtrarPorEstado(estado) {
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const checkbox = row.querySelector('.estado-check');
        
        if (!checkbox) return;
        
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

// ============================================
// FUNCIÓN PARA COMPLETAR TODOS (CON PRECAUCIÓN)
// ============================================

async function completarTodos() {
    if (!confirm('¿Está seguro que desea marcar todos los domicilios como completados?')) {
        return;
    }
    
    const checkboxes = document.querySelectorAll('.estado-check:not(:disabled)');
    let errores = 0;
    
    for (const checkbox of checkboxes) {
        try {
            checkbox.checked = true;
            await toggleEstado(checkbox);
        } catch (error) {
            console.error('Error al completar domicilio:', error);
            errores++;
        }
    }
    
    if (errores === 0) {
        alert('Todos los domicilios han sido marcados como completados');
    } else {
        alert(`Se completaron los domicilios con ${errores} error(es)`);
    }
}

// ============================================
// FUNCIÓN PARA RECARGAR ASIGNACIONES
// ============================================

function recargarAsignaciones() {
    cargarAsignaciones();
}