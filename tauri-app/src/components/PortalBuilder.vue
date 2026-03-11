<template>
  <div class="portal-builder" ref="builderRef">
    <!-- Title -->
    <div class="portal-header">
      <InlineEdit
        v-model="page.name"
        fontSize="20px"
        fontWeight="700"
        placeholder="ポータルページタイトル"
      />
    </div>

    <!-- Categories -->
    <div class="categories">
      <div v-for="cat in page.categories" :key="cat.id" class="category">
        <div class="category-header">
          <InlineEdit v-model="cat.name" fontWeight="600" />
          <div class="flex gap-1" style="align-items: center;">
            <input type="color" v-model="cat.themeColor" title="テーマカラー" class="category-color-picker" />
            <button class="btn btn-primary" @click="store.addCard(page.id, cat.id)">
              <span class="material-icons xs">add</span> カード
            </button>
            <button class="btn-icon danger" @click="store.removeCategory(page.id, cat.id)">
              <span class="material-icons sm">delete</span>
            </button>
          </div>
        </div>

        <!-- Cards -->
        <div class="cards-container" :data-cat-id="cat.id">
          <div
            v-for="(card, idx) in cat.cards"
            :key="card.id"
            class="card-wrapper"
            :data-card-idx="idx"
            :class="{
              'drag-over-left': dropTarget?.catId === cat.id && dropTarget?.idx === idx && dropTarget?.side === 'left',
              'drag-over-right': dropTarget?.catId === cat.id && dropTarget?.idx === idx && dropTarget?.side === 'right',
              dragging: dragging?.catId === cat.id && dragging?.cardId === card.id
            }"
            @mousedown.left="onGripStart($event, cat, card, idx)"
          >
            <div class="card" @click="openCardEditor(card)">
              <span class="material-icons card-icon">{{ card.icon }}</span>
              <span class="card-title truncate">{{ card.title }}</span>
            </div>
            <button class="btn-icon danger card-delete" @click.stop="store.removeCard(page.id, cat.id, card.id)">
              <span class="material-icons xs">close</span>
            </button>
            <!-- Move buttons -->
            <div class="card-move-buttons">
              <button
                v-if="idx > 0"
                class="btn-icon card-move-btn"
                @click.stop="moveCardLeft(cat, idx)"
                title="左へ移動"
              >
                <span class="material-icons xs">chevron_left</span>
              </button>
              <button
                v-if="idx < cat.cards.length - 1"
                class="btn-icon card-move-btn"
                @click.stop="moveCardRight(cat, idx)"
                title="右へ移動"
              >
                <span class="material-icons xs">chevron_right</span>
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="cat.cards.length === 0"
            class="cards-empty"
            :data-cat-id="cat.id"
            :class="{ 'drag-over-end': dropTarget?.catId === cat.id && dropTarget?.idx === 0 }"
          >
            「＋カード」でカードを追加
          </div>
        </div>
      </div>
    </div>

    <button class="btn btn-primary" @click="store.addCategory(page.id)" style="margin-top:12px;">
      <span class="material-icons xs">add</span> カテゴリを追加
    </button>

    <!-- Drag ghost -->
    <div v-if="dragging" class="drag-ghost" :style="ghostStyle">
      <div class="card">
        <span class="material-icons card-icon">{{ dragging.card.icon }}</span>
        <span class="card-title truncate">{{ dragging.card.title }}</span>
      </div>
    </div>

    <!-- Card Editor Modal -->
    <div v-if="editingCard" class="modal-overlay" @click.self="editingCard = null">
      <div class="modal-content">
        <h3>カード編集</h3>
        <div class="flex-col gap-3">
          <div>
            <label class="field-label">タイトル</label>
            <input type="text" v-model="editingCard.title" />
          </div>
          <div>
            <label class="field-label">リンク</label>
            <input type="url" v-model="editingCard.link" placeholder="リンク先URL" />
          </div>
          <div>
            <label class="field-label">アイコン</label>
            <div class="icon-preview" @click="showIconPicker = true">
              <span class="material-icons lg">{{ editingCard.icon }}</span>
              <span>クリックして変更</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="editingCard = null">閉じる</button>
        </div>
      </div>
    </div>

    <!-- Icon Picker -->
    <IconPicker
      v-if="showIconPicker"
      :selected="editingCard?.icon"
      @select="onIconSelect"
      @close="showIconPicker = false"
    />
  </div>
