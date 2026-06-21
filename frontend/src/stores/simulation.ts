import { reactive, computed } from 'vue'
import { estimateWear } from '@/api/simulation'
import type { Tool, CuttingParam, WearResponse, WearStatus } from '@/types'

export interface SimParams {
  toolLength: number
  toolWidth: number
  toolHeight: number
  material: string
  cuttingSpeed: number
  feedRate: number
  depthOfCut: number
  spindleSpeed: number
}

interface SimState {
  params: SimParams
  running: boolean
  finished: boolean
  progress: number
  cuttingTime: number
  feedPosition: number
  totalDuration: number
  partLength: number
  partRadius: number
  wear: WearResponse
  loadedToolId: number | null
  loadedParamId: number | null
  backendError: string | null
}

const state = reactive<SimState>({
  params: {
    toolLength: 40,
    toolWidth: 12,
    toolHeight: 16,
    material: '硬质合金',
    cuttingSpeed: 120,
    feedRate: 0.2,
    depthOfCut: 1.0,
    spindleSpeed: 1500,
  },
  running: false,
  finished: false,
  progress: 0,
  cuttingTime: 0,
  feedPosition: 0,
  totalDuration: 14,
  partLength: 120,
  partRadius: 28,
  wear: { wear_value: 0, wear_percent: 0, status: 'normal' },
  loadedToolId: null,
  loadedParamId: null,
  backendError: null,
})

function localWear(t: number, p: SimParams): WearResponse {
  const vb = 0.0009 * p.cuttingSpeed * Math.sqrt(p.feedRate) * Math.sqrt(p.depthOfCut) * t
  const pct = Math.min(100, (vb / 0.3) * 100)
  const status: WearStatus = pct < 60 ? 'normal' : pct < 90 ? 'warning' : 'critical'
  return {
    wear_value: Number(vb.toFixed(4)),
    wear_percent: Number(pct.toFixed(1)),
    status,
  }
}

async function refreshWear(): Promise<void> {
  try {
    const res = await estimateWear({
      cutting_speed: state.params.cuttingSpeed,
      feed_rate: state.params.feedRate,
      depth_of_cut: state.params.depthOfCut,
      cutting_time: state.cuttingTime,
    })
    state.wear = res
    state.backendError = null
  } catch (e) {
    state.wear = localWear(state.cuttingTime, state.params)
    state.backendError = (e as Error).message
  }
}

function tick(dt: number): void {
  if (!state.running) return
  state.cuttingTime += dt
  state.progress = Math.min(1, state.cuttingTime / state.totalDuration)
  state.feedPosition = state.progress * state.partLength
  if (state.cuttingTime >= state.totalDuration) {
    state.cuttingTime = state.totalDuration
    state.progress = 1
    state.feedPosition = state.partLength
    state.running = false
    state.finished = true
    void refreshWear()
  }
}

function start(): void {
  if (state.finished) reset()
  state.running = true
}

function pause(): void {
  state.running = false
}

function reset(): void {
  state.running = false
  state.finished = false
  state.cuttingTime = 0
  state.progress = 0
  state.feedPosition = 0
  state.wear = { wear_value: 0, wear_percent: 0, status: 'normal' }
  state.backendError = null
}

function applyTool(tool: Tool): void {
  state.params.toolLength = tool.length
  state.params.toolWidth = tool.width
  state.params.toolHeight = tool.height
  state.params.material = tool.material
  state.loadedToolId = tool.id
  reset()
}

function applyParam(cp: CuttingParam): void {
  state.params.cuttingSpeed = cp.cutting_speed
  state.params.feedRate = cp.feed_rate
  state.params.depthOfCut = cp.depth_of_cut
  state.params.spindleSpeed = cp.spindle_speed
  state.loadedParamId = cp.id
  reset()
}

function setParam<K extends keyof SimParams>(key: K, value: SimParams[K]): void {
  state.params[key] = value
}

export function useSimulationStore() {
  return {
    state,
    isRunning: computed(() => state.running),
    isFinished: computed(() => state.finished),
    wearStatus: computed(() => state.wear.status),
    start,
    pause,
    reset,
    tick,
    refreshWear,
    applyTool,
    applyParam,
    setParam,
    localWear,
  }
}
