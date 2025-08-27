'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  FileText, 
  Shield, 
  TrendingUp, 
  Moon, 
  Sun,
  Info,
  ChevronRight
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

import { RiskInputForm, RiskResults, RiskMatrix } from '@/components/risk-calculator'
import { RiskRegisterTable } from '@/components/risk-register'
import { useRiskCalculation, useStoredCalculations } from '@/lib/hooks'
import { RiskCalculationInput, RiskCalculationResult } from '@/lib/types'

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [currentResult, setCurrentResult] = useState<RiskCalculationResult | null>(null)
  const [activeTab, setActiveTab] = useState('calculator')
  
  const riskCalculation = useRiskCalculation()
  const { storeCalculation, getStoredCalculations } = useStoredCalculations()

  const handleCalculateRisk = async (input: RiskCalculationInput) => {
    try {
      const result = await riskCalculation.mutateAsync(input)
      setCurrentResult(result)
      storeCalculation(result)
      setActiveTab('results')
      
      toast.success('Cálculo de riesgo completado exitosamente', {
        description: `Riesgo evaluado: ${result.input.name}`,
      })
    } catch (error) {
      toast.error('Error al calcular el riesgo', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  const storedCalculations = getStoredCalculations()
  

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Calculadora de Riesgo</h1>
                <p className="text-sm text-muted-foreground">Ciberseguridad</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden sm:flex">
                ISO 27005 / NIST SP 800-30
              </Badge>
              
              {/* Botón de prueba de Sentry */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  throw new Error('Test error for Sentry - Risk Calculator Test')
                }}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
              >
                Test Sentry
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Cambiar tema"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Info className="w-5 h-5" />
                Bienvenido a la Calculadora de Riesgo de Ciberseguridad
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-200">
                Herramienta profesional para evaluación y gestión de riesgos basada en metodologías estándar como ISO 27005 y NIST SP 800-30.
                Evalúe riesgos utilizando métodos cualitativos y cuantitativos con análisis comparativo inherente vs residual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Cálculo Preciso</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">Métodos cualitativo y cuantitativo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Análisis Visual</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">Matriz de riesgo interactiva</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Registro Completo</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">Gestión de registro de riesgos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Application Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Matriz
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Registro
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <RiskInputForm 
              onSubmit={handleCalculateRisk}
              isLoading={riskCalculation.isPending}
            />
            
            {/* Recent Calculations */}
            {storedCalculations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cálculos Recientes</CardTitle>
                  <CardDescription>
                    Acceso rápido a evaluaciones anteriores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {storedCalculations.slice(0, 5).map((calc) => (
                      <div 
                        key={calc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setCurrentResult(calc)
                          setActiveTab('results')
                        }}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{calc.input.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {calc.input.assetName} • {new Date(calc.calculatedAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {calc.input.method === 'qualitative' ? 'Cualitativo' : 'Cuantitativo'}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
        </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {currentResult ? (
              <RiskResults result={currentResult} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay resultados disponibles</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete un cálculo de riesgo para ver los resultados aquí
                  </p>
                  <Button onClick={() => setActiveTab('calculator')}>
                    Ir a la Calculadora
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Matrix Tab */}
          <TabsContent value="matrix" className="space-y-6">
            <RiskMatrix 
              qualitativeResult={currentResult?.qualitativeResult}
              showComparison={true}
            />
            
            {!currentResult?.qualitativeResult && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Matriz de Riesgo Vacía</h3>
                  <p className="text-muted-foreground mb-4">
                    Realice un cálculo cualitativo para visualizar el riesgo en la matriz
                  </p>
                  <Button onClick={() => setActiveTab('calculator')}>
                    Calcular Riesgo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-6">
            <RiskRegisterTable 
              risks={[]}
              isLoading={false}
              onEdit={() => {
                toast.info('Función de edición en desarrollo')
              }}
              onDelete={() => {
                toast.info('Función de eliminación en desarrollo')
              }}
              onView={() => {
                toast.info('Función de visualización en desarrollo')
              }}
              onExport={() => {
                toast.info('Función de exportación en desarrollo')
              }}
              onAddNew={() => {
                toast.info('Función de agregar nuevo en desarrollo')
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Calculadora de Riesgo
              </h3>
              <p className="text-sm text-muted-foreground">
                Herramienta profesional para la evaluación y gestión de riesgos de ciberseguridad, 
                basada en estándares internacionales como ISO 27005 y NIST SP 800-30.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Características</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Análisis cualitativo y cuantitativo</li>
                <li>• Matriz de riesgo interactiva</li>
                <li>• Comparación inherente vs residual</li>
                <li>• Registro de riesgos completo</li>
                <li>• Exportación CSV/JSON</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Metodologías</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ISO 27005:2018</li>
                <li>• NIST SP 800-30</li>
                <li>• Escala CVSS</li>
                <li>• Análisis ALE/SLE</li>
                <li>• Cálculo ROSI</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-4">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 Calculadora de Riesgo de Ciberseguridad. Desarrollada con Next.js y ShadCN.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}