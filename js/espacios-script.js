// Función para crear fechas de reservación cercanas al día de hoy
function crearReservaciones() {
    const hoy = new Date();
    const reservaciones = [];
    
    // Reservación 1: Del 15 al 20 de noviembre (5 días)
    const reserva1Inicio = new Date(2025, 10, 15); // Noviembre 15
    const reserva1Fin = new Date(2025, 10, 20);    // Noviembre 20
    
    // Reservación 2: Del 22 al 28 de noviembre (6 días)
    const reserva2Inicio = new Date(2025, 10, 22); // Noviembre 22
    const reserva2Fin = new Date(2025, 10, 28);    // Noviembre 28
    
    // Reservación 3: Del 5 al 10 de diciembre (5 días)
    const reserva3Inicio = new Date(2025, 11, 5);  // Diciembre 5
    const reserva3Fin = new Date(2025, 11, 10);    // Diciembre 10
    
    // Reservación 4: Del 18 al 25 de diciembre (7 días - temporada navideña)
    const reserva4Inicio = new Date(2025, 11, 18); // Diciembre 18
    const reserva4Fin = new Date(2025, 11, 25);    // Diciembre 25
    
    // Reservación 5: Del 28 de diciembre al 3 de enero (6 días - fin de año)
    const reserva5Inicio = new Date(2025, 11, 28); // Diciembre 28
    const reserva5Fin = new Date(2026, 0, 3);      // Enero 3
    
    return [
        { inicio: reserva1Inicio.toISOString().split('T')[0], fin: reserva1Fin.toISOString().split('T')[0] },
        { inicio: reserva2Inicio.toISOString().split('T')[0], fin: reserva2Fin.toISOString().split('T')[0] },
        { inicio: reserva3Inicio.toISOString().split('T')[0], fin: reserva3Fin.toISOString().split('T')[0] },
        { inicio: reserva4Inicio.toISOString().split('T')[0], fin: reserva4Fin.toISOString().split('T')[0] },
        { inicio: reserva5Inicio.toISOString().split('T')[0], fin: reserva5Fin.toISOString().split('T')[0] }
    ];
}

