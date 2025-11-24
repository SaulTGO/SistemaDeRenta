// Funcionalidad del panel de administración
document.addEventListener('DOMContentLoaded', function() {
    
    // Botón de cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    
    btnCerrarSesion.addEventListener('click', function() {
        // Confirmar antes de cerrar sesión
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            console.log('Cerrando sesión...');
            
            // Simular cierre de sesión
            setTimeout(function() {
                // Redirigir a la página de inicio de sesión
                window.location.href = '../../html/login.html';
            }, 500);
        }
    });

    // Animación del título
    const panelTitle = document.querySelector('.panel-title');
    panelTitle.style.opacity = '0';
    panelTitle.style.transform = 'translateY(-20px)';
    panelTitle.style.transition = 'all 0.6s ease';
    
    setTimeout(() => {
        panelTitle.style.opacity = '1';
        panelTitle.style.transform = 'translateY(0)';
    }, 100);

    // Animación de entrada para los botones del menú
    const menuButtons = document.querySelectorAll('.menu-btn');
    
    menuButtons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px)';
        button.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 300 + (index * 150));
    });

    // Animación del contenedor principal
    const menuContainer = document.querySelector('.menu-container');
    menuContainer.style.opacity = '0';
    menuContainer.style.transform = 'scale(0.95)';
    menuContainer.style.transition = 'all 0.5s ease';
    
    setTimeout(() => {
        menuContainer.style.opacity = '1';
        menuContainer.style.transform = 'scale(1)';
    }, 200);
});