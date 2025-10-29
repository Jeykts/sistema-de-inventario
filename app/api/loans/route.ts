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
  const { toolId, userId, quantity = 1, notes } = body

  // Check if tool has enough available quantity
  const tool = await prisma.tool.findUnique({
    where: { id: toolId }
  })

  if (!tool) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
  }

  if (tool.availableQuantity < quantity) {
    return NextResponse.json({ error: 'Insufficient available quantity' }, { status: 400 })
  }

  // Create the loan
  const newLoan = await prisma.loan.create({
    data: {
      toolId,
      userId,
      quantity,
      notes,
    },
    include: {
      tool: true,
      user: true,
    },
  })

  // Update tool's available quantity
  await prisma.tool.update({
    where: { id: toolId },
    data: {
      availableQuantity: tool.availableQuantity - quantity,
      status: tool.availableQuantity - quantity === 0 ? 'BORROWED' : tool.status
    }
  })

  return NextResponse.json(newLoan)
}
