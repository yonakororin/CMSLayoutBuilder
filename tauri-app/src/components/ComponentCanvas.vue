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
              <span v-for="(col, ci) in getColumns(comp)" :key="ci" class="table-col-header">
                <InlineEdit :modelValue="col" @update:modelValue="updateColumn(comp, ci, $event)" />
              </span>
              <span class="table-col-actions">
                <button class="btn-icon table-col-btn" @click.stop="addColumn(comp)" title="カラム追加">
                  <span class="material-icons xs">add</span>
                </button>
                <button class="btn-icon table-col-btn" @click.stop="removeLastColumn(comp)" title="末尾カラム削除" v-if="getColumns(comp).length > 1">
                  <span class="material-icons xs">remove</span>
                </button>
              </span>
            </div>
            <div class="table-body">
              <div class="table-row"><span v-for="(col, ci) in getColumns(comp)" :key="ci">---</span></div>
              <div class="table-row"><span v-for="(col, ci) in getColumns(comp)" :key="ci">---</span></div>
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
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <label style="font-size: 12px; color: var(--text-muted);">追加:</label>
              <select @change="insertSnippet" style="font-size: 12px; padding: 4px; border-radius: 4px; background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border); outline: none;">
                <option value="">-- スニペットを選択 --</option>
                <optgroup label="PHP (サーバーサイド)">
                  <option value="php_session">セッション確認 (権限チェック)</option>
                  <option value="php_db_query">PDO データベースクエリ展開</option>
                  <option value="php_echo">PHP 変数出力 (htmlspecialchars)</option>
                </optgroup>
                <optgroup label="JavaScript (クライアントサイド)">
                  <option value="js_fetch">API Fetch リクエスト</option>
                  <option value="js_dom_ready">DOM Ready イベント</option>
                  <option value="js_modal">独自モーダル表示 (window.UI)</option>
                </optgroup>
                <optgroup label="HTML (UI部品)">
                  <option value="html_alert">Bootstrap アラート</option>
                  <option value="html_card">カスタム カードレイアウト</option>
                </optgroup>
                <optgroup label="カスタム (ブラウザ保存)" v-if="customSnippets.length > 0">
                  <option v-for="cs in customSnippets" :key="cs.id" :value="'custom_' + cs.id">{{ cs.name }}</option>
                </optgroup>
              </select>
              <button class="btn btn-ghost" style="padding: 2px; height: auto;" @click="openSnippetManager" title="カスタムスニペットを管理">
                <span class="material-icons sm" style="font-size: 16px;">settings</span>
              </button>
            </div>
            <div class="flex items-center gap-2">
              <label style="font-size: 12px; color: var(--text-muted);">Keybinding:</label>
              <select v-model="htmlEditor.keybinding" @change="updateKeybinding" style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border); outline: none;">
                <option value="normal">Normal</option>
                <option value="vim">Vim</option>
                <option value="emacs">Emacs</option>
              </select>
            </div>
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

        <template v-if="settingsEditor.hasColumns">
          <hr style="border: 0; border-top: 1px solid var(--border); margin: 8px 0;" />
          <div class="flex flex-col gap-1">
            <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">テーブルカラム名 (カンマ区切り)</label>
            <input type="text" v-model="settingsEditor.tempColumns" placeholder="例: ID,名前,ステータス" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; width: 100%; box-sizing: border-box;" />
          </div>
        </template>

        <div class="modal-actions" style="margin-top: 8px; justify-content: flex-end; display: flex; gap: 8px;">
          <button class="btn btn-ghost" @click="closeSettingsEditor">キャンセル</button>
          <button class="btn btn-primary" @click="saveSettingsEditor">保存</button>
        </div>
      </div>
    </div>

    <!-- Snippet Manager Modal -->
    <div v-if="snippetManager.show" class="modal-overlay" @mousedown.prevent.stop="closeSnippetManager">
      <div class="modal-content flex flex-col gap-3" style="width: 500px; max-width: 90vw; pointer-events: auto;" @mousedown.stop>
        <h3 style="margin:0 0 8px 0;">カスタムスニペット管理</h3>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: -8px;">
          よく使うコード片を登録できます。（このブラウザ/PCにのみ保存されます）
        </p>

        <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-surface);">
          <div v-for="snip in customSnippets" :key="snip.id" class="flex items-center justify-between p-2 border-bottom">
            <div class="truncate text-sm fw-bold" style="color: var(--text-primary);">
              {{ snip.name }} 
              <span v-if="snip.trigger" class="badge bg-secondary ms-2" style="font-size: 10px; font-weight: normal;">trigger: {{ snip.trigger }}</span>
            </div>
            <button class="btn-icon danger" @click="removeCustomSnippet(snip.id)" title="削除"><span class="material-icons xs">delete</span></button>
          </div>
          <div v-if="customSnippets.length === 0" class="p-3 text-center text-muted" style="font-size: 12px;">登録されていません</div>
        </div>

        <div class="flex flex-col gap-2 mt-2">
          <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">新しいスニペット名</label>
          <input type="text" v-model="snippetManager.newName" placeholder="例: カスタムヘッダー" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; width: 100%; box-sizing: border-box;" />

          <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">呼び出しトリガー (VSCode風: 半角英数)</label>
          <input type="text" v-model="snippetManager.newTrigger" placeholder="例: myheader" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; width: 100%; box-sizing: border-box;" />
          
          <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">挿入するコード ($1, $2 でカーソル位置指定)</label>
          <textarea v-model="snippetManager.newCode" rows="4" placeholder="ここにスニペットのコードを貼り付けます..." style="padding: 6px; border-radius: 4px; border: 1px solid var(--border); font-size: 12px; width: 100%; box-sizing: border-box; font-family: monospace;"></textarea>
          
          <button class="btn btn-primary btn-sm align-self-end mt-1" style="width: fit-content;" @click="addCustomSnippet">追加して保存</button>
        </div>
        
        <div class="modal-actions" style="justify-content: flex-end; display: flex; gap: 8px; margin-top: 8px;">
          <button class="btn btn-ghost" @click="closeSnippetManager">閉じる</button>
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
      tempOptions: '', tempDefault: '', hasOptions: false,
      tempColumns: '', hasColumns: false
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

            // Register standard dropdown snippets as VSCode tab-triggers
            const prebuiltSnippets = Object.keys(snippets).map(key => ({
              content: snippets[key],
              name: key,
              tabTrigger: key
            }));
            snippetManager.register(prebuiltSnippets, "html");
            snippetManager.register(prebuiltSnippets, "javascript");

            // Register user custom snippets as VSCode tab-triggers
            const userSnippets = customSnippets.value.map(cs => ({
              content: cs.code,
              name: cs.name,
              tabTrigger: cs.trigger || cs.name
            }));
            snippetManager.register(userSnippets, "html");
            snippetManager.register(userSnippets, "javascript");
            
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

    const snippets = {
      php_session: `<?php\n// セッションによる権限チェック\nif (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {\n    // 管理者向けコンテンツ\n} else {\n    // 一般ユーザー向けコンテンツ\n}\n?>`,
      php_db_query: `<?php\n// データベースクエリの例\n/*\n$stmt = $pdo->prepare("SELECT * FROM users WHERE status = ?");\n$stmt->execute(['active']);\n$results = $stmt->fetchAll(PDO::FETCH_ASSOC);\nforeach ($results as $row) {\n    echo "<div>" . htmlspecialchars($row['name']) . "</div>";\n}\n*/\n?>`,
      php_echo: `<?php echo htmlspecialchars($変数, ENT_QUOTES, 'UTF-8'); ?>`,
      js_fetch: `<script>\n// 非同期でデータを取得する例\nfetch('/api/endpoint')\n  .then(response => response.json())\n  .then(data => {\n      console.log(data);\n  })\n  .catch(error => console.error('Error:', error));\n<\\/script>`,
      js_dom_ready: `<script>\ndocument.addEventListener('DOMContentLoaded', () => {\n  // ページ読み込み完了時の処理\n});\n<\\/script>`,
      js_modal: `<script>\n// 組み込みのUIモーダルを呼び出す\nwindow.UI.showModal('確認', '<p>本当に実行しますか？</p>', () => {\n  console.log('OK pressed');\n});\n<\\/script>`,
      html_alert: `<div class="alert alert-info alert-dismissible fade show" role="alert">\n  <strong>お知らせ:</strong> ここにメッセージを入力\n  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\n</div>`,
      html_card: `<div class="card shadow-sm mb-3">\n  <div class="card-header bg-white fw-bold">カードタイトル</div>\n  <div class="card-body">\n    <p class="card-text">コンテンツをここに配置します。</p>\n  </div>\n</div>`
    };

    function insertSnippet(event) {
      const val = event.target.value;
      if (!val || !aceEditorInstance.value) return;
      
      let snippetText = snippets[val];
      
      // Try custom snippets
      if (val.startsWith('custom_')) {
        const id = val.replace('custom_', '');
        const custom = customSnippets.value.find(c => c.id === id);
        if (custom) snippetText = custom.code;
      }

      if (snippetText) {
        aceEditorInstance.value.session.insert(aceEditorInstance.value.getCursorPosition(), snippetText);
        aceEditorInstance.value.focus();
      }
      event.target.value = ""; // Reset select
    }

    // --- Custom Snippets Manager ---
    const customSnippets = ref(JSON.parse(localStorage.getItem('cms_custom_snippets') || '[]'))
    const snippetManager = ref({ show: false, newName: '', newTrigger: '', newCode: '' })

    function saveCustomSnippets() {
      localStorage.setItem('cms_custom_snippets', JSON.stringify(customSnippets.value))
    }

    function openSnippetManager() {
      snippetManager.value.show = true
    }

    function closeSnippetManager() {
      snippetManager.value.show = false
      snippetManager.value.newName = ''
      snippetManager.value.newTrigger = ''
      snippetManager.value.newCode = ''
    }

    function addCustomSnippet() {
      if (!snippetManager.value.newName.trim() || !snippetManager.value.newCode.trim()) return
      
      const newSnip = {
        id: Date.now().toString(36),
        name: snippetManager.value.newName.trim(),
        trigger: snippetManager.value.newTrigger.trim(),
        code: snippetManager.value.newCode
      };
      
      customSnippets.value.push(newSnip)
      saveCustomSnippets()
      
      // Live register to ACE editor without reopening
      if (aceEditorInstance.value) {
        const aceSnippetManager = ace.require("ace/snippets").snippetManager;
        aceSnippetManager.register([{
          content: newSnip.code,
          name: newSnip.name,
          tabTrigger: newSnip.trigger || newSnip.name
        }], "html");
      }
      
      snippetManager.value.newName = ''
      snippetManager.value.newTrigger = ''
      snippetManager.value.newCode = ''
    }

    function removeCustomSnippet(id) {
      customSnippets.value = customSnippets.value.filter(cs => cs.id !== id)
      saveCustomSnippets()
    }
    // -------------------------------

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

    // --- Table column helpers ---
    function getColumns(comp) {
      if (!comp.columns) comp.columns = ['カラム1', 'カラム2', 'カラム3']
      return comp.columns
    }
    function updateColumn(comp, idx, val) {
      if (!comp.columns) comp.columns = ['カラム1', 'カラム2', 'カラム3']
      comp.columns[idx] = val
    }
    function addColumn(comp) {
      if (!comp.columns) comp.columns = ['カラム1', 'カラム2', 'カラム3']
      comp.columns.push('カラム' + (comp.columns.length + 1))
    }
    function removeLastColumn(comp) {
      if (!comp.columns || comp.columns.length <= 1) return
      comp.columns.pop()
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

      const hasColumns = comp.type === 'テーブル(ページネーション付)';
      settingsEditor.value.hasColumns = hasColumns;
      if (hasColumns) {
        settingsEditor.value.tempColumns = getColumns(comp).join(', ');
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

        if (settingsEditor.value.hasColumns) {
          let colsArray = settingsEditor.value.tempColumns.split(',').map(s => s.trim()).filter(s => s);
          if (colsArray.length === 0) colsArray = ['カラム1'];
          comp.columns = colsArray;
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
      htmlEditor, closeHtmlEditor, saveHtmlEditor, aceContainerRef, updateKeybinding, insertSnippet,
      settingsEditor, openSettingsEditor, closeSettingsEditor, saveSettingsEditor,
      getIframeSrcdoc,
      getColumns, updateColumn, addColumn, removeLastColumn,
      store,
      customSnippets, snippetManager, openSnippetManager, closeSnippetManager, addCustomSnippet, removeCustomSnippet
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
.table-col-header {
  display: flex;
  align-items: center;
  pointer-events: auto;
}
.table-col-actions {
  display: flex;
  gap: 2px;
  flex: 0 0 auto;
  pointer-events: auto;
}
.table-col-btn {
  width: 18px !important;
  height: 18px !important;
  padding: 1px !important;
  opacity: 0.5;
}
.table-col-btn:hover {
  opacity: 1;
  color: var(--accent) !important;
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
