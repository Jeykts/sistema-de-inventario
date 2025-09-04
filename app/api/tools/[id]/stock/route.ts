import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { quantity, availableQuantity } = await request.json()

    // Validaciones
    if (quantity < 0 || availableQuantity < 0) {
      return NextResponse.json(
        { message: 'Las cantidades no pueden ser negativas' },
        { status: 400 }
      )
    }

    if (availableQuantity > quantity) {
      return NextResponse.json(
        { message: 'La cantidad disponible no puede ser mayor que la cantidad total' },
        { status: 400 }
      )
    }

    // Verificar que la herramienta existe
    const existingTool = await prisma.tool.findUnique({
      where: { id }
    })

    if (!existingTool) {
      return NextResponse.json(
        { message: 'Herramienta no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar el stock
    const updatedTool = await prisma.tool.update({
      where: { id },
      data: {
        quantity,
        availableQuantity,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Stock actualizado exitosamente',
      tool: updatedTool
    })

  } catch (error) {
    console.error('Error actualizando stock:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
