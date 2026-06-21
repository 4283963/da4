import { request } from './client'
import type { CuttingParam, CuttingParamInput } from '@/types'

export function fetchCuttingParams(toolId?: number): Promise<CuttingParam[]> {
  const qs = toolId ? `?tool_id=${toolId}` : ''
  return request<CuttingParam[]>(`/cutting-params${qs}`)
}

export function createCuttingParam(data: CuttingParamInput): Promise<CuttingParam> {
  return request<CuttingParam>('/cutting-params', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteCuttingParam(id: number): Promise<void> {
  return request<void>(`/cutting-params/${id}`, { method: 'DELETE' })
}
