<template>
  <div class="component-canvas" ref="canvasRef">
    <!-- Components on the canvas -->
    <div
      v-for="(comp, idx) in components"
      :key="comp.id"
      class="canvas-component"
      :style="{
        left: comp.x + 'px',
        top: comp.y + 'px',
        width: comp.w + 'px',
        height: comp.h + 'px',
        zIndex: idx + 1
      }"
      @pointerdown="handlePointerDown($event, comp)"
      @contextmenu.prevent.stop="showContextMenu($event, comp)"
    >
      <!-- Component body -->
      <div class="comp-body">

        <!-- HTML表示領域 -->
        <div v-if="comp.type === 'HTML表示領域'" class="placeholder-html-preview">
          <iframe 
            :srcdoc="getIframeSrcdoc(comp)" 
            style="pointer-events: none; width: 100%; height: 100%; border: none; overflow: hidden; background: transparent;">
          </iframe>
        </div>
        <!-- インプット -->
        <div v-else-if="comp.type === 'インプット(ラベル付き)'" class="placeholder-input">
          <label><InlineEdit v-model="comp.label" /></label>
          <input type="text" disabled placeholder="テキスト入力" />
        </div>
        <!-- カレンダー -->
        <div v-else-if="comp.type === 'カレンダー(ラベル付き)'" class="placeholder-input">
          <label class="flex items-center gap-1"><span class="material-icons xs">calendar_month</span> <InlineEdit v-model="comp.label" /></label>
          <input type="text" disabled placeholder="yyyy/mm/dd" />
        </div>
        <!-- セレクト -->
        <div v-else-if="comp.type === 'セレクトボックス(ラベル付き)'" class="placeholder-input">
          <label><InlineEdit v-model="comp.label" /></label>
          <select disabled>
            <option v-for="opt in comp.options" :key="opt">{{ opt }}</option>
          </select>
          <div class="default-val-hint" v-if="comp.defaultValue">初期選択: {{ comp.defaultValue }}</div>
        </div>
        <!-- ラジオ -->
        <div v-else-if="comp.type === 'ラジオボタン(ラベル付き)'" class="placeholder-radio">
          <label class="label-heading"><InlineEdit v-model="comp.label" /></label>
          <label v-for="opt in comp.options" :key="opt" class="opt-label">
            <input type="radio" disabled :checked="opt === comp.defaultValue" /> {{ opt }}
          </label>
        </div>
        <!-- チェック -->
        <div v-else-if="comp.type === 'チェックボックス(ラベル付き)'" class="placeholder-check">
          <label class="label-heading"><InlineEdit v-model="comp.label" /></label>
          <label v-for="opt in comp.options" :key="opt" class="opt-label">
            <input type="checkbox" disabled :checked="opt === comp.defaultValue" /> {{ opt }}
          </label>
        </div>
        <!-- テーブル -->
        <div v-else-if="comp.type === 'テーブル(ページネーション付)'" class="placeholder-table">
          <label v-if="comp.label !== undefined" class="table-label"><InlineEdit v-model="comp.label" /></label>
          <div class="table-content-wrap">
            <div class="table-header">
              <span>ID</span>
              <span>名前</span>
              <span>ステータス</span>
            </div>
            <div class="table-body">
              <div class="table-row"><span>001</span><span>サンプル</span><span>アクティブ</span></div>
              <div class="table-row"><span>002</span><span>ダミーデータ</span><span>停止</span></div>
            </div>
            <div class="table-pagination">
              <span class="material-icons xs">chevron_left</span>
              <span>1 / 5</span>
              <span class="material-icons xs">chevron_right</span>
            </div>
          </div>
        </div>
        <!-- ボタン -->
        <div v-else-if="comp.type === 'ボタン'" class="placeholder-button">
          <button disabled><InlineEdit v-model="comp.label" fontSize="14px" fontWeight="600" /></button>
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

    <!-- Context Menu -->
    <div v-if="contextMenu.show" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
      <div class="context-menu-item" v-if="contextMenu.comp && contextMenu.comp.type !== 'HTML表示領域'" @click="handleContextMenuOption('editSettings')">
        <span class="material-icons xs">settings</span> 設定 (ID/Class等)
      </div>
      <div class="context-menu-item" v-if="contextMenu.comp && contextMenu.comp.type === 'HTML表示領域'" @click="handleContextMenuOption('editHtml')">
        <span class="material-icons xs">code</span> HTML編集
      </div>
      <div class="context-menu-item text-danger" @click="handleContextMenuOption('delete')">
        <span class="material-icons xs">delete</span> 削除する
      </div>
    </div>

    <!-- HTML Editor Modal -->
    <div v-show="htmlEditor.show" class="modal-overlay" @mousedown.prevent.stop="closeHtmlEditor">
      <div class="modal-content flex flex-col gap-3" style="width: 700px; max-width: 90vw; pointer-events: auto; padding: 16px;" @mousedown.stop>
        <div class="flex items-center justify-between">
          <h3 style="margin: 0;">HTML / JS コード編集</h3>
          <div class="flex items-center gap-2">
            <label style="font-size: 12px; color: var(--text-muted);">Keybinding:</label>
            <select v-model="htmlEditor.keybinding" @change="updateKeybinding" style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border); outline: none;">
              <option value="normal">Normal</option>
              <option value="vim">Vim</option>
              <option value="emacs">Emacs</option>
            </select>
          </div>
        </div>
        <div ref="aceContainerRef" style="width: 100%; height: 350px; border-radius: 6px; border: 1px solid var(--border);"></div>
        <div class="modal-actions" style="margin-top: 8px;">
          <button class="btn btn-ghost" @click="closeHtmlEditor">キャンセル</button>
          <button class="btn btn-primary" @click="saveHtmlEditor">保存</button>
        </div>
      </div>
    </div>

    <!-- Component Settings Modal -->
    <div v-if="settingsEditor.show" class="modal-overlay" @mousedown.prevent.stop="closeSettingsEditor">
      <div class="modal-content flex flex-col gap-3" style="width: 400px; max-width: 90vw; pointer-events: auto;" @mousedown.stop>
        <h3 style="margin:0 0 8px 0;">コンポーネント設定</h3>
        
        <div class="flex flex-col gap-1">
          <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">ID (任意)</label>
          <input type="text" v-model="settingsEditor.tempId" placeholder="例: my-button" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; width: 100%; box-sizing: border-box;" />
        </div>
        
        <div class="flex flex-col gap-1">
          <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">追加クラス (半角スペース区切り・任意)</label>
          <input type="text" v-model="settingsEditor.tempClass" placeholder="例: btn-primary mb-4" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; width: 100%; box-sizing: border-box;" />
        </div>

        <div class="flex flex-col gap-1">
          <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">カスタムアクション (onclick・任意)</label>
          <input type="text" v-model="settingsEditor.tempOnClick" placeholder="例: window.UI.showModal('メッセージ')" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; width: 100%; box-sizing: border-box;" />
        </div>

        <template v-if="settingsEditor.hasOptions">
          <hr style="border: 0; border-top: 1px solid var(--border); margin: 8px 0;" />
          <div class="flex flex-col gap-1">
            <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">選択肢 (カンマ区切り)</label>
            <input type="text" v-model="settingsEditor.tempOptions" placeholder="例: 選択肢1,選択肢2" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; width: 100%; box-sizing: border-box;" />
          </div>
          <div class="flex flex-col gap-1">
            <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">デフォルト選択値 (空でも可)</label>
            <input type="text" v-model="settingsEditor.tempDefault" placeholder="例: 選択肢1" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; width: 100%; box-sizing: border-box;" />
          </div>
        </template>

        <div class="modal-actions" style="margin-top: 8px; justify-content: flex-end; display: flex; gap: 8px;">
          <button class="btn btn-ghost" @click="closeSettingsEditor">キャンセル</button>
          <button class="btn btn-primary" @click="saveSettingsEditor">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import { store } from '../store.js'
