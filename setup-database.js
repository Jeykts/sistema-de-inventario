// Script para configurar la variable DATABASE_URL temporalmente
const { exec } = require('child_process');

// Configuración de la base de datos MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema-inventario',
};

// Generar la URL de conexión para Prisma
const databaseUrl = `mysql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;

// Establecer la variable DATABASE_URL temporalmente
process.env.DATABASE_URL = databaseUrl;

console.log('🔧 Configurando DATABASE_URL:', databaseUrl);

// Ejecutar migraciones de Prisma
exec('npx prisma migrate dev --name init', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    return;
  }
  console.log('✅ Migraciones ejecutadas exitosamente');
  console.log(stdout);
  
  // Ejecutar seed de datos
  exec('npx ts-node prisma/seed.ts', (seedError, seedStdout, seedStderr) => {
    if (seedError) {
      console.error('❌ Error ejecutando seed:', seedError);
      return;
    }
    console.log('✅ Seed ejecutado exitosamente');
    console.log(seedStdout);
  });
});
