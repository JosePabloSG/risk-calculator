import {
  QualitativeInput,
  QuantitativeInput,
  QualitativeResult,
  QuantitativeResult,
  RiskLevel,
  ImpactAssessment
} from './types'

// Helper function to determine risk level from score
export const getRiskLevel = (score: number): RiskLevel => {
  if (score <= 5) return 'Muy Bajo'
  if (score <= 10) return 'Bajo'
  if (score <= 15) return 'Medio'
  if (score <= 20) return 'Alto'
  return 'Crítico'
}

// Helper function to get risk color
export const getRiskColor = (level: RiskLevel): string => {
  const colorMap = {
    'Muy Bajo': '#22c55e',
    'Bajo': '#84cc16',
    'Medio': '#eab308',
    'Alto': '#f97316',
    'Crítico': '#ef4444'
  }
  return colorMap[level]
}

// Calculate overall impact from multiple dimensions
export const calculateOverallImpact = (impact: ImpactAssessment): number => {
  const { confidentiality, integrity, availability } = impact
  // Use maximum impact as overall impact (worst case scenario)
  return Math.max(confidentiality, integrity, availability)
}

// Apply control effectiveness to reduce risk
export const applyControlEffectiveness = (
  baseScore: number,
  effectiveness: number
): number => {
  // Control effectiveness is a percentage (0-100)
  // Reduce risk proportionally to effectiveness
  const reductionFactor = effectiveness / 100
  return baseScore * (1 - reductionFactor)
}

// Qualitative Risk Calculation (ISO 27005 approach)
export const calculateQualitativeRisk = (
  input: QualitativeInput,
  impactAssessment: ImpactAssessment
): QualitativeResult => {
  const {
    likelihood,
    impact,
    vulnerabilitySeverity,
    controlEffectiveness,
    detectionCapability,
    responseCapability
  } = input

  // Calculate overall impact considering all dimensions
  const overallImpact = Math.max(impact, calculateOverallImpact(impactAssessment))

  // Adjust likelihood based on vulnerability severity
  const adjustedLikelihood = Math.min(5, likelihood + (vulnerabilitySeverity / 10) * 2)

  // Calculate inherent risk (before controls)
  const inherentRiskScore = adjustedLikelihood * overallImpact

  // Apply detection and response capabilities to control effectiveness
  const enhancedControlEffectiveness = Math.min(100,
    controlEffectiveness +
    (detectionCapability - 1) * 5 +
    (responseCapability - 1) * 5
  )

  // Calculate residual risk (after controls)
  const residualRiskScore = applyControlEffectiveness(
    inherentRiskScore,
    enhancedControlEffectiveness
  )

  // Determine risk levels
  const inherentRiskLevel = getRiskLevel(inherentRiskScore)
  const residualRiskLevel = getRiskLevel(residualRiskScore)

  // Calculate risk reduction percentage
  const riskReduction = ((inherentRiskScore - residualRiskScore) / inherentRiskScore) * 100

  return {
    inherentRiskScore: Math.round(inherentRiskScore * 100) / 100,
    residualRiskScore: Math.round(residualRiskScore * 100) / 100,
    inherentRiskLevel,
    residualRiskLevel,
    riskReduction: Math.round(riskReduction * 100) / 100,
    matrixPosition: {
      inherent: {
        likelihood: Math.round(adjustedLikelihood),
        impact: Math.round(overallImpact)
      },
      residual: {
        likelihood: Math.round(adjustedLikelihood * (1 - enhancedControlEffectiveness / 100)),
        impact: Math.round(overallImpact)
      }
    }
  }
}

