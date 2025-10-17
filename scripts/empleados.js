// empleados.js
// ============================================
// 🧑‍💼 Módulo de Empleados - Gestión de Inventario
// ============================================

const API_EMPLEADOS = "http://localhost:4000/api/productos";

const formProducto = document.getElementById("formProducto");
const tablaProductos = document.getElementById("tablaProductos tbody");

// Cargar productos al inicio
async function cargarInventario() {
  try {
    const res = await fetch(API_EMPLEADOS);
    const productos = await res.json();
    renderTabla(productos);
  } catch {
    alert("Error al cargar inventario");
  }
}

// Mostrar productos en tabla
function renderTabla(productos) {
  tablaProductos.innerHTML = "";
  productos.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.tipo}</td>
      <td>$${p.precio}</td>
      <td>${p.cantidad}</td>
      <td>
        <button class="btn btn-edit" data-id="${p._id}">Editar</button>
        <button class="btn btn-delete" data-id="${p._id}">Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(fila);
  });

  document.querySelectorAll(".btn-edit").forEach(b =>
    b.addEventListener("click", () => editarProducto(b.dataset.id))
  );
  document.querySelectorAll(".btn-delete").forEach(b =>
    b.addEventListener("click", () => eliminarProducto(b.dataset.id))
  );
}

// Crear o editar producto
formProducto.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = formProducto.nombre.value;
  const tipo = formProducto.tipo.value;
  const precio = formProducto.precio.value;
  const cantidad = formProducto.cantidad.value;

  const id = formProducto.dataset.editId;
  const metodo = id ? "PUT" : "POST";
  const url = id ? `${API_EMPLEADOS}/${id}` : API_EMPLEADOS;

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, tipo, precio, cantidad })
    });

    if (res.ok) {
      formProducto.reset();
      delete formProducto.dataset.editId;
      cargarInventario();
      alert(id ? "Producto actualizado" : "Producto agregado");
    }
  } catch {
    alert("Error al guardar producto");
  }
});

// Editar producto
async function editarProducto(id) {
  try {
    const res = await fetch(`${API_EMPLEADOS}/${id}`);
    const p = await res.json();

    formProducto.nombre.value = p.nombre;
    formProducto.tipo.value = p.tipo;
    formProducto.precio.value = p.precio;
    formProducto.cantidad.value = p.cantidad;
    formProducto.dataset.editId = id;
  } catch {
    alert("Error al obtener producto");
  }
}

// Eliminar producto
async function eliminarProducto(id) {
  if (!confirm("¿Deseas eliminar este producto?")) return;
  try {
    await fetch(`${API_EMPLEADOS}/${id}`, { method: "DELETE" });
    cargarInventario();
  } catch {
    alert("Error al eliminar producto");
  }
}

document.addEventListener("DOMContentLoaded", cargarInventario);
