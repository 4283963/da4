import { request } from './client'
import type { WearRequest, WearResponse } from '@/types'

export function estimateWear(data: WearRequest): Promise<WearResponse> {
  return request<WearResponse>('/simulation/wear', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
