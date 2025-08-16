import { NextRequest, NextResponse } from 'next/server'
import {
  RiskCalculationInput,
  RiskCalculationResult,
  ApiResponse
} from '@/lib/types'
import {
  calculateQualitativeRisk,
  calculateQuantitativeRisk,
  generateRecommendations
} from '@/lib/risk-calculations'

export async function POST(request: NextRequest) {
  try {
    console.log('API: Starting risk calculation...')

    const input: RiskCalculationInput = await request.json()
    console.log('API: Input received:', {
      name: input.name,
      method: input.method,
      hasQualitativeData: !!input.qualitativeData,
      hasQuantitativeData: !!input.quantitativeData
    })

    // Validate required fields
    if (!input.name || !input.method || !input.impactAssessment) {
      console.log('API: Validation failed - missing required fields')
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Campos requeridos faltantes'
      }, { status: 400 })
    }

    // Validate method-specific data
    if (input.method === 'qualitative' && !input.qualitativeData) {
      console.log('API: Validation failed - missing qualitative data')
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Datos cualitativos requeridos para el método cualitativo'
      }, { status: 400 })
    }

    if (input.method === 'quantitative' && !input.quantitativeData) {
      console.log('API: Validation failed - missing quantitative data')
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Datos cuantitativos requeridos para el método cuantitativo'
      }, { status: 400 })
    }

    // Generate unique ID if not provided
    const id = input.id || `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('API: Generated ID:', id)

    let qualitativeResult
    let quantitativeResult
    let recommendations: string[] = []

    try {
      // Perform calculations based on method
      if (input.method === 'qualitative' && input.qualitativeData) {
        console.log('API: Calculating qualitative risk...')
        qualitativeResult = calculateQualitativeRisk(
          input.qualitativeData,
          input.impactAssessment
        )
        console.log('API: Qualitative result calculated:', {
          inherentScore: qualitativeResult.inherentRiskScore,
          residualScore: qualitativeResult.residualRiskScore
        })

        recommendations = generateRecommendations(qualitativeResult, undefined, 'qualitative')
        console.log('API: Generated recommendations:', recommendations.length)
      }

      if (input.method === 'quantitative' && input.quantitativeData) {
        console.log('API: Calculating quantitative risk...')
        quantitativeResult = calculateQuantitativeRisk(
          input.quantitativeData
        )
        console.log('API: Quantitative result calculated:', {
          SLE: quantitativeResult.singleLossExpectancy,
          ALE: quantitativeResult.annualLossExpectancy
        })

        recommendations = generateRecommendations(undefined, quantitativeResult, 'quantitative')
        console.log('API: Generated recommendations:', recommendations.length)
      }
    } catch (calculationError) {
      console.error('API: Error during calculation:', calculationError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: `Error durante el cálculo: ${calculationError instanceof Error ? calculationError.message : 'Error desconocido'}`
      }, { status: 500 })
    }

    // Determine risk trend (simplified - would be based on historical data in real app)
    const riskTrend: 'increasing' | 'stable' | 'decreasing' = 'stable'

    const result: RiskCalculationResult = {
      id,
      input: { ...input, id },
      qualitativeResult,
      quantitativeResult,
      recommendedActions: recommendations,
      calculatedAt: new Date(),
      riskTrend
    }

    console.log('API: Calculation completed successfully, returning result')
    return NextResponse.json<ApiResponse<RiskCalculationResult>>({
      success: true,
      data: result,
      message: 'Cálculo de riesgo completado exitosamente'
    })

  } catch (error) {
    console.error('API: Unexpected error in POST handler:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error interno del servidor al calcular el riesgo'
    }, { status: 500 })
  }
}
