<template>
  <div v-if="show" class="diff-overlay">
    <div class="diff-modal">
      <div class="dm-header">
        <h3 class="m-0 fs-5 fw-bolder text-dark" style="color: #000; letter-spacing: 0.5px;">ファイル保存の確認</h3>
        <button class="btn-close" @click="cancel"></button>
      </div>
      <div class="dm-body">
        <div class="dm-sidebar">
          <div class="dm-file-list">
            <label v-for="(w, idx) in writes" :key="idx" class="dm-file-item" :class="{active: activeIdx === idx}">
              <input type="checkbox" v-model="w.selected" />
              <div class="file-info" @click.prevent="activeIdx = idx">
                <span class="file-path truncate">{{ w.path }}</span>
                <span v-if="w.oldContent === null" class="badge bg-success ms-2" style="font-size:10px;">New</span>
                <span v-else class="badge bg-warning text-dark ms-2" style="font-size:10px;">Changed</span>
              </div>
            </label>
          </div>
        </div>
        <div class="dm-main">
          <div v-if="activeWrite" class="dm-diff-wrapper">
            <div v-if="activeWrite.oldContent === null" class="alert alert-success m-3 p-3 text-dark fw-bold">
              新規ファイルです。以下の内容が保存されます。
            </div>
            <div v-else class="dm-diff-container">
              <div class="dm-diff-header">
                <div class="dm-diff-title dm-diff-title-left text-danger" style="color: #b91c1c !important;">
                  <span class="material-icons sm">remove_circle_outline</span> 変更前（保存済みの内容）
                </div>
                <div class="dm-diff-title dm-diff-title-right text-success" style="color: #15803d !important;">
                  <span class="material-icons sm">add_circle_outline</span> 変更後（今回上書きする内容）
                </div>
              </div>
              <div class="diff-blocks">
                <div v-for="(block, bIdx) in activeWrite.blocks" :key="bIdx" class="diff-block" :class="block.type">
                  <div v-if="block.type === 'changed'" class="block-actions px-3 py-2 border-bottom border-top flex align-items-center" style="background:#f1f5f9;">
                     <label class="form-check-label fw-bolder text-dark cursor-pointer d-flex align-items-center gap-2" style="font-size:14px; color:#0f172a;">
                       <input type="checkbox" class="form-check-input mt-0" v-model="block.selected" style="width:16px; height:16px;" /> 
                       この変更箇所を保存する
                     </label>
                  </div>
                  <div class="block-content d-flex w-100">
                    <div class="side old-side" :class="{'bg-del text-del': block.type==='changed'}">
                      <pre class="m-0 p-2">{{ block.type === 'unchanged' ? block.value : block.oldValue }}</pre>
                    </div>
                    <div class="side new-side border-start" :class="{'bg-add text-add': block.type==='changed' && block.selected, 'bg-rejected text-muted text-decoration-line-through': block.type==='changed' && !block.selected}">
                      <pre class="m-0 p-2">{{ block.type === 'unchanged' ? block.value : block.newValue }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="dm-footer">
        <button class="btn btn-secondary fw-bold text-dark" style="background:#e2e8f0; border:none;" @click="cancel">キャンセル</button>
        <button class="btn btn-primary fw-bold" @click="confirm">
          選択した {{ writes.filter(w => w.selected).length }} ファイルを保存
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { diffLines } from 'diff'

export default {
  name: 'DiffModal',
  setup() {
    const show = ref(false)
    const writes = ref([])
    const activeIdx = ref(0)
    let resolvePromise = null

    const activeWrite = computed(() => writes.value[activeIdx.value])

    function computeBlocks(oldStr, newStr) {
      const changes = diffLines(oldStr || '', newStr || '')
      const blocks = []
      let currentChange = null

      for (let i = 0; i < changes.length; i++) {
        const c = changes[i]
        // Group consecutive unchanges, and consecutive changes
        if (!c.added && !c.removed) {
          if (currentChange) { blocks.push(currentChange); currentChange = null; }
          blocks.push({ type: 'unchanged', value: c.value })
        } else {
          if (!currentChange) {
            currentChange = { type: 'changed', oldValue: '', newValue: '', selected: true }
          }
          if (c.removed) currentChange.oldValue += c.value
          if (c.added) currentChange.newValue += c.value
        }
      }
      if (currentChange) { blocks.push(currentChange); }
      return blocks
    }

    function open(plannedWrites) {
      writes.value = plannedWrites.map(w => {
        const blocks = (w.oldContent !== null) ? computeBlocks(w.oldContent, w.newContent) : []
        return { ...w, selected: true, blocks }
      })
      activeIdx.value = 0
      show.value = true
      return new Promise((resolve) => {
        resolvePromise = resolve
      })
    }

    function cancel() {
      show.value = false
      if (resolvePromise) resolvePromise(null)
    }

    function confirm() {
      show.value = false
      if (resolvePromise) {
        // Reconstruct content based on selected hunks
        const finalWrites = writes.value.filter(w => w.selected).map(w => {
          if (w.oldContent === null) return w // new file
          
          let reconstructed = w.blocks.map(b => {
            if (b.type === 'unchanged') return b.value
            return b.selected ? b.newValue : b.oldValue
          }).join('')
          
          return { ...w, newContent: reconstructed }
        })
        resolvePromise(finalWrites)
      }
    }

    return { show, writes, activeIdx, activeWrite, open, cancel, confirm }
  }
}
</script>

<style scoped>
.diff-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.diff-modal { display: flex; flex-direction: column; width: 95vw; height: 90vh; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); font-family: 'Inter', system-ui, sans-serif; }
.dm-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 2px solid #cbd5e1; background: #f8fafc; }
.dm-body { display: flex; flex: 1; overflow: hidden; }
.dm-sidebar { width: 250px; min-width: 250px; border-right: 2px solid #cbd5e1; background: #f8fafc; overflow-y: auto; }
.dm-file-list { display: flex; flex-direction: column; padding: 8px 0; }
.dm-file-item { display: flex; align-items: flex-start; gap: 8px; padding: 10px 16px; cursor: pointer; border-bottom: 1px solid #e2e8f0; user-select: none; transition: background 0.15s; }
.dm-file-item.active { background: #e0e7ff; }
.dm-file-item:hover:not(.active) { background: #f1f5f9; }
.file-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; cursor: pointer; }
.file-path { font-size: 13px; color: #0f172a; word-wrap: break-word; line-height: 1.4; font-weight: 500; }
.dm-file-item.active .file-path { font-weight: 800; color: #4338ca; }
.dm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #fff; }
.dm-diff-wrapper { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.dm-footer { border-top: 2px solid #cbd5e1; padding: 16px 24px; display: flex; justify-content: flex-end; gap: 12px; background: #f8fafc; }

/* Custom Diff Blocks */
.dm-diff-container { display: flex; flex-direction: column; height: 100%; }
.dm-diff-header { display: flex; border-bottom: 2px solid #cbd5e1; background: #f8fafc; flex: 0 0 auto; }
.dm-diff-title { flex: 1; padding: 14px 16px; font-size: 15px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.dm-diff-title-left { border-right: 2px solid #cbd5e1; }
.diff-blocks { flex: 1; overflow-y: auto; display: flex; flex-direction: column; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace; font-size: 13.5px; }
.diff-block { display: flex; flex-direction: column; }
.diff-block.unchanged { background: #fff; border-bottom: 1px solid #f1f5f9; }
.block-actions { border-bottom: 2px solid #cbd5e1; background: #f1f5f9; }
.side { flex: 1; min-width: 0; overflow-x: auto; }
.bg-del { background-color: #fee2e2; }
.text-del { color: #7f1d1d; }
.bg-add { background-color: #dcfce7; }
.text-add { color: #14532d; }
.bg-rejected { background-color: #f1f5f9; }
pre { margin: 0; line-height: 1.6; white-space: pre-wrap; word-break: break-all; }
</style>
