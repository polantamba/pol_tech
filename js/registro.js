document.addEventListener('DOMContentLoaded', function () {


    const registroForm = document.getElementById('registro-form');
    const tablaRegistrosBody = document.getElementById('tabla-registros');


    registroForm.addEventListener('submit', function (event) {


        event.preventDefault();


        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const correo = document.getElementById('correo').value;
        const contrasena = document.getElementById('contrasena').value;
        const telefono = document.getElementById('telefono').value;


        const nuevaFila = document.createElement('tr');
        nuevaFila.className = 'bg-gray-800 border-b border-gray-700 hover:bg-gray-600';


        nuevaFila.innerHTML = `
            <td class="px-6 py-4 font-medium text-white whitespace-nowrap">${nombre}</td>
            <td class="px-6 py-4">${apellido}</td>
            <td class="px-6 py-4">${correo}</td>
            <td class="px-6 py-4">${contrasena}</td>
            <td class="px-6 py-4">${telefono}</td>
        `;


        tablaRegistrosBody.appendChild(nuevaFila);


        registroForm.reset();
    });
});
