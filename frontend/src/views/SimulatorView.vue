<script setup lang="ts">
import { onMounted } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import Scene3D from '@/components/Scene3D.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import HudPanel from '@/components/HudPanel.vue'
import TransportBar from '@/components/TransportBar.vue'
import { useSimulationLoop } from '@/composables/useSimulationLoop'
import { useSimulationStore } from '@/stores/simulation'

const { start } = useSimulationLoop()
const state = useSimulationStore().state
onMounted(start)
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-base">
    <div class="absolute inset-0 grid-texture opacity-60" />
    <div class="pointer-events-none absolute inset-0 noise-texture opacity-40" />

    <Scene3D />

    <div
      class="pointer-events-none absolute inset-0"
      style="box-shadow: inset 0 0 200px rgba(0, 0, 0, 0.75)"
    />

    <!-- decorative corner brackets -->
    <div class="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-amber/50" />
    <div class="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-amber/50" />
    <div class="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-amber/50" />
    <div class="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-amber/50" />

    <Transition name="alarm-pop">
      <div
        v-if="state.alarm"
        class="alarm-flicker pointer-events-none absolute left-4 top-16 z-20 flex items-center gap-2.5 rounded-md border border-danger/60 bg-danger/15 px-4 py-2.5 backdrop-blur-sm"
      >
        <AlertTriangle :size="18" class="text-danger" />
        <span class="font-display text-sm font-semibold tracking-wide text-danger text-glow-danger">
          刀具快磨没有了
        </span>
      </div>
    </Transition>

    <div
      class="absolute bottom-4 left-4 top-4 z-10 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col"
    >
      <ControlPanel />
    </div>

    <div class="absolute right-4 top-4 z-10 w-[300px] max-w-[calc(100vw-2rem)]">
      <HudPanel />
    </div>

    <TransportBar />
  </div>
</template>
