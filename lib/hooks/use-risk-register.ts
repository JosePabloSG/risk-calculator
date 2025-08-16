'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RiskRegisterEntry, ApiResponse } from '@/lib/types'

// API Functions
const fetchRisks = async (filters?: {
  search?: string
  status?: string
  category?: string
}): Promise<RiskRegisterEntry[]> => {
  const searchParams = new URLSearchParams()

  if (filters?.search) searchParams.set('search', filters.search)
  if (filters?.status) searchParams.set('status', filters.status)
  if (filters?.category) searchParams.set('category', filters.category)

  const response = await fetch(`/api/risks?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Error al obtener los riesgos')
  }

  const result: ApiResponse<RiskRegisterEntry[]> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Error en la respuesta del servidor')
  }

  return result.data
}

const createRisk = async (riskData: Omit<RiskRegisterEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskRegisterEntry> => {
  const response = await fetch('/api/risks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(riskData),
  })

  if (!response.ok) {
    const errorData: ApiResponse<null> = await response.json()
    throw new Error(errorData.error || 'Error al crear el riesgo')
  }

  const result: ApiResponse<RiskRegisterEntry> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Error en la respuesta del servidor')
  }

  return result.data
}

const updateRisk = async (riskId: string, updates: Partial<Omit<RiskRegisterEntry, 'id' | 'createdAt' | 'updatedAt'>>): Promise<RiskRegisterEntry> => {
  const response = await fetch(`/api/risks/${riskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const errorData: ApiResponse<null> = await response.json()
    throw new Error(errorData.error || 'Error al actualizar el riesgo')
  }

  const result: ApiResponse<RiskRegisterEntry> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Error en la respuesta del servidor')
  }

  return result.data
}

const deleteRisk = async (riskId: string): Promise<void> => {
  const response = await fetch(`/api/risks/${riskId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorData: ApiResponse<null> = await response.json()
    throw new Error(errorData.error || 'Error al eliminar el riesgo')
  }
}

const exportRisks = async (format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      format,
      includeCalculations: true,
      includeRecommendations: true,
    }),
  })

  if (!response.ok) {
    throw new Error('Error al exportar los datos')
  }

  return response.blob()
}

// Custom Hooks
export const useRisks = (filters?: {
  search?: string
  status?: string
  category?: string
}) => {
  return useQuery({
    queryKey: ['risks', filters],
    queryFn: () => fetchRisks(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useCreateRisk = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRisk,
    onSuccess: () => {
      // Invalidate and refetch risks
      queryClient.invalidateQueries({ queryKey: ['risks'] })
    },
    onError: (error) => {
      console.error('Error creating risk:', error)
    },
  })
}

export const useUpdateRisk = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ riskId, updates }: { riskId: string; updates: Partial<Omit<RiskRegisterEntry, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      updateRisk(riskId, updates),
    onSuccess: () => {
      // Invalidate and refetch risks
      queryClient.invalidateQueries({ queryKey: ['risks'] })
    },
    onError: (error) => {
      console.error('Error updating risk:', error)
    },
  })
}

export const useDeleteRisk = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRisk,
    onSuccess: () => {
      // Invalidate and refetch risks
      queryClient.invalidateQueries({ queryKey: ['risks'] })
    },
    onError: (error) => {
      console.error('Error deleting risk:', error)
    },
  })
}

export const useExportRisks = () => {
  return useMutation({
    mutationFn: exportRisks,
    onSuccess: (blob, format) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `registro-riesgos-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
    onError: (error) => {
      console.error('Error exporting risks:', error)
    },
  })
}
