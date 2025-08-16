'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, TrendingUp, DollarSign } from 'lucide-react'
import { RiskCalculationInput, CalculationMethod } from '@/lib/types'

// Validation schema
const riskInputSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  assetName: z.string().min(1, 'El nombre del activo es requerido'),
  threatDescription: z.string().min(1, 'La descripción de la amenaza es requerida'),
  vulnerabilityDescription: z.string().min(1, 'La descripción de la vulnerabilidad es requerida'),
  method: z.enum(['qualitative', 'quantitative']),

  // Qualitative fields
  likelihood: z.number().min(1).max(5).optional(),
  impact: z.number().min(1).max(5).optional(),
  vulnerabilitySeverity: z.number().min(1).max(10).optional(),
  controlEffectiveness: z.number().min(0).max(100).optional(),
  detectionCapability: z.number().min(1).max(5).optional(),
  responseCapability: z.number().min(1).max(5).optional(),

  // Quantitative fields
  assetValue: z.number().min(0).optional(),
  exposureFactor: z.number().min(0).max(1).optional(),
  annualRateOfOccurrence: z.number().min(0).optional(),

  // Impact assessment
  confidentiality: z.number().min(1).max(5),
  integrity: z.number().min(1).max(5),
  availability: z.number().min(1).max(5),

  // Controls
  existingControls: z.array(z.string()).optional(),
  proposedControls: z.array(z.string()).optional(),
})

type RiskInputFormData = z.infer<typeof riskInputSchema>

interface RiskInputFormProps {
  onSubmit: (data: RiskCalculationInput) => void
  isLoading?: boolean
}

