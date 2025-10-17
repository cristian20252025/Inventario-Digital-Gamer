/**
 * 🎮 MAIN.JS - Sistema de Animaciones y UI
 * Maneja las interacciones de la interfaz y animaciones
 */

// ========== SISTEMA DE PESTAÑAS (TABS) ==========
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initFormInteractions();
});

/**
 * Inicializa el sistema de pestañas
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const switchLinks = document.querySelectorAll('[data-switch]');

  // Eventos para los botones de pestañas
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
    });
  });

  // Eventos para los enlaces de cambio (Regístrate aquí / Inicia sesión aquí)
  switchLinks.forEach(link => {
    link.addEventListener('click', () => {
      switchTab(link.dataset.switch);
    });
  });

  /**
   * Cambia entre pestañas
   * @param {string} targetTab - ID de la pestaña objetivo
   */
  function switchTab(targetTab) {
    // Remover clase active de todos
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));

    // Activar el botón y panel correspondiente
    const targetButton = document.querySelector(`.tab-button[data-tab="${targetTab}"]`);
    const targetPane = document.getElementById(targetTab);
    
    if (targetButton && targetPane) {
      targetButton.classList.add('active');
      targetPane.classList.add('active');
      
      // Limpiar formularios al cambiar
      const forms = document.querySelectorAll('form');
      forms.forEach(form => form.reset());
    }
  }
}

/**
 * Añade interacciones visuales a los formularios
 */
function initFormInteractions() {
  const inputs = document.querySelectorAll('input');

  inputs.forEach(input => {
    // Efecto de enfoque
    input.addEventListener('focus', (e) => {
      const formGroup = e.target.closest('.form-group');
      if (formGroup) {
        formGroup.style.transform = 'translateX(5px)';
        formGroup.style.transition = 'transform 0.3s ease';
      }
    });

    input.addEventListener('blur', (e) => {
      const formGroup = e.target.closest('.form-group');
      if (formGroup) {
        formGroup.style.transform = 'translateX(0)';
      }
    });

    // Validación visual en tiempo real
    input.addEventListener('input', (e) => {
      if (e.target.validity.valid) {
        e.target.style.borderColor = 'var(--color-exito)';
      } else if (e.target.value.length > 0) {
        e.target.style.borderColor = 'var(--color-error)';
      } else {
        e.target.style.borderColor = '#e0e6ed';
      }
    });
  });
}

/**
 * Muestra alertas con animación
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de alerta: 'success', 'error', 'info'
 * @param {number} duracion - Duración en milisegundos
 */
function mostrarAlerta(mensaje, tipo = 'info', duracion = 4000) {
  const alertBox = document.getElementById('alertBox');
  
  const alert = document.createElement('div');
  alert.className = `alert ${tipo}`;
  alert.textContent = mensaje;
  alert.style.animation = 'fadeIn 0.3s ease';
  
  alertBox.innerHTML = '';
  alertBox.appendChild(alert);
  
  // Auto-ocultar
  setTimeout(() => {
    alert.style.animation = 'fadeOut 0.3s ease';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 300);
  }, duracion);
}

/**
 * Añade animación de carga a un botón
 * @param {HTMLElement} button - Botón al que se añade la animación
 * @param {boolean} loading - Estado de carga
 */
function toggleButtonLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = '⏳ Procesando...';
    button.style.opacity = '0.7';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
    button.style.opacity = '1';
  }
}

/**
 * Redirige al usuario según su tipo
 * @param {Object} usuario - Objeto del usuario con sus datos
 */
function redirigirPorTipo(usuario) {
  if (!usuario || !usuario.tipo) {
    mostrarAlerta('Error: No se pudo identificar el tipo de usuario', 'error');
    return;
  }

  // Normalizar el tipo de usuario (minúsculas)
  const tipo = usuario.tipo.toLowerCase();

  // Mostrar mensaje de bienvenida
  mostrarAlerta(`¡Bienvenido ${usuario.usuario || usuario.nombre}!`, 'success', 2000);

  // Redirigir después de 1.5 segundos
  setTimeout(() => {
    if (tipo === 'empleado') {
      window.location.href = './html/productos.html';
    } else if (tipo === 'usuario') {
      window.location.href = './html/compra.html';
    } else {
      // Tipo desconocido, redirigir a compra por defecto
      console.warn('Tipo de usuario desconocido:', tipo);
      window.location.href = './html/compra.html';
    }
  }, 1500);
}

// Añadir animación CSS para fadeOut
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }
`;
document.head.appendChild(style);

// Exportar funciones para uso en app.js
window.mostrarAlerta = mostrarAlerta;
window.toggleButtonLoading = toggleButtonLoading;
window.redirigirPorTipo = redirigirPorTipo;