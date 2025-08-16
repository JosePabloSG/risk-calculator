export type RiskLevel = 'Muy Bajo' | 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
export type CalculationMethod = 'qualitative' | 'quantitative'
export type ImpactDimension = 'confidentiality' | 'integrity' | 'availability'

export interface QualitativeInput {
  likelihood: number // 1-5 scale
  impact: number // 1-5 scale
  vulnerabilitySeverity: number // 1-10 scale (CVSS-like)
  controlEffectiveness: number // 0-100%
  detectionCapability: number // 1-5 scale
  responseCapability: number // 1-5 scale
}

export interface QuantitativeInput {
  assetValue: number // monetary value
  exposureFactor: number // 0-1 (percentage of asset value at risk)
  annualRateOfOccurrence: number // ARO - times per year
  controlEffectiveness: number // 0-100%
  detectionCapability: number // 1-5 scale
  responseCapability: number // 1-5 scale
}

export interface ImpactAssessment {
  confidentiality: number // 1-5 scale
  integrity: number // 1-5 scale
  availability: number // 1-5 scale
}

export interface RiskCalculationInput {
  id?: string
  name: string
  description: string
  assetName: string
  threatDescription: string
  vulnerabilityDescription: string
  method: CalculationMethod
  qualitativeData?: QualitativeInput
  quantitativeData?: QuantitativeInput
  impactAssessment: ImpactAssessment
  existingControls: string[]
  proposedControls: string[]
}

export interface QualitativeResult {
  inherentRiskScore: number
  residualRiskScore: number
  inherentRiskLevel: RiskLevel
  residualRiskLevel: RiskLevel
  riskReduction: number
  matrixPosition: {
    inherent: { likelihood: number; impact: number }
    residual: { likelihood: number; impact: number }
  }
}

export interface QuantitativeResult {
  singleLossExpectancy: number // SLE
  annualLossExpectancy: number // ALE
  inherentALE: number
  residualALE: number
  costAvoidance: number
  returnOnSecurityInvestment: number // ROSI
}

export interface RiskCalculationResult {
  id: string
  input: RiskCalculationInput
  qualitativeResult?: QualitativeResult
  quantitativeResult?: QuantitativeResult
  recommendedActions: string[]
  calculatedAt: Date
  riskTrend: 'increasing' | 'stable' | 'decreasing'
}

export interface RiskRegisterEntry {
  id: string
  name: string
  description: string
  assetName: string
  category: string
  inherentRiskLevel: RiskLevel
  residualRiskLevel: RiskLevel
  inherentRiskScore: number
  residualRiskScore: number
  probability: number
  impact: number
  owner: string
  status: 'open' | 'in-progress' | 'mitigated' | 'accepted' | 'transferred'
  treatmentPlan: string
  controls: string[]
  reviewDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface ExportOptions {
  format: 'csv' | 'json'
  includeCalculations: boolean
  includeRecommendations: boolean
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Risk Matrix Configuration
export const RISK_MATRIX_CONFIG = {
  size: 5,
  colors: {
    1: '#22c55e', // green-500 - Muy Bajo
    2: '#84cc16', // lime-500 - Bajo  
    3: '#eab308', // yellow-500 - Medio
    4: '#f97316', // orange-500 - Alto
    5: '#ef4444', // red-500 - Crítico
  },
  labels: {
    1: 'Muy Bajo',
    2: 'Bajo',
    3: 'Medio',
    4: 'Alto',
    5: 'Crítico',
  } as Record<number, RiskLevel>
}

// CVSS Severity Mapping
export const CVSS_SEVERITY_MAP = {
  1: 'Informacional',
  2: 'Informacional',
  3: 'Bajo',
  4: 'Bajo',
  5: 'Medio',
  6: 'Medio',
  7: 'Alto',
  8: 'Alto',
  9: 'Crítico',
  10: 'Crítico',
}
