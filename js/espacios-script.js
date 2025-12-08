// Funcionalidad de los calendarios
document.addEventListener('DOMContentLoaded', async function() {
    let fechaLlegada = null;
    let fechaSalida = null;
    let numHuespedes = 5;
    let espacioSeleccionado = null;
    let espaciosData = []; // Se llenará desde la API

    // ============================================
    // CARGAR DATOS DESDE LA API
    // ============================================
    
    async function cargarEspaciosDesdeAPI() {
        try {
            // Cargar sitios
            const sitios = await authGet('/api/sites?populate=*');
            
            if (!sitios || !sitios.data) {
                console.error('No se pudieron cargar los sitios');
                return [];
            }

            // Procesar cada sitio
            const espaciosProcesados = await Promise.all(sitios.data.map(async (sitio) => {
                const atributos = sitio.attributes || sitio;
                
                // Obtener URL de la imagen
                let imagenUrl = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'; // Imagen por defecto
                
                if (atributos.image?.data) {
                    const imageData = atributos.image.data;
                    if (Array.isArray(imageData) && imageData.length > 0) {
                        // Si es un array, tomar la primera imagen
                        imagenUrl = `${API_BASE_URL}${imageData[0].attributes.url}`;
                    } else if (imageData.attributes) {
                        // Si es un objeto único
                        imagenUrl = `${API_BASE_URL}${imageData.attributes.url}`;
                    }
                }

                // Obtener IDs de reservaciones asociadas
                let reservacionesIds = [];
                if (atributos.reservations?.data) {
                    reservacionesIds = atributos.reservations.data.map(r => r.id);
                }

                // Cargar detalles de las reservaciones
                let reservaciones = [];
                if (reservacionesIds.length > 0) {
                    reservaciones = await Promise.all(
                        reservacionesIds.map(async (resId) => {
                            try {
                                const reservacion = await authGet(`/api/reservations/${resId}`);
                                if (reservacion && reservacion.data) {
                                    const resAttr = reservacion.data.attributes || reservacion.data;
                                    return {
                                        inicio: resAttr.arriveDate,
                                        fin: resAttr.departureDate
                                    };
                                }
                                return null;
                            } catch (error) {
                                console.warn(`Error al cargar reservación ${resId}:`, error);
                                return null;
                            }
                        })
                    );
                    // Filtrar reservaciones nulas
                    reservaciones = reservaciones.filter(r => r !== null);
                }

                return {
                    id: sitio.id,
                    nombre: atributos.name || 'Sin nombre',
                    ubicacion: atributos.address || 'Ubicación no disponible',
                    imagen: imagenUrl,
                    precio: parseFloat(atributos.price) || 500,
                    maxHuespedes: parseInt(atributos.capacity) || 5,
                    reservaciones: reservaciones
                };
            }));

            return espaciosProcesados;
        } catch (error) {
            console.error('Error al cargar espacios desde la API:', error);
            return [];
        }
    }

    // Cargar espacios al iniciar
    const loadingMessage = document.getElementById('spacesGrid');
    loadingMessage.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;"><p style="font-size: 1.2rem;">Cargando espacios disponibles...</p></div>';
    
    espaciosData = await cargarEspaciosDesdeAPI();
    
    if (espaciosData.length === 0) {
        loadingMessage.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;"><p style="font-size: 1.2rem;">No hay espacios disponibles en este momento.</p></div>';
    }

    // ============================================
    // CONFIGURACIÓN DE CALENDARIOS
    // ============================================

    const mesesNombres = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const diasNombres = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

    let calendario1Mes = new Date().getMonth();
    let calendario1Año = new Date().getFullYear();
    let calendario2Mes = new Date().getMonth();
    let calendario2Año = new Date().getFullYear();

    // Generar calendario
    function generarCalendario(mes, año, calendarGridId) {
        const grid = document.getElementById(calendarGridId);
        grid.innerHTML = '';

        // Agregar nombres de días
        diasNombres.forEach(dia => {
            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = dia;
            grid.appendChild(dayName);
        });

        // Obtener primer día del mes y total de días
        const primerDia = new Date(año, mes, 1).getDay();
        const diasEnMes = new Date(año, mes + 1, 0).getDate();
        
        // Ajustar para que Lunes sea el primer día (0)
        const ajustePrimerDia = primerDia === 0 ? 6 : primerDia - 1;

        // Agregar espacios vacíos antes del primer día
        for (let i = 0; i < ajustePrimerDia; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day';
            grid.appendChild(emptyDay);
        }

        // Agregar días del mes
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Calcular fecha máxima (6 meses desde hoy)
        const fechaMaxima = new Date();
        fechaMaxima.setMonth(fechaMaxima.getMonth() + 6);
        fechaMaxima.setHours(0, 0, 0, 0);

        for (let dia = 1; dia <= diasEnMes; dia++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = dia;
            
            const fechaActual = new Date(año, mes, dia);
            fechaActual.setHours(0, 0, 0, 0);
            
            const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            dayElement.setAttribute('data-date', fechaStr);

            // Deshabilitar fechas pasadas o más allá de 6 meses
            if (fechaActual < hoy || fechaActual > fechaMaxima) {
                dayElement.classList.add('disabled');
            }

            grid.appendChild(dayElement);
        }

        actualizarEventosDias();
    }

    // Validar fechas
    function validarFechas() {
        const dateAlert = document.getElementById('dateAlert');
        
        if (fechaLlegada && fechaSalida) {
            const llegada = new Date(fechaLlegada);
            const salida = new Date(fechaSalida);
            
            if (salida <= llegada) {
                dateAlert.classList.add('show');
                return false;
            } else {
                dateAlert.classList.remove('show');
                return true;
            }
        }
        
        dateAlert.classList.remove('show');
        return true;
    }

    // Actualizar eventos de días
    function actualizarEventosDias() {
        const allDays = document.querySelectorAll('.day');
        
        allDays.forEach(day => {
            if (!day.classList.contains('disabled') && day.textContent.trim() !== '') {
                day.addEventListener('click', function() {
                    const calendar = this.closest('.calendar');
                    const daysInCalendar = calendar.querySelectorAll('.day');
                    daysInCalendar.forEach(d => d.classList.remove('selected'));
                    
                    this.classList.add('selected');
                    
                    const isLlegada = calendar.id === 'calendar-llegada';
                    const fechaSeleccionada = this.getAttribute('data-date');
                    
                    if (isLlegada) {
                        fechaLlegada = fechaSeleccionada;
                        localStorage.setItem("arriveDate", fechaLlegada);
                    } else {
                        fechaSalida = fechaSeleccionada;
                        localStorage.setItem("departureDate", fechaSalida);
                    }
                    
                    // Validar fechas antes de filtrar
                    if (validarFechas()) {
                        filtrarEspacios();
                        actualizarResumen();
                    } else {
                        // Limpiar espacios y resumen si las fechas no son válidas
                        espacioSeleccionado = null;
                        filtrarEspacios();
                        document.getElementById('summarySection').style.display = 'none';
                    }
                });
            }
        });
    }

    // Navegación de calendarios
    document.getElementById('prevMonth1').addEventListener('click', function() {
        calendario1Mes--;
        if (calendario1Mes < 0) {
            calendario1Mes = 11;
            calendario1Año--;
        }
        document.getElementById('currentMonth1').textContent = `${mesesNombres[calendario1Mes]} ${calendario1Año}`;
        generarCalendario(calendario1Mes, calendario1Año, 'calendarGrid1');
    });

    document.getElementById('nextMonth1').addEventListener('click', function() {
        calendario1Mes++;
        if (calendario1Mes > 11) {
            calendario1Mes = 0;
            calendario1Año++;
        }
        document.getElementById('currentMonth1').textContent = `${mesesNombres[calendario1Mes]} ${calendario1Año}`;
        generarCalendario(calendario1Mes, calendario1Año, 'calendarGrid1');
    });

    document.getElementById('prevMonth2').addEventListener('click', function() {
        calendario2Mes--;
        if (calendario2Mes < 0) {
            calendario2Mes = 11;
            calendario2Año--;
        }
        document.getElementById('currentMonth2').textContent = `${mesesNombres[calendario2Mes]} ${calendario2Año}`;
        generarCalendario(calendario2Mes, calendario2Año, 'calendarGrid2');
    });

    document.getElementById('nextMonth2').addEventListener('click', function() {
        calendario2Mes++;
        if (calendario2Mes > 11) {
            calendario2Mes = 0;
            calendario2Año++;
        }
        document.getElementById('currentMonth2').textContent = `${mesesNombres[calendario2Mes]} ${calendario2Año}`;
        generarCalendario(calendario2Mes, calendario2Año, 'calendarGrid2');
    });

    // Control de huéspedes
    const guestsInput = document.getElementById('guests');
    const decreaseBtn = document.getElementById('decreaseGuests');
    const increaseBtn = document.getElementById('increaseGuests');

    decreaseBtn.addEventListener('click', function() {
        let currentValue = parseInt(guestsInput.value);
        if (currentValue > 1) {
            guestsInput.value = currentValue - 1;
            numHuespedes = currentValue - 1;
            filtrarEspacios();
            actualizarResumen();
        }
    });

    increaseBtn.addEventListener('click', function() {
        let currentValue = parseInt(guestsInput.value);
        if (currentValue < 20) {
            guestsInput.value = currentValue + 1;
            numHuespedes = currentValue + 1;
            filtrarEspacios();
            actualizarResumen();
        }
    });

    // Función para verificar si las fechas seleccionadas interfieren con reservaciones existentes
    function tieneConflictoReservacion(espacio, llegada, salida) {
        if (!llegada || !salida || !espacio.reservaciones || espacio.reservaciones.length === 0) {
            return false;
        }
        
        const fechaLlegadaDate = new Date(llegada);
        const fechaSalidaDate = new Date(salida);
        
        for (let reservacion of espacio.reservaciones) {
            const reservaInicio = new Date(reservacion.inicio);
            const reservaFin = new Date(reservacion.fin);
            
            // Verificar si hay solapamiento entre las fechas
            if (
                (fechaLlegadaDate >= reservaInicio && fechaLlegadaDate < reservaFin) ||
                (fechaSalidaDate > reservaInicio && fechaSalidaDate <= reservaFin) ||
                (fechaLlegadaDate <= reservaInicio && fechaSalidaDate >= reservaFin)
            ) {
                return true;
            }
        }
        
        return false;
    }

    // Función para filtrar y mostrar espacios
    function filtrarEspacios() {
        const espaciosGrid = document.getElementById('spacesGrid');
        espaciosGrid.innerHTML = '';
        
        // No filtrar si las fechas no son válidas
        if (!validarFechas() && fechaLlegada && fechaSalida) {
            espaciosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;"><p style="font-size: 1.2rem;">Por favor, selecciona fechas válidas.</p><p style="margin-top: 10px;">La fecha de salida debe ser posterior a la fecha de llegada.</p></div>';
            return;
        }
        
        // Filtrar por capacidad de huéspedes y disponibilidad
        let espaciosFiltrados = espaciosData.filter(espacio => {
            // Verificar capacidad
            if (espacio.maxHuespedes < numHuespedes) return false;
            
            // Verificar si hay conflicto con reservaciones existentes
            if (fechaLlegada && fechaSalida && tieneConflictoReservacion(espacio, fechaLlegada, fechaSalida)) {
                return false;
            }
            
            return true;
        });

        if (espaciosFiltrados.length === 0) {
            espaciosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;"><p style="font-size: 1.2rem;">No hay espacios disponibles para los criterios seleccionados.</p><p style="margin-top: 10px;">Intenta con otras fechas o menos huéspedes.</p></div>';
            return;
        }

        espaciosFiltrados.forEach(espacio => {
            const card = document.createElement('div');
            card.className = 'space-card';
            card.setAttribute('data-space-id', espacio.id);
            card.innerHTML = `
                <div class="space-image">
                    <img src="${espacio.imagen}" alt="${espacio.nombre}">
                </div>
                <div class="space-info">
                    <p><strong>Nombre:</strong> ${espacio.nombre}</p>
                    <p><strong>Ubicación:</strong> ${espacio.ubicacion}</p>
                    <p><strong>Precio:</strong> $${espacio.precio.toFixed(2)}/noche</p>
                    <p><strong>Capacidad:</strong> Máx ${espacio.maxHuespedes} huéspedes</p>
                </div>
            `;
            
            card.addEventListener('click', function() {
                localStorage.setItem("siteId", espacio.id);
                document.querySelectorAll('.space-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                espacioSeleccionado = espacio;
                localStorage.setItem("siteId", espacio.id);
                actualizarResumen();
            });
            
            espaciosGrid.appendChild(card);
        });
    }

    // Función para formatear fecha
    function formatearFecha(fechaStr) {
        if (!fechaStr) return '-';
        const fecha = new Date(fechaStr + 'T00:00:00');
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return fecha.toLocaleDateString('es-MX', opciones);
    }

    // Función para calcular noches
    function calcularNoches(llegada, salida) {
        if (!llegada || !salida) return 0;
        const fecha1 = new Date(llegada);
        const fecha2 = new Date(salida);
        const diferencia = fecha2 - fecha1;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    }

    // Función para actualizar resumen
    function actualizarResumen() {
        const summarySection = document.getElementById('summarySection');
        
        if (fechaLlegada && fechaSalida && espacioSeleccionado && validarFechas()) {
            summarySection.style.display = 'block';
            
            const noches = calcularNoches(fechaLlegada, fechaSalida);
            const total = noches * espacioSeleccionado.precio;
            
            document.getElementById('summaryLlegada').textContent = formatearFecha(fechaLlegada);
            document.getElementById('summarySalida').textContent = formatearFecha(fechaSalida);
            document.getElementById('summaryNoches').textContent = `${noches} ${noches === 1 ? 'noche' : 'noches'}`;
            document.getElementById('summaryHuespedes').textContent = `${numHuespedes} ${numHuespedes === 1 ? 'huésped' : 'huéspedes'}`;
            
            document.getElementById('summaryNombre').textContent = espacioSeleccionado.nombre;
            document.getElementById('summaryUbicacion').textContent = espacioSeleccionado.ubicacion;
            document.getElementById('summaryPrecio').textContent = `$${espacioSeleccionado.precio.toFixed(2)}`;
            document.getElementById('summaryCapacidad').textContent = `Máx ${espacioSeleccionado.maxHuespedes} huéspedes`;
            
            document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;

            sessionStorage.setItem('fechaLlegada', formatearFecha(fechaLlegada));
            sessionStorage.setItem('fechaSalida', formatearFecha(fechaSalida));
            sessionStorage.setItem('numHuespedes', `${numHuespedes} ${numHuespedes === 1 ? 'huésped' : 'huéspedes'}`);
            sessionStorage.setItem('numNoches', `${noches} ${noches === 1 ? 'noche' : 'noches'}`);
            sessionStorage.setItem('nombre', espacioSeleccionado.nombre);
            sessionStorage.setItem('ubicacion', espacioSeleccionado.ubicacion);
            sessionStorage.setItem('precio', `$${espacioSeleccionado.precio.toFixed(2)}`);
            sessionStorage.setItem('capacidad', `Máx ${espacioSeleccionado.maxHuespedes} huéspedes`);
            sessionStorage.setItem('totalAmount', `$${total.toFixed(2)}`);
            
        } else {
            summarySection.style.display = 'none';
        }
    }

    // Inicializar calendarios
    document.getElementById('currentMonth1').textContent = `${mesesNombres[calendario1Mes]} ${calendario1Año}`;
    document.getElementById('currentMonth2').textContent = `${mesesNombres[calendario2Mes]} ${calendario2Año}`;
    
    generarCalendario(calendario1Mes, calendario1Año, 'calendarGrid1');
    generarCalendario(calendario2Mes, calendario2Año, 'calendarGrid2');
    
    // Mostrar todos los espacios al cargar
    filtrarEspacios();
});