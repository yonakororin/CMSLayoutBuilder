<template>
  <div class="inline-edit" @dblclick="startEdit">
    <input
      v-if="editing"
      ref="inputRef"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="finishEdit"
      @keydown.enter="finishEdit"
      class="inline-edit-input"
      :style="inputStyle"
    />
    <span v-else class="inline-edit-label" :style="labelStyle">{{ modelValue || placeholder }}</span>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue'
import { store } from '../store.js'

export default {
  name: 'InlineEdit',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'ダブルクリックで編集' },
    fontSize: { type: String, default: '14px' },
    fontWeight: { type: String, default: '500' },
  },
  emits: ['update:modelValue'],
  setup(props) {
    const editing = ref(false)
    const inputRef = ref(null)

    const labelStyle = { fontSize: props.fontSize, fontWeight: props.fontWeight }
    const inputStyle = { fontSize: props.fontSize, fontWeight: props.fontWeight }

    function startEdit() {
      if (store.isViewMode) return
      editing.value = true
      nextTick(() => {
        if (inputRef.value) {
          inputRef.value.focus()
          inputRef.value.select()
        }
      })
    }

    function finishEdit() {
      editing.value = false
    }

    return { editing, inputRef, startEdit, finishEdit, labelStyle, inputStyle }
  },
}
</script>

<style scoped>
.inline-edit {
  cursor: text;
  min-width: 40px;
}
.inline-edit-label {
  color: var(--text-primary);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  transition: background var(--transition);
}
.inline-edit-label:hover {
  background: var(--bg-hover);
}
.inline-edit-input {
  background: var(--bg-primary);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 2px 6px;
  font-family: inherit;
  outline: none;
}
</style>
