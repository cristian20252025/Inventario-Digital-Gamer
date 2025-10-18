# Inventario Digital Gamer - Frontend

Este proyecto es la interfaz visual de una aplicación de inventario y ventas para una tienda de videojuegos. Está desarrollado con **HTML**, **CSS** y **JavaScript puro**, sin frameworks, lo que lo hace ideal para demostrar habilidades fundamentales en desarrollo web.

## ¿Qué hace esta app?

- Muestra productos disponibles en la tienda
- Permite registrar ventas desde la interfaz
- Actualiza el stock automáticamente tras cada venta
- Se conecta con una API RESTful para manejar datos en tiempo real

## Estructura del proyecto

```
Inventario-Digital-Gamer/
├── index.html
├── style.css
└── script.js
```

- `index.html`: Estructura principal de la interfaz
- `style.css`: Estilos visuales personalizados
- `script.js`: Lógica de conexión con el backend y manipulación del DOM

## Conexión con el backend

Este frontend se comunica con el backend mediante `fetch()` a rutas como:

```javascript
fetch('http://localhost:3000/api/productos')
```

Asegúrate de que el backend esté corriendo localmente o en un servidor accesible.

## Funcionalidades clave

- Carga dinámica de productos desde la API
- Validación básica de formularios
- Registro de ventas con actualización visual del stock
- Manejo de errores y respuestas del servidor

## Requisitos para correr

- Navegador moderno (Chrome, Firefox, Edge)
- Backend corriendo en `localhost:3000` o URL configurada
- Conexión a internet si se usa base de datos remota

## Cómo usar

1. Clona el repositorio:

```bash
git clone https://github.com/cristian20252025/Inventario-Digital-Gamer.git
```

2. Abre `index.html` en tu navegador

3. Interactúa con la interfaz para ver productos y registrar ventas
