/**
 * 🎮 APP.JS - Sistema de Autenticación
 * Conexión entre Frontend y Backend para usuarios
 */

// ============================================
// 🔧 CONFIGURACIÓN DE LA API
// ============================================
const API_URL = "http://localhost:4000/usuarios";

// ============================================
// 📋 ELEMENTOS DEL DOM
// ============================================
const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");

// ============================================
// 🔐 MANEJADOR DE LOGIN
// ============================================
formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const button = e.target.querySelector('button[type="submit"]');
  toggleButtonLoading(button, true);

  // Obtener datos del formulario
  const formData = new FormData(e.target);
  const datos = {
    email: formData.get("email"),
    contraseña: formData.get("password") // ✅ Backend espera "contraseña"
  };

  console.log("🔍 Intentando login con:", { email: datos.email });

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // ✅ Importante para enviar/recibir cookies
      body: JSON.stringify(datos)
    });

    const data = await response.json();
    console.log("📡 Respuesta del servidor:", response.status, data);

    if (response.ok) {
      // Login exitoso
      mostrarAlerta("✅ Inicio de sesión exitoso", "success", 2000);
      console.log("✅ Login exitoso. Usuario:", data.usuario);
      
      // Esperar 500ms para que la cookie se establezca
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar que la cookie se estableció
      console.log("🍪 Cookies del navegador:", document.cookie);
      
      // Redirigir según el tipo de usuario
      redirigirPorTipo(data.usuario);
    } else {
      // Error del servidor
      console.error("❌ Error en login:", data.error);
      mostrarAlerta(data.error || "❌ Error al iniciar sesión", "error");
    }
  } catch (error) {
    console.error("❌ Error en login:", error);
    mostrarAlerta("❌ Error de conexión con el servidor", "error");
  } finally {
    toggleButtonLoading(button, false);
  }
});

// ============================================
// ✨ MANEJADOR DE REGISTRO
// ============================================
formRegistro.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const button = e.target.querySelector('button[type="submit"]');
  toggleButtonLoading(button, true);

  // Obtener datos del formulario
  const formData = new FormData(e.target);
  const datos = {
    email: formData.get("email"),
    usuario: formData.get("nombre"),
    contraseña: formData.get("password"), // ✅ Backend espera "contraseña"
    tipo: "usuario" // Por defecto los registros son de tipo "usuario"
  };

  console.log("📝 Intentando registro:", { email: datos.email, usuario: datos.usuario });

  try {
    const response = await fetch(`${API_URL}/registrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(datos)
    });

    const data = await response.json();
    console.log("📡 Respuesta registro:", response.status, data);

    if (response.ok) {
      // Registro exitoso
      mostrarAlerta("✅ Registro exitoso. Ahora puedes iniciar sesión", "success", 3000);
      
      // Resetear formulario
      e.target.reset();
      
      // Cambiar a la pestaña de login después de 2 segundos
      setTimeout(() => {
        const loginTab = document.querySelector('.tab-button[data-tab="login"]');
        if (loginTab) loginTab.click();
      }, 2000);
    } else {
      // Error del servidor
      console.error("❌ Error en registro:", data.error);
      mostrarAlerta(data.error || "❌ Error al registrarse", "error");
    }
  } catch (error) {
    console.error("❌ Error en registro:", error);
    mostrarAlerta("❌ Error de conexión con el servidor", "error");
  } finally {
    toggleButtonLoading(button, false);
  }
});

// ============================================
// 🔄 VERIFICAR SESIÓN AL CARGAR
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔍 Verificando sesión existente...");
  
  // Verificar si hay una sesión activa
  try {
    const response = await fetch(`${API_URL}/verificar-sesion`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("📡 Verificación de sesión:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("👤 Sesión activa encontrada:", data.usuario);
      
      if (data.usuario) {
        // Ya hay sesión activa, redirigir
        mostrarAlerta("✅ Sesión activa detectada, redirigiendo...", "success", 1500);
        setTimeout(() => {
          redirigirPorTipo(data.usuario);
        }, 1500);
      }
    } else {
      console.log("ℹ️ No hay sesión activa");
    }
  } catch (error) {
    // No hay sesión activa o error de conexión, continuar normalmente
    console.log("ℹ️ No hay sesión activa o error:", error.message);
  }
});

// ============================================
// 🚀 FUNCIÓN DE REDIRECCIÓN
// ============================================
function redirigirPorTipo(usuario) {
  console.log("🚀 Redirigiendo usuario tipo:", usuario.tipo);
  
  setTimeout(() => {
    if (usuario.tipo.toLowerCase() === "empleado") {
      console.log("➡️ Redirigiendo a productos.html");
      window.location.href = "./html/productos.html";
    } else {
      console.log("➡️ Redirigiendo a compra.html");
      window.location.href = "./html/compra.html";
    }
  }, 500);
}

// ============================================
// 🎨 FUNCIONES DE UI
// ============================================
function toggleButtonLoading(button, isLoading) {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = "⏳ Cargando...";
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function mostrarAlerta(mensaje, tipo = "info", duracion = 4000) {
  let alertBox = document.getElementById("alertBox");
  
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "alertBox";
    alertBox.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    `;
    document.body.appendChild(alertBox);
  }
  
  const alert = document.createElement("div");
  alert.className = `alert ${tipo}`;
  alert.textContent = mensaje;
  
  const colores = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6"
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
    alert.style.opacity = "0";
    alert.style.transition = "opacity 0.3s";
    setTimeout(() => alert.remove(), 300);
  }, duracion);
}

// CSS para animaciones
if (!document.getElementById("alertStyles")) {
  const style = document.createElement("style");
  style.id = "alertStyles";
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