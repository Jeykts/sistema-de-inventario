import { PrismaClient, Role, ToolStatus, LoanStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuarios con contraseñas hasheadas
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'María González',
        email: 'maria.gonzalez@colegio.edu',
        password: await hash('admin123', 12),
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@colegio.edu',
        password: await hash('profesor123', 12),
        role: Role.PROFESOR,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ana Martínez',
        email: 'ana.martinez@colegio.edu',
        password: await hash('profesor123', 12),
        role: Role.PROFESOR,
      },
    }),
  ])

  console.log(`✅ ${users.length} usuarios creados`)

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Herramientas Manuales',
        description: 'Martillos, destornilladores, llaves',
        color: 'bg-blue-100 text-blue-800',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Herramientas Eléctricas',
        description: 'Taladros, sierras, lijadoras',
        color: 'bg-green-100 text-green-800',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Instrumentos de Medición',
        description: 'Reglas, calibradores, niveles',
        color: 'bg-purple-100 text-purple-800',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Equipos de Seguridad',
        description: 'Cascos, guantes, gafas',
        color: 'bg-orange-100 text-orange-800',
      },
    }),
  ])

  console.log(`✅ ${categories.length} categorías creadas`)

  // Crear herramientas
  const tools = await Promise.all([
    prisma.tool.create({
      data: {
        name: 'Taladro Eléctrico Bosch',
        description: 'Taladro percutor de 650W con maletín',
        category: 'Herramientas Eléctricas',
        qrCode: 'TOOL-001-2024',
        status: ToolStatus.AVAILABLE,
        location: 'Taller A - Estante 1',
      },
    }),
    prisma.tool.create({
      data: {
        name: 'Martillo de Carpintero',
        description: 'Martillo de acero con mango de madera',
        category: 'Herramientas Manuales',
        qrCode: 'TOOL-002-2024',
        status: ToolStatus.BORROWED,
        location: 'Taller B - Estante 2',
      },
    }),
    prisma.tool.create({
      data: {
        name: 'Nivel de Burbuja',
        description: 'Nivel de aluminio de 60cm',
        category: 'Instrumentos de Medición',
        qrCode: 'TOOL-003-2024',
        status: ToolStatus.AVAILABLE,
        location: 'Taller A - Estante 3',
      },
    }),
    prisma.tool.create({
      data: {
        name: 'Casco de Seguridad',
        description: 'Casco blanco con ajuste de correa',
        category: 'Equipos de Seguridad',
        qrCode: 'TOOL-004-2024',
        status: ToolStatus.AVAILABLE,
        location: 'Almacén - Estante Seguridad',
      },
    }),
  ])

  console.log(`✅ ${tools.length} herramientas creadas`)

  // Crear préstamos
  const loans = await Promise.all([
    prisma.loan.create({
      data: {
        toolId: tools[1].id, // Martillo prestado
        userId: users[1].id, // Carlos Rodríguez
        status: LoanStatus.ACTIVE,
        notes: 'Para proyecto de carpintería',
      },
    }),
  ])

  console.log(`✅ ${loans.length} préstamos creados`)
  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
