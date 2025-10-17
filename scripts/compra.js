/**
 * 🛒 COMPRA.JS - Lógica de la tienda para usuarios
 * Maneja el catálogo, carrito y compras
 */

// ========== CONFIGURACIÓN ==========
const API_URL = 'http://localhost:3000/api'; // Ajusta según tu backend
let carrito = [];
let productos = [];
let usuarioActual = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  verificarSesion();
  inicializarEventos();
  cargarProductos();
});

/**
 * Verifica que el usuario esté autenticado
 */
function verificarSesion() {
  try {
    const userData = sessionStorage.getItem('usuario');
    if (!userData) {
      alert('Debes iniciar sesión primero');
      window.location.href = '../index.html';
      return;
    }
    
    usuarioActual = JSON.parse(userData);
    
    // Verificar que sea un usuario común
    if (usuarioActual.tipo && usuarioActual.tipo.toLowerCase() !== 'usuario') {
      alert('Acceso denegado. Esta sección es solo para usuarios.');
      window.location.href = '../index.html';
      return;
    }
    
    // Mostrar nombre del usuario
    document.getElementById('nombreUsuario').textContent = usuarioActual.usuario || usuarioActual.nombre;
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    window.location.href = '../index.html';
  }
}

/**
 * Inicializa los eventos del DOM
 */
function inicializarEventos() {
  // Botón ver carrito
  document.getElementById('btnVerCarrito').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarCarrito();
  });
  
  // Botón cerrar carrito
  document.getElementById('btnCerrarCarrito').addEventListener('click', cerrarCarrito);
  
  // Botón finalizar compra
  document.getElementById('btnFinalizarCompra').addEventListener('click', finalizarCompra);
  
  // Botón cerrar sesión
  document.getElementById('btnCerrarSesion').addEventListener('click', (e) => {
    e.preventDefault();
    cerrarSesion();
  });
  
  // Cerrar modal al hacer click fuera
  document.getElementById('carritoModal').addEventListener('click', (e) => {
    if (e.target.id === 'carritoModal') {
      cerrarCarrito();
    }
  });
}

/**
 * Carga los productos desde la API
 */
async function cargarProductos() {
  try {
    const response = await fetch(`${API_URL}/productos`);
    
    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }
    
    productos = await response.json();
    renderizarCatalogo();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarAlerta('Error al cargar el catálogo de productos', 'error');
  }
}

/**
 * Renderiza el catálogo de productos
 */
function renderizarCatalogo() {
  const catalogo = document.getElementById('catalogo');
  
  if (!productos || productos.length === 0) {
    catalogo.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No hay productos disponibles en este momento.</p>';
    return;
  }
  
  catalogo.innerHTML = productos.map(producto => `
    <div class="producto-card">
      <h3>${producto.nombre}</h3>
      <p><strong>Plataforma:</strong> ${producto.plataforma || 'N/A'}</p>
      <p><strong>Género:</strong> ${producto.genero || 'N/A'}</p>
      <p><strong>Precio:</strong> $${Number(producto.precio).toLocaleString()}</p>
      <p><strong>Stock:</strong> ${producto.stock || 0} unidades</p>
      <button 
        class="btn-comprar" 
        onclick="agregarAlCarrito('${producto._id}')"
        ${producto.stock <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
      >
        ${producto.stock > 0 ? '🛒 Agregar al Carrito' : '❌ Sin Stock'}
      </button>
    </div>
  `).join('');
}

/**
 * Agrega un producto al carrito
 */
function agregarAlCarrito(productoId) {
  const producto = productos.find(p => p._id === productoId);
  
  if (!producto) {
    mostrarAlerta('Producto no encontrado', 'error');
    return;
  }
  
  if (producto.stock <= 0) {
    mostrarAlerta('Producto sin stock', 'error');
    return;
  }
  
  // Verificar si ya está en el carrito
  const itemExistente = carrito.find(item => item._id === productoId);
  
  if (itemExistente) {
    // Verificar stock disponible
    if (itemExistente.cantidad >= producto.stock) {
      mostrarAlerta('No hay más stock disponible', 'error');
      return;
    }
    itemExistente.cantidad++;
  } else {
    carrito.push({
      ...producto,
      cantidad: 1
    });
  }
  
  actualizarContadorCarrito();
  mostrarAlerta(`${producto.nombre} agregado al carrito`, 'success', 2000);
}

/**
 * Muestra el modal del carrito
 */
