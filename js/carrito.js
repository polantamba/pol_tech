
const firebaseConfig = {
    apiKey: "AIzaSyBoqaduD3OrWU2NajXdMUlUkIuhMHXYJxQ",
    authDomain: "poltech-927e4.firebaseapp.com",
    projectId: "poltech-927e4",
    storageBucket: "poltech-927e4.firebasestorage.app",
    messagingSenderId: "709234978512",
    appId: "1:709234978512:web:8ecd87f3bd5686638c38d5"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth(); 

let currentUserId = null;
let isAuthReady = false;

document.addEventListener('DOMContentLoaded', function () {
    const contenedorArticulosCarrito = document.getElementById('lista-carrito'); 
    const elementoTotalCarrito = document.getElementById('cart-total'); 
    const mensajeCarritoVacio = document.getElementById('empty-cart-message');
    const botonesAgregarAlCarrito = document.querySelectorAll('.add-to-cart-btn');

 
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUserId = user.uid;
        } else {
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            if (!initialAuthToken) {
                try {
                    const anonymousUser = await auth.signInAnonymously();
                    currentUserId = anonymousUser.user.uid;
                } catch (error) {
                    console.error("Error al iniciar sesión anónimamente:", error);
                }
            } else {
                try {
                    const customTokenUser = await auth.signInWithCustomToken(initialAuthToken);
                    currentUserId = customTokenUser.user.uid;
                } catch (error) {
                    console.error("Error al iniciar sesión con token personalizado:", error);
                    try {
                        const anonymousUser = await auth.signInAnonymously();
                        currentUserId = anonymousUser.user.uid;
                    } catch (anonError) {
                        console.error("Error al iniciar sesión anónimamente después de fallar el token:", anonError);
                    }
                }
            }
        }
        isAuthReady = true;
        console.log("Firebase Auth Ready. User ID:", currentUserId); 

   
        cargarCarrito();
    });

    const agregarProducto = async (nombre, precio, imagen) => { 
        try {
            if (!isAuthReady || !db || !currentUserId) {
                mostrarNotificacion('Firebase no está listo. Por favor, espera.', 'bg-red-600');
                return;
            }
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('carrito').add({
                nombre,
                precio,
                imagen, 
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            mostrarNotificacion(`${nombre} añadido al carrito.`, 'bg-green-500');
        } catch (error) {
            console.error("Error al agregar el producto", error);
            mostrarNotificacion('Error al añadir producto: ' + error.message, 'bg-red-600');
        }
    };


    const cargarCarrito = async () => {
        if (!isAuthReady || !db || !currentUserId) {
            console.log('Firebase no está listo para cargar el carrito.');
            return;
        }

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const carritoCollectionRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('carrito');


        carritoCollectionRef.orderBy('timestamp', 'asc').onSnapshot(snapshot => { 
            contenedorArticulosCarrito.innerHTML = '';
            let total = 0;

            if (snapshot.empty) {
                mensajeCarritoVacio.classList.remove('hidden');
                elementoTotalCarrito.textContent = '$0.00';
                return;
            } else {
                mensajeCarritoVacio.classList.add('hidden');
            }

            snapshot.forEach(doc => {
                const item = doc.data();
                const itemId = doc.id;
                total += item.precio;

                const li = document.createElement("li");
                li.className = 'flex items-center justify-between bg-[#1a1a1a] p-4 rounded-lg shadow-md';
                li.innerHTML = `
                    <div class="flex items-center">
                        <img src="${item.imagen}" alt="${item.nombre}" class="w-16 h-16 object-cover rounded-md mr-4">
                        <div>
                            <span class="text-white text-lg font-semibold">${item.nombre}</span> - <span class="text-green-400 text-lg">$${item.precio.toFixed(2)}</span>
                        </div>
                    </div>
                    <button data-id="${itemId}" class="eliminar-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full transition-transform hover:scale-105">Eliminar</button>
                `;

            
                const btnEliminar = li.querySelector('.eliminar-btn');
                btnEliminar.addEventListener('click', async () => {
                    try {
                        await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('carrito').doc(itemId).delete();
                        mostrarNotificacion(`"${item.nombre}" eliminado del carrito.`, 'bg-red-500');

                    } catch (error) {
                        console.error("No se puede eliminar", error);
                        mostrarNotificacion('Error al eliminar producto: ' + error.message, 'bg-red-600');
                    }
                });
                contenedorArticulosCarrito.appendChild(li);
            });

            elementoTotalCarrito.textContent = `$${total.toFixed(2)}`;

        }, (error) => {
            console.error("Error al cargar el carrito en tiempo real:", error);
            mostrarNotificacion('Error al cargar el carrito: ' + error.message, 'bg-red-600');
        });
    };


    botonesAgregarAlCarrito.forEach(boton => {
        boton.addEventListener('click', () => {
            const nombreProducto = boton.dataset.productName;
            const precioProducto = parseFloat(boton.dataset.productPrice);
            const imagenProducto = boton.dataset.productImage;
            agregarProducto(nombreProducto, precioProducto, imagenProducto);
        });
    });


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
