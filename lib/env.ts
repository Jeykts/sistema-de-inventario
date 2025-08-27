import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env.local
dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/sistema-inventario';
export const JWT_SECRET = process.env.JWT_SECRET || 'sistema-inventario-secret-key-2024';
