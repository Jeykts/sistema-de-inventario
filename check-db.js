const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Checking loans in database...')

  const loans = await prisma.loan.findMany({
    include: {
      tool: true,
      user: true
    }
  })

  console.log('Loans found:', loans.length)
  loans.forEach(loan => {
    console.log(`ID: ${loan.id}, Tool: ${loan.tool.name}, User: ${loan.user.name}, Quantity: ${loan.quantity}, Status: ${loan.status}`)
  })

  await prisma.$disconnect()
}

main().catch(console.error)