import InlineEdit from './InlineEdit.vue'

import ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/keybinding-vim'
import 'ace-builds/src-noconflict/keybinding-emacs'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/snippets/html'
import 'ace-builds/src-noconflict/snippets/javascript'

ace.config.set('useWorker', false)

export default {
  name: 'ComponentCanvas',
  components: { InlineEdit },
  props: {
    components: { type: Array, required: true },
  },
  emits: ['removeComponent'],
  setup(props, { emit }) {
    const canvasRef = ref(null)

    // Context menu state
    const contextMenu = ref({ show: false, x: 0, y: 0, comp: null })
    const htmlEditor = ref({ show: false, content: '', comp: null, keybinding: 'normal' })
    const aceContainerRef = ref(null)
    const aceEditorInstance = shallowRef(null)
    const settingsEditor = ref({ 
      show: false, comp: null, tempId: '', tempClass: '', tempOnClick: '', 
      tempOptions: '', tempDefault: '', hasOptions: false 
    })

    // Drag state
    let dragState = null
    // Resize state
    let resizeState = null

    function snap(v) {
      return Math.round(v / 5) * 5
    }

    function handlePointerDown(e, comp) {
      if (e.button === 2) return // Ignore right-click, handled by context menu
      if (e.target.closest('.inline-edit') || e.target.closest('.comp-resize-handle') || e.target.closest('input, select')) return

      dragState = {
        comp,
        startX: e.clientX,
        startY: e.clientY,
        origX: comp.x,
        origY: comp.y,
      }
      e.target.setPointerCapture(e.pointerId)
    }

    function showContextMenu(e, comp) {
      contextMenu.value = { show: true, x: e.clientX, y: e.clientY, comp }
    }

    function closeContextMenu() {
      contextMenu.value.show = false
    }

    function handleContextMenuOption(action) {
      const comp = contextMenu.value.comp
      if (!comp) return
      
      if (action === 'editSettings') {
        openSettingsEditor(comp)
      } else if (action === 'editHtml') {
        openHtmlEditor(comp)
      } else if (action === 'delete') {
        emit('removeComponent', comp.id)
      }
      closeContextMenu()
    }

    function openHtmlEditor(comp) {
      if (!comp) return
      htmlEditor.value.comp = comp
      htmlEditor.value.content = comp.htmlContent || ''
      htmlEditor.value.show = true
      
      nextTick(() => {
        if (aceContainerRef.value) {
          if (!aceEditorInstance.value) {
            aceEditorInstance.value = ace.edit(aceContainerRef.value, {
              mode: 'ace/mode/html',
              theme: 'ace/theme/monokai',
              value: htmlEditor.value.content,
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              fontSize: 14,
            })
            
            // Add custom script snippet
            const snippetManager = ace.require("ace/snippets").snippetManager;
            const customHtmlSnippets = [
              {
                content: "<script type=\"text/javascript\">\n\t$1\n<\\/script>",
                name: "script",
                tabTrigger: "script"
              }
            ];
            snippetManager.register(customHtmlSnippets, "html");

            // Add UI Helper snippets
            const customJsSnippets = [
              { content: "window.UI.showLoading(\"${1:ロード中...}\");", name: "UI.showLoading", tabTrigger: "showLoading" },
              { content: "window.UI.hideLoading();", name: "UI.hideLoading", tabTrigger: "hideLoading" },
              { content: "window.UI.showProgress(${1:50}, \"${2:処理中...}\");", name: "UI.showProgress", tabTrigger: "showProgress" },
              { content: "window.UI.hideProgress();", name: "UI.hideProgress", tabTrigger: "hideProgress" },
              { content: "window.UI.showModal({\n\ttitle: \"${1:確認}\",\n\tcontentHtml: \"${2:<p>実行してもよろしいですか？</p>}\",\n\tbuttons: [\n\t\t{\n\t\t\tlabel: \"${3:キャンセル}\",\n\t\t\tstyle: \"None\",\n\t\t\tonClick: () => {\n\t\t\t\t${4:// キャンセルの処理}\n\t\t\t}\n\t\t},\n\t\t{\n\t\t\tlabel: \"${5:実行}\",\n\t\t\tstyle: \"Primary\",\n\t\t\tonClick: () => {\n\t\t\t\t${6:// 実行する処理}\n\t\t\t}\n\t\t}\n\t]\n});", name: "UI.showModal", tabTrigger: "showModal" },
              { content: "window.UI.hideModal();", name: "UI.hideModal", tabTrigger: "hideModal" },
              { content: "window.UI.showPrompt({\n\ttitle: \"${1:値の入力}\",\n\tdescriptionHtml: \"${2:<p>新しく設定する名前を入力してください</p>}\",\n\tdefaultValue: \"${3:デフォルト値}\",\n\tbuttons: [\n\t\t{\n\t\t\tlabel: \"${4:キャンセル}\",\n\t\t\tstyle: \"None\",\n\t\t\tonClick: () => {\n\t\t\t\t${5:// キャンセルの処理}\n\t\t\t}\n\t\t},\n\t\t{\n\t\t\tlabel: \"${6:決定}\",\n\t\t\tstyle: \"Info\",\n\t\t\tonClick: (val) => {\n\t\t\t\t${7:console.log(\"入力された値:\", val);}\n\t\t\t}\n\t\t}\n\t]\n});", name: "UI.showPrompt", tabTrigger: "showPrompt" },
              { content: "fetch(\"${1:url}\")\n\t.then(res => res.json())\n\t.then(data => {\n\t\tconsole.log(data);\n\t\t$2\n\t})\n\t.catch(err => console.error(err));", name: "fetch GET", tabTrigger: "fetchget" },
              { content: "fetch(\"${1:url}\", {\n\tmethod: \"POST\",\n\theaders: { \"Content-Type\": \"application/json\" },\n\tbody: JSON.stringify({ ${2:key}: ${3:value} })\n})\n\t.then(res => res.json())\n\t.then(data => {\n\t\tconsole.log(data);\n\t\t$4\n\t})\n\t.catch(err => console.error(err));", name: "fetch POST", tabTrigger: "fetchpost" }
            ];
            snippetManager.register(customJsSnippets, "javascript");
            snippetManager.register(customJsSnippets, "html");
            
          } else {
            aceEditorInstance.value.setValue(htmlEditor.value.content, -1)
          }
          updateKeybinding()
        }
      })
    }

    function updateKeybinding() {
      if (!aceEditorInstance.value) return;
      if (htmlEditor.value.keybinding === 'vim') {
        aceEditorInstance.value.setKeyboardHandler('ace/keyboard/vim')
      } else if (htmlEditor.value.keybinding === 'emacs') {
        aceEditorInstance.value.setKeyboardHandler('ace/keyboard/emacs')
      } else {
        aceEditorInstance.value.setKeyboardHandler(null)
      }
    }

    function closeHtmlEditor() {
      htmlEditor.value.show = false
    }

    function saveHtmlEditor() {
      if (htmlEditor.value.comp) {
        if (aceEditorInstance.value) {
          htmlEditor.value.content = aceEditorInstance.value.getValue()
        }
        htmlEditor.value.comp.htmlContent = htmlEditor.value.content
      }
      closeHtmlEditor()
      if (store.triggerSave) {
        store.triggerSave()
      }
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

    function openSettingsEditor(comp) {
      if (!comp) return;
      settingsEditor.value.comp = comp;
      settingsEditor.value.tempId = comp.customId || '';
      settingsEditor.value.tempClass = comp.customClass || '';
      settingsEditor.value.tempOnClick = comp.customOnClick || '';
      
      const hasOptions = comp.options !== undefined;
      settingsEditor.value.hasOptions = hasOptions;
      if (hasOptions) {
        settingsEditor.value.tempOptions = (comp.options || []).join(', ');
        settingsEditor.value.tempDefault = comp.defaultValue || '';
      }
      
      settingsEditor.value.show = true;
    }

    function closeSettingsEditor() {
      settingsEditor.value.show = false;
    }

    function saveSettingsEditor() {
      const comp = settingsEditor.value.comp;
      if (comp) {
        comp.customId = settingsEditor.value.tempId.trim();
        comp.customClass = settingsEditor.value.tempClass.trim();
        comp.customOnClick = settingsEditor.value.tempOnClick.trim();
        
        if (settingsEditor.value.hasOptions) {
          let optsArray = settingsEditor.value.tempOptions.split(',').map(s => s.trim()).filter(s => s);
          if (optsArray.length === 0) optsArray = ['選択肢1']; // fallback
          comp.options = optsArray;
          comp.defaultValue = settingsEditor.value.tempDefault.trim();
        }
      }
      closeSettingsEditor();
    }

    function getIframeSrcdoc(comp) {
      const rawContent = comp.htmlContent || '<div style="color:#94a3b8; text-align:center; font-family:sans-serif; padding-top:10px;">右クリックでHTMLを編集</div>';
      // Wrap content in a styled body so text defaults to a readable color on dark background
      return `
        <html>
          <head>
            <style>
              body {
                color: #e2e8f0; /* Default light color for dark background */
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                margin: 0;
                padding: 4px;
                box-sizing: border-box;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            ${rawContent}
          </body>
        </html>
      `;
    }

    onMounted(() => {
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
      window.addEventListener('click', closeContextMenu)
      window.addEventListener('contextmenu', closeContextMenu)
    })

    onUnmounted(() => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('click', closeContextMenu)
      window.removeEventListener('contextmenu', closeContextMenu)
    })

    return { 
      canvasRef, handlePointerDown, startResize, 
      contextMenu, showContextMenu, handleContextMenuOption,
      htmlEditor, closeHtmlEditor, saveHtmlEditor, aceContainerRef, updateKeybinding,
      settingsEditor, openSettingsEditor, closeSettingsEditor, saveSettingsEditor,
      getIframeSrcdoc,
      store 
    }
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
  cursor: grab;
}
.canvas-component:hover {
  box-shadow: 0 2px 8px rgba(124, 92, 252, 0.3);
  border-color: var(--accent);
}
.canvas-component:active { cursor: grabbing; }

.comp-body {
  flex: 1;
  padding: 6px;
  overflow: hidden;
  position: relative;
}
.comp-body > div {
  pointer-events: none;
}
.comp-body label {
  pointer-events: auto; /* allow clicking inline edit */
}
.comp-body .placeholder-button button {
  pointer-events: auto; /* allow clicking inline edit in button */
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
.placeholder-html-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.default-val-hint {
  font-size: 10px;
  color: var(--primary);
  margin-top: -2px;
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
.placeholder-radio,
.placeholder-check {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.label-heading {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}
.placeholder-radio .opt-label,
.placeholder-check .opt-label {
  font-size: 12px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px 0;
}
.placeholder-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 4px;
  align-items: stretch;
}
.table-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: flex-start;
  padding: 2px 4px;
}
.table-content-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  overflow: hidden;
}
.table-header {
  display: flex;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}
.table-header span, .table-row span {
  flex: 1;
}
.table-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.table-row {
  display: flex;
  padding: 6px 8px;
  font-size: 11px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
}
.table-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-secondary);
}
.placeholder-button {
  width: 100%;
  height: 100%;
}
.placeholder-button button {
  width: 100%;
  height: 100%;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  pointer-events: none;
  font-family: inherit;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-sm);
  padding: 4px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  min-width: 150px;
}
.context-menu-item {
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  transition: background 0.15s;
}
.context-menu-item:hover {
  background: var(--bg-hover);
}
.context-menu-item.text-danger {
  color: var(--danger);
}
.context-menu-item.text-danger:hover {
  background: var(--danger);
  color: #fff;
}
</style>
