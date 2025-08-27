# Configuración de Base de Datos MySQL - Hostinger Business

## Credenciales de Conexión

Para conectar con la base de datos MySQL de Hostinger Business, necesitas configurar las siguientes variables de entorno:

### Variables de Entorno Requeridas

```bash
# Base de datos MySQL
DB_HOST=tu-host-mysql.hostinger.com
DB_PORT=3306
DB_USER=tu-usuario-mysql
DB_PASSWORD=tu-contraseña-mysql
DB_NAME=sistema-inventario

# JWT Secret para autenticación
JWT_SECRET=sistema-inventario-secret-key-2024
```

### URL de Conexión Prisma

La URL de conexión para Prisma se genera automáticamente en base a las variables anteriores:

```
mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

### Configuración en Hostinger

1. **Acceder a cPanel de Hostinger**
2. **Base de datos MySQL**
   - Crear una nueva base de datos llamada `sistema-inventario`
   - Crear un usuario con todos los privilegios
   - Asignar el usuario a la base de datos

3. **Configurar variables de entorno**
   - Agregar las variables al archivo `.env.local`
   - O configurarlas en el panel de control de Hostinger

### Estructura de Tablas

Las siguientes tablas se crearán automáticamente con Prisma Migrate:

- `users` - Usuarios del sistema
- `tools` - Herramientas del inventario
- `loans` - Préstamos de herramientas
- `categories` - Categorías de herramientas

### Comandos Prisma

```bash
# Generar migraciones
npx prisma migrate dev --name init

# Ejecutar migraciones en producción
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate

# Ejecutar seed de datos iniciales
npx ts-node prisma/seed.ts
```

### Solución de Problemas

Si encuentras errores de conexión:
1. Verifica que las credenciales sean correctas
2. Asegúrate de que la base de datos exista en Hostinger
3. Verifica que el usuario tenga los privilegios necesarios
4. Comprueba que el firewall permita conexiones en el puerto 3306

### Backup y Restauración

Para hacer backup de la base de datos:

```bash
# Exportar
mysqldump -h [host] -u [usuario] -p [base-de-datos] > backup.sql

# Importar
mysql -h [host] -u [usuario] -p [base-de-datos] < backup.sql
```

---
**Última actualización:** $(date)
