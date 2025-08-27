import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Error de prueba del servidor
    throw new Error('Test error from server - Sentry server-side test')

    return NextResponse.json({
      success: true,
      message: 'This should not be reached'
    })
  } catch (error) {
    // Sentry debería capturar este error automáticamente
    console.error('Server error test:', error)
    throw error // Re-throw para que Sentry lo capture
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Error condicional basado en el body
    if (body.triggerError) {
      throw new Error(`Test error with data: ${JSON.stringify(body)}`)
    }

    return NextResponse.json({
      success: true,
      message: 'No error triggered',
      received: body
    })
  } catch (error) {
    console.error('Server error test (POST):', error)
    throw error
  }
}
