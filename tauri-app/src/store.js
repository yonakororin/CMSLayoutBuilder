// ============================================================
// CMS Layout Builder – Reactive State Store
// ============================================================
import { reactive } from 'vue'

let _idCounter = 0
function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + (++_idCounter)
}

// Icon options available for cards
export const ICON_OPTIONS = [
    // Basic / Navigation
    { label: 'フォルダ', icon: 'folder' },
    { label: 'ホーム', icon: 'home' },
    { label: '検索', icon: 'search' },
    { label: '設定', icon: 'settings' },
    { label: 'メニュー', icon: 'menu' },
    { label: 'アプリ', icon: 'apps' },
    { label: 'リンク', icon: 'link' },
    { label: '外部サイト', icon: 'open_in_new' },

    // Communication / Users
    { label: 'ユーザー', icon: 'person' },
    { label: 'グループ', icon: 'group' },
    { label: 'メール', icon: 'mail' },
    { label: 'チャット', icon: 'chat' },
    { label: '電話', icon: 'phone' },
    { label: '通知', icon: 'notifications' },
    { label: 'サポート', icon: 'support_agent' },

    // Status / Feedback
    { label: 'お気に入り', icon: 'favorite' },
    { label: 'スター', icon: 'star' },
    { label: 'いいね', icon: 'thumb_up' },
    { label: 'チェック', icon: 'check_circle' },
    { label: '情報', icon: 'info' },
    { label: 'エラー', icon: 'error' },
    { label: '警告', icon: 'warning' },
    { label: 'ヘルプ', icon: 'help' },

    // Office / Productivity
    { label: 'カレンダー', icon: 'calendar_month' },
    { label: 'スケジュール', icon: 'schedule' },
    { label: 'リスト', icon: 'list' },
    { label: 'タスク', icon: 'assignment' },
    { label: 'ドキュメント', icon: 'article' },
    { label: 'メモ', icon: 'description' },
    { label: 'ダッシュボード', icon: 'dashboard' },
    { label: 'ウィジェット', icon: 'widgets' },
    { label: '分析', icon: 'analytics' },
    { label: 'グラフ', icon: 'bar_chart' },
    { label: 'レポート', icon: 'assessment' },
    { label: '仕事', icon: 'work' },
    { label: '印刷', icon: 'print' },

    // Tech / Development
    { label: 'コード', icon: 'code' },
    { label: 'ターミナル', icon: 'terminal' },
    { label: 'ビルド', icon: 'build' },
    { label: 'バグ', icon: 'bug_report' },
    { label: 'セキュリティ', icon: 'security' },
    { label: '鍵', icon: 'lock' },
    { label: 'データ', icon: 'storage' },
    { label: 'クラウド', icon: 'cloud' },
    { label: '地球・Web', icon: 'public' },
    { label: '拡張機能', icon: 'extension' },

    // Commerce / Media
    { label: 'ショップ', icon: 'shopping_cart' },
    { label: '支払い', icon: 'payments' },
    { label: '画像', icon: 'image' },
    { label: '動画', icon: 'videocam' },
    { label: '音楽', icon: 'music_note' },
    { label: '地図', icon: 'map' },
    { label: 'お店', icon: 'store' },
    { label: '配送', icon: 'local_shipping' },

    // File Actions
    { label: 'ダウンロード', icon: 'download' },
    { label: 'アップロード', icon: 'upload' },
    { label: '添付', icon: 'attach_file' },
    { label: '保存', icon: 'save' },
]

// Component types for menu builder
export const COMPONENT_TYPES = [
    { label: 'HTML', type: 'HTML表示領域' },
    { label: 'インプット', type: 'インプット(ラベル付き)' },
    { label: 'カレンダー', type: 'カレンダー(ラベル付き)' },
    { label: 'セレクト', type: 'セレクトボックス(ラベル付き)' },
    { label: 'ラジオ', type: 'ラジオボタン(ラベル付き)' },
    { label: 'チェック', type: 'チェックボックス(ラベル付き)' },
]

function createDefaultTab() {
    return {
        id: generateId(),
        name: 'タブ1',
        components: [],
    }
}

