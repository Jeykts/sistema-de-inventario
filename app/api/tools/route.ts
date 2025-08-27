import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Tool } from '@prisma/client'

export async function GET() {
  const tools = await prisma.tool.findMany()
  return NextResponse.json(tools)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, description, category, qrCode, status, location } = body

  const newTool = await prisma.tool.create({
    data: {
      name,
      description,
      category,
      qrCode,
      status,
      location,
    },
  })

  return NextResponse.json(newTool)
}
