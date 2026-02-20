<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="help-modal">
      <div class="help-header">
        <h2><span class="material-icons">help_outline</span> 操作マニュアル</h2>
        <button class="btn-icon" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Tab navigation -->
      <div class="help-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="help-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="material-icons sm">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab content -->
      <div class="help-body">

        <!-- 基本操作 -->
        <div v-if="activeTab === 'basic'" class="help-section">
          <h3>基本操作</h3>

          <div class="help-card">
            <h4><span class="material-icons sm">dashboard_customize</span> アプリの概要</h4>
            <p>CMS Layout Builder は、管理ツール風の Web ページレイアウトを視覚的に編集するツールです。</p>
            <p>以下の2種類のページを作成できます：</p>
            <ul>
              <li><strong>ポータルページ</strong> — カテゴリ別にカードが配置されたポータル画面</li>
              <li><strong>メニューページ</strong> — 左メニュー＋右コンテンツの管理画面</li>
            </ul>
          </div>

          <div class="help-card">
            <h4><span class="material-icons sm">save</span> 保存と読み込み</h4>
            <p>SaveまたはLoadボタンを押すと<b>フォルダ選択ダイアログ</b>が開きます。データを保存・読み込みたい「プロジェクトのルートフォルダ」を選択してください。</p>
            <table class="help-table" style="margin-top: 8px;">
              <tr>
                <td class="key-cell"><kbd>Save</kbd> ボタン</td>
                <td>現在の編集状態（JSON）と、各ページのエクスポートされたHTMLを指定フォルダに保存します。</td>
              </tr>
              <tr>
                <td class="key-cell"><kbd>Load</kbd> ボタン</td>
                <td>指定フォルダ内にある <code>cms_project.json</code> を読み込み、編集状態を復元します。</td>
              </tr>
            </table>
            <div class="help-note" style="margin-top: 12px; font-family: monospace; font-size: 11px; white-space: pre;">【保存されるフォルダ構成】
