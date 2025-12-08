// Funcionalidad de los calendarios
document.addEventListener('DOMContentLoaded', async function() {
    let fechaLlegada = null;
    let fechaSalida = null;
    let numHuespedes = 5;
    let espacioSeleccionado = null;
    let espaciosData = []; // Se llenará desde la API

    // ============================================
    // CONFIGURACIÓN DE CALENDARIOS (PRIMERO)
    // ============================================

    const mesesNombres = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const diasNombres = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

    // Inicializar con el mes actual
    const hoy = new Date();
    let calendario1Mes = hoy.getMonth();
    let calendario1Año = hoy.getFullYear();
    let calendario2Mes = hoy.getMonth();
    let calendario2Año = hoy.getFullYear();

    // Generar calendario
    function generarCalendario(mes, año, calendarGridId) {
        const grid = document.getElementById(calendarGridId);
        if (!grid) {
            console.error(`No se encontró el elemento: ${calendarGridId}`);
            return;
        }
        
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
        const hoyFecha = new Date();
        hoyFecha.setHours(0, 0, 0, 0);

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
            if (fechaActual < hoyFecha || fechaActual > fechaMaxima) {
                dayElement.classList.add('disabled');
            }

            // Agregar event listener directamente
            if (!dayElement.classList.contains('disabled')) {
                dayElement.addEventListener('click', function() {
                    const calendar = this.closest('.calendar');
                    const daysInCalendar = calendar.querySelectorAll('.day:not(.day-name)');
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

            grid.appendChild(dayElement);
        }
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

    // Inicializar calendarios INMEDIATAMENTE
    console.log('🗓️ Inicializando calendarios...');
    document.getElementById('currentMonth1').textContent = `${mesesNombres[calendario1Mes]} ${calendario1Año}`;
    document.getElementById('currentMonth2').textContent = `${mesesNombres[calendario2Mes]} ${calendario2Año}`;
    
    generarCalendario(calendario1Mes, calendario1Año, 'calendarGrid1');
    generarCalendario(calendario2Mes, calendario2Año, 'calendarGrid2');

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

    // Control de huéspedes - CONFIGURAR INMEDIATAMENTE
    console.log('👥 Configurando controles de huéspedes...');
    const guestsInput = document.getElementById('guests');
    const decreaseBtn = document.getElementById('decreaseGuests');
    const increaseBtn = document.getElementById('increaseGuests');

    if (decreaseBtn && increaseBtn && guestsInput) {
        decreaseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            let currentValue = parseInt(guestsInput.value);
            if (currentValue > 1) {
                guestsInput.value = currentValue - 1;
                numHuespedes = currentValue - 1;
                console.log('Huéspedes:', numHuespedes);
                if (espaciosData.length > 0) {
                    filtrarEspacios();
                    actualizarResumen();
                }
            }
        });

        increaseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            let currentValue = parseInt(guestsInput.value);
            if (currentValue < 20) {
                guestsInput.value = currentValue + 1;
                numHuespedes = currentValue + 1;
                console.log('Huéspedes:', numHuespedes);
                if (espaciosData.length > 0) {
                    filtrarEspacios();
                    actualizarResumen();
                }
            }
        });

        console.log('✅ Controles de huéspedes configurados');
    } else {
        console.error('❌ No se encontraron los controles de huéspedes');
    }

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
            const json = await sitios.json();
            // Procesar cada sitio
            const espaciosProcesados = await Promise.all(json.data.map(async (sitio) => {
                let imagenUrl = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop';

                return {
                    id: sitio.documentId,
                    nombre: sitio.name || 'Sin nombre',
                    ubicacion: sitio.location || 'Ubicación no disponible',
                    imagen: sitio.image || imagenUrl,
                    precio: parseFloat(sitio.pricePerNight) || 500,
                    maxHuespedes: parseInt(sitio.capacity) || 5,
                    reservaciones: sitio.periodos?.map(r => ({
                        inicio: r.start,
                        fin: r.end
                    })) || []
                };
            }));

            return espaciosProcesados;
        } catch (error) {
            console.error('Error al cargar espacios desde la API:', error);
            return [];
        }
    }

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
        if (!espaciosGrid) return;
        
        espaciosGrid.innerHTML = '';
        
        // Si no hay espacios cargados, mostrar mensaje
        if (espaciosData.length === 0) {
            espaciosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;"><p style="font-size: 1.2rem;">❌ No hay espacios disponibles en este momento.</p><p style="margin-top: 10px;">Por favor, intente más tarde o contacte al administrador.</p></div>';
            return;
        }
        
        // No filtrar si las fechas no son válidas
        if (!validarFechas() && fechaLlegada && fechaSalida) {
            espaciosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;"><p style="font-size: 1.2rem;">⚠️ Por favor, selecciona fechas válidas.</p><p style="margin-top: 10px;">La fecha de salida debe ser posterior a la fecha de llegada.</p></div>';
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
            espaciosGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;"><p style="font-size: 1.2rem;">😔 No hay espacios disponibles para los criterios seleccionados.</p><p style="margin-top: 10px;">Intenta con otras fechas o menos huéspedes.</p></div>';
            return;
        }

        espaciosFiltrados.forEach(espacio => {
            const card = document.createElement('div');
            card.className = 'space-card';
            card.setAttribute('data-space-id', espacio.id);
            card.innerHTML = `
                <div class="space-image">
                    <img src="${espacio.imagen}" alt="${espacio.nombre}" onerror="this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'">
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

    // Cargar espacios desde la API
    console.log('📦 Cargando espacios desde la API...');
    const loadingMessage = document.getElementById('spacesGrid');
    loadingMessage.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;"><p style="font-size: 1.2rem;">⏳ Cargando espacios disponibles...</p></div>';
    
    espaciosData = await cargarEspaciosDesdeAPI();
    
    console.log('✅ Espacios cargados:', espaciosData.length);
    
    // Mostrar espacios
    filtrarEspacios();
    
    console.log('✅ Página completamente cargada');
});