function mostrarCarrito() {
  const modal = document.getElementById('carritoModal');
  const lista = document.getElementById('listaCarrito');
  
  if (carrito.length === 0) {
    lista.innerHTML = '<div class="carrito-vacio">Tu carrito está vacío</div>';
    document.getElementById('totalCarrito').textContent = '$0';
    document.getElementById('btnFinalizarCompra').disabled = true;
  } else {
    lista.innerHTML = carrito.map((item, index) => `
      <div class="carrito-item">
        <div class="carrito-item-info">
          <h4>${item.nombre}</h4>
          <p>${item.plataforma} - ${item.genero}</p>
          <p class="carrito-item-precio">${Number(item.precio).toLocaleString()} x ${item.cantidad}</p>
        </div>
        <div class="carrito-item-controles">
          <button onclick="cambiarCantidad(${index}, -1)" class="btn-cantidad">-</button>
          <span class="cantidad-display">${item.cantidad}</span>
          <button onclick="cambiarCantidad(${index}, 1)" class="btn-cantidad mas">+</button>
          <button onclick="eliminarDelCarrito(${index})" class="btn-eliminar">🗑️</button>
        </div>
      </div>
    `).join('');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('totalCarrito').textContent = `${total.toLocaleString()}`;
    document.getElementById('btnFinalizarCompra').disabled = false;
  }
  
  modal.style.display = 'block';
}

/**
 * Cierra el modal del carrito
 */
function cerrarCarrito() {
  document.getElementById('carritoModal').style.display = 'none';
}

/**
 * Cambia la cantidad de un producto en el carrito
 */
function cambiarCantidad(index, cambio) {
  const item = carrito[index];
  const producto = productos.find(p => p._id === item._id);
  
  const nuevaCantidad = item.cantidad + cambio;
  
  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(index);
    return;
  }
  
  if (nuevaCantidad > producto.stock) {
    mostrarAlerta('No hay suficiente stock', 'error', 2000);
    return;
  }
  
  item.cantidad = nuevaCantidad;
  mostrarCarrito();
  actualizarContadorCarrito();
}

/**
 * Elimina un producto del carrito
 */
function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  mostrarCarrito();
  actualizarContadorCarrito();
  mostrarAlerta('Producto eliminado del carrito', 'info', 2000);
}

/**
 * Actualiza el contador del carrito en el header
 */
function actualizarContadorCarrito() {
  const cantidad = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  document.getElementById('cantidadCarrito').textContent = cantidad;
}

/**
 * Finaliza la compra
 */
async function finalizarCompra() {
  if (carrito.length === 0) {
    mostrarAlerta('El carrito está vacío', 'error');
    return;
  }
  
  const btnFinalizar = document.getElementById('btnFinalizarCompra');
  btnFinalizar.disabled = true;
  btnFinalizar.textContent = '⏳ Procesando...';
  
  try {
    const pedido = {
      usuario: usuarioActual._id,
      productos: carrito.map(item => ({
        producto: item._id,
        cantidad: item.cantidad,
        precio: item.precio
      })),
      total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };
    
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedido)
    });
    
    if (!response.ok) {
      throw new Error('Error al procesar la compra');
    }
    
    mostrarAlerta('¡Compra realizada con éxito!', 'success');
    carrito = [];
    actualizarContadorCarrito();
    cerrarCarrito();
    cargarProductos(); // Recargar para actualizar stock
  } catch (error) {
    console.error('Error al finalizar compra:', error);
    mostrarAlerta('Error al procesar la compra. Intenta nuevamente.', 'error');
  } finally {
    btnFinalizar.disabled = false;
    btnFinalizar.textContent = '💳 Finalizar Compra';
  }
}

/**
 * Cierra la sesión del usuario
 */
function cerrarSesion() {
  if (confirm('¿Deseas cerrar sesión?')) {
    sessionStorage.removeItem('usuario');
    window.location.href = '../index.html';
  }
}

/**
 * Muestra una alerta
 */
function mostrarAlerta(mensaje, tipo = 'info', duracion = 4000) {
  const alertBox = document.getElementById('alertBox');
  
  const alert = document.createElement('div');
  alert.className = `alert ${tipo}`;
  alert.textContent = mensaje;
  alert.style.animation = 'fadeIn 0.3s ease';
  
  alertBox.innerHTML = '';
  alertBox.appendChild(alert);
  
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transition = 'opacity 0.3s';
    setTimeout(() => alert.remove(), 300);
  }, duracion);
}