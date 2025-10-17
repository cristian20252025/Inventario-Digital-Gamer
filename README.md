## README Frontend

# Frontend - Tienda de Videojuegos

Este es el frontend de la aplicación de inventario y ventas para una tienda de videojuegos. Está desarrollado con **HTML**, **CSS** y **JavaScript puro**, y se conecta con una API REST construida en Node.js.

## Funcionalidades

- Listar catálogo de productos
- Simular una compra (registrar venta)
- Mostrar mensajes de error si no hay stock
- Interfaz amigable para crear, editar y eliminar productos

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/frontend-inventario.git
   cd frontend-inventario

2. Abre el archivo index.html en tu navegador o usa una extensión como Live Server en VS Code.

    Asegúrate de que el backend esté corriendo y que el CORS esté correctamente configurado para permitir la conexión.

## Conexión con el backend

El frontend se comunica con el backend a través de fetch() usando la URL base definida en el archivo config.js o directamente en los scripts.

Ejemplo:
fetch('http://localhost:3000/api/productos')

## Estructura del proyecto

frontend/
├── index.html
├── styles.css
├── empleados.js
├── usuarios.js
└── app.js 

<<<<<<< HEAD
### Productos
- GET /api/productos → Listar todos los productos

- POST /api/productos → Crear un nuevo producto

- PUT /api/productos/:id → Actualizar un producto

- DELETE /api/productos/:id → Eliminar un producto

### Ventas
- POST /api/ventas → Registrar una venta (descuenta stock automáticamente)

**Las rutas incluyen validaciones con express-validator y retornan errores claros si los datos son inválidos.**

## Repositorio del frontend
- aaa
=======
## Validaciones
Los mensajes de error del backend (como stock insuficiente o datos inválidos) se muestran en la interfaz para mejorar la experiencia del usuario.
>>>>>>> 4e8f67f9d08f56806648248c25678ae4632744e5
