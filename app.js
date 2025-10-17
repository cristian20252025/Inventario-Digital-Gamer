/* ========= CONFIGURACIÓN ========= */
const API_BASE = "http://localhost:4000/api"; // Cambia según tu backend
let token = localStorage.getItem("token");

/* ========= UTILIDADES ========= */
async function apiRequest(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error");
  return json;
}

function showAlert(msg, type = "info") {
  const div = document.createElement("div");
  div.className = `alert ${type}`;
  div.textContent = msg;
  document.body.append(div);
  setTimeout(() => div.remove(), 3000);
}

/* ========= LOGIN ========= */
const loginForm = document.getElementById("loginForm");
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    email: e.target.email.value,
    password: e.target.password.value
  };
  try {
    const res = await apiRequest("/auth/login", "POST", data);
    token = res.token;
    localStorage.setItem("token", token);
    showAlert("Inicio de sesión exitoso", "success");
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadAll();
  } catch {
    showAlert("Credenciales inválidas", "error");
  }
});

function logout() {
  token = null;
  localStorage.removeItem("token");
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  showAlert("Sesión cerrada", "info");
}

/* ========= NAVEGACIÓN ========= */
document.querySelectorAll("nav button").forEach((b) => {
  b.addEventListener("click", () => {
    const t = b.dataset.target;
    document.querySelectorAll("main section").forEach((s) => s.classList.remove("active"));
    document.getElementById(t).classList.add("active");
  });
});

/* ========= PRODUCTOS ========= */
const formProducto = document.getElementById("formProducto");
const tablaProductos = document.querySelector("#tablaProductos tbody");

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    nombre: e.target.nombre.value,
    tipo: e.target.tipo.value,
    precio: parseFloat(e.target.precio.value),
    cantidad: parseInt(e.target.cantidad.value)
  };
  await apiRequest("/products", "POST", data);
  showAlert("Producto agregado", "success");
  formProducto.reset();
  cargarProductos();
});

async function cargarProductos() {
  const productos = await apiRequest("/products");
  tablaProductos.innerHTML = "";
  productos.forEach((p) => {
    tablaProductos.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.tipo}</td>
        <td>$${p.precio}</td>
        <td>${p.cantidad}</td>
        <td>
          <button class="btn btn-edit" onclick="editarProducto('${p._id}')">Editar</button>
          <button class="btn btn-delete" onclick="eliminarProducto('${p._id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

async function eliminarProducto(id) {
  await apiRequest(`/products/${id}`, "DELETE");
  showAlert("Producto eliminado", "info");
  cargarProductos();
}

async function editarProducto(id) {
  const nuevoPrecio = prompt("Nuevo precio:");
  if (nuevoPrecio) {
    await apiRequest(`/products/${id}`, "PUT", { precio: parseFloat(nuevoPrecio) });
    showAlert("Producto actualizado", "success");
    cargarProductos();
  }
}

/* ========= VENTAS ========= */
const formVenta = document.getElementById("formVenta");
const tablaVentas = document.querySelector("#tablaVentas tbody");

formVenta.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    productId: e.target.productId.value,
    cantidad: parseInt(e.target.cantidad.value),
    cliente: e.target.cliente.value
  };
  try {
    await apiRequest("/sales", "POST", data);
    showAlert("Venta registrada", "success");
    cargarProductos();
    cargarVentas();
  } catch (err) {
    showAlert("Error: " + err.message, "error");
  }
});

async function cargarVentas() {
  const ventas = await apiRequest("/sales");
  tablaVentas.innerHTML = "";
  ventas.forEach((v) => {
    tablaVentas.innerHTML += `
      <tr>
        <td>${v.producto?.nombre || "N/A"}</td>
        <td>${v.cantidad}</td>
        <td>${v.cliente}</td>
        <td>$${v.total}</td>
        <td>${new Date(v.fecha).toLocaleString()}</td>
      </tr>
    `;
  });
}

/* ========= USUARIOS Y EMPLEADOS ========= */
const tablaUsuarios = document.querySelector("#tablaUsuarios tbody");
const tablaEmpleados = document.querySelector("#tablaEmpleados tbody");

async function cargarUsuarios() {
  const usuarios = await apiRequest("/users");
  tablaUsuarios.innerHTML = usuarios
    .map(
      (u) => `
    <tr>
      <td>${u.nombre}</td>
      <td>${u.email}</td>
      <td>${u.rol}</td>
      <td><button class="btn btn-delete" onclick="eliminarUsuario('${u._id}')">Eliminar</button></td>
    </tr>`
    )
    .join("");
}

async function cargarEmpleados() {
  const empleados = await apiRequest("/employees");
  tablaEmpleados.innerHTML = empleados
    .map(
      (e) => `
    <tr>
      <td>${e.nombre}</td>
      <td>${e.cargo}</td>
      <td>${e.salario}</td>
      <td><button class="btn btn-delete" onclick="eliminarEmpleado('${e._id}')">Eliminar</button></td>
    </tr>`
    )
    .join("");
}

async function eliminarUsuario(id) {
  await apiRequest(`/users/${id}`, "DELETE");
  showAlert("Usuario eliminado", "info");
  cargarUsuarios();
}

async function eliminarEmpleado(id) {
  await apiRequest(`/employees/${id}`, "DELETE");
  showAlert("Empleado eliminado", "info");
  cargarEmpleados();
}

/* ========= CARGA INICIAL ========= */
async function loadAll() {
  await Promise.all([cargarProductos(), cargarVentas(), cargarUsuarios(), cargarEmpleados()]);
}

document.addEventListener("DOMContentLoaded", () => {
  if (token) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadAll();
  } else {
    document.getElementById("dashboard").style.display = "none";
  }
});
