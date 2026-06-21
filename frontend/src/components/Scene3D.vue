<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useSimulationStore } from '@/stores/simulation'

// 兜底：把 THREE 暴露到全局，避免 examples/addons 内部兼容性代码报 "THREE is not defined"
;(window as any).THREE = THREE

const U = 0.1
const MAX_SPARKS = 240

const containerRef = ref<HTMLDivElement | null>(null)
const store = useSimulationStore()
const state = store.state

let renderer!: THREE.WebGLRenderer
let scene!: THREE.Scene
let camera!: THREE.PerspectiveCamera
let controls!: OrbitControls
let clock!: THREE.Clock

let holder!: THREE.Group
let workpiece!: THREE.Mesh
let toolGroup!: THREE.Group
let shank!: THREE.Mesh
let insert!: THREE.Mesh
let insertMat!: THREE.MeshStandardMaterial
let tipLight!: THREE.PointLight
let groove!: THREE.Mesh
let grooveMat!: THREE.MeshBasicMaterial
let sparks!: THREE.Points
let sparkMat!: THREE.PointsMaterial
const sparkVel: THREE.Vector3[] = []
const sparkLife: number[] = new Array(MAX_SPARKS).fill(0)
let sparkCursor = 0
let workpieceAngle = 0
let resizeObs!: ResizeObserver

const colFresh = new THREE.Color(0x66e0ff)
const colMid = new THREE.Color(0xff7a1a)
const colCrit = new THREE.Color(0xff3b3b)

