// Configuración de la base de datos MySQL
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema-inventario',
}

// Generar la URL de conexión para Prisma
export const databaseUrl = `mysql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`

// JWT Secret
export const jwtSecret = process.env.JWT_SECRET || 'sistema-inventario-secret-key-2024'
