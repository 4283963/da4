<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import NumberField from '@/components/NumberField.vue'
import { createTool } from '@/api/tools'
import type { ToolInput } from '@/types'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const blank = (): ToolInput => ({
  name: '',
  length: 40,
  width: 12,
  height: 16,
  material: '硬质合金',
})
const form = ref<ToolInput>(blank())
const saving = ref(false)
const error = ref('')

watch(
  () => props.open,
  (o) => {
    if (o) {
      form.value = blank()
      error.value = ''
    }
  },
)

async function submit() {
  saving.value = true
  error.value = ''
  try {
    await createTool(form.value)
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
          <h2 class="font-display text-lg tracking-wider text-ink">新增刀具</h2>
          <button class="text-ink-faint hover:text-ink" @click="emit('close')">
            <X :size="18" />
          </button>
        </div>
        <div class="space-y-4">
          <div class="space-y-1.5">
            <span class="label-cap">刀具名称</span>
            <input v-model="form.name" class="field-input" placeholder="例如：CNMG120408" />
          </div>
          <div class="grid grid-cols-3 gap-3">
            <NumberField label="长度" unit="mm" v-model="form.length" :min="1" :step="1" />
            <NumberField label="宽度" unit="mm" v-model="form.width" :min="1" :step="1" />
            <NumberField label="高度" unit="mm" v-model="form.height" :min="1" :step="1" />
          </div>
          <div class="space-y-1.5">
            <span class="label-cap">刀具材料</span>
            <select v-model="form.material" class="field-select">
              <option>硬质合金</option>
              <option>陶瓷</option>
              <option>立方氮化硼</option>
              <option>聚晶金刚石</option>
              <option>高速钢</option>
            </select>
          </div>
          <p v-if="error" class="font-mono text-xs text-danger">{{ error }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button class="btn-ghost" @click="emit('close')">取消</button>
            <button class="btn-primary" :disabled="saving || !form.name" @click="submit">
              {{ saving ? '保存中…' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
