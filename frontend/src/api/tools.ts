import { request } from './client'
import type { Tool, ToolInput } from '@/types'

export function fetchTools(): Promise<Tool[]> {
  return request<Tool[]>('/tools')
}

export function fetchTool(id: number): Promise<Tool> {
  return request<Tool>(`/tools/${id}`)
}

export function createTool(data: ToolInput): Promise<Tool> {
  return request<Tool>('/tools', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteTool(id: number): Promise<void> {
  return request<void>(`/tools/${id}`, { method: 'DELETE' })
}