</template>

<script>
import { ref, reactive, onUnmounted } from 'vue'
import { store } from '../store.js'
import InlineEdit from './InlineEdit.vue'
import IconPicker from './IconPicker.vue'

export default {
  name: 'PortalBuilder',
  components: { InlineEdit, IconPicker },
  props: {
    page: { type: Object, required: true },
  },
  setup(props) {
    const editingCard = ref(null)
    const showIconPicker = ref(false)
    const builderRef = ref(null)

    // Drag state
    const dragging = ref(null)   // { catId, cardId, card, startX, startY }
    const dropTarget = ref(null) // { catId, idx, side }
    const ghostPos = reactive({ x: 0, y: 0 })
    const ghostStyle = ref({})
    let isDragging = false
    let suppressClick = false
    const DRAG_THRESHOLD = 5 // pixels before drag starts

    function openCardEditor(card) {
      if (suppressClick) return
      editingCard.value = card
    }

    function onIconSelect(icon) {
      if (editingCard.value) {
        editingCard.value.icon = icon
      }
      showIconPicker.value = false
    }

    // --- Arrow-button move ---
    function moveCardLeft(cat, idx) {
      if (idx <= 0) return
      store.moveCard(props.page.id, cat.id, idx, cat.id, idx - 1)
    }
    function moveCardRight(cat, idx) {
      if (idx >= cat.cards.length - 1) return
      store.moveCard(props.page.id, cat.id, idx, cat.id, idx + 2)
    }

    // --- Custom mouse-based drag & drop ---
    let pendingDrag = null // { catId, cardId, card, idx, startX, startY }

    function onGripStart(e, cat, card, idx) {
      // Don't start drag from buttons
      if (e.target.closest('.card-delete') || e.target.closest('.card-move-btn')) return

      pendingDrag = {
        catId: cat.id,
        cardId: card.id,
        card: card,
        idx: idx,
        startX: e.clientX,
        startY: e.clientY,
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      e.preventDefault()
    }

    function onMouseMove(e) {
      if (!pendingDrag && !isDragging) return

      if (pendingDrag && !isDragging) {
        const dx = e.clientX - pendingDrag.startX
        const dy = e.clientY - pendingDrag.startY
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return

        // Start drag
        isDragging = true
        suppressClick = true
        dragging.value = {
          catId: pendingDrag.catId,
          cardId: pendingDrag.cardId,
          card: pendingDrag.card,
          idx: pendingDrag.idx,
        }
        pendingDrag = null
      }

      if (isDragging) {
        ghostPos.x = e.clientX
        ghostPos.y = e.clientY
        ghostStyle.value = {
          left: (e.clientX + 8) + 'px',
          top: (e.clientY + 8) + 'px',
        }

        // Hit-test: find which card we're over
        updateDropTarget(e.clientX, e.clientY)
      }
    }

    function updateDropTarget(mx, my) {
      if (!builderRef.value) return

      const containers = builderRef.value.querySelectorAll('.cards-container')
      let found = false

      for (const container of containers) {
        const catId = container.dataset.catId
        const wrappers = container.querySelectorAll('.card-wrapper')

        for (let i = 0; i < wrappers.length; i++) {
          const rect = wrappers[i].getBoundingClientRect()
          if (mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom) {
            const midX = rect.left + rect.width / 2
            const side = mx < midX ? 'left' : 'right'
            dropTarget.value = { catId, idx: i, side }
            found = true
            break
          }
        }

        if (!found) {
          // Check if mouse is inside the container itself (for drop at end)
          const containerRect = container.getBoundingClientRect()
          if (mx >= containerRect.left && mx <= containerRect.right &&
              my >= containerRect.top && my <= containerRect.bottom) {
            const cat = props.page.categories.find(c => c.id === catId)
            if (cat) {
              dropTarget.value = { catId, idx: cat.cards.length, side: 'left' }
              found = true
            }
          }
        }

        if (found) break
      }

      if (!found) {
        dropTarget.value = null
      }
    }

    function onMouseUp(e) {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)

      if (isDragging && dragging.value && dropTarget.value) {
        // Perform the drop
        const srcCatId = dragging.value.catId
        const srcIdx = dragging.value.idx
        let dstIdx = dropTarget.value.idx
        if (dropTarget.value.side === 'right') {
          dstIdx = dropTarget.value.idx + 1
        }
        store.moveCard(props.page.id, srcCatId, srcIdx, dropTarget.value.catId, dstIdx)
      }

      dragging.value = null
      dropTarget.value = null
      pendingDrag = null
      isDragging = false

      // Suppress the click that follows mouseup
      setTimeout(() => { suppressClick = false }, 50)
    }

    onUnmounted(() => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    })

    return {
      store, editingCard, showIconPicker, builderRef,
      dragging, dropTarget, ghostStyle,
      openCardEditor, onIconSelect,
      moveCardLeft, moveCardRight,
      onGripStart,
    }
  },
}
</script>

