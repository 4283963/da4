<script setup lang="ts">
defineProps<{
  label: string
  unit?: string
  min?: number
  max?: number
  step?: number
}>()
const model = defineModel<number>({ required: true })
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between">
      <span class="label-cap">{{ label }}</span>
      <span v-if="unit" class="font-mono text-[10px] text-ink-faint">{{ unit }}</span>
    </div>
    <input
      type="number"
      v-model.number="model"
      :min="min"
      :max="max"
      :step="step"
      class="field-input"
    />
  </div>
</template>
