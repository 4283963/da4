<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  Cpu,
  Gauge,
  Loader2,
  Database,
} from 'lucide-vue-next'
import { fetchTools, deleteTool } from '@/api/tools'
import { fetchCuttingParams, deleteCuttingParam } from '@/api/cuttingParams'
import { useSimulationStore } from '@/stores/simulation'
import ToolFormModal from '@/components/ToolFormModal.vue'
import ParamFormModal from '@/components/ParamFormModal.vue'
import type { Tool, CuttingParam } from '@/types'

const router = useRouter()
const store = useSimulationStore()

const tools = ref<Tool[]>([])
const params = ref<CuttingParam[]>([])
const loading = ref(false)
const toolModalOpen = ref(false)
const paramModalOpen = ref(false)
const error = ref('')

const toolName = (id: number) => tools.value.find((t) => t.id === id)?.name ?? `#${id}`

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [t, p] = await Promise.all([fetchTools(), fetchCuttingParams()])
    tools.value = t
    params.value = p
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
onMounted(load)

function loadTool(tool: Tool) {
  store.applyTool(tool)
  router.push('/')
}
function loadParam(cp: CuttingParam) {
  store.applyParam(cp)
  router.push('/')
}
async function removeTool(id: number) {
  await deleteTool(id)
  await load()
}
async function removeParam(id: number) {
  await deleteCuttingParam(id)
  await load()
}

const toolCount = computed(() => tools.value.length)
const paramCount = computed(() => params.value.length)
</script>

<template>
  <div class="h-full overflow-y-auto bg-base">
    <div class="grid-texture">
      <div class="mx-auto max-w-6xl px-6 py-8">
        <div class="mb-8 flex items-end justify-between">
          <div>
            <div class="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber">
              <Database :size="13" /> 工艺数据
            </div>
            <h1 class="font-display text-3xl font-bold tracking-wide text-ink">
              刀具与切削参数库
            </h1>
            <p class="mt-1 text-sm text-ink-muted">
              管理已存档的刀具尺寸与切削用量，一键载入三维模拟器验证磨损与干涉。
            </p>
          </div>
          <button class="btn-ghost" :disabled="loading" @click="load">
            <Loader2 v-if="loading" :size="15" class="animate-spin" />
            <RefreshCw v-else :size="15" /> 刷新
          </button>
        </div>

        <p v-if="error" class="mb-6 rounded border border-danger/40 bg-danger/10 p-3 font-mono text-xs text-danger">
          后端连接失败：{{ error }}（请确认 FastAPI 服务已启动）
        </p>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Tools -->
          <section class="panel">
            <div class="flex items-center justify-between border-b border-base-border bg-base-elevated px-4 py-3">
              <div class="flex items-center gap-2">
                <Cpu :size="15" class="text-amber" />
                <span class="font-display text-sm uppercase tracking-wider text-ink">刀具库</span>
                <span class="chip bg-base-panel text-ink-faint">{{ toolCount }}</span>
              </div>
              <button class="btn-primary !px-3 !py-1.5 !text-xs" @click="toolModalOpen = true">
                <Plus :size="13" /> 新增
              </button>
            </div>
            <div class="p-3">
              <div v-if="!tools.length && !loading" class="py-10 text-center font-mono text-xs text-ink-faint">
                暂无刀具记录，点击「新增」添加
              </div>
              <ul v-else class="space-y-2">
                <li
                  v-for="t in tools"
                  :key="t.id"
                  class="group flex items-center justify-between rounded border border-base-border bg-base-elevated px-3 py-2.5 transition hover:border-amber/40"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-[10px] text-ink-faint">#{{ t.id }}</span>
                      <span class="truncate font-display text-sm text-ink">{{ t.name }}</span>
                    </div>
                    <div class="mt-0.5 font-mono text-[11px] text-ink-muted">
                      {{ t.length }}×{{ t.width }}×{{ t.height }} mm · {{ t.material }}
                    </div>
                  </div>
                  <div class="flex shrink-0 items-center gap-1.5">
                    <button class="btn-ghost !px-2 !py-1.5 !text-[10px]" @click="loadTool(t)">
                      <Upload :size="12" /> 载入
                    </button>
                    <button class="btn-danger !px-2 !py-1.5" @click="removeTool(t.id)">
                      <Trash2 :size="12" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <!-- Cutting params -->
          <section class="panel">
            <div class="flex items-center justify-between border-b border-base-border bg-base-elevated px-4 py-3">
              <div class="flex items-center gap-2">
                <Gauge :size="15" class="text-cyan-tech" />
                <span class="font-display text-sm uppercase tracking-wider text-ink">切削参数库</span>
                <span class="chip bg-base-panel text-ink-faint">{{ paramCount }}</span>
              </div>
              <button
                class="btn-primary !px-3 !py-1.5 !text-xs"
                :disabled="!tools.length"
                @click="paramModalOpen = true"
              >
                <Plus :size="13" /> 新增
              </button>
            </div>
            <div class="p-3">
              <div v-if="!params.length && !loading" class="py-10 text-center font-mono text-xs text-ink-faint">
                暂无切削参数记录
              </div>
              <ul v-else class="space-y-2">
                <li
                  v-for="cp in params"
                  :key="cp.id"
                  class="group flex items-center justify-between rounded border border-base-border bg-base-elevated px-3 py-2.5 transition hover:border-cyan-tech/40"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-[10px] text-ink-faint">#{{ cp.id }}</span>
                      <span class="truncate font-display text-sm text-ink">{{ toolName(cp.tool_id) }}</span>
                    </div>
                    <div class="mt-0.5 font-mono text-[11px] text-ink-muted">
                      Vc {{ cp.cutting_speed }} · f {{ cp.feed_rate }} · ap {{ cp.depth_of_cut }} · n {{ cp.spindle_speed }}
                    </div>
                  </div>
                  <div class="flex shrink-0 items-center gap-1.5">
                    <button class="btn-ghost !px-2 !py-1.5 !text-[10px]" @click="loadParam(cp)">
                      <Upload :size="12" /> 载入
                    </button>
                    <button class="btn-danger !px-2 !py-1.5" @click="removeParam(cp.id)">
                      <Trash2 :size="12" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>

    <ToolFormModal :open="toolModalOpen" @close="toolModalOpen = false" @saved="load" />
    <ParamFormModal :open="paramModalOpen" :tools="tools" @close="paramModalOpen = false" @saved="load" />
  </div>
</template>
