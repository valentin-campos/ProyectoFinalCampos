// Clase molde para lso productos de nuestra aplicacion 
class Producto {
    constructor(id, nombre, precio, categoria, imagen){
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.imagen = imagen;
    }
}

class BaseDeDatos {
    constructor() {
        // Array para el catalogo
        this.productos = []
        //
        this.cargarRegistros();
    }

    async cargarRegistros() {
        const resultado = await fetch("./json/productos.json");
        this.productos = await resultado.json();
        cargarProductos(this.productos);
    }
    

    //
    agregarRegistro(id, nombre, precio, categoria, imagen) {
        const producto = new Producto(id, nombre, precio, categoria, imagen);
        this.productos.push(producto);
    }
    
    // Nos devulve el catalogo de productos
    traerRegistros() {
        return this.productos;
    }

    // Nos dvuelve un producto segun el ID
    registroPorId(id) {
        return this.productos.find((producto => producto.id === id));
    }

    registrosPorNombre(palabra) {
        return this.productos.filter((producto) => producto.nombre.toLowerCase().includes(palabra.toLowerCase()));
    }
    
    registrosPorCategoria(categoria) {
        return this.productos.filter((producto) => producto.categoria == categoria);
    }
}

class Carrito {
    constructor() {
        const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
        //
        this.carrito = carritoStorage || [];
        this.total = 0; // Suma total de los precios de todos los productos
        this.cantidadProductos = 0; // La cantidad de productos que tenemos en el carrito
        this.listar();
    }

    //
    estaEnCarrito({id}) {
        return this.carrito.find((producto) => producto.id === id);
    }

    // Agregar al carrito
    agregar(producto) {
        const productoEnCarrito = this.estaEnCarrito(producto);
    
        if (productoEnCarrito) {
            // Algoritmo cuando ya está en el carrito
            productoEnCarrito.cantidad++;
        } else {
            // Algoritmo cuando el producto no está en el carrito
            this.carrito.push({ ...producto, cantidad: 1 });
        }
        // Actualizo el storage
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        this.listar();
    }

    // Quitar del carrito
    quitar(id) {
        const indice = this.carrito.findIndex((producto) => producto.id === id);
        //  Si la cantidad es mayor a 1, le resto la cantidad en 1
        if (this.carrito[indice].cantidad > 1) {
            this.carrito[indice].cantidad--;
        } else {
            // Borramso del carrito el producto a quitar
            this.carrito.splice(indice, 1);
        }
        // Actualizo el storage
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        //
        this.listar();
    }

    vaciar() {
        this.total = 0;
        this.cantidadProductos = 0;
        this.carrito = [];
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        this.listar();
    }

    // Renderiza todos los productos de HTML
    listar() {
        this.total = 0;
        this.cantidadProductos = 0;
        divCarrito.innerHTML = ""

        for (const producto of this.carrito) {
            divCarrito.innerHTML += `
                <div class="productoCarrito">
                    <h2 class="nombre-producto">${producto.nombre}</h2>
                    <p class="precio-producto">$${producto.precio}</p>
                    <p class="cantidad-producto">Cantidad: ${producto.cantidad}</p>
                    <a href="#" class="btnQuitar" data-id="${producto.id}"><i class="fa-solid fa-minus restar-cantidad"></i></a>
                </div>
            `;
            // Actualizamos los totales
            this.total += producto.precio * producto.cantidad;
            this.cantidadProductos += producto.cantidad;
        }
        if (this.cantidadProductos > 0){
            // Boton comprar visible
            botonComprar.style.display = "block";
        } else {
            // Boton comprar invisible
            botonComprar.style.display = "none";
        }

        const botonesQuitar = document.querySelectorAll(".btnQuitar");
        for (const boton of botonesQuitar) {
            boton.addEventListener("click", (event) => {
                event.preventDefault();
                const idProducto = Number(boton.dataset.id);
                this.quitar(idProducto);
            });
        }

        spanCantidadProductos.innerText = this.cantidadProductos;
        spanTotalCarrito.innerText = this.total;
    }
}

// Elementos
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const divProductos = document.querySelector(".productos");
const divCarrito = document.querySelector("#carrito");
const inputBuscar = document.querySelector("#inputBuscar")
const botonComprar = document.querySelector("#botonComprar"); 
const botonesCategorias = document.querySelectorAll(".btnCategoria");


// Instaciamos base de datos
const bd = new BaseDeDatos();

// Instaciamos la clase Carrito
const carrito = new Carrito();

botonesCategorias.forEach((boton) => {
    boton.addEventListener("click", () => {
        const categoria = boton.dataset.categoria;
        // Quitar clase anteriror
        const botonSeleccionado = document.querySelector(".seleccionado");
        botonSeleccionado.classList.remove("seleccionado");
        // Se lo agrego a este boton
        boton.classList.add("seleccionado");
        if (categoria == "Todos") {
            cargarProductos(bd.traerRegistros());
        } else {
            cargarProductos(bd.registrosPorCategoria(categoria));
        }
    });
});


//
cargarProductos(bd.traerRegistros());

function cargarProductos(productos) {
    // Vaciamos el div
    divProductos.innerHTML = "";
    //
    for (const producto of productos) {
        divProductos.innerHTML += `
            <div class="producto">
                <h2 class="nombre">${producto.nombre}</h2>
                <p class="precio">$${producto.precio}</p>
                <div class="imagen">
                    <img src="img/${producto.imagen}" width="180"</img>
                </div>
                <a href="#" class="btnAgregar" data-id="${producto.id}">Agregar al carrito</a>
            </div>
        `;
    }

    const botonesAgregar =document.querySelectorAll(".btnAgregar");

    for (const boton of botonesAgregar) {
        boton.addEventListener("click", (event) => {
            // Evita el comportamiento default de HTML
            event.preventDefault();
            // Guarda el dataset ID que esta en el html del boton agregar
            const idProducto = Number(boton.dataset.id);
            // Uso el metodo de la base de datps
            const producto = bd.registroPorId(idProducto);
            //
            carrito.agregar(producto);
            Toastify({
                text:`Se ha añadido ${producto.nombre} al carrito`,
                gravity: "bottom",
                className: "info",
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast();
        });
    }
}

// Buscador

inputBuscar.addEventListener("input", (event) => {
    event.preventDefault();
    const palabra = inputBuscar.value;
    const productos = bd.registrosPorNombre(palabra);
    cargarProductos(productos);
});

// Boton comprar
botonComprar.addEventListener("click", (event) => {
    event.preventDefault();
    Swal.fire({
        title: "Seguro que desea comprar los producto/s?",
        icon: "warning",
        showCancelButton: true, 
        confirmButtonText: "Si, seguro",
        cancelButtonText: "No, no quiero",
    }).then((result) => {
        if (result.isConfirmed) {
            carrito.vaciar();
            Swal.fire({
                title: "Compra realizada!!",
                icon: "success",
                text: "Los productos han sido comprados, gracias!"
            })
        }
    })
});


