<template>
  <div class="portal-builder">
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
          <div v-if="!store.isViewMode" class="flex gap-1">
            <button class="btn btn-primary" @click="store.addCard(page.id, cat.id)">
              <span class="material-icons xs">add</span> カード
            </button>
            <button class="btn-icon danger" @click="store.removeCategory(page.id, cat.id)">
              <span class="material-icons sm">delete</span>
            </button>
          </div>
        </div>

        <!-- Cards (drag & drop) -->
        <div class="cards-container">
          <div
            v-for="(card, idx) in cat.cards"
            :key="card.id"
            class="card-wrapper"
            :class="{
              'drag-over-left': dragOverInfo?.catId === cat.id && dragOverInfo?.idx === idx && dragOverInfo?.side === 'left',
              'drag-over-right': dragOverInfo?.catId === cat.id && dragOverInfo?.idx === idx && dragOverInfo?.side === 'right',
              dragging: dragInfo?.catId === cat.id && dragInfo?.idx === idx
            }"
            :draggable="!store.isViewMode"
            @dragstart="onDragStart($event, cat, idx)"
            @dragend="onDragEnd"
            @dragover.prevent="onDragOver($event, cat, idx)"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop($event, cat, idx)"
          >
            <div class="card" @click="openCardEditor(card)">
              <span class="material-icons card-icon">{{ card.icon }}</span>
              <span class="card-title truncate">{{ card.title }}</span>
            </div>
            <button v-if="!store.isViewMode" class="btn-icon danger card-delete" @click.stop="store.removeCard(page.id, cat.id, card.id)">
              <span class="material-icons xs">close</span>
            </button>
          </div>

          <!-- Drop zone at the end -->
          <div
            v-if="!store.isViewMode && cat.cards.length > 0"
            class="card-drop-end"
            :class="{ 'drag-over-end': dragOverInfo?.catId === cat.id && dragOverInfo?.idx === cat.cards.length }"
            @dragover.prevent="onDragOverEnd($event, cat)"
            @dragleave="onDragLeave"
            @drop.prevent="onDropEnd($event, cat)"
          ></div>

          <!-- Empty state -->
          <div
            v-if="!store.isViewMode && cat.cards.length === 0"
            class="cards-empty"
            @dragover.prevent="onDragOverEnd($event, cat)"
            @dragleave="onDragLeave"
            @drop.prevent="onDropEnd($event, cat)"
            :class="{ 'drag-over-end': dragOverInfo?.catId === cat.id && dragOverInfo?.idx === 0 }"
          >
            カードをここにドロップ、または「＋カード」で追加
          </div>
        </div>
      </div>
    </div>

    <button v-if="!store.isViewMode" class="btn btn-primary" @click="store.addCategory(page.id)" style="margin-top:12px;">
      <span class="material-icons xs">add</span> カテゴリを追加
    </button>

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
import { ref } from 'vue'
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
    const dragInfo = ref(null)      // { catId, idx }
    const dragOverInfo = ref(null)  // { catId, idx, side }

    function openCardEditor(card) {
      if (store.isViewMode) {
        if (card.link) window.open(card.link, '_blank')
        return
      }
      // Only open if not just finished dragging
      if (!dragInfo.value) {
        editingCard.value = card
      }
    }

    function onIconSelect(icon) {
      if (editingCard.value) {
        editingCard.value.icon = icon
      }
      showIconPicker.value = false
    }

    // --- Drag & Drop ---
    function onDragStart(e, cat, idx) {
      dragInfo.value = { catId: cat.id, idx }
      e.dataTransfer.effectAllowed = 'move'
      // Set minimal drag image
      e.dataTransfer.setData('text/plain', cat.id + ':' + idx)
    }

    function onDragEnd() {
      dragInfo.value = null
      dragOverInfo.value = null
    }

    function onDragOver(e, cat, idx) {
      if (!dragInfo.value) return
      // Determine if mouse is on left or right half of card
      const rect = e.currentTarget.getBoundingClientRect()
      const midX = rect.left + rect.width / 2
      const side = e.clientX < midX ? 'left' : 'right'
      dragOverInfo.value = { catId: cat.id, idx, side }
    }

    function onDragOverEnd(e, cat) {
      if (!dragInfo.value) return
      dragOverInfo.value = { catId: cat.id, idx: cat.cards.length, side: 'left' }
    }

    function onDragLeave() {
      // Will be re-set on next dragover
    }

    function performDrop(targetCat, targetIdx) {
      if (!dragInfo.value) return
      const srcCatId = dragInfo.value.catId
      const srcIdx = dragInfo.value.idx

      // Find source category
      const srcCat = props.page.categories.find(c => c.id === srcCatId)
      if (!srcCat) return

      // Remove card from source
      const [card] = srcCat.cards.splice(srcIdx, 1)

      // Adjust target index if same category and source was before target
      let insertIdx = targetIdx
      if (srcCat.id === targetCat.id && srcIdx < targetIdx) {
        insertIdx = Math.max(0, insertIdx - 1)
      }

      // Insert card at target
      targetCat.cards.splice(insertIdx, 0, card)

      dragInfo.value = null
      dragOverInfo.value = null
    }

    function onDrop(e, cat, idx) {
      const info = dragOverInfo.value
      if (!info) return performDrop(cat, idx)
      const insertIdx = info.side === 'right' ? idx + 1 : idx
      performDrop(cat, insertIdx)
    }

    function onDropEnd(e, cat) {
      performDrop(cat, cat.cards.length)
    }

    return {
      store, editingCard, showIconPicker, dragInfo, dragOverInfo,
      openCardEditor, onIconSelect,
      onDragStart, onDragEnd, onDragOver, onDragOverEnd, onDragLeave, onDrop, onDropEnd,
    }
  },
}
</script>

<style scoped>
.portal-builder {
  padding: 16px;
  overflow-y: auto;
  height: 100%;
}
.portal-header {
  padding: 12px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 16px;
}
.categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  padding: 8px 12px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
}
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  align-items: flex-start;
}
.card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 130px;
  position: relative;
  cursor: grab;
  transition: transform 0.15s ease, opacity 0.15s ease;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
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
.card {
  width: 130px;
  height: 100px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  font-size: 32px;
  color: var(--accent);
}
.card-title {
  font-size: 12px;
  max-width: 110px;
  text-align: center;
}
.card-drop-end {
  width: 20px;
  min-height: 100px;
  transition: all 0.15s ease;
  border-radius: var(--radius-sm);
}
.card-drop-end.drag-over-end {
  width: 40px;
  background: var(--accent-light);
  border: 2px dashed var(--accent);
}
.cards-empty {
  color: var(--text-muted);
  font-size: 13px;
  padding: 16px;
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
