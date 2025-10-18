/**
 * 💼 PRODUCTOS.JS - Lógica del panel de empleados
 * Gestión completa de productos: CRUD + búsqueda
 */

// ========== CONFIGURACIÓN ==========
const API_URL = 'http://localhost:4000'; // Backend URL
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
async function verificarSesion() {
  try {
    console.log('🔍 Verificando sesión...');
    
    // Verificar sesión con el backend mediante cookies
    const response = await fetch(`${API_URL}/usuarios/verificar-sesion`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Respuesta de verificación:', response.status);

    if (!response.ok) {
      // No hay sesión activa
      mostrarAlerta('⚠️ Debes iniciar sesión primero', 'error', 2000);
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 2000);
      return;
    }

    const data = await response.json();
    empleadoActual = data.usuario;

    // Verificar que sea un empleado
    if (empleadoActual.tipo.toLowerCase() !== 'empleado') {
      mostrarAlerta('🚫 Acceso denegado. Esta sección es solo para empleados.', 'error', 2000);
      setTimeout(() => {
        window.location.href = '../html/compra.html';
      }, 2000);
      return;
    }

    // Mostrar nombre del empleado
    document.getElementById('nombreEmpleado').textContent = empleadoActual.usuario;
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
  // Formulario de producto
  document.getElementById('formProducto').addEventListener('submit', guardarProducto);
  
  // Botón cancelar
  document.getElementById('btnCancelar').addEventListener('click', cancelarEdicion);
  
  // Buscador
  document.getElementById('buscarProducto').addEventListener('input', buscarProductos);
  
  // Cerrar sesión
  document.getElementById('btnCerrarSesion').addEventListener('click', async (e) => {
    e.preventDefault();
    await cerrarSesion();
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
    renderizarTabla(productos);
  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarAlerta('❌ Error al cargar los productos', 'error');
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
  
  tbody.innerHTML = productosArray.map(producto => {
    // Usar el ID personalizado (id) no el _id de MongoDB
    const productoId = producto.id || producto._id;
    
    return `
      <tr>
        <td>${producto.nombre}</td>
        <td>${producto.plataforma || 'N/A'}</td>
        <td>${producto.genero || 'N/A'}</td>
        <td><strong>$${Number(producto.precio).toFixed(2)}</strong></td>
        <td>${generarBadgeStock(producto.cantidad_disponible || producto.stock || 0)}</td>
        <td>
          <div class="acciones-cell">
            <button class="btn-edit" onclick="editarProducto('${productoId}')">✏️ Editar</button>
            <button class="btn-delete" onclick="eliminarProducto('${productoId}', '${producto.nombre}')">🗑️ Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
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
    precio: parseFloat(formData.get('precio')),
    cantidad_disponible: parseInt(formData.get('stock')),
    descripcion: formData.get('descripcion') || '',
    plataforma: formData.get('plataforma') || '',
    genero: formData.get('genero') || ''
  };
  
  // Si estamos creando un producto nuevo, generar ID personalizado
  if (!productoEnEdicion) {
    producto.id = `P${Date.now()}`;
  }
  
  // Validación
  if (!producto.nombre) {
    mostrarAlerta('⚠️ El nombre del producto es obligatorio', 'error');
    return;
  }
  
  if (producto.precio <= 0) {
    mostrarAlerta('⚠️ El precio debe ser mayor a 0', 'error');
    return;
  }
  
  if (producto.cantidad_disponible < 0) {
    mostrarAlerta('⚠️ El stock no puede ser negativo', 'error');
    return;
  }
  
  try {
    // Activar estado de carga
    btnGuardar.disabled = true;
    btnGuardar.textContent = '⏳ Guardando...';
    
    let response;
    
    if (productoEnEdicion) {
      // Actualizar producto existente usando el ID personalizado
      console.log('🔧 Actualizando producto:', productoEnEdicion);
      response = await fetch(`${API_URL}/productos?id=${productoEnEdicion}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(producto)
      });
    } else {
      // Crear nuevo producto
      console.log('➕ Creando producto:', producto);
      response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(producto)
      });
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al guardar el producto');
    }
    
    const mensaje = productoEnEdicion ? '✅ Producto actualizado con éxito' : '✅ Producto agregado con éxito';
    mostrarAlerta(mensaje, 'success');
    
    // Limpiar y recargar
    cancelarEdicion();
    cargarProductos();
  } catch (error) {
    console.error('Error al guardar producto:', error);
    mostrarAlerta(`❌ ${error.message}`, 'error');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = '💾 Guardar Producto';
  }
}

/**
 * Carga los datos de un producto en el formulario para editarlo
 */
function editarProducto(id) {
  console.log('✏️ Editando producto con ID:', id);
  
  // Buscar producto por id personalizado o _id
  const producto = productos.find(p => p.id === id || p._id === id);
  
  if (!producto) {
    mostrarAlerta('❌ Producto no encontrado', 'error');
    return;
  }
  
  // Guardar el ID personalizado para edición
  productoEnEdicion = producto.id || producto._id;
  console.log('📝 Producto en edición:', productoEnEdicion);
  
  // Llenar el formulario
  document.getElementById('productoId').value = productoEnEdicion;
  document.getElementById('nombre').value = producto.nombre;
  document.getElementById('plataforma').value = producto.plataforma || '';
  document.getElementById('genero').value = producto.genero || '';
  document.getElementById('precio').value = producto.precio;
  document.getElementById('stock').value = producto.cantidad_disponible || producto.stock || 0;
  document.getElementById('descripcion').value = producto.descripcion || '';
  
  // Cambiar el título del formulario
  document.getElementById('formTitulo').textContent = '✏️ Editar Producto';
  document.getElementById('btnGuardar').textContent = '💾 Actualizar Producto';
  document.getElementById('btnCancelar').style.display = 'inline-block';
  
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
  document.getElementById('btnCancelar').style.display = 'none';
}

/**
 * Elimina un producto
 */
async function eliminarProducto(id, nombre) {
  if (!confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
    return;
  }
  
  try {
    console.log('🗑️ Eliminando producto con ID:', id);
    
    const response = await fetch(`${API_URL}/productos?id=${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar el producto');
    }
    
    mostrarAlerta('✅ Producto eliminado con éxito', 'success');
    cargarProductos();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    mostrarAlerta(`❌ ${error.message}`, 'error');
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

// Exponer funciones al scope global para los botones onclick
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;