import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, role } = body

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      role,
    },
  })

  return NextResponse.json(newUser)
}