export const store = reactive({
    // --- Global ---
    projectPath: '',

    // --- Portal pages ---
    portalPages: [],

    // --- Menu pages ---
    menuPages: [],

    // --- UI state ---
    selectedPageType: null,  // 'portal' | 'menu'
    selectedPageId: null,
    selectedSubmenuId: null,  // content pane target

    // --- Helpers ---
    generateId,

    // --- Portal ---
    addPortalPage() {
        this.portalPages.push({
            id: generateId(),
            name: '新しいポータルページ',
            categories: [],
        })
    },
    removePortalPage(pageId) {
        this.portalPages = this.portalPages.filter(p => p.id !== pageId)
        if (this.selectedPageId === pageId) {
            this.selectedPageId = null
        }
    },
    getPortalPage(pageId) {
        return this.portalPages.find(p => p.id === pageId)
    },

    addCategory(pageId) {
        const page = this.getPortalPage(pageId)
        if (page) {
            page.categories.push({
                id: generateId(),
                name: '新しいカテゴリ',
                themeColor: '#4f46e5',
                cards: [],
            })
        }
    },
    removeCategory(pageId, catId) {
        const page = this.getPortalPage(pageId)
        if (page) {
            page.categories = page.categories.filter(c => c.id !== catId)
        }
    },

    addCard(pageId, catId) {
        const page = this.getPortalPage(pageId)
        if (!page) return
        const cat = page.categories.find(c => c.id === catId)
        if (cat) {
            cat.cards.push({
                id: generateId(),
                title: '新しいカード',
                link: '',
                icon: 'folder',
            })
        }
    },
    removeCard(pageId, catId, cardId) {
        const page = this.getPortalPage(pageId)
        if (!page) return
        const cat = page.categories.find(c => c.id === catId)
        if (cat) {
            cat.cards = cat.cards.filter(c => c.id !== cardId)
        }
    },

    // --- Menu pages ---
    addMenuPage() {
        this.menuPages.push({
            id: generateId(),
            name: '新しいメニューページ',
            menus: [],
        })
    },
    removeMenuPage(pageId) {
        this.menuPages = this.menuPages.filter(p => p.id !== pageId)
        if (this.selectedPageId === pageId) {
            this.selectedPageId = null
        }
    },
    getMenuPage(pageId) {
        return this.menuPages.find(p => p.id === pageId)
    },

    addMenu(pageId) {
        const page = this.getMenuPage(pageId)
        if (page) {
            page.menus.push({
                id: generateId(),
                name: '新しいメニュー',
                submenus: [],
                // when no submenus, this menu item itself has tabs/components
                tabs: [createDefaultTab()],
            })
        }
    },
    removeMenu(pageId, menuId) {
        const page = this.getMenuPage(pageId)
        if (page) {
            page.menus = page.menus.filter(m => m.id !== menuId)
        }
    },

    addSubmenu(pageId, menuId) {
        const page = this.getMenuPage(pageId)
        if (!page) return
        const menu = page.menus.find(m => m.id === menuId)
        if (menu) {
            menu.submenus.push({
                id: generateId(),
                name: '新しいサブメニュー',
                tabs: [createDefaultTab()],
            })
        }
    },
    removeSubmenu(pageId, menuId, subId) {
        const page = this.getMenuPage(pageId)
        if (!page) return
        const menu = page.menus.find(m => m.id === menuId)
        if (menu) {
            menu.submenus = menu.submenus.filter(s => s.id !== subId)
        }
    },

    addTab(target) {
        // target is a menu or submenu object with a tabs array
        if (target && target.tabs) {
            target.tabs.push({
                id: generateId(),
                name: 'タブ' + (target.tabs.length + 1),
                components: [],
            })
        }
    },
    removeTab(target, tabId) {
        if (target && target.tabs) {
            target.tabs = target.tabs.filter(t => t.id !== tabId)
        }
    },

    addComponent(tab, ctype) {
        if (tab) {
            tab.components.push({
                id: generateId(),
                type: ctype,
                x: 10,
                y: 10,
                w: 200,
                h: 60,
            })
        }
    },
    removeComponent(tab, compId) {
        if (tab) {
            tab.components = tab.components.filter(c => c.id !== compId)
        }
    },

    // --- Serialization ---
    toJSON() {
        return JSON.stringify({
            portalPages: this.portalPages,
            menuPages: this.menuPages,
        }, null, 2)
    },
    fromJSON(json) {
        try {
            const data = JSON.parse(json)
            this.portalPages = data.portalPages || []
            this.menuPages = data.menuPages || []
        } catch (e) {
            console.error('Failed to parse project data:', e)
        }
    },
})
