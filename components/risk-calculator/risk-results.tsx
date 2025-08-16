'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react'
import { RiskCalculationResult } from '@/lib/types'
import { getRiskColor } from '@/lib/risk-calculations'

interface RiskResultsProps {
  result: RiskCalculationResult
}

export const RiskResults = ({ result }: RiskResultsProps) => {
  const { input, qualitativeResult, quantitativeResult, recommendedActions } = result

  // Helper function to safely format dates
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('es-ES')
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Fecha inválida'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header with basic risk info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resultados del Análisis de Riesgo
          </CardTitle>
          <CardDescription>
            {input.name} - {input.assetName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Método</p>
              <Badge variant={input.method === 'qualitative' ? 'default' : 'secondary'}>
                {input.method === 'qualitative' ? 'Cualitativo' : 'Cuantitativo'}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Calculado</p>
              <p className="font-medium">
                {formatDate(result.calculatedAt)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tendencia</p>
              <div className="flex items-center justify-center gap-1">
                {result.riskTrend === 'increasing' && <TrendingUp className="w-4 h-4 text-red-500" />}
                {result.riskTrend === 'decreasing' && <TrendingDown className="w-4 h-4 text-green-500" />}
                {result.riskTrend === 'stable' && <Activity className="w-4 h-4 text-yellow-500" />}
                <span className="capitalize text-sm">{result.riskTrend === 'stable' ? 'Estable' : result.riskTrend === 'increasing' ? 'Creciente' : 'Decreciente'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="detailed">Detallado</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {qualitativeResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inherent Risk */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Riesgo Inherente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nivel:</span>
                      <Badge
                        style={{
                          backgroundColor: getRiskColor(qualitativeResult.inherentRiskLevel),
                          color: 'white'
                        }}
                      >
                        {qualitativeResult.inherentRiskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Puntuación:</span>
                      <span className="font-bold text-lg">
                        {qualitativeResult.inherentRiskScore}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Probabilidad: {qualitativeResult.matrixPosition.inherent.likelihood}</span>
                        <span>Impacto: {qualitativeResult.matrixPosition.inherent.impact}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Residual Risk */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Riesgo Residual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nivel:</span>
                      <Badge
                        style={{
                          backgroundColor: getRiskColor(qualitativeResult.residualRiskLevel),
                          color: 'white'
                        }}
                      >
                        {qualitativeResult.residualRiskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Puntuación:</span>
                      <span className="font-bold text-lg">
                        {qualitativeResult.residualRiskScore}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Probabilidad: {qualitativeResult.matrixPosition.residual.likelihood}</span>
                        <span>Impacto: {qualitativeResult.matrixPosition.residual.impact}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {quantitativeResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">SLE</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(quantitativeResult.singleLossExpectancy)}
                  </p>
                  <p className="text-xs text-muted-foreground">Expectativa de Pérdida Simple</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">ALE Inherente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(quantitativeResult.inherentALE)}
                  </p>
                  <p className="text-xs text-muted-foreground">Expectativa de Pérdida Anual</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">ALE Residual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(quantitativeResult.residualALE)}
                  </p>
                  <p className="text-xs text-muted-foreground">Después de controles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">ROSI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPercentage(quantitativeResult.returnOnSecurityInvestment)}
                  </p>
                  <p className="text-xs text-muted-foreground">Retorno de Inversión</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Risk Reduction Progress */}
          {qualitativeResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reducción de Riesgo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Efectividad de los controles</span>
                    <span className="font-medium">
                      {formatPercentage(qualitativeResult.riskReduction)}
                    </span>
                  </div>
                  <Progress
                    value={qualitativeResult.riskReduction}
                    className="w-full h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Los controles reducen el riesgo en {formatPercentage(qualitativeResult.riskReduction)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {quantitativeResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Beneficio Económico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ahorro Anual</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(quantitativeResult.costAvoidance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ROI de Seguridad</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatPercentage(quantitativeResult.returnOnSecurityInvestment)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Datos de Entrada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Descripción:</p>
                  <p className="text-sm text-muted-foreground">{input.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Amenaza:</p>
                  <p className="text-sm text-muted-foreground">{input.threatDescription}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Vulnerabilidad:</p>
                  <p className="text-sm text-muted-foreground">{input.vulnerabilityDescription}</p>
                </div>
                {input.existingControls && input.existingControls.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Controles Existentes:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {input.existingControls.map((control, index) => (
                        <li key={index}>{control}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Impact Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Evaluación de Impacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidencialidad:</span>
                    <Badge variant="outline">{input.impactAssessment.confidentiality}/5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Integridad:</span>
                    <Badge variant="outline">{input.impactAssessment.integrity}/5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Disponibilidad:</span>
                    <Badge variant="outline">{input.impactAssessment.availability}/5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Calculations */}
          {qualitativeResult && (
            <Card>
              <CardHeader>
                <CardTitle>Cálculos Detallados - Método Cualitativo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Posición en Matriz de Riesgo</h4>
                    <p>Inherente: Probabilidad {qualitativeResult.matrixPosition.inherent.likelihood} × Impacto {qualitativeResult.matrixPosition.inherent.impact} = {qualitativeResult.inherentRiskScore}</p>
                    <p>Residual: Probabilidad {qualitativeResult.matrixPosition.residual.likelihood} × Impacto {qualitativeResult.matrixPosition.residual.impact} = {qualitativeResult.residualRiskScore}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Efectividad de Controles</h4>
                    <p>Reducción: {formatPercentage(qualitativeResult.riskReduction)}</p>
                    <p>El riesgo se redujo de {qualitativeResult.inherentRiskLevel} a {qualitativeResult.residualRiskLevel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {quantitativeResult && (
            <Card>
              <CardHeader>
                <CardTitle>Cálculos Detallados - Método Cuantitativo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium">Fórmulas Aplicadas:</h4>
                    <p>SLE = Valor del Activo × Factor de Exposición</p>
                    <p>ALE = SLE × Tasa Anual de Ocurrencia</p>
                    <p>Ahorro = ALE Inherente - ALE Residual</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Resultados:</h4>
                      <p>SLE: {formatCurrency(quantitativeResult.singleLossExpectancy)}</p>
                      <p>ALE Inherente: {formatCurrency(quantitativeResult.inherentALE)}</p>
                      <p>ALE Residual: {formatCurrency(quantitativeResult.residualALE)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Beneficios:</h4>
                      <p>Ahorro Anual: {formatCurrency(quantitativeResult.costAvoidance)}</p>
                      <p>ROSI: {formatPercentage(quantitativeResult.returnOnSecurityInvestment)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Acciones Recomendadas
              </CardTitle>
              <CardDescription>
                Recomendaciones basadas en el análisis de riesgo realizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedActions.map((action, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{action}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {input.proposedControls && input.proposedControls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Controles Propuestos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {input.proposedControls.map((control, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Shield className="w-4 h-4 mt-0.5 text-green-500" />
                      <span className="text-sm">{control}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
