export interface Tool {
  id: number
  name: string
  length: number
  width: number
  height: number
  material: string
  created_at: string
}

export interface CuttingParam {
  id: number
  tool_id: number
  cutting_speed: number
  feed_rate: number
  depth_of_cut: number
  spindle_speed: number
  created_at: string
}

export type WearStatus = 'normal' | 'warning' | 'critical'

export interface WearResponse {
  wear_value: number
  wear_percent: number
  status: WearStatus
}

export interface WearRequest {
  cutting_speed: number
  feed_rate: number
  depth_of_cut: number
  cutting_time: number
}

export type ToolInput = Omit<Tool, 'id' | 'created_at'>
export type CuttingParamInput = Omit<CuttingParam, 'id' | 'created_at'>
