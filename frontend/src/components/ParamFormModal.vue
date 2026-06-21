<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import NumberField from '@/components/NumberField.vue'
import { createCuttingParam } from '@/api/cuttingParams'
import type { Tool, CuttingParamInput } from '@/types'

const props = defineProps<{ open: boolean; tools: Tool[] }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const blank = (): CuttingParamInput => ({
  tool_id: 0,
  cutting_speed: 120,
  feed_rate: 0.2,
  depth_of_cut: 1.0,
  spindle_speed: 1500,
})
const form = ref<CuttingParamInput>(blank())
const saving = ref(false)
const error = ref('')

watch(
  () => props.open,
  (o) => {
    if (o) {
      form.value = blank()
      form.value.tool_id = props.tools[0]?.id ?? 0
      error.value = ''
    }
  },
)

async function submit() {
  saving.value = true
  error.value = ''
  try {
    await createCuttingParam(form.value)
    emit('saved')
    emit('close')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="panel w-full max-w-md animate-rise p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-display text-lg tracking-wider text-ink">新增切削参数</h2>
          <button class="text-ink-faint hover:text-ink" @click="emit('close')">
            <X :size="18" />
          </button>
        </div>
        <div class="space-y-4">
          <div class="space-y-1.5">
            <span class="label-cap">关联刀具</span>
            <select v-model="form.tool_id" class="field-select">
              <option v-for="t in tools" :key="t.id" :value="t.id">
                #{{ t.id }} · {{ t.name }}
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <NumberField label="切削速度" unit="m/min" v-model="form.cutting_speed" :min="10" :max="600" :step="5" />
            <NumberField label="主轴转速" unit="rpm" v-model="form.spindle_speed" :min="100" :max="6000" :step="50" />
            <NumberField label="进给量" unit="mm/rev" v-model="form.feed_rate" :min="0.02" :max="1" :step="0.01" />
            <NumberField label="切深" unit="mm" v-model="form.depth_of_cut" :min="0.1" :max="6" :step="0.1" />
          </div>
          <p v-if="error" class="font-mono text-xs text-danger">{{ error }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button class="btn-ghost" @click="emit('close')">取消</button>
            <button class="btn-primary" :disabled="saving || !form.tool_id" @click="submit">
              {{ saving ? '保存中…' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
