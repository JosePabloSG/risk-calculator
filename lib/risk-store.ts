import { RiskRegisterEntry } from './types'

// In-memory storage for demo purposes
// In a real application, this would be replaced with a database
export const riskRegister: RiskRegisterEntry[] = []

export const addRisk = (risk: RiskRegisterEntry): void => {
  riskRegister.push(risk)
}

export const updateRisk = (riskId: string, updates: Partial<RiskRegisterEntry>): RiskRegisterEntry | null => {
  const index = riskRegister.findIndex(risk => risk.id === riskId)
  if (index === -1) return null

  riskRegister[index] = { ...riskRegister[index], ...updates, updatedAt: new Date() }
  return riskRegister[index]
}

export const deleteRisk = (riskId: string): RiskRegisterEntry | null => {
  const index = riskRegister.findIndex(risk => risk.id === riskId)
  if (index === -1) return null

  return riskRegister.splice(index, 1)[0]
}

export const findRisk = (riskId: string): RiskRegisterEntry | undefined => {
  return riskRegister.find(risk => risk.id === riskId)
}

export const getAllRisks = (): RiskRegisterEntry[] => {
  return [...riskRegister]
}
