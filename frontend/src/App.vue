<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="flex flex-col h-full bg-base">
    <AppHeader />
    <main class="flex-1 min-h-0">
      <router-view />
    </main>
  </div>
</template>