// Quantitative Risk Calculation (NIST SP 800-30 approach)
export const calculateQuantitativeRisk = (
  input: QuantitativeInput
): QuantitativeResult => {
  const {
    assetValue,
    exposureFactor,
    annualRateOfOccurrence,
    controlEffectiveness,
    detectionCapability,
    responseCapability
  } = input

  // Single Loss Expectancy (SLE) = Asset Value × Exposure Factor
  const singleLossExpectancy = assetValue * exposureFactor

  // Annual Loss Expectancy (ALE) = SLE × Annual Rate of Occurrence (ARO)
  const inherentALE = singleLossExpectancy * annualRateOfOccurrence

  // Apply enhanced control effectiveness (including detection and response)
  const enhancedControlEffectiveness = Math.min(100,
    controlEffectiveness +
    (detectionCapability - 1) * 5 +
    (responseCapability - 1) * 5
  )

  // Calculate residual ALE after controls
  const residualALE = applyControlEffectiveness(inherentALE, enhancedControlEffectiveness)

  // Cost avoidance (benefit of controls)
  const costAvoidance = inherentALE - residualALE

  // Simplified ROSI calculation (assumes control cost is 10% of cost avoidance)
  const estimatedControlCost = costAvoidance * 0.1
  const returnOnSecurityInvestment = estimatedControlCost > 0
    ? ((costAvoidance - estimatedControlCost) / estimatedControlCost) * 100
    : 0

  return {
    singleLossExpectancy: Math.round(singleLossExpectancy * 100) / 100,
    annualLossExpectancy: Math.round(inherentALE * 100) / 100,
    inherentALE: Math.round(inherentALE * 100) / 100,
    residualALE: Math.round(residualALE * 100) / 100,
    costAvoidance: Math.round(costAvoidance * 100) / 100,
    returnOnSecurityInvestment: Math.round(returnOnSecurityInvestment * 100) / 100
  }
}

// Generate risk-based recommendations
export const generateRecommendations = (
  qualitativeResult?: QualitativeResult,
  quantitativeResult?: QuantitativeResult,
  method: 'qualitative' | 'quantitative' = 'qualitative'
): string[] => {
  const recommendations: string[] = []

  if (method === 'qualitative' && qualitativeResult) {
    const { residualRiskLevel, riskReduction } = qualitativeResult

    if (residualRiskLevel === 'Crítico') {
      recommendations.push('Implementar controles inmediatos - Riesgo crítico requiere acción urgente')
      recommendations.push('Escalar a la alta dirección para aprobación de recursos adicionales')
      recommendations.push('Considerar transferir el riesgo a través de seguros o terceros')
    } else if (residualRiskLevel === 'Alto') {
      recommendations.push('Planificar implementación de controles adicionales en el corto plazo')
      recommendations.push('Aumentar la frecuencia de monitoreo y revisión')
      recommendations.push('Desarrollar un plan de respuesta a incidentes específico')
    } else if (residualRiskLevel === 'Medio') {
      recommendations.push('Evaluar costo-beneficio de controles adicionales')
      recommendations.push('Mantener monitoreo regular del riesgo')
      recommendations.push('Documentar decisiones de aceptación de riesgo')
    }

    if (riskReduction < 50) {
      recommendations.push('Los controles actuales muestran efectividad limitada - revisar implementación')
      recommendations.push('Considerar controles alternativos o complementarios')
    }
  }

  if (method === 'quantitative' && quantitativeResult) {
    const { returnOnSecurityInvestment, costAvoidance } = quantitativeResult

    if (returnOnSecurityInvestment > 100) {
      recommendations.push('Excelente ROI en controles de seguridad - continuar inversión')
    } else if (returnOnSecurityInvestment > 0) {
      recommendations.push('ROI positivo - los controles son económicamente justificables')
    } else {
      recommendations.push('ROI negativo - evaluar controles más costo-efectivos')
    }

    if (costAvoidance > 100000) {
      recommendations.push('Alto potencial de ahorro - priorizar implementación de controles')
    }
  }

  // General recommendations
  recommendations.push('Programar revisión trimestral del riesgo y efectividad de controles')
  recommendations.push('Mantener documentación actualizada de todos los controles implementados')

  return recommendations
}

// Calculate risk matrix position
export const calculateMatrixPosition = (likelihood: number, impact: number): number => {
  // Ensure values are within 1-5 range
  const normalizedLikelihood = Math.max(1, Math.min(5, Math.round(likelihood)))
  const normalizedImpact = Math.max(1, Math.min(5, Math.round(impact)))

  return normalizedLikelihood * normalizedImpact
}

// Get risk matrix cell color
export const getMatrixCellColor = (likelihood: number, impact: number): string => {
  const score = calculateMatrixPosition(likelihood, impact)
  return getRiskColor(getRiskLevel(score))
}
