// Configuración de Firebase proporcionada por el usuario
// ¡IMPORTANTE! Esta configuración debe ser IDÉNTICA en todos tus archivos JavaScript
// que se conecten a este proyecto de Firebase (ej. registro.js y carrito.js).
const firebaseConfig = {
    apiKey: "AIzaSyCv4cWzbbY0E-K-R5bHVaxrO2QsI1snuI8",
    authDomain: "poltech-c92ec.firebaseapp.com",
    projectId: "poltech-c92ec",
    storageBucket: "poltech-c92ec.firebasestorage.app",
    messagingSenderId: "682924463768",
    appId: "1:682924463768:web:539d8c7f517bc65b71a2ed",
    measurementId: "G-PKFNTQW742"
};

document.addEventListener('DOMContentLoaded', function () {
    // === INICIALIZACIÓN DE FIREBASE DENTRO DE DOMContentLoaded ===
    // Esto asegura que las librerías de Firebase estén completamente cargadas
    // antes de intentar usarlas.
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    // =============================================================

    const registroForm = document.getElementById('registro-form');
    const tablaRegistrosBody = document.getElementById('tabla-registros');

    let currentUserId = null;
    let isAuthReady = false;

    // Manejar el estado de autenticación
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUserId = user.uid;
        } else {
            try {
                const anonymousUser = await auth.signInAnonymously();
                currentUserId = anonymousUser.user.uid;
            } catch (error) {
                console.error("Error al autenticar anónimamente:", error);
                mostrarNotificacion('Error de autenticación: ' + error.message, 'bg-red-600');
            }
        }
        isAuthReady = true;
    });


    if (registroForm) {
        registroForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            if (!isAuthReady || !currentUserId) {
                mostrarNotificacion('Inicializando sesión, por favor espera...', 'bg-yellow-500');
                return;
            }

            const nombre = document.getElementById('nombre').value.trim();
            const apellido = document.getElementById('apellido').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const contrasena = document.getElementById('contrasena').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const fechaNacimiento = document.getElementById('fechaNacimiento').value;
            const genero = document.getElementById('genero').value;
            const direccion = document.getElementById('direccion').value.trim();

            if (!nombre || !apellido || !correo || !contrasena || !telefono || !fechaNacimiento || !genero || !direccion) {
                mostrarNotificacion('Por favor, completa todos los campos.', 'bg-red-600');
                return;
            }

            const nuevoRegistro = {
                nombre,
                apellido,
                correo,
                contrasena,
                telefono,
                fechaNacimiento,
                genero,
                direccion,
                timestamp: new Date()
            };

            try {
                const userDocRef = db.collection('usuarios').doc(currentUserId);
                const registrosCollectionRef = userDocRef.collection('registros');
                await registrosCollectionRef.add(nuevoRegistro);

                mostrarNotificacion('Registro listo', 'bg-green-500');
                registroForm.reset();
            } catch (error) {
                console.error("Error al guardar el registro en Firestore:", error);
                mostrarNotificacion('Error al guardar el registro: ' + error.message, 'bg-red-600');
            }
        });
    }

    function mostrarNotificacion(mensaje, colorClass = 'bg-blue-600') {
        const notificacion = document.createElement('div');
        notificacion.className = `fixed bottom-5 right-5 ${colorClass} text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up`;
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);

        setTimeout(() => {
            notificacion.classList.add('animate-fade-out-down');
            notificacion.addEventListener('animationend', () => notificacion.remove());
        }, 3000);
    }
});