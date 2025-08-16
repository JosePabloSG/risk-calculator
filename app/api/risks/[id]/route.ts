import { NextRequest, NextResponse } from 'next/server'
import { RiskRegisterEntry, ApiResponse } from '@/lib/types'
import { findRisk, updateRisk as updateRiskInStore, deleteRisk as deleteRiskFromStore } from '@/lib/risk-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const risk = findRisk(id)

    if (!risk) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Riesgo no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<RiskRegisterEntry>>({
      success: true,
      data: risk
    })

  } catch (error) {
    console.error('Error fetching risk:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error interno del servidor al obtener el riesgo'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updateData: Partial<Omit<RiskRegisterEntry, 'id' | 'createdAt' | 'updatedAt'>> = await request.json()

    const updatedRisk = updateRiskInStore(id, updateData)

    if (!updatedRisk) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Riesgo no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<RiskRegisterEntry>>({
      success: true,
      data: updatedRisk,
      message: 'Riesgo actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating risk:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error interno del servidor al actualizar el riesgo'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deletedRisk = deleteRiskFromStore(id)

    if (!deletedRisk) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Riesgo no encontrado'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<RiskRegisterEntry>>({
      success: true,
      data: deletedRisk,
      message: 'Riesgo eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting risk:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Error interno del servidor al eliminar el riesgo'
    }, { status: 500 })
  }
}
