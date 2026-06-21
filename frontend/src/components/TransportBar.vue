<script setup lang="ts">
import { Play, Pause, RotateCcw } from 'lucide-vue-next'
import { useSimulationStore } from '@/stores/simulation'

const store = useSimulationStore()
const state = store.state
</script>

<template>
  <div
    class="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-md border border-base-border bg-base-panel/90 px-3 py-2 shadow-panel backdrop-blur"
  >
    <button v-if="!state.running" class="btn-primary" @click="store.start()">
      <Play :size="15" /> 开始切削
    </button>
    <button v-else class="btn-ghost" @click="store.pause()">
      <Pause :size="15" /> 暂停
    </button>
    <button class="btn-ghost" @click="store.reset()">
      <RotateCcw :size="15" /> 重置
    </button>

    <div class="h-6 w-px bg-base-border" />

    <div class="w-44">
      <div class="mb-1 flex justify-between font-mono text-[10px] text-ink-faint">
        <span>切削进度</span>
        <span>{{ Math.round(state.progress * 100) }}%</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-base-elevated">
        <div
          class="h-full bg-amber transition-all duration-150"
          :style="{ width: state.progress * 100 + '%' }"
        />
      </div>
    </div>
  </div>
</template>
