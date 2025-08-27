// Script para configurar la variable DATABASE_URL temporalmente
const { exec } = require('child_process');
const { databaseUrl } = require('../lib/config');

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
