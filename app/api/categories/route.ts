import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const categories = await prisma.category.findMany()
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, description, color } = body

  const newCategory = await prisma.category.create({
    data: {
      name,
      description,
      color,
    },
  })

  return NextResponse.json(newCategory)
}
