import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { returnedQuantity } = body

  try {
    // Find the loan
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: { tool: true }
    })

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }

    if (loan.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Loan is not active' }, { status: 400 })
    }

    if (returnedQuantity > loan.quantity) {
      return NextResponse.json({ error: 'Returned quantity exceeds loan quantity' }, { status: 400 })
    }

    // Update loan
    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        returnedAt: new Date(),
        status: returnedQuantity === loan.quantity ? 'RETURNED' : 'ACTIVE',
        quantity: loan.quantity - returnedQuantity
      },
      include: {
        tool: true,
        user: true
      }
    })

    // Update tool's available quantity
    const tool = await prisma.tool.findUnique({
      where: { id: loan.toolId }
    })

    if (tool) {
      const newAvailableQuantity = tool.availableQuantity + returnedQuantity
      await prisma.tool.update({
        where: { id: loan.toolId },
        data: {
          availableQuantity: newAvailableQuantity,
          status: newAvailableQuantity > 0 ? 'AVAILABLE' : tool.status
        }
      })
    }

    return NextResponse.json(updatedLoan)
  } catch (error) {
    console.error('Error returning loan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