<style scoped>
.portal-builder {
  padding: 8px;
  overflow-y: auto;
  height: 100%;
  position: relative;
}
.portal-header {
  padding: 8px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 8px;
}
.categories {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.category {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  overflow: hidden;
}
.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
}
.category-color-picker {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  margin-right: 4px;
}
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  align-items: flex-start;
  min-height: 60px;
}
.card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 110px;
  position: relative;
  cursor: grab;
  transition: transform 0.15s ease, opacity 0.15s ease;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  user-select: none;
}
.card-wrapper:active { cursor: grabbing; }
.card-wrapper.dragging {
  opacity: 0.3;
  transform: scale(0.95);
}
.card-wrapper.drag-over-left {
  border-left-color: var(--accent);
}
.card-wrapper.drag-over-right {
  border-right-color: var(--accent);
}
.card-delete {
  position: absolute;
  top: 2px;
  right: 2px;
  opacity: 0;
  transition: opacity var(--transition);
}
.card-wrapper:hover .card-delete {
  opacity: 1;
}
.card-move-buttons {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--transition);
  pointer-events: none;
}
.card-wrapper:hover .card-move-buttons {
  opacity: 1;
  pointer-events: auto;
}
.card-move-btn {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border) !important;
  border-radius: 50% !important;
  width: 20px;
  height: 20px;
  padding: 2px !important;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.card-move-btn:hover {
  background: var(--accent-light) !important;
  color: var(--accent) !important;
  border-color: var(--accent) !important;
}
.card {
  width: 110px;
  height: 80px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all var(--transition);
}
.card:hover {
  border-color: var(--accent);
  background: var(--accent-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.2);
}
.card-icon {
  font-size: 28px;
  color: var(--accent);
}
.card-title {
  font-size: 12px;
  max-width: 110px;
  text-align: center;
}
.cards-empty {
  color: var(--text-muted);
  font-size: 13px;
  padding: 12px;
  border: 2px dashed transparent;
  border-radius: var(--radius);
  transition: all 0.15s ease;
  flex: 1;
}
.cards-empty.drag-over-end {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
}

/* Drag ghost - floating copy that follows the mouse */
.drag-ghost {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.85;
  transform: rotate(3deg) scale(1.05);
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
}

.field-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.icon-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition);
  color: var(--text-secondary);
}
.icon-preview:hover {
  background: var(--bg-hover);
}
</style>
