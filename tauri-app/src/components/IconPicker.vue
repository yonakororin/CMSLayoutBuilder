<template>
  <div class="icon-picker-overlay" @click.self="$emit('close')">
    <div class="icon-picker">
      <h3>アイコンを選択</h3>
      <div class="icon-grid">
        <button
          v-for="opt in iconOptions"
          :key="opt.icon"
          class="icon-option"
          :class="{ selected: opt.icon === selected }"
          @click="$emit('select', opt.icon)"
        >
          <span class="material-icons lg">{{ opt.icon }}</span>
          <span class="icon-label">{{ opt.label }}</span>
        </button>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" @click="$emit('close')">閉じる</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ICON_OPTIONS } from '../store.js'

export default {
  name: 'IconPicker',
  props: {
    selected: { type: String, default: 'folder' },
  },
  emits: ['select', 'close'],
  setup() {
    return { iconOptions: ICON_OPTIONS }
  },
}
</script>

<style scoped>
.icon-picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: fadeIn 0.15s ease;
}
.icon-picker {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  max-width: 480px;
  box-shadow: var(--shadow);
  animation: slideUp 0.2s ease;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  margin-top: 12px;
}
.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  background: var(--bg-surface);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  color: var(--text-secondary);
}
.icon-option:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.icon-option.selected {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
}
.icon-label {
  font-size: 10px;
  white-space: nowrap;
}
</style>
