/**
 * Este script maneja el formulario de registro.
 * - Escucha el evento 'submit' del formulario.
 * - Previene el comportamiento por defecto del formulario (recargar la página).
 * - Obtiene los valores de los campos de entrada.
 * - Crea una nueva fila en la tabla con los datos del usuario.
 * - Limpia los campos del formulario después del registro.
 */

// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', function () {

    // Seleccionar los elementos del DOM necesarios
    const registroForm = document.getElementById('registro-form');
    const tablaRegistrosBody = document.getElementById('tabla-registros');

    // Añadir un 'escuchador' de eventos al formulario para el evento 'submit'
    registroForm.addEventListener('submit', function (event) {

        // Prevenir el comportamiento por defecto del formulario (que es recargar la página)
        event.preventDefault();

        // 1. Obtener los valores de cada campo del formulario
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const correo = document.getElementById('correo').value;
        const contrasena = document.getElementById('contrasena').value;
        const telefono = document.getElementById('telefono').value;

        // 2. Crear una nueva fila para la tabla (elemento <tr>)
        const nuevaFila = document.createElement('tr');
        nuevaFila.className = 'bg-gray-800 border-b border-gray-700 hover:bg-gray-600';

        // 3. Crear las celdas (<td>) y llenarlas con los datos del usuario
        // Se usa innerHTML para poder añadir clases de Tailwind directamente
        nuevaFila.innerHTML = `
            <td class="px-6 py-4 font-medium text-white whitespace-nowrap">${nombre}</td>
            <td class="px-6 py-4">${apellido}</td>
            <td class="px-6 py-4">${correo}</td>
            <td class="px-6 py-4">${contrasena}</td>
            <td class="px-6 py-4">${telefono}</td>
        `;

        // 4. Añadir la nueva fila al cuerpo de la tabla
        tablaRegistrosBody.appendChild(nuevaFila);

        // 5. Limpiar el formulario para el siguiente registro
        registroForm.reset();
    });
});