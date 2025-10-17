// usuarios.js
// ============================================
// 👥 Módulo de Usuarios - Registro y Login
// ============================================

const API_USERS = "http://localhost:4000/api/usuarios";

// Referencias DOM
const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");
const contenedorUsuario = document.getElementById("usuarioActivo");

// Mostrar usuario activo
function mostrarUsuario(nombre) {
  contenedorUsuario.innerHTML = `
    <p>👋 Bienvenido, <strong>${nombre}</strong></p>
    <button id="btnLogout" class="btn">Cerrar sesión</button>
  `;
  document.getElementById("btnLogout").addEventListener("click", cerrarSesion);
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("usuario");
  location.reload();
}

// Registro
formRegistro?.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = formRegistro.nombre.value;
  const email = formRegistro.email.value;
  const password = formRegistro.password.value;

  try {
    const res = await fetch(`${API_USERS}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Usuario registrado con éxito");
      formRegistro.reset();
    } else alert(data.mensaje || "Error al registrar usuario");
  } catch (error) {
    alert("Error de conexión con el servidor");
  }
});

// Login
formLogin?.addEventListener("submit", async e => {
  e.preventDefault();
  const email = formLogin.email.value;
  const password = formLogin.password.value;

  try {
    const res = await fetch(`${API_USERS}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      mostrarUsuario(data.usuario.nombre);
      document.querySelector(".login-container").style.display = "none";
    } else {
      alert(data.mensaje || "Credenciales incorrectas");
    }
  } catch (error) {
    alert("Error de conexión");
  }
});

// Revisar sesión activa
document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario) {
    mostrarUsuario(usuario.nombre);
    document.querySelector(".login-container").style.display = "none";
  }
});
