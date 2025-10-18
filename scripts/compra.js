/**
 * 🛒 COMPRA.JS - Lógica de la tienda para usuarios
 * Maneja el catálogo, carrito y compras
 */

// ========== CONFIGURACIÓN ==========
const API_URL = 'http://localhost:4000'; // Backend URL
let carrito = [];
let productos = [];
let usuarioActual = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  verificarSesion();
  inicializarEventos();
});

/**
 * Verifica que el usuario esté autenticado
 */
async function verificarSesion() {
  try {
    console.log('🔍 Verificando sesión...');
    console.log('🍪 Cookies actuales:', document.cookie);
    
    // Verificar sesión con el backend mediante cookies
    const response = await fetch(`${API_URL}/usuarios/verificar-sesion`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Respuesta de verificación:', response.status);
    console.log('📡 Headers de respuesta:', [...response.headers.entries()]);

    if (!response.ok) {
      // No hay sesión activa
      mostrarAlerta('⚠️ Debes iniciar sesión primero', 'error', 2000);
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 2000);
      return;
    }

    const data = await response.json();
    usuarioActual = data.usuario;

    // Verificar que sea un usuario común
    if (usuarioActual.tipo && usuarioActual.tipo.toLowerCase() !== 'usuario') {
      mostrarAlerta('🚫 Acceso denegado. Esta sección es solo para usuarios.', 'error', 2000);
      setTimeout(() => {
        window.location.href = '../html/productos.html';
      }, 2000);
      return;
    }

    // Mostrar nombre del usuario
    document.getElementById('nombreUsuario').textContent = usuarioActual.usuario;
    
    // Cargar productos después de verificar sesión
    cargarProductos();
    
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    mostrarAlerta('❌ Error al verificar sesión', 'error', 2000);
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 2000);
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
  document.getElementById('btnCerrarSesion').addEventListener('click', async (e) => {
    e.preventDefault();
    await cerrarSesion();
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
    const response = await fetch(`${API_URL}/productos`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }
    
    productos = await response.json();
    renderizarCatalogo();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarAlerta('❌ Error al cargar el catálogo de productos', 'error');
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
  
  catalogo.innerHTML = productos.map(producto => {
    const productoId = producto.id || producto._id;
    const stock = producto.cantidad_disponible || producto.stock || 0;
    
    return `
      <div class="producto-card">
        <h3>${producto.nombre}</h3>
        <p><strong>Plataforma:</strong> ${producto.plataforma || 'N/A'}</p>
        <p><strong>Género:</strong> ${producto.genero || 'N/A'}</p>
        <p><strong>Precio:</strong> $${Number(producto.precio).toFixed(2)}</p>
        <p><strong>Stock:</strong> ${stock} unidades</p>
        <button 
          class="btn-comprar" 
          onclick="agregarAlCarrito('${productoId}')"
          ${stock <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
        >
          ${stock > 0 ? '🛒 Agregar al Carrito' : '❌ Sin Stock'}
        </button>
      </div>
    `;
  }).join('');
}

/**
 * Agrega un producto al carrito (local)
 */
function agregarAlCarrito(productoId) {
  const producto = productos.find(p => (p.id || p._id) === productoId);
  
  if (!producto) {
    mostrarAlerta('Producto no encontrado', 'error');
    return;
  }
  
  const stock = producto.cantidad_disponible || producto.stock || 0;
  
  if (stock <= 0) {
    mostrarAlerta('Producto sin stock', 'error');
    return;
  }
  
  // Verificar si ya está en el carrito
  const itemExistente = carrito.find(item => (item.id || item._id) === productoId);
  
  if (itemExistente) {
    // Verificar stock disponible
    if (itemExistente.cantidad >= stock) {
      mostrarAlerta('No hay más stock disponible', 'error');
      return;
    }
    itemExistente.cantidad++;
  } else {
    carrito.push({
      ...producto,
      id: producto.id || producto._id,
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
          <p>${item.plataforma || 'N/A'} - ${item.genero || 'N/A'}</p>
          <p class="carrito-item-precio">$${Number(item.precio).toFixed(2)} x ${item.cantidad}</p>
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
    document.getElementById('totalCarrito').textContent = `$${total.toFixed(2)}`;
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
  const producto = productos.find(p => (p.id || p._id) === (item.id || item._id));
  
  const nuevaCantidad = item.cantidad + cambio;
  
  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(index);
    return;
  }
  
  const stock = producto.cantidad_disponible || producto.stock || 0;
  
  if (nuevaCantidad > stock) {
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
 * Finaliza la compra enviando cada producto al backend
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
    console.log('💳 Procesando compra con carrito:', carrito);
    console.log('👤 Usuario actual:', usuarioActual);
    console.log('🍪 Cookies:', document.cookie);
    
    // Agregar cada producto al carrito en el backend
    for (const item of carrito) {
      const productoId = item.id || item._id;
      
      console.log(`📦 Agregando producto ${productoId} al carrito...`);
      
      const response = await fetch(`${API_URL}/compras/carrito`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          idProducto: productoId,
          cantidad: item.cantidad
        })
      });
      
      console.log(`📡 Respuesta para ${item.nombre}:`, response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error al agregar al carrito:', errorData);
        throw new Error(errorData.error || `Error al agregar ${item.nombre} al carrito`);
      }
      
      console.log(`✅ ${item.nombre} agregado correctamente`);
    }
    
    // Confirmar la compra
    const confirmarResponse = await fetch(`${API_URL}/compras/confirmar`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!confirmarResponse.ok) {
      const errorData = await confirmarResponse.json();
      throw new Error(errorData.error || 'Error al confirmar la compra');
    }
    
    const resultado = await confirmarResponse.json();
    console.log('✅ Compra confirmada:', resultado);
    
    mostrarAlerta(`✅ ¡Compra realizada con éxito! Total: $${resultado.totalCompra.toFixed(2)}`, 'success', 4000);
    
    // Limpiar carrito local
    carrito = [];
    actualizarContadorCarrito();
    cerrarCarrito();
    
    // Recargar productos para actualizar stock
    cargarProductos();
    
  } catch (error) {
    console.error('Error al finalizar compra:', error);
    mostrarAlerta(`❌ ${error.message}`, 'error');
    
    // Limpiar el carrito del backend si hubo error
    try {
      await fetch(`${API_URL}/compras/carrito`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (e) {
      console.error('Error al limpiar carrito:', e);
    }
    
  } finally {
    btnFinalizar.disabled = false;
    btnFinalizar.textContent = '💳 Finalizar Compra';
  }
}

/**
 * Cierra la sesión del usuario
 */
async function cerrarSesion() {
  if (!confirm('¿Deseas cerrar sesión?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/usuarios/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      mostrarAlerta('✅ Sesión cerrada correctamente', 'success', 1500);
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1500);
    } else {
      throw new Error('Error al cerrar sesión');
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    mostrarAlerta('❌ Error al cerrar sesión', 'error');
  }
}

/**
 * Muestra una alerta
 */
function mostrarAlerta(mensaje, tipo = 'info', duracion = 4000) {
  let alertBox = document.getElementById('alertBox');
  
  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.id = 'alertBox';
    alertBox.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    `;
    document.body.appendChild(alertBox);
  }
  
  const alert = document.createElement('div');
  alert.className = `alert ${tipo}`;
  alert.textContent = mensaje;
  
  const colores = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6'
  };
  
  alert.style.cssText = `
    padding: 15px 20px;
    margin-bottom: 10px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
    background: ${colores[tipo] || colores.info};
  `;
  
  alertBox.appendChild(alert);
  
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transition = 'opacity 0.3s';
    setTimeout(() => alert.remove(), 300);
  }, duracion);
}

// Exponer funciones al scope global para los botones onclick
window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;

// CSS para animaciones
if (!document.getElementById('alertStyles')) {
  const style = document.createElement('style');
  style.id = 'alertStyles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}