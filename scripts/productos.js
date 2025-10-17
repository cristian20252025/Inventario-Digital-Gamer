/**
 * 👨‍💼 PRODUCTOS.JS - Lógica del panel de empleados
 * Gestión completa de productos: CRUD + búsqueda
 */

// ========== CONFIGURACIÓN ==========
const API_URL = 'http://localhost:3000/api'; // Ajusta según tu backend
let productos = [];
let productoEnEdicion = null;
let empleadoActual = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  verificarSesion();
  inicializarEventos();
  cargarProductos();
});

/**
 * Verifica que el usuario esté autenticado y sea empleado
 */
function verificarSesion() {
  try {
    const userData = sessionStorage.getItem('usuario');
    if (!userData) {
      alert('Debes iniciar sesión primero');
      window.location.href = '../index.html';
      return;
    }
    
    empleadoActual = JSON.parse(userData);
    
    // Verificar que sea un empleado
    if (empleadoActual.tipo && empleadoActual.tipo.toLowerCase() !== 'empleado') {
      alert('Acceso denegado. Esta sección es solo para empleados.');
      window.location.href = '../index.html';
      return;
    }
    
    // Mostrar nombre del empleado
    document.getElementById('nombreEmpleado').textContent = empleadoActual.usuario || empleadoActual.nombre;
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    window.location.href = '../index.html';
  }
}

/**
 * Inicializa los eventos del DOM
 */
function inicializarEventos() {
  // Formulario de producto
  document.getElementById('formProducto').addEventListener('submit', guardarProducto);
  
  // Botón cancelar
  document.getElementById('btnCancelar').addEventListener('click', cancelarEdicion);
  
  // Buscador
  document.getElementById('buscarProducto').addEventListener('input', buscarProductos);
  
  // Cerrar sesión
  document.getElementById('btnCerrarSesion').addEventListener('click', (e) => {
    e.preventDefault();
    cerrarSesion();
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
    renderizarTabla(productos);
  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarAlerta('Error al cargar los productos', 'error');
  }
}

/**
 * Renderiza la tabla de productos
 */
function renderizarTabla(productosArray) {
  const tbody = document.querySelector('#tablaProductos tbody');
  
  if (!productosArray || productosArray.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="tabla-vacia">No hay productos en el inventario</td></tr>';
    return;
  }
  
  tbody.innerHTML = productosArray.map(producto => `
    <tr>
      <td>${producto.nombre}</td>
      <td>${producto.plataforma || 'N/A'}</td>
      <td>${producto.genero || 'N/A'}</td>
      <td><strong>$${Number(producto.precio).toLocaleString()}</strong></td>
      <td>${generarBadgeStock(producto.stock)}</td>
      <td>
        <div class="acciones-cell">
          <button class="btn-edit" onclick="editarProducto('${producto._id}')">✏️ Editar</button>
          <button class="btn-delete" onclick="eliminarProducto('${producto._id}', '${producto.nombre}')">🗑️ Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Genera un badge de stock según la cantidad
 */
function generarBadgeStock(stock) {
  let clase = 'alto';
  if (stock === 0) clase = 'bajo';
  else if (stock <= 10) clase = 'medio';
  
  return `<span class="badge-stock ${clase}">${stock} unid.</span>`;
}

/**
 * Busca productos en tiempo real
 */
function buscarProductos(e) {
  const termino = e.target.value.toLowerCase().trim();
  
  if (termino === '') {
    renderizarTabla(productos);
    return;
  }
  
  const productosFiltrados = productos.filter(producto => 
    producto.nombre.toLowerCase().includes(termino) ||
    (producto.plataforma && producto.plataforma.toLowerCase().includes(termino)) ||
    (producto.genero && producto.genero.toLowerCase().includes(termino))
  );
  
  renderizarTabla(productosFiltrados);
}

/**
 * Guarda o actualiza un producto
 */
async function guardarProducto(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const btnGuardar = document.getElementById('btnGuardar');
  
  const producto = {
    nombre: formData.get('nombre'),
    plataforma: formData.get('plataforma'),
    genero: formData.get('genero'),
    precio: parseFloat(formData.get('precio')),
    stock: parseInt(formData.get('stock')),
    descripcion: formData.get('descripcion') || ''
  };
  
  // Validación
  if (!producto.nombre || !producto.plataforma || !producto.genero) {
    mostrarAlerta('Por favor completa todos los campos obligatorios', 'error');
    return;
  }
  
  if (producto.precio <= 0) {
    mostrarAlerta('El precio debe ser mayor a 0', 'error');
    return;
  }
  
  if (producto.stock < 0) {
    mostrarAlerta('El stock no puede ser negativo', 'error');
    return;
  }
  
  try {
    // Activar estado de carga
    btnGuardar.disabled = true;
    btnGuardar.textContent = '⏳ Guardando...';
    
    let response;
    
    if (productoEnEdicion) {
      // Actualizar producto existente
      response = await fetch(`${API_URL}/productos/${productoEnEdicion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
      });
    } else {
      // Crear nuevo producto
      response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
      });
    }
    
    if (!response.ok) {
      throw new Error('Error al guardar el producto');
    }
    
    const mensaje = productoEnEdicion ? 'Producto actualizado con éxito' : 'Producto agregado con éxito';
    mostrarAlerta(mensaje, 'success');
    
    // Limpiar y recargar
    cancelarEdicion();
    cargarProductos();
  } catch (error) {
    console.error('Error al guardar producto:', error);
    mostrarAlerta('Error al guardar el producto. Intenta nuevamente.', 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = '💾 Guardar Producto';
  }
}

/**
 * Carga los datos de un producto en el formulario para editarlo
 */
function editarProducto(id) {
  const producto = productos.find(p => p._id === id);
  
  if (!producto) {
    mostrarAlerta('Producto no encontrado', 'error');
    return;
  }
  
  // Cambiar el modo a edición
  productoEnEdicion = id;
  
  // Llenar el formulario
  document.getElementById('productoId').value = id;
  document.getElementById('nombre').value = producto.nombre;
  document.getElementById('plataforma').value = producto.plataforma || '';
  document.getElementById('genero').value = producto.genero || '';
  document.getElementById('precio').value = producto.precio;
  document.getElementById('stock').value = producto.stock || 0;
  document.getElementById('descripcion').value = producto.descripcion || '';
  
  // Cambiar el título del formulario
  document.getElementById('formTitulo').textContent = '✏️ Editar Producto';
  document.getElementById('btnGuardar').textContent = '💾 Actualizar Producto';
  document.getElementById('btnCancelar').classList.add('visible');
  
  // Scroll al formulario
  document.getElementById('formProducto').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Cancela la edición y limpia el formulario
 */
function cancelarEdicion() {
  productoEnEdicion = null;
  
  // Limpiar el formulario
  document.getElementById('formProducto').reset();
  document.getElementById('productoId').value = '';
  
  // Restaurar el título
  document.getElementById('formTitulo').textContent = '➕ Agregar Nuevo Producto';
  document.getElementById('btnGuardar').textContent = '💾 Guardar Producto';
  document.getElementById('btnCancelar').classList.remove('visible');
}

/**
 * Elimina un producto
 */
async function eliminarProducto(id, nombre) {
  if (!confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar el producto');
    }
    
    mostrarAlerta('Producto eliminado con éxito', 'success');
    cargarProductos();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    mostrarAlerta('Error al eliminar el producto. Intenta nuevamente.', 'error');
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