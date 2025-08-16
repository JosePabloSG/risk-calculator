'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QualitativeResult, RISK_MATRIX_CONFIG } from '@/lib/types'
import { getMatrixCellColor, getRiskLevel } from '@/lib/risk-calculations'

interface RiskMatrixProps {
  qualitativeResult?: QualitativeResult
  showComparison?: boolean
}

export const RiskMatrix = ({ qualitativeResult, showComparison = false }: RiskMatrixProps) => {
  const { size, colors, labels } = RISK_MATRIX_CONFIG

  // Create matrix grid
  const createMatrix = () => {
    const matrix = []
    for (let impact = size; impact >= 1; impact--) {
      const row = []
      for (let likelihood = 1; likelihood <= size; likelihood++) {
        const riskScore = likelihood * impact
        const riskLevel = getRiskLevel(riskScore)
        const color = getMatrixCellColor(likelihood, impact)

        // Check if this cell contains inherent or residual risk
        let isInherent = false
        let isResidual = false

        if (qualitativeResult) {
          const { inherent, residual } = qualitativeResult.matrixPosition

          if (inherent.likelihood === likelihood && inherent.impact === impact) {
            isInherent = true
          }

          if (residual.likelihood === likelihood && residual.impact === impact) {
            isResidual = true
          }
        }

        row.push({
          likelihood,
          impact,
          riskScore,
          riskLevel,
          color,
          isInherent,
          isResidual
        })
      }
      matrix.push(row)
    }
    return matrix
  }

  const matrix = createMatrix()

  const getCellContent = (cell: {
    likelihood: number
    impact: number
    riskScore: number
    riskLevel: string
    color: string
    isInherent: boolean
    isResidual: boolean
  }) => {
    const markers = []

    if (cell.isInherent) {
      markers.push(
        <div
          key="inherent"
          className="absolute -top-1 -left-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white"
          title="Riesgo Inherente"
        />
      )
    }

    if (cell.isResidual) {
      markers.push(
        <div
          key="residual"
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 rounded-full border-2 border-white"
          title="Riesgo Residual"
        />
      )
    }

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className="text-xs font-medium text-white drop-shadow-sm">
          {cell.riskScore}
        </span>
        {markers}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Matriz de Riesgo 5×5</CardTitle>
        <CardDescription>
          Visualización del riesgo en función de probabilidad e impacto
          {qualitativeResult && showComparison && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-600 rounded-full" />
                <span className="text-xs">Inherente</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded-full" />
                <span className="text-xs">Residual</span>
              </div>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-1 min-w-[400px]">
              {/* Headers */}
              <div className="p-2"></div>
              {[1, 2, 3, 4, 5].map(likelihood => (
                <div key={likelihood} className="p-2 text-center text-sm font-medium">
                  {likelihood}
                </div>
              ))}

              {/* Matrix Rows */}
              {matrix.map((row, rowIndex) => (
                <div key={rowIndex} className="contents">
                  {/* Impact Label */}
                  <div className="p-2 text-center text-sm font-medium">
                    {row[0].impact}
                  </div>

                  {/* Matrix Cells */}
                  {row.map((cell, cellIndex) => (
                    <div
                      key={cellIndex}
                      className="relative aspect-square min-h-[50px] rounded border-2 border-white/20 transition-all hover:scale-105 hover:border-white/40 cursor-pointer"
                      style={{ backgroundColor: cell.color }}
                      title={`Probabilidad: ${cell.likelihood}, Impacto: ${cell.impact}, Riesgo: ${cell.riskLevel} (${cell.riskScore})`}
                    >
                      {getCellContent(cell)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Axis Labels */}
          <div className="flex justify-between items-end">
            <div className="text-center">
              <p className="text-sm font-medium">Probabilidad</p>
              <p className="text-xs text-muted-foreground">
                1=Muy Baja → 5=Muy Alta
              </p>
            </div>
            <div className="text-center transform -rotate-90 origin-center">
              <p className="text-sm font-medium whitespace-nowrap">Impacto</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                1=Mínimo → 5=Catastrófico
              </p>
            </div>
          </div>

          {/* Risk Level Legend */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Niveles de Riesgo:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(labels).map(([score, level]) => (
                <Badge
                  key={score}
                  style={{
                    backgroundColor: colors[parseInt(score) as keyof typeof colors],
                    color: 'white'
                  }}
                  className="text-xs"
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          {/* Risk Score Ranges */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Muy Bajo:</strong> 1-5 | <strong>Bajo:</strong> 6-10 | <strong>Medio:</strong> 11-15 | <strong>Alto:</strong> 16-20 | <strong>Crítico:</strong> 21-25</p>
          </div>

          {/* Current Risk Summary */}
          {qualitativeResult && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Resumen del Riesgo Actual:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-red-600">Riesgo Inherente:</p>
                  <p>Posición: ({qualitativeResult.matrixPosition.inherent.likelihood}, {qualitativeResult.matrixPosition.inherent.impact})</p>
                  <p>Nivel: {qualitativeResult.inherentRiskLevel}</p>
                  <p>Puntuación: {qualitativeResult.inherentRiskScore}</p>
                </div>
                <div>
                  <p className="font-medium text-green-600">Riesgo Residual:</p>
                  <p>Posición: ({qualitativeResult.matrixPosition.residual.likelihood}, {qualitativeResult.matrixPosition.residual.impact})</p>
                  <p>Nivel: {qualitativeResult.residualRiskLevel}</p>
                  <p>Puntuación: {qualitativeResult.residualRiskScore}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="font-medium">Reducción de Riesgo: {qualitativeResult.riskReduction.toFixed(1)}%</p>
                <p className="text-muted-foreground">
                  Los controles implementados redujeron el riesgo de {qualitativeResult.inherentRiskLevel} a {qualitativeResult.residualRiskLevel}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
