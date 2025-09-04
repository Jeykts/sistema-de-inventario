import { PrismaClient, Role, ToolStatus, LoanStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuarios con contraseñas hasheadas (usando upsert para evitar duplicados)
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'maria.gonzalez@colegio.edu' },
      update: {},
      create: {
        name: 'María',
        lastName: 'González',
        course: 'Administración',
        email: 'maria.gonzalez@colegio.edu',
        password: await hash('admin123', 12),
        role: Role.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'carlos.rodriguez@colegio.edu' },
      update: {},
      create: {
        name: 'Carlos',
        lastName: 'Rodríguez',
        course: 'Matemáticas',
        email: 'carlos.rodriguez@colegio.edu',
        password: await hash('profesor123', 12),
        role: Role.PROFESOR,
      },
    }),
    prisma.user.upsert({
      where: { email: 'ana.martinez@colegio.edu' },
      update: {},
      create: {
        name: 'Ana',
        lastName: 'Martínez',
        course: 'Física',
        email: 'ana.martinez@colegio.edu',
        password: await hash('profesor123', 12),
        role: Role.PROFESOR,
      },
    }),
  ])

  console.log(`✅ ${users.length} usuarios creados`)

  // Crear categorías (usando upsert para evitar duplicados)
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Herramientas Manuales' },
      update: {},
      create: {
        name: 'Herramientas Manuales',
        description: 'Martillos, destornilladores, llaves',
        color: 'bg-blue-100 text-blue-800',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Herramientas Eléctricas' },
      update: {},
      create: {
        name: 'Herramientas Eléctricas',
        description: 'Taladros, sierras, lijadoras',
        color: 'bg-green-100 text-green-800',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Instrumentos de Medición' },
      update: {},
      create: {
        name: 'Instrumentos de Medición',
        description: 'Reglas, calibradores, niveles',
        color: 'bg-purple-100 text-purple-800',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Equipos de Seguridad' },
      update: {},
      create: {
        name: 'Equipos de Seguridad',
        description: 'Cascos, guantes, gafas',
        color: 'bg-orange-100 text-orange-800',
      },
    }),
  ])

  console.log(`✅ ${categories.length} categorías creadas`)

  // Crear herramientas con sistema de stock (usando upsert para evitar duplicados)
  const tools = await Promise.all([
    prisma.tool.upsert({
      where: { qrCode: 'TOOL-001-2024' },
      update: {},
      create: {
        name: 'Taladro Eléctrico Bosch',
        description: 'Taladro percutor de 650W con maletín',
        category: 'Herramientas Eléctricas',
        qrCode: 'TOOL-001-2024',
        status: ToolStatus.AVAILABLE,
        location: 'Taller A - Estante 1',
        quantity: 5,
        availableQuantity: 5,
      },
    }),
    prisma.tool.upsert({
      where: { qrCode: 'TOOL-002-2024' },
      update: {},
      create: {
        name: 'Martillo de Carpintero',
        description: 'Martillo de acero con mango de madera',
        category: 'Herramientas Manuales',
        qrCode: 'TOOL-002-2024',
        status: ToolStatus.BORROWED,
        location: 'Taller B - Estante 2',
        quantity: 10,
        availableQuantity: 9,
      },
    }),
    prisma.tool.upsert({
      where: { qrCode: 'TOOL-003-2024' },
      update: {},
      create: {
        name: 'Nivel de Burbuja',
        description: 'Nivel de aluminio de 60cm',
        category: 'Instrumentos de Medición',
        qrCode: 'TOOL-003-2024',
        status: ToolStatus.AVAILABLE,
        location: 'Taller A - Estante 3',
        quantity: 8,
        availableQuantity: 8,
      },
    }),
    prisma.tool.upsert({
      where: { qrCode: 'TOOL-004-2024' },
      update: {},
      create: {
        name: 'Casco de Seguridad',
        description: 'Casco blanco con ajuste de correa',
        category: 'Equipos de Seguridad',
        qrCode: 'TOOL-004-2024',
        status: ToolStatus.AVAILABLE,
        location: 'Almacén - Estante Seguridad',
        quantity: 15,
        availableQuantity: 15,
      },
    }),
    // Agregar más herramientas con stock
    prisma.tool.upsert({
      where: { qrCode: 'TOOL-005-2024' },
      update: {},
      create: {
        name: 'Destornillador Phillips',
        description: 'Set de destornilladores Phillips tamaños 1-4',
        category: 'Herramientas Manuales',
        qrCode: 'TOOL-005-2024',
        status: ToolStatus.AVAILABLE,
        location: 'Taller A - Estante 2',
        quantity: 20,
        availableQuantity: 20,
      },
    }),
    prisma.tool.upsert({
      where: { qrCode: 'TOOL-006-2024' },
      update: {},
      create: {
        name: 'Guantes de Trabajo',
        description: 'Guantes resistentes al corte y abrasión',
        category: 'Equipos de Seguridad',
        qrCode: 'TOOL-006-2024',
        status: ToolStatus.AVAILABLE,
        location: 'Almacén - Estante Seguridad',
        quantity: 25,
        availableQuantity: 25,
      },
    }),
  ])

  console.log(`✅ ${tools.length} herramientas creadas`)

  // Crear préstamos (verificar si ya existe para evitar duplicados)
  const existingLoan = await prisma.loan.findFirst({
    where: {
      toolId: tools[1].id,
      userId: users[1].id,
      status: LoanStatus.ACTIVE,
    },
  })

  let loans = []
  if (!existingLoan) {
    loans = await Promise.all([
      prisma.loan.create({
        data: {
          toolId: tools[1].id, // Martillo prestado
          userId: users[1].id, // Carlos Rodríguez
          quantity: 1,
          status: LoanStatus.ACTIVE,
          notes: 'Para proyecto de carpintería',
        },
      }),
    ])
    console.log(`✅ ${loans.length} préstamos creados`)
  } else {
    console.log('ℹ️  Préstamo ya existe, saltando creación')
  }
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
