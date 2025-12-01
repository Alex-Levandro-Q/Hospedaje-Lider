# Backend - Sistema de Hospedaje

## Configuración de Base de Datos

1. Asegúrate de que PostgreSQL esté corriendo en localhost:5432
2. Crea la base de datos:
```sql
CREATE DATABASE hospedaje;
```

3. Si necesitas crear un usuario con permisos:
```sql
CREATE USER hospedaje_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE hospedaje TO hospedaje_user;
```

4. Actualiza el .env si usas autenticación:
```
DATABASE_URL="postgresql://hospedaje_user:password@localhost:5432/hospedaje"
```

## Comandos

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npm run db:generate

# Crear tablas en BD
npm run db:push

# Iniciar servidor desarrollo
npm run dev

# Ver base de datos
npm run db:studio
```

## API Endpoints

### Autenticación
- POST /api/auth/login - Iniciar sesión

### Usuarios
- GET /api/usuarios - Listar usuarios activos
- GET /api/usuarios/:id - Obtener usuario por ID
- POST /api/usuarios - Crear usuario
- PUT /api/usuarios/:id - Editar usuario
- PATCH /api/usuarios/:id/desactivar - Desactivar usuario
- PATCH /api/usuarios/:id/activar - Activar usuario

### Servicios
- GET /api/servicios - Listar servicios activos
- POST /api/servicios - Crear servicio (regente/admin)
- PATCH /api/servicios/:id/desactivar - Desactivar servicio

### Habitaciones
- GET /api/habitaciones - Listar habitaciones activas con servicios
- GET /api/habitaciones/:id - Obtener habitación por ID
- POST /api/habitaciones - Crear habitación (regente/admin)
- PUT /api/habitaciones/:id - Editar habitación
- PATCH /api/habitaciones/:id/estado - Cambiar estado (disponible/ocupada)
- PATCH /api/habitaciones/:id/limpieza - Cambiar estado de limpieza
- PATCH /api/habitaciones/:id/desactivar - Desactivar habitación

### Reservas
- GET /api/reservas - Listar reservas
- POST /api/reservas - Crear reserva

## Roles de Usuario

- **cliente**: Puede hacer reservas
- **regente**: Puede gestionar habitaciones y servicios
- **administrador**: Acceso completo al sistema

## Tipos de Reserva

- **hora**: Mínimo 3 horas, precio por hora
- **noche**: Precio por noche
- **mes**: Precio mensual

## Estados de Habitación

- **disponible**: Habitación libre para reservar
- **ocupada**: Habitación en uso
- **activa/inactiva**: Estado lógico de la habitación
- **limpieza**: true/false - Indica si necesita limpieza