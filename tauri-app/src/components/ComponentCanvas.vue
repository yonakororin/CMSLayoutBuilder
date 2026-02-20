<template>
  <div class="component-canvas" ref="canvasRef">
    <!-- Components on the canvas -->
    <div
      v-for="comp in components"
      :key="comp.id"
      class="canvas-component"
      :style="{
        left: comp.x + 'px',
        top: comp.y + 'px',
        width: comp.w + 'px',
        height: comp.h + 'px',
      }"
    >
      <!-- Drag handle (top bar) -->
      <div
        class="comp-drag-bar"
        @pointerdown.prevent="startDrag($event, comp)"
      >
        <span class="material-icons xs">drag_indicator</span>
        <span class="comp-type-label truncate">{{ comp.type }}</span>
        <button class="btn-icon danger" @click.stop="$emit('removeComponent', comp.id)" style="padding:0">
          <span class="material-icons xs">close</span>
        </button>
      </div>

      <!-- Component body -->
      <div class="comp-body">
        <!-- HTML表示領域 -->
        <div v-if="comp.type === 'HTML表示領域'" class="placeholder-html">
          HTML表示領域
        </div>
        <!-- インプット -->
        <div v-else-if="comp.type === 'インプット(ラベル付き)'" class="placeholder-input">
          <label>ラベル</label>
          <input type="text" disabled placeholder="テキスト入力" />
        </div>
        <!-- カレンダー -->
        <div v-else-if="comp.type === 'カレンダー(ラベル付き)'" class="placeholder-input">
          <label><span class="material-icons xs">calendar_month</span> 日付</label>
          <input type="text" disabled placeholder="yyyy/mm/dd" />
        </div>
        <!-- セレクト -->
        <div v-else-if="comp.type === 'セレクトボックス(ラベル付き)'" class="placeholder-input">
          <label>選択</label>
          <select disabled><option>-- 選択 --</option></select>
        </div>
        <!-- ラジオ -->
        <div v-else-if="comp.type === 'ラジオボタン(ラベル付き)'" class="placeholder-radio">
          <label><input type="radio" disabled /> ラジオ</label>
        </div>
        <!-- チェック -->
        <div v-else-if="comp.type === 'チェックボックス(ラベル付き)'" class="placeholder-check">
          <label><input type="checkbox" disabled /> チェック</label>
        </div>
        <div v-else class="placeholder-html">{{ comp.type }}</div>
      </div>

      <!-- Resize handle (bottom-right) -->
      <div
        class="comp-resize-handle"
        @pointerdown.prevent.stop="startResize($event, comp)"
      >
        <span class="material-icons xs">open_in_full</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { store } from '../store.js'

export default {
  name: 'ComponentCanvas',
  props: {
    components: { type: Array, required: true },
  },
  emits: ['removeComponent'],
  setup(props) {
    const canvasRef = ref(null)

    // Drag state
    let dragState = null
    // Resize state
    let resizeState = null

    function snap(v) {
      return Math.round(v / 5) * 5
    }

    function startDrag(e, comp) {
      dragState = {
        comp,
        startX: e.clientX,
        startY: e.clientY,
        origX: comp.x,
        origY: comp.y,
      }
      e.target.setPointerCapture(e.pointerId)
    }

    function startResize(e, comp) {
      resizeState = {
        comp,
        startX: e.clientX,
        startY: e.clientY,
        origW: comp.w,
        origH: comp.h,
      }
      e.target.setPointerCapture(e.pointerId)
    }

    function onPointerMove(e) {
      if (dragState) {
        const dx = e.clientX - dragState.startX
        const dy = e.clientY - dragState.startY
        dragState.comp.x = Math.max(0, snap(dragState.origX + dx))
        dragState.comp.y = Math.max(0, snap(dragState.origY + dy))
      }
      if (resizeState) {
        const dx = e.clientX - resizeState.startX
        const dy = e.clientY - resizeState.startY
        resizeState.comp.w = Math.max(40, snap(resizeState.origW + dx))
        resizeState.comp.h = Math.max(30, snap(resizeState.origH + dy))
      }
    }

    function onPointerUp() {
      dragState = null
      resizeState = null
    }

    onMounted(() => {
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    })

    onUnmounted(() => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    })

    return { canvasRef, startDrag, startResize, store }
  },
}
</script>

<style scoped>
.component-canvas {
  position: relative;
  width: 100%;
  min-height: 500px;
  height: 100%;
  background:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 5px 5px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: auto;
}
.canvas-component {
  position: absolute;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  transition: box-shadow 0.1s;
}
.canvas-component:hover {
  box-shadow: 0 2px 8px rgba(124, 92, 252, 0.3);
  border-color: var(--accent);
}
.comp-drag-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  cursor: grab;
  user-select: none;
  min-height: 24px;
}
.comp-drag-bar:active { cursor: grabbing; }
.comp-type-label {
  flex: 1;
  font-size: 11px;
  color: var(--text-muted);
}
.comp-body {
  flex: 1;
  padding: 6px;
  overflow: hidden;
  pointer-events: none;
}
.comp-resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: nwse-resize;
  color: var(--text-muted);
  background: var(--bg-surface);
  border-radius: 0 0 var(--radius-sm) 0;
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
}
.comp-resize-handle:hover {
  color: var(--accent);
}

/* Placeholder component styles */
.placeholder-html {
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 12px;
}
.placeholder-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.placeholder-input label {
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 2px;
}
.placeholder-input input,
.placeholder-input select {
  pointer-events: none;
  font-size: 12px;
  padding: 3px 6px;
}
.placeholder-radio label,
.placeholder-check label {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
