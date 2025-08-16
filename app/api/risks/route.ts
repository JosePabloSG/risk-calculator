import { NextRequest, NextResponse } from 'next/server'
import { RiskRegisterEntry, ApiResponse } from '@/lib/types'
import { getAllRisks, addRisk } from '@/lib/risk-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    let filteredRisks = getAllRisks()

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filteredRisks = filteredRisks.filter(risk =>
        risk.name.toLowerCase().includes(searchLower) ||
        risk.description.toLowerCase().includes(searchLower) ||
        risk.assetName.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      filteredRisks = filteredRisks.filter(risk => risk.status === status)
    }

    if (category) {
      filteredRisks = filteredRisks.filter(risk => risk.category === category)
    }

    // Sort by risk score (highest first)
    filteredRisks.sort((a, b) => b.residualRiskScore - a.residualRiskScore)

    return NextResponse.json<ApiResponse<RiskRegisterEntry[]>>({
      success: true,
      data: filteredRisks,
      message: `${filteredRisks.length} riesgos encontrados`
    })

  } catch (error) {
    console.error('Error fetching risks:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error interno del servidor al obtener los riesgos'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const riskData: Omit<RiskRegisterEntry, 'id' | 'createdAt' | 'updatedAt'> = await request.json()

    // Validate required fields
    if (!riskData.name || !riskData.assetName || !riskData.category) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Campos requeridos faltantes: nombre, activo y categoría son obligatorios'
      }, { status: 400 })
    }

    // Generate new risk entry
    const newRisk: RiskRegisterEntry = {
      ...riskData,
      id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    addRisk(newRisk)

    return NextResponse.json<ApiResponse<RiskRegisterEntry>>({
      success: true,
      data: newRisk,
      message: 'Riesgo creado exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating risk:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error interno del servidor al crear el riesgo'
    }, { status: 500 })
  }
}
