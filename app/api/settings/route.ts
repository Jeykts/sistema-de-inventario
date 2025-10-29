import { NextResponse } from 'next/server'

// In a real application, you would store these settings in a database
// For now, we'll use a simple in-memory store or localStorage simulation
let systemSettings = {
  appName: "Sistema de Inventario",
  appDescription: "Colegio - Gestión de Herramientas",
  allowRegistration: false,
  requireApproval: true,
  maxLoanDays: 30,
  emailNotifications: false
}

export async function GET() {
  return NextResponse.json(systemSettings)
}

export async function PUT(request: Request) {
  const body = await request.json()

  try {
    // Update settings
    systemSettings = {
      ...systemSettings,
      ...body
    }

    return NextResponse.json(systemSettings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
  }
}
