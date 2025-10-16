# Inventario-Digital-Gamer

# API de Inventario Digital Gamer

Este proyecto es el backend de una aplicación web Full Stack para gestionar el inventario y las ventas de una tienda de videojuegos físicos y consolas. Está construido con **Node.js**, **Express** y **MongoDB**, siguiendo buenas prácticas de modularización, validaciones y configuración.

## Tecnologías utilizadas

- Node.js
- Express

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/backend-inventario.git
   cd backend-inventario

2 .Instala las dependencias:

bash
npm install

3. Crea un archivo .env en la raíz del proyecto con las siguientes variables:

PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventario

4. Inicia el servidor:

bash
npm run dev

# Estructura del proyecto

backend/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── config/
├── .env
├── app.js
└── server.js

# Endpoints principales

## Productos

- GET /api/productos → Listar todos los productos

- POST /api/productos → Crear un nuevo producto

- PUT /api/productos/:id → Actualizar un producto

- DELETE /api/productos/:id → Eliminar un producto

## Ventas
- POST /api/ventas → Registrar una venta (descuenta stock automáticamente)

Las rutas incluyen validaciones con express-validator y retornan errores claros si los datos son inválidos.
