'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Download,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  AlertTriangle
} from 'lucide-react'
import { RiskRegisterEntry } from '@/lib/types'
import { getRiskColor } from '@/lib/risk-calculations'

interface RiskRegisterTableProps {
  risks: RiskRegisterEntry[]
  isLoading?: boolean
  onEdit?: (risk: RiskRegisterEntry) => void
  onDelete?: (riskId: string) => void
  onView?: (risk: RiskRegisterEntry) => void
  onExport?: () => void
  onAddNew?: () => void
}

export const RiskRegisterTable = ({
  risks,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onExport,
  onAddNew
}: RiskRegisterTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Filter risks based on search and filters
  const filteredRisks = risks.filter(risk => {
    const matchesSearch = searchTerm === '' ||
      risk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.assetName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || risk.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(risks.map(risk => risk.category)))

  // Status options
  const statusOptions = [
    { value: 'open', label: 'Abierto' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'mitigated', label: 'Mitigado' },
    { value: 'accepted', label: 'Aceptado' },
    { value: 'transferred', label: 'Transferido' }
  ]

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'open': { label: 'Abierto', variant: 'destructive' as const },
      'in-progress': { label: 'En Progreso', variant: 'default' as const },
      'mitigated': { label: 'Mitigado', variant: 'secondary' as const },
      'accepted': { label: 'Aceptado', variant: 'outline' as const },
      'transferred': { label: 'Transferido', variant: 'secondary' as const },
    }

    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES')
  }

  const getRiskTrendIcon = (inherentScore: number, residualScore: number) => {
    const reduction = ((inherentScore - residualScore) / inherentScore) * 100

    if (reduction > 50) {
      return (
        <div title="Riesgo bajo control">
          <AlertTriangle className="w-4 h-4 text-green-500" />
        </div>
      )
    } else if (reduction > 25) {
      return (
        <div title="Riesgo parcialmente controlado">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        </div>
      )
    } else {
      return (
        <div title="Riesgo necesita atención">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
      )
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Cargando registro de riesgos...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Registro de Riesgos</CardTitle>
            <CardDescription>
              Gestión centralizada de todos los riesgos identificados
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
            {onAddNew && (
              <Button size="sm" onClick={onAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Riesgo
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar riesgos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Riesgo</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-center">Inherente</TableHead>
                <TableHead className="text-center">Residual</TableHead>
                <TableHead className="text-center">Tendencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Revisión</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                      ? 'No se encontraron riesgos que coincidan con los filtros aplicados'
                      : 'No hay riesgos registrados. Comience agregando un nuevo riesgo.'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredRisks.map((risk) => (
                  <TableRow key={risk.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{risk.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {risk.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{risk.assetName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {risk.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          style={{
                            backgroundColor: getRiskColor(risk.inherentRiskLevel),
                            color: 'white'
                          }}
                          className="text-xs"
                        >
                          {risk.inherentRiskLevel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {risk.inherentRiskScore}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          style={{
                            backgroundColor: getRiskColor(risk.residualRiskLevel),
                            color: 'white'
                          }}
                          className="text-xs"
                        >
                          {risk.residualRiskLevel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {risk.residualRiskScore}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getRiskTrendIcon(risk.inherentRiskScore, risk.residualRiskScore)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(risk.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{risk.owner}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(risk.reviewDate)}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(risk)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(risk)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(risk.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        {filteredRisks.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium">{filteredRisks.length}</p>
                <p className="text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-red-600">
                  {filteredRisks.filter(r => r.residualRiskLevel === 'Crítico' || r.residualRiskLevel === 'Alto').length}
                </p>
                <p className="text-muted-foreground">Alto/Crítico</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-orange-600">
                  {filteredRisks.filter(r => r.status === 'open').length}
                </p>
                <p className="text-muted-foreground">Abiertos</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-600">
                  {filteredRisks.filter(r => r.status === 'mitigated').length}
                </p>
                <p className="text-muted-foreground">Mitigados</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
