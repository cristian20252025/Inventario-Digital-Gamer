// app.js
// ============================================
// 🎮 Control de Inventario - Lógica General
// ============================================

const API_URL = "http://localhost:4000/api"; // Backend base

// Elementos del DOM
const secciones = document.querySelectorAll("section");
const botonesNav = document.querySelectorAll("nav button");
const contenedorProductos = document.getElementById("catalogo");
const alertBox = document.getElementById("alertBox");

// Cambiar de sección dinámicamente
botonesNav.forEach(btn => {
  btn.addEventListener("click", () => {
    const destino = btn.getAttribute("data-section");
    secciones.forEach(sec => sec.classList.remove("active"));
    document.getElementById(destino).classList.add("active");
  });
});

// Mostrar alertas reutilizables
function mostrarAlerta(tipo, mensaje) {
  alertBox.innerHTML = `<div class="alert ${tipo}">${mensaje}</div>`;
  setTimeout(() => (alertBox.innerHTML = ""), 2500);
}

// Cargar catálogo de productos
async function cargarProductos() {
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    mostrarCatalogo(productos);
  } catch (error) {
    mostrarAlerta("error", "Error al cargar productos.");
  }
}

// Mostrar productos dinámicamente
function mostrarCatalogo(productos) {
  contenedorProductos.innerHTML = "";
  productos.forEach(prod => {
    const card = document.createElement("div");
    card.className = "producto-card";
    card.innerHTML = `
      <h3>${prod.nombre}</h3>
      <p><b>Tipo:</b> ${prod.tipo}</p>
      <p><b>Precio:</b> $${prod.precio}</p>
      <p><b>Stock:</b> ${prod.cantidad}</p>
      <button class="btn btn-comprar" data-id="${prod._id}">Comprar</button>
    `;
    contenedorProductos.appendChild(card);
  });

  document.querySelectorAll(".btn-comprar").forEach(btn => {
    btn.addEventListener("click", () => realizarCompra(btn.dataset.id));
  });
}

// Simular compra
async function realizarCompra(idProducto) {
  try {
    const res = await fetch(`${API_URL}/ventas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idProducto, cantidad: 1 })
    });

    const data = await res.json();

    if (res.ok) {
      mostrarAlerta("success", "Compra realizada con éxito 🎮");
      cargarProductos();
    } else {
      mostrarAlerta("error", data.mensaje || "No hay stock suficiente.");
    }
  } catch (error) {
    mostrarAlerta("error", "Error al realizar la compra.");
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded", cargarProductos);
