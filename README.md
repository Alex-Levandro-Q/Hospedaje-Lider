# Sistema de Hospedaje Líder

Sistema completo de reservas y gestión de habitaciones para hospedaje, construido con Next.js (frontend) y Express.js + Prisma + PostgreSQL (backend).

## Configuración Inicial

1. **Instalar dependencias:**
```bash
npm install
npm run setup
```

2. **Configurar base de datos PostgreSQL:**
   - Crear base de datos `hospedaje`
   - Configurar credenciales en `backend/.env`

3. **Iniciar desarrollo:**
```bash
npm run dev
```

Esto iniciará:
- Frontend en [http://localhost:3000](http://localhost:3000)
- Backend API en [http://localhost:4005](http://localhost:4005)

## Estructura del Proyecto

- `/src` - Frontend Next.js
- `/backend` - API Express.js con Prisma
- `/backend/prisma` - Esquemas de base de datos

## API Endpoints

### Usuarios
- `GET /api/usuarios` - Listar usuarios activos
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Editar usuario
- `PATCH /api/usuarios/:id/desactivar` - Desactivar usuario
- `PATCH /api/usuarios/:id/activar` - Activar usuario
