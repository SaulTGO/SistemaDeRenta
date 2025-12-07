# SistemaDeRenta
Proyecto de sistema de rentas

TO DO

- Entre la pantalla de espacios (donde se selecciona la reservacion) y la pagina del metodo de pago (reservar.html), manejar que los datos de la se envien desde los espacios hacia  el resumen de la reservacion en la ventana del metodo de pago.
- COMPROBAR QUE: En la ventana del metodo de pago (reservar.html) ocultar la seccion de registarse cuando hay una sesion iniciada.
- La reservacion debe asociarse a un usuario, y la informacion debe desplegarse en la ventana de home-user
- Si no hay una sesion iniciada en la ventana del metodo de pago (reservar.html), despues de simular el pago, la cuenta debe guardarse correctamente, y la sesion debe inciarse y redirigerse a la seccion de home-user (REVISAR FLUJO)
- Revisar el script de reservar-script.js, segun el ide, hay variables no inicializadas
- Revisar despliegue de datos en las tablas del admin y superadmin (No se si actualemente funciona)
- Recuperar el valor de la checkbox y de las observaciones en la tabla del home-personal, para que se guarden en la BD

- Cuando un super admin inicia sesion, las paginas asociadas al admin deben retornar al super admin en vez de al admin.


MODIFICACIONES A CONSIDERAR
- En las tablas del admin, operaciones completas del CRUD. Por simplicidad, ahorita solo seria editar los valores o agregar alguno nuevo a la tabla
- Graficas para reportes de nivel de uso en admin/reservaciones
- La informacion de los domicilios que se muestra donde se hace la reservacion, deberia recuperarse desde la BD? Ahorita solo esta incluida dentro del script