function makeSparkTexture(): THREE.Texture {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.3, 'rgba(255,200,120,0.9)')
  g.addColorStop(1, 'rgba(255,122,26,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}

function buildToolGeometry(): void {
  const tl = state.params.toolLength * U
  const tw = state.params.toolWidth * U
  const th = state.params.toolHeight * U
  const insertH = th * 0.22
  const shankH = th * 0.78
  shank.geometry.dispose()
  shank.geometry = new THREE.BoxGeometry(tl, shankH, tw)
  shank.position.set(0, insertH + shankH / 2, 0)
  insert.geometry.dispose()
  insert.geometry = new THREE.BoxGeometry(tl * 0.55, insertH, tw)
  insert.position.set(0, insertH / 2, 0)
}

function setup(): void {
  const el = containerRef.value!
  const w = el.clientWidth || 800
  const h = el.clientHeight || 600

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  el.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0b0f14)
  scene.fog = new THREE.Fog(0x0b0f14, 30, 78)

  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 220)
  camera.position.set(7, 7.5, 21)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.target.set(0, 0, 0)
  controls.minDistance = 8
  controls.maxDistance = 60
  controls.maxPolarAngle = Math.PI * 0.52

  clock = new THREE.Clock()

  scene.add(new THREE.AmbientLight(0x4a5566, 0.55))
  const dir = new THREE.DirectionalLight(0xdfefff, 1.2)
  dir.position.set(12, 22, 14)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  dir.shadow.camera.near = 1
  dir.shadow.camera.far = 60
  dir.shadow.camera.left = -22
  dir.shadow.camera.right = 22
  dir.shadow.camera.top = 22
  dir.shadow.camera.bottom = -22
  scene.add(dir)
  const rim = new THREE.DirectionalLight(0x36d6e7, 0.35)
  rim.position.set(-15, 6, -12)
  scene.add(rim)
  tipLight = new THREE.PointLight(0xff7a1a, 0, 12, 2)
  scene.add(tipLight)

  const groundY = -state.partRadius * U - 3
  const grid = new THREE.GridHelper(80, 80, 0x223140, 0x141921)
  grid.position.y = groundY
  const gm = grid.material as THREE.Material
  gm.transparent = true
  gm.opacity = 0.5
  scene.add(grid)
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.ShadowMaterial({ opacity: 0.35 }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = groundY
  floor.receiveShadow = true
  scene.add(floor)

  holder = new THREE.Group()
  holder.rotation.z = Math.PI / 2
  scene.add(holder)
  const r = state.partRadius * U
  const l = state.partLength * U
  const workMat = new THREE.MeshStandardMaterial({
    color: 0xb8c4d0,
    metalness: 0.88,
    roughness: 0.32,
  })
  workpiece = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 96, 1), workMat)
  workpiece.castShadow = true
  workpiece.receiveShadow = true
  holder.add(workpiece)
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x36d6e7,
    emissive: 0x0a2a30,
    emissiveIntensity: 0.5,
    metalness: 0.6,
    roughness: 0.4,
  })
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.18, 96), capMat)
  cap.position.y = l / 2 - 0.09
  cap.castShadow = true
  holder.add(cap)
  const cap2 = cap.clone()
  cap2.position.y = -l / 2 + 0.09
  holder.add(cap2)

  toolGroup = new THREE.Group()
  const shankMat = new THREE.MeshStandardMaterial({
    color: 0x2a313c,
    metalness: 0.7,
    roughness: 0.42,
  })
  shank = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), shankMat)
  shank.castShadow = true
  insertMat = new THREE.MeshStandardMaterial({
    color: 0x66e0ff,
    metalness: 0.4,
    roughness: 0.25,
    emissive: 0x0a3a4a,
    emissiveIntensity: 0.6,
  })
  insert = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), insertMat)
  insert.castShadow = true
  toolGroup.add(shank, insert)
  scene.add(toolGroup)
  buildToolGeometry()

  grooveMat = new THREE.MeshBasicMaterial({
    color: 0x36d6e7,
    transparent: true,
    opacity: 0,
  })
  groove = new THREE.Mesh(new THREE.BoxGeometry(1, 0.04, 0.5), grooveMat)
  scene.add(groove)

  const positions = new Float32Array(MAX_SPARKS * 3)
  for (let i = 0; i < MAX_SPARKS; i++) positions[i * 3 + 1] = -9999
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  sparkMat = new THREE.PointsMaterial({
    color: 0xffae42,
    size: 0.16,
    map: makeSparkTexture(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  sparks = new THREE.Points(geo, sparkMat)
  scene.add(sparks)
  for (let i = 0; i < MAX_SPARKS; i++) sparkVel.push(new THREE.Vector3())

  onResize()
  resizeObs = new ResizeObserver(onResize)
  resizeObs.observe(el)

  renderer.setAnimationLoop(animate)
}

function spawnSpark(x: number, y: number): void {
  const i = sparkCursor
  sparkCursor = (sparkCursor + 1) % MAX_SPARKS
  const arr = sparks.geometry.attributes.position.array as Float32Array
  arr[i * 3] = x + (Math.random() - 0.5) * 0.15
  arr[i * 3 + 1] = y
  arr[i * 3 + 2] = (Math.random() - 0.5) * 0.15
  sparkVel[i].set((Math.random() - 0.5) * 5, -Math.random() * 2 - 1, (Math.random() - 0.5) * 5)
  sparkLife[i] = 0.4 + Math.random() * 0.4
}

function updateSparks(dt: number, x: number, y: number, running: boolean): void {
  const pos = sparks.geometry.attributes.position as THREE.BufferAttribute
  const arr = pos.array as Float32Array
  if (running && state.progress < 1) {
    for (let n = 0; n < 5; n++) spawnSpark(x, y)
  }
  for (let i = 0; i < MAX_SPARKS; i++) {
    if (sparkLife[i] > 0) {
      sparkLife[i] -= dt
      if (sparkLife[i] <= 0) {
        arr[i * 3 + 1] = -9999
        sparkVel[i].set(0, 0, 0)
      } else {
        sparkVel[i].y -= 9.8 * dt
        arr[i * 3] += sparkVel[i].x * dt
        arr[i * 3 + 1] += sparkVel[i].y * dt
        arr[i * 3 + 2] += sparkVel[i].z * dt
      }
    }
  }
  pos.needsUpdate = true
}

function animate(): void {
  const dt = Math.min(clock.getDelta(), 0.05)
  const running = state.running

  if (running) {
    const omega = state.params.spindleSpeed * 0.0042
    workpieceAngle += omega * dt
  }
  workpiece.rotation.y = workpieceAngle

  const l = state.partLength * U
  const feedX = -l / 2 + state.feedPosition * U
  const cutY = state.partRadius * U - state.params.depthOfCut * U
  toolGroup.position.set(feedX, cutY, 0)

  tipLight.position.set(feedX, cutY + 0.6, 0)
  const shankMatRef = shank.material as THREE.MeshStandardMaterial
  if (state.alarm) {
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.012)
    tipLight.color.setHex(0xff3b3b)
    tipLight.intensity = 1.6 + pulse * 2.6
    insertMat.color.copy(colCrit)
    insertMat.emissive.copy(colCrit).multiplyScalar(0.7 + pulse * 1.2)
    shankMatRef.color.setHex(0x7a1f1f)
    shankMatRef.emissive.setHex(0x2a0606)
    const sc = 1 - (state.wear.wear_percent / 100) * 0.12
    insert.scale.set(sc * (1 + pulse * 0.05), 1, sc * (1 + pulse * 0.05))
  } else {
    tipLight.intensity = running ? 2.4 : 0
    tipLight.color.setHex(state.wear.status === 'critical' ? 0xff3b3b : 0xff7a1a)
    const t = state.wear.wear_percent / 100
    const col = new THREE.Color()
    if (t < 0.5) col.copy(colFresh).lerp(colMid, t / 0.5)
    else col.copy(colMid).lerp(colCrit, (t - 0.5) / 0.5)
    insertMat.color.copy(col)
    insertMat.emissive.copy(col).multiplyScalar(0.4 + t * 0.9)
    shankMatRef.color.setHex(0x2a313c)
    shankMatRef.emissive.setHex(0x000000)
    const sc = 1 - t * 0.12
    insert.scale.set(sc, 1, sc)
  }

  const gp = state.feedPosition * U
  groove.scale.x = Math.max(0.0001, gp)
  groove.position.set(-l / 2 + gp / 2, state.partRadius * U + 0.03, 0)
  grooveMat.opacity = state.progress > 0 ? 0.5 : 0

  updateSparks(dt, feedX, cutY, running)

  controls.update()
  renderer.render(scene, camera)
}

function onResize(): void {
  const el = containerRef.value
  if (!el || !renderer) return
  const w = el.clientWidth
  const h = el.clientHeight
  if (w === 0 || h === 0) return
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

function dispose(): void {
  renderer?.setAnimationLoop(null)
  resizeObs?.disconnect()
  controls?.dispose()
  scene?.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.geometry) m.geometry.dispose()
    const mat = m.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose())
    else mat?.dispose()
  })
  sparkMat?.map?.dispose()
  renderer?.dispose()
  const dom = renderer?.domElement
  if (dom?.parentNode) dom.parentNode.removeChild(dom)
}

onMounted(setup)
onUnmounted(dispose)

watch(
  () => [state.params.toolLength, state.params.toolWidth, state.params.toolHeight],
  buildToolGeometry,
)
</script>

<template>
  <div ref="containerRef" class="absolute inset-0" />
</template>
