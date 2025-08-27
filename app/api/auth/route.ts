import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/env'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 })
    }

    const token = sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' })

    // Excluir la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ 
      token, 
      user: userWithoutPassword 
    })
  } catch (error) {
    console.error('Error en autenticación:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
