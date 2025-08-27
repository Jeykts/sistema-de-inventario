import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const loans = await prisma.loan.findMany({
    include: {
      tool: true,
      user: true,
    },
  })
  return NextResponse.json(loans)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { toolId, userId, notes } = body

  const newLoan = await prisma.loan.create({
    data: {
      toolId,
      userId,
      notes,
    },
    include: {
      tool: true,
      user: true,
    },
  })

  return NextResponse.json(newLoan)
}
