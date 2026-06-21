<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { Cpu, Database, Activity } from 'lucide-vue-next'

const route = useRoute()
const nav = [
  { to: '/', label: '切削模拟', icon: Cpu },
  { to: '/database', label: '工艺数据库', icon: Database },
]
</script>

<template>
  <header
    class="relative z-30 flex h-14 items-center justify-between border-b border-base-border bg-base-panel px-5"
  >
    <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber/60 to-transparent" />
    <div class="flex items-center gap-3">
      <div
        class="grid h-8 w-8 place-items-center rounded-sm bg-amber text-black shadow-glow"
      >
        <Cpu :size="17" />
      </div>
      <div class="leading-none">
        <div class="font-display text-sm font-bold tracking-wider text-ink">
          WEAR-SIM <span class="text-amber">/</span> 刀具磨损模拟器
        </div>
        <div class="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          几何干涉三维全栈仿真平台
        </div>
      </div>
    </div>

    <nav class="flex items-center gap-1">
      <RouterLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2 border-b-2 px-3 py-2 font-display text-xs uppercase tracking-wider transition"
        :class="
          route.path === item.to
            ? 'border-amber text-amber'
            : 'border-transparent text-ink-muted hover:text-ink'
        "
      >
        <component :is="item.icon" :size="15" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div
      class="hidden items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-ink-faint md:flex"
    >
      <span class="flex items-center gap-1.5">
        <Activity :size="12" class="text-cyan-tech animate-flicker" />
        system online
      </span>
      <span>build 1.0</span>
    </div>
  </header>
</template>
