'use client'

import { useMutation } from '@tanstack/react-query'
import { RiskCalculationInput, RiskCalculationResult, ApiResponse } from '@/lib/types'

// API Functions
const calculateRisk = async (input: RiskCalculationInput): Promise<RiskCalculationResult> => {
  try {
    console.log('Hook: Sending calculation request...')

    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    console.log('Hook: Response status:', response.status)
    console.log('Hook: Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.error('Hook: Response not OK, status:', response.status)

      // Try to get error details
      let errorMessage = `Error HTTP ${response.status}`
      try {
        const errorData: ApiResponse<null> = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (jsonError) {
        console.error('Hook: Failed to parse error response as JSON:', jsonError)
        // Try to get text response
        try {
          const errorText = await response.text()
          console.error('Hook: Error response text:', errorText)
          errorMessage = `Error del servidor: ${errorText.substring(0, 100)}...`
        } catch (textError) {
          console.error('Hook: Failed to get error text:', textError)
        }
      }

      throw new Error(errorMessage)
    }

    // Try to parse the response
    let result: ApiResponse<RiskCalculationResult>
    try {
      const responseText = await response.text()
      console.log('Hook: Response text (first 200 chars):', responseText.substring(0, 200))

      result = JSON.parse(responseText)
    } catch (jsonError) {
      console.error('Hook: Failed to parse response as JSON:', jsonError)
      throw new Error('La respuesta del servidor no es JSON válido')
    }

    if (!result.success || !result.data) {
      console.error('Hook: API response indicates failure:', result)
      throw new Error(result.error || 'Error en la respuesta del servidor')
    }

    console.log('Hook: Calculation successful, result ID:', result.data.id)
    return result.data

  } catch (error) {
    console.error('Hook: Error in calculateRisk:', error)
    throw error
  }
}

// Custom Hooks
export const useRiskCalculation = () => {
  return useMutation({
    mutationFn: calculateRisk,
    onError: (error) => {
      console.error('Error calculating risk:', error)
    },
  })
}

// Helper function to convert dates back to Date objects
const parseStoredCalculation = (stored: Record<string, unknown>): RiskCalculationResult => {
  try {
    return {
      ...stored,
      calculatedAt: stored.calculatedAt ? new Date(stored.calculatedAt as string) : new Date(),
      input: stored.input as RiskCalculationInput,
      id: stored.id as string,
      qualitativeResult: stored.qualitativeResult,
      quantitativeResult: stored.quantitativeResult,
      recommendedActions: stored.recommendedActions as string[],
      riskTrend: stored.riskTrend as 'increasing' | 'stable' | 'decreasing'
    } as RiskCalculationResult
  } catch (error) {
    console.error('Error parsing stored calculation:', error)
    // Return with current date if parsing fails
    return {
      ...stored,
      calculatedAt: new Date(),
      input: stored.input as RiskCalculationInput,
      id: stored.id as string,
      qualitativeResult: stored.qualitativeResult,
      quantitativeResult: stored.quantitativeResult,
      recommendedActions: stored.recommendedActions as string[],
      riskTrend: stored.riskTrend as 'increasing' | 'stable' | 'decreasing'
    } as RiskCalculationResult
  }
}

// Store calculated results in localStorage
export const useStoredCalculations = () => {
  const getStoredCalculations = (): RiskCalculationResult[] => {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem('risk-calculations')
      if (!stored) return []

      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed.map(parseStoredCalculation) : []
    } catch (error) {
      console.error('Error loading stored calculations:', error)
      return []
    }
  }

  const storeCalculation = (calculation: RiskCalculationResult) => {
    if (typeof window === 'undefined') return

    try {
      const existing = getStoredCalculations()
      const updated = [calculation, ...existing].slice(0, 50) // Keep last 50
      localStorage.setItem('risk-calculations', JSON.stringify(updated))
    } catch (error) {
      console.error('Error storing calculation:', error)
    }
  }

  const clearStoredCalculations = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('risk-calculations')
  }

  return {
    getStoredCalculations,
    storeCalculation,
    clearStoredCalculations,
  }
}