📂 選択したフォルダ
 ┣ 📄 cms_project.json (設定データ)
 ┣ 📂 ポータルページ
 ┃ ┗ 📂 (ページ名)
 ┃    ┗ 📄 index.html
 ┗ 📂 メニューページ
    ┗ 📂 (ページ名)
       ┗ 📄 index.html</div>
          </div>

          <div class="help-card">
            <h4><span class="material-icons sm">edit</span> インライン編集</h4>
            <p>タイトル・カテゴリ名・メニュー名・タブ名など、テキスト部分を<strong>ダブルクリック</strong>すると、その場で編集できます。</p>
            <p>編集後は <kbd>Enter</kbd> キーまたは別の場所をクリックして確定します。</p>
          </div>
        </div>

        <!-- ポータルページ -->
        <div v-if="activeTab === 'portal'" class="help-section">
          <h3>ポータルページの操作</h3>

          <div class="help-card">
            <h4><span class="material-icons sm">web</span> ページの作成</h4>
            <table class="help-table">
              <tr>
                <td class="key-cell">ページ追加</td>
                <td>左サイドバー「ポータルページ」横の <span class="material-icons xs">add</span> をクリック</td>
              </tr>
              <tr>
                <td class="key-cell">ページ選択</td>
                <td>サイドバーのページ名をクリック</td>
              </tr>
              <tr>
                <td class="key-cell">ページ削除</td>
                <td>ページ名右の <span class="material-icons xs">close</span> をクリック</td>
              </tr>
              <tr>
                <td class="key-cell">タイトル変更</td>
                <td>ページタイトルを<strong>ダブルクリック</strong></td>
              </tr>
            </table>
          </div>

          <div class="help-card">
            <h4><span class="material-icons sm">category</span> カテゴリの管理</h4>
            <table class="help-table">
              <tr>
                <td class="key-cell">カテゴリ追加</td>
                <td>「＋ カテゴリを追加」ボタンをクリック</td>
              </tr>
              <tr>
                <td class="key-cell">カテゴリ削除</td>
                <td>カテゴリヘッダー右の <span class="material-icons xs">delete</span> をクリック</td>
              </tr>
              <tr>
                <td class="key-cell">カテゴリ名変更</td>
                <td>カテゴリ名を<strong>ダブルクリック</strong></td>
              </tr>
            </table>
          </div>

          <div class="help-card">
            <h4><span class="material-icons sm">style</span> カードの操作</h4>
            <table class="help-table">
              <tr>
                <td class="key-cell">カード追加</td>
                <td>カテゴリ右の「＋ カード」ボタンをクリック</td>
              </tr>
              <tr>
                <td class="key-cell">カード編集</td>
                <td>カードを<strong>クリック</strong> → 編集モーダルでタイトル・リンク・アイコンを設定</td>
              </tr>
              <tr>
                <td class="key-cell">アイコン変更</td>
                <td>編集モーダルのアイコン欄をクリック → アイコングリッドから選択</td>
              </tr>
              <tr>
                <td class="key-cell">カード並び替え</td>
                <td>カードを<strong>ドラッグ＆ドロップ</strong>（カテゴリ間の移動も可能）</td>
              </tr>
              <tr>
                <td class="key-cell">カード削除</td>
                <td>カードにホバーして右上の <span class="material-icons xs">close</span> をクリック</td>
              </tr>
            </table>
            <p class="help-note">💡 ドラッグ中、挿入位置にはアクセントカラーの線が表示されます。</p>
          </div>
        </div>

        <!-- メニューページ -->
        <div v-if="activeTab === 'menu'" class="help-section">
          <h3>メニューページの操作</h3>

          <div class="help-card">
            <h4><span class="material-icons sm">menu_book</span> ページの作成</h4>
            <table class="help-table">
              <tr>
                <td class="key-cell">ページ追加</td>
                <td>左サイドバー「メニューページ」横の <span class="material-icons xs">add</span> をクリック</td>
              </tr>
              <tr>
                <td class="key-cell">ページ選択</td>
                <td>サイドバーのページ名をクリック</td>
              </tr>
              <tr>
                <td class="key-cell">タイトル変更</td>
                <td>ページタイトルを<strong>ダブルクリック</strong></td>
              </tr>
            </table>
          </div>

          <div class="help-card">
            <h4><span class="material-icons sm">list</span> メニューの管理</h4>
            <table class="help-table">
              <tr>
                <td class="key-cell">メニュー追加</td>
                <td>左エリアの「＋ メニュー追加」ボタン</td>
              </tr>
              <tr>
                <td class="key-cell">メニュー削除</td>
                <td>メニュー名右の <span class="material-icons xs">delete</span></td>
              </tr>
              <tr>
                <td class="key-cell">メニュー名変更</td>
                <td>メニュー名を<strong>ダブルクリック</strong></td>
              </tr>
              <tr>
                <td class="key-cell">サブメニュー追加</td>
                <td>メニュー項目右の <span class="material-icons xs">add</span> をクリック</td>
              </tr>
            </table>
            <p class="help-note">📌 サブメニューがないメニュー項目をクリックすると、そのメニュー自体のコンテンツ設定画面が表示されます。</p>
          </div>

          <div class="help-card">
            <h4><span class="material-icons sm">tab</span> タブの管理</h4>
            <table class="help-table">
              <tr>
                <td class="key-cell">タブ追加</td>
                <td>タブバー右端の <span class="material-icons xs">add</span> をクリック</td>
              </tr>
              <tr>
                <td class="key-cell">タブ切替</td>
                <td>タブ名をクリック</td>
              </tr>
              <tr>
                <td class="key-cell">タブ名変更</td>
                <td>タブ名を<strong>ダブルクリック</strong></td>
              </tr>
              <tr>
                <td class="key-cell">タブ削除</td>
                <td>タブ右の <span class="material-icons xs">close</span>（2つ以上ある場合のみ）</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- コンテンツ設定 -->
        <div v-if="activeTab === 'content'" class="help-section">
          <h3>コンテンツ設定画面</h3>

          <div class="help-card">
            <h4><span class="material-icons sm">widgets</span> コンポーネントの配置</h4>
            <p>タブ上部のツールバーからコンポーネントを選んで追加します。</p>
            <table class="help-table">
              <tr><td class="key-cell">HTML</td><td>HTML 表示領域（テキスト、画像など自由な内容を配置）</td></tr>
              <tr><td class="key-cell">インプット</td><td>ラベル付きテキスト入力欄</td></tr>
              <tr><td class="key-cell">カレンダー</td><td>ラベル付き日付入力欄</td></tr>
              <tr><td class="key-cell">セレクト</td><td>ラベル付きドロップダウン選択欄</td></tr>
              <tr><td class="key-cell">ラジオ</td><td>ラベル付きラジオボタン</td></tr>
              <tr><td class="key-cell">チェック</td><td>ラベル付きチェックボックス</td></tr>
            </table>
          </div>

          <div class="help-card">
            <h4><span class="material-icons sm">open_with</span> コンポーネントの操作</h4>
            <table class="help-table">
              <tr>
                <td class="key-cell">移動</td>
                <td>コンポーネント上部の灰色バーを<strong>ドラッグ</strong>（5px グリッドにスナップ）</td>
              </tr>
              <tr>
                <td class="key-cell">サイズ変更</td>
                <td>右下のハンドル <span class="material-icons xs">open_in_full</span> を<strong>ドラッグ</strong></td>
              </tr>
              <tr>
                <td class="key-cell">削除</td>
                <td>上部バー右の <span class="material-icons xs">close</span> をクリック</td>
              </tr>
            </table>
            <p class="help-note">💡 キャンバスには 5px 間隔のグリッドが表示されています。コンポーネントは自動的にグリッドにスナップします。</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'HelpModal',
  emits: ['close'],
  setup() {
    const activeTab = ref('basic')

    const tabs = [
      { id: 'basic',   label: '基本操作',     icon: 'home' },
      { id: 'portal',  label: 'ポータル',     icon: 'web' },
      { id: 'menu',    label: 'メニュー',     icon: 'menu_book' },
      { id: 'content', label: 'コンテンツ設定', icon: 'widgets' },
    ]

    return { activeTab, tabs }
  },
}
</script>

