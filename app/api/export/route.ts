import { NextRequest, NextResponse } from 'next/server'
import { RiskRegisterEntry, ExportOptions, ApiResponse } from '@/lib/types'
import { getAllRisks } from '@/lib/risk-store'

// Helper function to convert data to CSV
const convertToCSV = (data: RiskRegisterEntry[]): string => {
  if (data.length === 0) return ''

  // CSV Headers in Spanish
  const headers = [
    'ID',
    'Nombre',
    'Descripción',
    'Activo',
    'Categoría',
    'Nivel de Riesgo Inherente',
    'Nivel de Riesgo Residual',
    'Puntuación Riesgo Inherente',
    'Puntuación Riesgo Residual',
    'Probabilidad',
    'Impacto',
    'Propietario',
    'Estado',
    'Plan de Tratamiento',
    'Controles',
    'Fecha de Revisión',
    'Fecha de Creación',
    'Fecha de Actualización'
  ]

  // Convert data to CSV rows
  const csvRows = data.map(risk => [
    risk.id,
    `"${risk.name}"`,
    `"${risk.description}"`,
    `"${risk.assetName}"`,
    risk.category,
    risk.inherentRiskLevel,
    risk.residualRiskLevel,
    risk.inherentRiskScore,
    risk.residualRiskScore,
    risk.probability,
    risk.impact,
    `"${risk.owner}"`,
    risk.status,
    `"${risk.treatmentPlan}"`,
    `"${risk.controls.join('; ')}"`,
    risk.reviewDate.toISOString().split('T')[0],
    risk.createdAt.toISOString().split('T')[0],
    risk.updatedAt.toISOString().split('T')[0]
  ])

  return [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const options: ExportOptions = await request.json()

    // Validate export format
    if (!['csv', 'json'].includes(options.format)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Formato de exportación no válido. Use "csv" o "json"'
      }, { status: 400 })
    }

    let filteredData = getAllRisks()

    // Apply date range filter if provided
    if (options.dateRange) {
      const { from, to } = options.dateRange
      filteredData = filteredData.filter(risk => {
        const createdAt = new Date(risk.createdAt)
        return createdAt >= new Date(from) && createdAt <= new Date(to)
      })
    }

    // Sort by risk score (highest first)
    filteredData.sort((a, b) => b.residualRiskScore - a.residualRiskScore)

    let content: string
    let contentType: string
    let filename: string

    if (options.format === 'csv') {
      content = convertToCSV(filteredData)
      contentType = 'text/csv'
      filename = `registro-riesgos-${new Date().toISOString().split('T')[0]}.csv`
    } else {
      // JSON format
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalRisks: filteredData.length,
        includeCalculations: options.includeCalculations,
        includeRecommendations: options.includeRecommendations,
        risks: filteredData
      }

      content = JSON.stringify(exportData, null, 2)
      contentType = 'application/json'
      filename = `registro-riesgos-${new Date().toISOString().split('T')[0]}.json`
    }

    // Return file for download
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error interno del servidor al exportar los datos'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Formato de exportación no válido. Use "csv" o "json"'
      }, { status: 400 })
    }

    // Quick export without filters
    const filteredData = getAllRisks().sort((a, b) => b.residualRiskScore - a.residualRiskScore)

    let content: string
    let contentType: string
    let filename: string

    if (format === 'csv') {
      content = convertToCSV(filteredData)
      contentType = 'text/csv'
      filename = `registro-riesgos-${new Date().toISOString().split('T')[0]}.csv`
    } else {
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalRisks: filteredData.length,
        includeCalculations: true,
        includeRecommendations: true,
        risks: filteredData
      }

      content = JSON.stringify(exportData, null, 2)
      contentType = 'application/json'
      filename = `registro-riesgos-${new Date().toISOString().split('T')[0]}.json`
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Error in GET export:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
