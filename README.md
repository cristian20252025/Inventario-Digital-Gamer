# 🎮 Inventario Digital Gamer - Frontend

Una interfaz web moderna y funcional para gestionar el inventario y ventas de una tienda de videojuegos. Desarrollado con **HTML5**, **CSS3** y **JavaScript vanilla** para demostrar dominio de los fundamentos del desarrollo web front-end.

---

## 📋 Descripción

Este proyecto constituye la capa de presentación de un sistema completo de gestión comercial para tiendas gaming. Permite visualizar productos, procesar ventas y mantener el control de inventario en tiempo real mediante comunicación con una API RESTful.

### ✨ Características principales

- **Catálogo dinámico**: Visualización en tiempo real de productos disponibles
- **Gestión de ventas**: Registro intuitivo de transacciones desde la interfaz
- **Actualización automática**: El stock se ajusta instantáneamente tras cada operación
- **Arquitectura desacoplada**: Comunicación eficiente con backend mediante API REST
- **Sin dependencias**: Código vanilla sin frameworks, facilitando comprensión y mantenimiento

---

## 🏗️ Estructura del proyecto

```
Inventario-Digital-Gamer/
│
├── index.html          # Estructura y maquetado de la aplicación
├── style.css           # Estilos y diseño visual
└── script.js           # Lógica de negocio y comunicación con API
```

### Descripción de archivos

| Archivo | Propósito |
|---------|-----------|
| `index.html` | Estructura semántica y componentes de la interfaz |
| `style.css` | Estilos personalizados y diseño responsive |
| `script.js` | Manipulación del DOM, peticiones HTTP y lógica del cliente |

---

## 🔌 Integración con Backend

La aplicación consume servicios REST mediante la API Fetch nativa:

```javascript
// Ejemplo de consumo de endpoint
fetch('http://localhost:3000/api/productos')
  .then(response => response.json())
  .then(data => renderizarProductos(data))
  .catch(error => manejarError(error));
```

**Endpoints principales:**
- `GET /api/productos` - Obtener catálogo
- `POST /api/ventas` - Registrar nueva venta
- `PUT /api/productos/:id` - Actualizar stock

> ⚠️ **Importante**: Asegúrate de que el servidor backend esté activo antes de utilizar la interfaz.

---

## 🚀 Funcionalidades implementadas

- ✅ Carga asíncrona de productos desde la API
- ✅ Validación de formularios en cliente
- ✅ Registro de ventas con feedback visual
- ✅ Actualización reactiva del inventario
- ✅ Manejo robusto de errores y estados de carga
- ✅ Notificaciones de éxito/error en operaciones

---

## 💻 Requisitos del sistema

### Software necesario

- **Navegador moderno** con soporte ES6+ (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- **Servidor backend** activo en `http://localhost:3000` (o URL configurada)
- **Conexión a Internet** (si la base de datos es remota)

### Compatibilidad

| Navegador | Versión mínima |
|-----------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 🛠️ Instalación y uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/cristian20252025/Inventario-Digital-Gamer.git
cd Inventario-Digital-Gamer
```

### 2. Configurar la conexión al backend

Si tu backend NO corre en `localhost:3000`, edita la URL base en `script.js`:

```javascript
const API_URL = 'http://tu-servidor:puerto/api';
```

### 3. Ejecutar la aplicación

**Opción A: Abrir directamente**
```bash
# Abre el archivo en tu navegador
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

**Opción B: Servidor local (recomendado)**
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx serve .

# Luego visita: http://localhost:8000
```

### 4. Comenzar a usar

1. Verifica que el backend esté corriendo
2. Navega por el catálogo de productos
3. Selecciona artículos y registra ventas
4. Observa cómo se actualiza el inventario en tiempo real

---

## 🎯 Próximas mejoras

- [ ] Implementar sistema de búsqueda y filtros
- [ ] Agregar autenticación de usuarios
- [ ] Añadir modo oscuro
- [ ] Mejorar responsive design para móviles
- [ ] Implementar paginación en catálogo
- [ ] Agregar gráficos de ventas con Chart.js

---

## 👥 Equipo de desarrollo

| Nombre | GitHub |
|--------|--------|
| **Juan Camilo Rojas Arenas** | [@juancamilorojasarenas](#) |
| **Connie Tatiana Carrillo Bohórquez** | [@Connisita77](#) |
| **Cristian Miguel Pérez Hernández** | [@cristian20252025](https://github.com/cristian20252025) |
| **Kevin Santiago Rivero Rueda** | [@kevinlevin200](#) |

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible para fines educativos.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📞 Contacto y soporte

¿Tienes dudas o sugerencias? Abre un [issue](https://github.com/cristian20252025/Inventario-Digital-Gamer/issues) en el repositorio.

---

<div align="center">

**Desarrollado con ❤️ para la comunidad gamer**

⭐ Si te gustó el proyecto, no olvides darle una estrella

</div>