import { onUnmounted } from 'vue'
import { useSimulationStore } from '@/stores/simulation'

export function useSimulationLoop() {
  const store = useSimulationStore()
  let raf = 0
  let last = 0
  let wearAccum = 0

  const loop = (time: number) => {
    const dt = last ? (time - last) / 1000 : 0
    last = time
    const clamped = Math.min(dt, 0.05)

    store.tick(clamped)

    if (store.state.running) {
      wearAccum += clamped
      if (wearAccum >= 0.4) {
        wearAccum = 0
        void store.refreshWear()
      }
    }

    raf = requestAnimationFrame(loop)
  }

  const start = () => {
    last = 0
    raf = requestAnimationFrame(loop)
  }

  const stop = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  onUnmounted(stop)

  return { start, stop }
}