export const RiskInputForm = ({ onSubmit, isLoading = false }: RiskInputFormProps) => {
  const [method, setMethod] = useState<CalculationMethod>('qualitative')
  const [existingControlsText, setExistingControlsText] = useState('')
  const [proposedControlsText, setProposedControlsText] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // watch,
    reset
  } = useForm<RiskInputFormData>({
    resolver: zodResolver(riskInputSchema),
    defaultValues: {
      method: 'qualitative',
      likelihood: 3,
      impact: 3,
      vulnerabilitySeverity: 5,
      controlEffectiveness: 50,
      detectionCapability: 3,
      responseCapability: 3,
      assetValue: 100000,
      exposureFactor: 0.5,
      annualRateOfOccurrence: 1,
      confidentiality: 3,
      integrity: 3,
      availability: 3,
    }
  })

  const handleMethodChange = (newMethod: string) => {
    const calculationMethod = newMethod as CalculationMethod
    setMethod(calculationMethod)
    setValue('method', calculationMethod)
  }

  const handleFormSubmit = (data: RiskInputFormData) => {
    // Parse controls text into arrays
    const existingControls = existingControlsText
      .split('\n')
      .map(control => control.trim())
      .filter(control => control.length > 0)

    const proposedControls = proposedControlsText
      .split('\n')
      .map(control => control.trim())
      .filter(control => control.length > 0)

    // Build the calculation input
    const calculationInput: RiskCalculationInput = {
      name: data.name,
      description: data.description,
      assetName: data.assetName,
      threatDescription: data.threatDescription,
      vulnerabilityDescription: data.vulnerabilityDescription,
      method: data.method,
      impactAssessment: {
        confidentiality: data.confidentiality,
        integrity: data.integrity,
        availability: data.availability,
      },
      existingControls,
      proposedControls,
    }

    // Add method-specific data
    if (data.method === 'qualitative') {
      calculationInput.qualitativeData = {
        likelihood: data.likelihood!,
        impact: data.impact!,
        vulnerabilitySeverity: data.vulnerabilitySeverity!,
        controlEffectiveness: data.controlEffectiveness!,
        detectionCapability: data.detectionCapability!,
        responseCapability: data.responseCapability!,
      }
    } else {
      calculationInput.quantitativeData = {
        assetValue: data.assetValue!,
        exposureFactor: data.exposureFactor!,
        annualRateOfOccurrence: data.annualRateOfOccurrence!,
        controlEffectiveness: data.controlEffectiveness!,
        detectionCapability: data.detectionCapability!,
        responseCapability: data.responseCapability!,
      }
    }

    onSubmit(calculationInput)
  }

  const handleReset = () => {
    reset()
    setExistingControlsText('')
    setProposedControlsText('')
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculadora de Riesgo de Ciberseguridad
        </CardTitle>
        <CardDescription>
          Complete los campos para evaluar el riesgo utilizando metodologías cualitativas o cuantitativas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Riesgo *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="ej. Brecha de datos por acceso no autorizado"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetName">Activo Afectado *</Label>
              <Input
                id="assetName"
                {...register('assetName')}
                placeholder="ej. Base de datos de clientes"
                aria-describedby={errors.assetName ? 'asset-error' : undefined}
              />
              {errors.assetName && (
                <p id="asset-error" className="text-sm text-red-600" role="alert">
                  {errors.assetName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción detallada del escenario de riesgo..."
              rows={3}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-red-600" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threatDescription">Descripción de la Amenaza *</Label>
              <Textarea
                id="threatDescription"
                {...register('threatDescription')}
                placeholder="ej. Ciberatacante externo con capacidades avanzadas"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vulnerabilityDescription">Descripción de la Vulnerabilidad *</Label>
              <Textarea
                id="vulnerabilityDescription"
                {...register('vulnerabilityDescription')}
                placeholder="ej. Falta de autenticación multifactor"
                rows={2}
              />
            </div>
          </div>

          {/* Method Selection */}
          <div className="space-y-4">
            <Label>Método de Cálculo</Label>
            <Tabs value={method} onValueChange={handleMethodChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qualitative" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Cualitativo
                </TabsTrigger>
                <TabsTrigger value="quantitative" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Cuantitativo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qualitative" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="likelihood">Probabilidad (1-5)</Label>
                    <Input
                      id="likelihood"
                      type="number"
                      min="1"
                      max="5"
                      {...register('likelihood', { valueAsNumber: true })}
                    />
                    <p className="text-xs text-muted-foreground">1=Muy Baja, 5=Muy Alta</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="impact">Impacto (1-5)</Label>
                    <Input
                      id="impact"
                      type="number"
                      min="1"
                      max="5"
                      {...register('impact', { valueAsNumber: true })}
                    />
                    <p className="text-xs text-muted-foreground">1=Mínimo, 5=Catastrófico</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vulnerabilitySeverity">Severidad Vulnerabilidad (1-10)</Label>
                    <Input
                      id="vulnerabilitySeverity"
                      type="number"
                      min="1"
                      max="10"
                      {...register('vulnerabilitySeverity', { valueAsNumber: true })}
                    />
                    <p className="text-xs text-muted-foreground">Basado en escala CVSS</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quantitative" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assetValue">Valor del Activo ($)</Label>
                    <Input
                      id="assetValue"
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('assetValue', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exposureFactor">Factor de Exposición (0-1)</Label>
                    <Input
                      id="exposureFactor"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      {...register('exposureFactor', { valueAsNumber: true })}
                    />
                    <p className="text-xs text-muted-foreground">% del valor del activo en riesgo</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualRateOfOccurrence">Tasa Anual de Ocurrencia</Label>
                    <Input
                      id="annualRateOfOccurrence"
                      type="number"
                      min="0"
                      step="0.1"
                      {...register('annualRateOfOccurrence', { valueAsNumber: true })}
                    />
                    <p className="text-xs text-muted-foreground">Veces por año que puede ocurrir</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Common Controls Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="controlEffectiveness">Efectividad de Controles (%)</Label>
              <Input
                id="controlEffectiveness"
                type="number"
                min="0"
                max="100"
                {...register('controlEffectiveness', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detectionCapability">Capacidad de Detección (1-5)</Label>
              <Input
                id="detectionCapability"
                type="number"
                min="1"
                max="5"
                {...register('detectionCapability', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseCapability">Capacidad de Respuesta (1-5)</Label>
              <Input
                id="responseCapability"
                type="number"
                min="1"
                max="5"
                {...register('responseCapability', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Impact Assessment */}
          <div className="space-y-4">
            <Label>Evaluación de Impacto por Dimensión</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confidentiality">Confidencialidad (1-5)</Label>
                <Input
                  id="confidentiality"
                  type="number"
                  min="1"
                  max="5"
                  {...register('confidentiality', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="integrity">Integridad (1-5)</Label>
                <Input
                  id="integrity"
                  type="number"
                  min="1"
                  max="5"
                  {...register('integrity', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Disponibilidad (1-5)</Label>
                <Input
                  id="availability"
                  type="number"
                  min="1"
                  max="5"
                  {...register('availability', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="existingControls">Controles Existentes</Label>
              <Textarea
                id="existingControls"
                value={existingControlsText}
                onChange={(e) => setExistingControlsText(e.target.value)}
                placeholder="Un control por línea..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposedControls">Controles Propuestos</Label>
              <Textarea
                id="proposedControls"
                value={proposedControlsText}
                onChange={(e) => setProposedControlsText(e.target.value)}
                placeholder="Un control por línea..."
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? 'Calculando...' : 'Calcular Riesgo'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 sm:flex-none"
            >
              Limpiar Formulario
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