<style scoped>
.help-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 720px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow);
  animation: slideUp 0.2s ease;
}
.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.help-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
}
.help-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 20px 0;
  border-bottom: 1px solid var(--border);
}
.help-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}
.help-tab:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.help-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  background: var(--accent-light);
}
.help-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.help-section {
  animation: fadeIn 0.2s ease;
}
.help-section > h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--accent);
}
.help-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
}
.help-card h4 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary);
}
.help-card p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.6;
}
.help-card ul {
  list-style: none;
  padding-left: 4px;
  margin-bottom: 8px;
}
.help-card ul li {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 3px 0;
}
.help-card ul li::before {
  content: '•';
  color: var(--accent);
  margin-right: 8px;
}
.help-table {
  width: 100%;
  border-collapse: collapse;
}
.help-table tr {
  border-bottom: 1px solid var(--border);
}
.help-table tr:last-child {
  border-bottom: none;
}
.help-table td {
  padding: 8px 8px;
  font-size: 13px;
  color: var(--text-secondary);
  vertical-align: top;
}
.key-cell {
  width: 130px;
  font-weight: 500;
  color: var(--text-primary) !important;
  white-space: nowrap;
}
.help-note {
  background: var(--accent-light);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 12px;
  color: var(--accent) !important;
  margin-top: 8px;
  margin-bottom: 0 !important;
}
kbd {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 12px;
  font-family: inherit;
  color: var(--text-primary);
}
code {
  background: var(--bg-primary);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 12px;
  color: var(--accent);
}
</style>
