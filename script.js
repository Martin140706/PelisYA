// Martin Tolosa, 47314494

const CLAVE_API = '8a946c4a81301898b5474e20cb65decc';
const URL_API = 'https://api.themoviedb.org/3/discover/movie';
let carrito = [];

async function cargarPeliculas() {
  try {
    const respuesta = await fetch(
      `${URL_API}?api_key=${CLAVE_API}&language=es-ES&sort_by=popularity.desc`,
    );
    const datos = await respuesta.json();
    const peliculas = datos.results.map((pelicula) => ({
      id: pelicula.id,
      titulo: pelicula.title,
      precio: (Math.random() * (5000 - 1500) + 1500).toFixed(0),
      poster: pelicula.poster_path
        ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`
        : null,
    }));
    mostrarPeliculas(peliculas);
  } catch (error) {
    console.error('Error cargando películas:', error);
    document.getElementById('cuadricula-peliculas').innerHTML =
      '<p style="color: red; text-align: center;">Error al cargar películas.</p>';
  }
}

function mostrarPeliculas(peliculasAMostrar) {
  const cuadricula = document.getElementById('cuadricula-peliculas');
  cuadricula.innerHTML = '';

  for (let i = 0; i < peliculasAMostrar.length; i++) {
    const pelicula = peliculasAMostrar[i];
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-pelicula';
    tarjeta.innerHTML = `
                    <div class="imagen-pelicula">
                        ${
                          pelicula.poster
                            ? `<img src="${pelicula.poster}" alt="${pelicula.titulo}">`
                            : '🎬'
                        }
                    </div>
                    <div class="info-pelicula">
                        <div class="titulo-pelicula">${pelicula.titulo}</div>
                        <div class="precio-pelicula">$${pelicula.precio}</div>
                        <button onclick="agregarAlCarrito(${pelicula.id}, '${
      pelicula.titulo
    }', ${pelicula.precio})">Añadir al Carrito</button>
                    </div>
                `;
    cuadricula.appendChild(tarjeta);
  }
}

function agregarAlCarrito(id, titulo, precio) {
  const elementoExistente = carrito.find((elemento) => elemento.id === id);

  if (elementoExistente) {
    elementoExistente.cantidad++;
  } else {
    carrito.push({ id, titulo, precio, cantidad: 1 });
  }

  actualizarVisualizacionCarrito();
  alert(`${titulo} añadido al carrito!`);
}

function actualizarVisualizacionCarrito() {
  const contador = carrito.reduce(
    (total, elemento) => total + elemento.cantidad,
    0,
  );
  document.getElementById('contador-carrito').textContent = contador;
  mostrarCarrito();
}

function mostrarCarrito() {
  const contenedor = document.getElementById('contenedor-elementos-carrito');

  if (carrito.length === 0) {
    contenedor.innerHTML =
      '<div class="mensaje-vacio">Tu carrito está vacío</div>';
    return;
  }

  let html = '<div class="elementos-carrito">';
  let total = 0;

  for (let i = 0; i < carrito.length; i++) {
    const elemento = carrito[i];
    const subtotal = elemento.precio * elemento.cantidad;
    total += subtotal;

    html += `
                    <div class="elemento-carrito">
                        <div class="detalles-elemento">
                            <div class="nombre-elemento">${
                              elemento.titulo
                            }</div>
                            <div class="precio-elemento">$${
                              elemento.precio
                            } x ${elemento.cantidad} = $${subtotal.toFixed(
      2,
    )}</div>
                        </div>
                        <div class="controles-cantidad">
                            <button class="boton-cantidad" onclick="actualizarCantidad(${
                              elemento.id
                            }, -1)">−</button>
                            <span>${elemento.cantidad}</span>
                            <button class="boton-cantidad" onclick="actualizarCantidad(${
                              elemento.id
                            }, 1)">+</button>
                        </div>
                        <button class="boton-eliminar" onclick="eliminarDelCarrito(${
                          elemento.id
                        })">Eliminar</button>
                    </div>
                `;
  }

  html += `
                <div class="total-carrito">
                    Total: $${total.toFixed(2)}
                </div>
                <button class="boton-pagar" onclick="irAPagar(${total.toFixed(
                  2,
                )})">Ir a Pagar</button>
            </div>
            `;

  contenedor.innerHTML = html;
}

function actualizarCantidad(id, cambio) {
  const elemento = carrito.find((elemento) => elemento.id === id);
  if (elemento) {
    elemento.cantidad += cambio;
    if (elemento.cantidad <= 0) {
      eliminarDelCarrito(id);
    } else {
      actualizarVisualizacionCarrito();
    }
  }
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter((elemento) => elemento.id !== id);
  actualizarVisualizacionCarrito();
}

function irAPagar(total) {
  document.getElementById('total-pago').textContent = total;
  cambiarSeccion('pago');
}

function validarNumeroTarjeta(numero) {
  const numeroLimpio = numero.replace(/\s/g, '');

  if (!/^\d{13,19}$/.test(numeroLimpio)) return false;

  let suma = 0;
  let esPar = false;

  for (let i = numeroLimpio.length - 1; i >= 0; i--) {
    let digito = parseInt(numeroLimpio[i], 10);

    if (esPar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }

    suma += digito;
    esPar = !esPar;
  }

  return suma % 10 === 0;
}

function detectarTipoTarjeta(numero) {
  const patrones = {
    Visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    Mastercard: /^5[1-5][0-9]{14}$/,
    'American Express': /^3[47][0-9]{13}$/,
    Discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
  };

  const numeroLimpio = numero.replace(/\s/g, '');

  for (const [tipo, patron] of Object.entries(patrones)) {
    if (patron.test(numeroLimpio)) {
      return tipo;
    }
  }

  return 'Tarjeta';
}

function formatearNumeroTarjeta(valor) {
  const limpio = valor.replace(/\s/g, '');
  const formateado = limpio.replace(/(\d{4})/g, '$1 ').trim();
  return formateado;
}

function formatearFechaExpiracion(valor) {
  const limpio = valor.replace(/\D/g, '');
  if (limpio.length >= 2) {
    return limpio.slice(0, 2) + '/' + limpio.slice(2, 4);
  }
  return limpio;
}

document
  .getElementById('numero-tarjeta')
  .addEventListener('input', function (e) {
    const formateado = formatearNumeroTarjeta(e.target.value);
    e.target.value = formateado;

    const tipoTarjeta = detectarTipoTarjeta(formateado);
    const visualizador = document.getElementById('visualizador-info-tarjeta');
    const iconoTipo = document.getElementById('icono-tipo-tarjeta');
    const nombreTipo = document.getElementById('nombre-tipo-tarjeta');

    const iconos = {
      Visa: '💳',
      Mastercard: '🟠',
      'American Express': '🟦',
      Discover: '🔶',
      Tarjeta: '💳',
    };

    iconoTipo.textContent = iconos[tipoTarjeta] || '💳';
    nombreTipo.textContent = tipoTarjeta;
    visualizador.style.display = 'block';

    if (validarNumeroTarjeta(formateado)) {
      e.target.classList.remove('invalido');
      e.target.classList.add('valido');
    } else {
      e.target.classList.remove('valido');
      e.target.classList.add('invalido');
    }
  });

document
  .getElementById('fecha-expiracion')
  .addEventListener('input', function (e) {
    e.target.value = formatearFechaExpiracion(e.target.value);
  });

document.getElementById('cvv').addEventListener('input', function (e) {
  e.target.value = e.target.value.replace(/\D/g, '');
});

function validarFormularioPago() {
  const nombre = document.getElementById('nombre-titular').value.trim();
  const numeroTarjeta = document.getElementById('numero-tarjeta').value.trim();
  const fechaExpiracion = document
    .getElementById('fecha-expiracion')
    .value.trim();
  const cvv = document.getElementById('cvv').value.trim();

  const errores = [];

  if (!nombre) {
    errores.push('El nombre del titular es requerido');
    document.getElementById('nombre-titular').classList.add('invalido');
  } else {
    document.getElementById('nombre-titular').classList.remove('invalido');
  }

  if (!validarNumeroTarjeta(numeroTarjeta)) {
    errores.push('El número de tarjeta no es válido');
    document.getElementById('numero-tarjeta').classList.add('invalido');
  } else {
    document.getElementById('numero-tarjeta').classList.remove('invalido');
  }

  const [mes, año] = fechaExpiracion.split('/');
  const fechaExpiracionObj = new Date(2000 + parseInt(año), parseInt(mes) - 1);
  if (fechaExpiracionObj < new Date()) {
    errores.push('La tarjeta ha expirado');
    document.getElementById('fecha-expiracion').classList.add('invalido');
  } else {
    document.getElementById('fecha-expiracion').classList.remove('invalido');
  }

  if (cvv.length < 3) {
    errores.push('El código de seguridad debe tener al menos 3 dígitos');
    document.getElementById('cvv').classList.add('invalido');
  } else {
    document.getElementById('cvv').classList.remove('invalido');
  }

  return errores;
}

function manejarPago(evento) {
  evento.preventDefault();

  const errores = validarFormularioPago();

  if (errores.length > 0) {
    alert('Errores en el formulario:\n' + errores.join('\n'));
    return;
  }

  const promesaPago = new Promise((resolver, rechazar) => {
    setTimeout(() => {
      const aleatorio = Math.random();
      if (aleatorio > 0.1) {
        resolver('Pago procesado exitosamente');
      } else {
        rechazar('Error al procesar el pago');
      }
    }, 2000);
  });

  promesaPago
    .then((mensaje) => {
      const divExito = document.getElementById('mensaje-exito-pago');
      divExito.textContent = '¡Gracias por tu compra!';
      divExito.classList.add('mostrar');

      setTimeout(() => {
        alert('¡Gracias por tu compra!');
        carrito = [];
        actualizarVisualizacionCarrito();
        document.getElementById('formulario-pago').reset();
        document
          .getElementById('mensaje-exito-pago')
          .classList.remove('mostrar');
        cambiarSeccion('peliculas');
      }, 1500);
    })
    .catch((error) => {
      alert('Error: ' + error);
    });
}

function cancelarPago() {
  if (confirm('¿Deseas cancelar el pago y volver al carrito?')) {
    cambiarSeccion('carrito');
    document.getElementById('formulario-pago').reset();
    document.getElementById('visualizador-info-tarjeta').style.display = 'none';
  }
}

function validarFormularioContacto() {
  const nombre = document.getElementById('nombre-contacto').value.trim();
  const email = document.getElementById('email-contacto').value.trim();
  const asunto = document.getElementById('asunto-contacto').value.trim();
  const mensaje = document.getElementById('mensaje-contacto').value.trim();

  const errores = [];

  if (!nombre) {
    errores.push('El nombre es requerido');
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    errores.push('Email inválido');
  }

  if (!asunto) {
    errores.push('El asunto es requerido');
  }

  if (mensaje.length < 10) {
    errores.push('El mensaje debe tener al menos 10 caracteres');
  }

  return errores;
}

function manejarEnvioContacto(evento) {
  evento.preventDefault();

  const errores = validarFormularioContacto();

  if (errores.length > 0) {
    alert('Errores en el formulario:\n' + errores.join('\n'));
    return;
  }

  alert('¡Gracias por tu mensaje! Nos pondremos en contacto pronto.');
  document.getElementById('formulario-contacto').reset();
}

function cambiarSeccion(idSeccion) {
  const secciones = document.querySelectorAll('.seccion');

  for (let i = 0; i < secciones.length; i++) {
    secciones[i].classList.remove('activa');
  }

  document.getElementById(idSeccion).classList.add('activa');
}

cargarPeliculas();
