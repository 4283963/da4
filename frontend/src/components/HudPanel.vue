<script setup lang="ts">
import { computed } from 'vue'
import { MoveHorizontal, Timer, Gauge, AlertTriangle, ServerCog } from 'lucide-vue-next'
import { useSimulationStore } from '@/stores/simulation'

const store = useSimulationStore()
const state = store.state

const statusMeta = {
  normal: { text: '正常', color: 'text-cyan-tech', bar: 'bg-cyan-tech', ring: 'ring-cyan-tech/40' },
  warning: { text: '预警', color: 'text-warn', bar: 'bg-warn', ring: 'ring-warn/50' },
  critical: { text: '临界', color: 'text-danger', bar: 'bg-danger', ring: 'ring-danger/60' },
}
const status = computed(() => statusMeta[state.wear.status])
</script>

<template>
  <div class="panel overflow-hidden">
    <div class="flex items-center justify-between border-b border-base-border bg-base-elevated px-4 py-2.5">
      <div class="flex items-center gap-2">
        <Gauge :size="14" class="text-amber" />
        <span class="font-display text-xs uppercase tracking-widest text-ink">实时遥测</span>
      </div>
      <span
        class="chip ring-1"
        :class="[status.color, status.ring]"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="status.bar" :style="state.running ? 'animation: flicker 1s infinite' : ''" />
        {{ status.text }}
      </span>
    </div>

    <div class="space-y-3 p-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded bg-base-elevated p-3">
          <div class="flex items-center gap-1.5 label-cap">
            <MoveHorizontal :size="11" /> 进给位置
          </div>
          <div class="mt-1 font-mono text-xl text-ink">
            {{ state.feedPosition.toFixed(1) }}<span class="ml-1 text-[11px] text-ink-faint">mm</span>
          </div>
        </div>
        <div class="rounded bg-base-elevated p-3">
          <div class="flex items-center gap-1.5 label-cap">
            <Timer :size="11" /> 切削时长
          </div>
          <div class="mt-1 font-mono text-xl text-ink">
            {{ state.cuttingTime.toFixed(1) }}<span class="ml-1 text-[11px] text-ink-faint">s</span>
          </div>
        </div>
      </div>

      <div class="rounded bg-base-elevated p-3">
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-1.5 label-cap">
            <AlertTriangle :size="11" /> 后刀面磨损 VB
          </div>
          <span class="font-mono text-xs" :class="status.color">
            {{ state.wear.wear_value.toFixed(3) }} mm
          </span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-base-panel">
          <div
            class="h-full transition-all duration-200"
            :class="status.bar"
            :style="{ width: state.wear.wear_percent + '%' }"
          />
        </div>
        <div class="mt-1.5 flex justify-between font-mono text-[10px] text-ink-faint">
          <span>0</span>
          <span :class="status.color">{{ state.wear.wear_percent.toFixed(1) }}%</span>
          <span>0.3mm</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 font-mono text-[11px]">
        <div class="flex justify-between rounded bg-base-elevated px-3 py-2">
          <span class="text-ink-faint">主轴</span>
          <span class="text-ink">{{ state.params.spindleSpeed }} rpm</span>
        </div>
        <div class="flex justify-between rounded bg-base-elevated px-3 py-2">
          <span class="text-ink-faint">切深</span>
          <span class="text-ink">{{ state.params.depthOfCut.toFixed(2) }} mm</span>
        </div>
      </div>

      <div
        class="flex items-center gap-2 rounded px-2 py-1.5 font-mono text-[10px]"
        :class="state.backendError ? 'text-warn bg-warn/5' : 'text-cyan-tech bg-cyan-tech/5'"
      >
        <ServerCog :size="12" />
        <span v-if="state.backendError">后端离线 · 使用本地估算</span>
        <span v-else>FastAPI 已连接 · 磨损实时同步</span>
      </div>
    </div>
  </div>
</template>
