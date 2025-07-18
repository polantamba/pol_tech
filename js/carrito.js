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
    measurementId: "G-PKFNTQW742" // Asegúrate de que este ID sea el correcto si lo tienes
};

// Declara estas variables globalmente para que sean accesibles en todo el script
let db;
let auth;
let currentUserId = null;
let isAuthReady = false;

document.addEventListener('DOMContentLoaded', function () {
    // === INICIALIZACIÓN DE FIREBASE DENTRO DE DOMContentLoaded ===
    // Esto asegura que las librerías de Firebase estén completamente cargadas
    // antes de intentar usarlas, evitando el error "firebase.firestore is not a function".
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    // =============================================================

    const contenedorArticulosCarrito = document.getElementById('lista-carrito');
    const elementoTotalCarrito = document.getElementById('cart-total');
    const mensajeCarritoVacio = document.getElementById('empty-cart-message');
    const botonesAgregarAlCarrito = document.querySelectorAll('.add-to-cart-btn');

    // Manejar el estado de autenticación para obtener un userId (anónimo si no hay token)
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUserId = user.uid;
        } else {
            // Si no hay usuario, autentica anónimamente para obtener un UID persistente
            try {
                const anonymousUser = await auth.signInAnonymously();
                currentUserId = anonymousUser.user.uid;
                console.log("Autenticado anónimamente con UID:", currentUserId);
            } catch (error) {
                console.error("Error al autenticar anónimamente:", error);
                mostrarNotificacion('Error de autenticación anónima: ' + error.message, 'bg-red-600');
                return;
            }
        }
        isAuthReady = true;
        cargarCarritoEnTiempoReal(); // Cargar el carrito solo cuando la autenticación esté lista
    });

    // Función para añadir un producto al carrito
    async function agregarProducto(nombre, precio, imagen) {
        if (!isAuthReady || !currentUserId) {
            mostrarNotificacion('Inicializando sesión, por favor espera...', 'bg-yellow-500');
            return;
        }

        try {
            const docRef = db.collection('carritos').doc(currentUserId);
            const docSnap = await docRef.get();

            let carritoActual = [];
            if (docSnap.exists) {
                carritoActual = docSnap.data().items || [];
            }

            const productoExistente = carritoActual.find(item => item.nombre === nombre);

            if (productoExistente) {
                productoExistente.cantidad++;
            } else {
                carritoActual.push({
                    nombre,
                    precio,
                    imagen,
                    cantidad: 1
                });
            }

            await docRef.set({
                items: carritoActual
            });
            mostrarNotificacion(`"${nombre}" añadido al carrito!`, 'bg-green-500');

        } catch (error) {
            console.error("Error al añadir producto al carrito:", error);
            mostrarNotificacion('Error al añadir producto: ' + error.message, 'bg-red-600');
        }
    }

    // Función para eliminar un producto del carrito
    window.eliminarProducto = async function (nombreProducto) {
        if (!isAuthReady || !currentUserId) {
            mostrarNotificacion('Inicializando sesión, por favor espera...', 'bg-yellow-500');
            return;
        }

        try {
            const docRef = db.collection('carritos').doc(currentUserId);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                let carritoActual = docSnap.data().items || [];
                carritoActual = carritoActual.filter(item => item.nombre !== nombreProducto);
                await docRef.set({
                    items: carritoActual
                });
                mostrarNotificacion(`"${nombreProducto}" eliminado del carrito.`, 'bg-red-500');
            }
        } catch (error) {
            console.error("Error al eliminar producto del carrito:", error);
            mostrarNotificacion('Error al eliminar producto: ' + error.message, 'bg-red-600');
        }
    };

    // Función para actualizar la cantidad de un producto
    window.actualizarCantidad = async function (nombreProducto, nuevaCantidad) {
        if (!isAuthReady || !currentUserId) {
            mostrarNotificacion('Inicializando sesión, por favor espera...', 'bg-yellow-500');
            return;
        }

        try {
            const docRef = db.collection('carritos').doc(currentUserId);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                let carritoActual = docSnap.data().items || [];
                const producto = carritoActual.find(item => item.nombre === nombreProducto);

                if (producto) {
                    producto.cantidad = parseInt(nuevaCantidad);
                    if (producto.cantidad <= 0) {
                        carritoActual = carritoActual.filter(item => item.nombre !== nombreProducto);
                    }
                    await docRef.set({
                        items: carritoActual
                    });
                    mostrarNotificacion(`Cantidad de "${nombreProducto}" actualizada.`, 'bg-blue-500');
                }
            }
        } catch (error) {
            console.error("Error al actualizar cantidad:", error);
            mostrarNotificacion('Error al actualizar cantidad: ' + error.message, 'bg-red-600');
        }
    };

    // Función para cargar el carrito en tiempo real
    function cargarCarritoEnTiempoReal() {
        if (!currentUserId) {
            console.warn("UID de usuario no disponible para cargar el carrito en tiempo real.");
            return;
        }

        const carritoRef = db.collection('carritos').doc(currentUserId);

        carritoRef.onSnapshot(docSnap => {
            let itemsCarrito = [];
            if (docSnap.exists) {
                itemsCarrito = docSnap.data().items || [];
            }

            contenedorArticulosCarrito.innerHTML = ''; // Limpiar el carrito
            let total = 0;

            if (itemsCarrito.length === 0) {
                mensajeCarritoVacio.classList.remove('hidden');
            } else {
                mensajeCarritoVacio.classList.add('hidden');
                itemsCarrito.forEach(item => {
                    const subtotal = item.precio * item.cantidad;
                    total += subtotal;

                    const articuloHTML = `
                        <div class="flex items-center bg-[#2a2a2a] p-4 rounded-lg shadow mb-4">
                            <img src="${item.imagen}" alt="${item.nombre}" class="w-20 h-20 object-cover rounded-md mr-4">
                            <div class="flex-grow">
                                <h3 class="text-lg font-bold text-white">${item.nombre}</h3>
                                <p class="text-green-400 font-semibold">$${item.precio.toFixed(2)}</p>
                            </div>
                            <div class="flex items-center space-x-2">
                                <input type="number" min="1" value="${item.cantidad}"
                                    onchange="actualizarCantidad('${item.nombre}', this.value)"
                                    class="w-20 bg-[#1a1a1a] border border-gray-600 rounded-md px-2 py-1 text-center text-white">
                                <button onclick="eliminarProducto('${item.nombre}')"
                                    class="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition">
                                    <i class="bi bi-trash-fill"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    contenedorArticulosCarrito.innerHTML += articuloHTML;
                });
            }
            elementoTotalCarrito.textContent = `$${total.toFixed(2)}`;

        }, (error) => {
            console.error("Error al cargar el carrito en tiempo real:", error);
            mostrarNotificacion('Error al cargar el carrito: ' + error.message, 'bg-red-600');
        });
    }

    // Evento que al dar click se agregue al carrito (adaptado a los botones existentes en productos.html)
    botonesAgregarAlCarrito.forEach(boton => {
        boton.addEventListener('click', () => {
            const nombreProducto = boton.dataset.productName;
            const precioProducto = parseFloat(boton.dataset.productPrice);
            const imagenProducto = boton.dataset.productImage;
            agregarProducto(nombreProducto, precioProducto, imagenProducto);
        });
    });

    // Función simple de notificación (reemplaza a alert)
    function mostrarNotificacion(mensaje, colorClass = 'bg-blue-600') {
        const notificacion = document.createElement('div');
        notificacion.className = `fixed bottom-5 right-5 ${colorClass} text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up`;
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);

        setTimeout(() => {
            notificacion.classList.add('animate-fade-out-down');
            notificacion.addEventListener('animationend', () => notificacion.remove());
        }, 3000); // La notificación desaparece después de 3 segundos
    }
});