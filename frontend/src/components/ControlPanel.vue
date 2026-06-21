<script setup lang="ts">
import { ref } from 'vue'
import { Save, Loader2, Check, Ruler, Settings2, Boxes } from 'lucide-vue-next'
import NumberField from '@/components/NumberField.vue'
import { useSimulationStore } from '@/stores/simulation'
import { createTool } from '@/api/tools'
import { createCuttingParam } from '@/api/cuttingParams'

const store = useSimulationStore()
const state = store.state

const saving = ref(false)
const saved = ref(false)
const errorMsg = ref('')

async function saveToDb() {
  saving.value = true
  saved.value = false
  errorMsg.value = ''
  try {
    const tool = await createTool({
      name: `${state.params.material} ${state.params.toolLength}×${state.params.toolWidth}×${state.params.toolHeight}`,
      length: state.params.toolLength,
      width: state.params.toolWidth,
      height: state.params.toolHeight,
      material: state.params.material,
    })
    await createCuttingParam({
      tool_id: tool.id,
      cutting_speed: state.params.cuttingSpeed,
      feed_rate: state.params.feedRate,
      depth_of_cut: state.params.depthOfCut,
      spindle_speed: state.params.spindleSpeed,
    })
    state.loadedToolId = tool.id
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (e) {
    errorMsg.value = (e as Error).message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="panel flex h-full flex-col">
    <div class="border-b border-base-border bg-base-elevated px-4 py-2.5">
      <div class="flex items-center gap-2">
        <Settings2 :size="14" class="text-amber" />
        <span class="font-display text-xs uppercase tracking-widest text-ink">工艺参数</span>
      </div>
    </div>

    <div class="flex-1 space-y-5 overflow-y-auto p-4">
      <section>
        <div class="mb-2.5 flex items-center gap-1.5">
          <Ruler :size="12" class="text-cyan-tech" />
          <span class="label-cap">刀具几何</span>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <NumberField label="长度" unit="mm" v-model="state.params.toolLength" :min="5" :max="120" :step="1" />
          <NumberField label="宽度" unit="mm" v-model="state.params.toolWidth" :min="2" :max="40" :step="1" />
          <NumberField label="高度" unit="mm" v-model="state.params.toolHeight" :min="4" :max="60" :step="1" />
        </div>
        <div class="mt-3 space-y-1.5">
          <span class="label-cap">刀具材料</span>
          <select v-model="state.params.material" class="field-select">
            <option>硬质合金</option>
            <option>陶瓷</option>
            <option>立方氮化硼</option>
            <option>聚晶金刚石</option>
            <option>高速钢</option>
          </select>
        </div>
      </section>

      <div class="h-px bg-base-line" />

      <section>
        <div class="mb-2.5 flex items-center gap-1.5">
          <Boxes :size="12" class="text-cyan-tech" />
          <span class="label-cap">切削用量</span>
        </div>
        <div class="space-y-3">
          <NumberField label="切削速度 Vc" unit="m/min" v-model="state.params.cuttingSpeed" :min="10" :max="600" :step="5" />
          <NumberField label="进给量 f" unit="mm/rev" v-model="state.params.feedRate" :min="0.02" :max="1" :step="0.01" />
          <NumberField label="切深 ap" unit="mm" v-model="state.params.depthOfCut" :min="0.1" :max="6" :step="0.1" />
          <NumberField label="主轴转速 n" unit="rpm" v-model="state.params.spindleSpeed" :min="100" :max="6000" :step="50" />
        </div>
      </section>
    </div>

    <div class="border-t border-base-border p-3">
      <button class="btn-ghost w-full" :disabled="saving" @click="saveToDb">
        <Loader2 v-if="saving" :size="15" class="animate-spin" />
        <Check v-else-if="saved" :size="15" class="text-cyan-tech" />
        <Save v-else :size="15" />
        {{ saving ? '保存中…' : saved ? '已保存到数据库' : '存入工艺数据库' }}
      </button>
      <p v-if="errorMsg" class="mt-2 font-mono text-[10px] text-danger">{{ errorMsg }}</p>
    </div>
  </div>
</template>