// Datos de espacios con algunas reservaciones
const espaciosData = [
    {
        id: 1,
        nombre: "Casa Paseo Arboleda",
        ubicacion: "Calle Paseo Arboleda No 102, San Mateo Otzacatipan, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/resize/18/00/90/64/49/08/1200x1200/1101471274.jpg?isFirstImage=true",
        precio: 800.00,
        maxHuespedes: 7,
        reservaciones: [crearReservaciones()[0], crearReservaciones()[3]] // 15-20 nov y 18-25 dic
    },
    {
        id: 2,
        nombre: "Casa Misiones",
        ubicacion: "Convento de Murcia #31 Fracc: Misiones, Misiones de Santa Esperanza, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/resize/18/01/47/69/99/59/1200x1200/1562397463.jpg?isFirstImage=true",
        precio: 950.00,
        maxHuespedes: 5,
        reservaciones: [] // Sin reservaciones
    },
    {
        id: 3,
        nombre: "Casa Los Sauces",
        ubicacion: "Chopos Mz 9 Lt 78C - 102, Conjunto Urbano Sauces I, Toluca Estado de México, Los Sauces, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/resize/18/01/47/34/94/62/1200x1200/1554140613.jpg?isFirstImage=true",
        precio: 800.00,
        maxHuespedes: 7,
        reservaciones: [crearReservaciones()[1]] // 22-28 nov
    },
    {
        id: 4,
        nombre: "Departamento San Lorenzo",
        ubicacion: "Sn Lorenzo T, San Lorenzo Tepaltitlán Centro, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/18/01/47/19/38/55/360x266/1550400757.jpg?isFirstImage=true",
        precio: 600.00,
        maxHuespedes: 2,
        reservaciones: [crearReservaciones()[2], crearReservaciones()[4]] // 5-10 dic y 28 dic-3 ene
    },
    {
        id: 5,
        nombre: "Casa Celanese",
        ubicacion: "Poliester, Celanese, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/resize/18/00/65/91/08/77/1200x1200/355187742.jpg?isFirstImage=true",
        precio: 700.00,
        maxHuespedes: 4,
        reservaciones: [] // Sin reservaciones
    },
    {
        id: 6,
        nombre: "Casa Valle Don Camilo",
        ubicacion: "Sierra Tarahumara 324, Valle Don Camilo, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/resize/18/01/43/27/87/65/1200x1200/1454336106.jpg?isFirstImage=true",
        precio: 700.00,
        maxHuespedes: 4,
        reservaciones: [crearReservaciones()[0]] // 15-20 nov
    },
    {
        id: 7,
        nombre: "Casa Ex Hacienda San José",
        ubicacion: "Rinconadas Casa Grande 28, Ex. Hacienda San José, Toluca",
        imagen: "https://propiedadescom.s3.amazonaws.com/files/1200x507/bosques-de-cantabria-toluca-mexico-30457133-foto-01.jpeg",
        precio: 1100.00,
        maxHuespedes: 8,
        recamaras: 4,
        banos: 3,
        m2Construccion: 220,
        reservaciones: [crearReservaciones()[3], crearReservaciones()[4]] // 18-25 dic y 28 dic-3 ene
    },
    {
        id: 8,
        nombre: "Casa Moderna Colonia Morelos",
        ubicacion: "Felipe Villanueva 602-A, Colonia Morelos Primera Sección, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/resize/18/01/46/80/72/27/1200x1200/1541024286.jpg?isFirstImage=true",
        precio: 750.00,
        maxHuespedes: 5,
        recamaras: 2,
        banos: 2,
        m2Construccion: 135,
        reservaciones: [] // Sin reservaciones
    },
    {
        id: 9,
        nombre: "Residencia Las Palmas",
        ubicacion: "Colonia Del Parque, Las Palmas, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/resize/18/01/48/12/01/67/1200x1200/1570738443.jpg?isFirstImage=true",
        precio: 1300.00,
        maxHuespedes: 10,
        recamaras: 4,
        banos: 3,
        m2Construccion: 300,
        reservaciones: [crearReservaciones()[1], crearReservaciones()[2]] // 22-28 nov y 5-10 dic
    },
    {
        id: 10,
        nombre: "Casa Familiar Barrio de la Merced",
        ubicacion: "Av. Sebastián Lerdo de Tejada Pte. 432, Barrio de la Merced, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/resize/18/01/44/16/95/98/1200x1200/1476816640.jpg?isFirstImage=true",
        precio: 700.00,
        maxHuespedes: 6,
        recamaras: 3,
        banos: 2,
        m2Construccion: 160,
        reservaciones: [] // Sin reservaciones
    },
    {
        id: 11,
        nombre: "Casa Amplia Ciprés Colón",
        ubicacion: "Colonia Ciprés, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/resize/18/01/45/46/05/79/1200x1200/1504816619.jpg?isFirstImage=true",
        precio: 1500.00,
        maxHuespedes: 12,
        recamaras: 6,
        banos: 4,
        m2Construccion: 530,
        reservaciones: [crearReservaciones()[4]] // 28 dic-3 ene
    },
    {
        id: 12,
        nombre: "Casa Acogedora Vicente Guerrero",
        ubicacion: "Colonia Vicente Guerrero, Toluca",
        imagen: "https://img10.naventcdn.com/avisos/resize/18/01/45/28/68/91/1200x1200/1528505819.jpg?isFirstImage=true",
        precio: 850.00,
        maxHuespedes: 7,
        recamaras: 3,
        banos: 3,
        m2Construccion: 185,
        reservaciones: [crearReservaciones()[0], crearReservaciones()[2]] // 15-20 nov y 5-10 dic
    }
];

// Funcionalidad de los calendarios
document.addEventListener('DOMContentLoaded', function() {
    let fechaLlegada = null;
    let fechaSalida = null;
    let numHuespedes = 5;
    let espacioSeleccionado = null;

    // Configuración de calendarios
    const mesesNombres = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const diasNombres = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

    let calendario1Mes = 10; // Noviembre (0-indexado)
    let calendario1Año = 2025;
    let calendario2Mes = 10;
    let calendario2Año = 2025;

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
                    } else {
                        fechaSalida = fechaSeleccionada;
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
            // Hay conflicto si:
            // - La llegada está dentro del período reservado
            // - La salida está dentro del período reservado
            // - La reserva está completamente dentro del período seleccionado
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
                    <p><strong>Precio:</strong> ${espacio.precio.toFixed(2)}/noche</p>
                    <p><strong>Capacidad:</strong> Máx ${espacio.maxHuespedes} huéspedes</p>
                </div>
            `;
            
            card.addEventListener('click', function() {
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

    // Inicializar calendarios
    generarCalendario(calendario1Mes, calendario1Año, 'calendarGrid1');
    generarCalendario(calendario2Mes, calendario2Año, 'calendarGrid2');
    
    // Mostrar todos los espacios al cargar
    filtrarEspacios();
});