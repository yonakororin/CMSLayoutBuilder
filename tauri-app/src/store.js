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
    { label: 'フォルダ', icon: 'folder' },
    { label: '設定', icon: 'settings' },
    { label: 'ユーザー', icon: 'person' },
    { label: 'グループ', icon: 'group' },
    { label: 'ホーム', icon: 'home' },
    { label: '検索', icon: 'search' },
    { label: 'スター', icon: 'star' },
    { label: 'お気に入り', icon: 'favorite' },
    { label: 'メール', icon: 'mail' },
    { label: 'チャット', icon: 'chat' },
    { label: '通知', icon: 'notifications' },
    { label: 'カレンダー', icon: 'calendar_month' },
    { label: 'リスト', icon: 'list' },
    { label: 'ダッシュ', icon: 'dashboard' },
    { label: '分析', icon: 'analytics' },
    { label: 'ショップ', icon: 'shopping_cart' },
    { label: '支払い', icon: 'payments' },
    { label: 'セキュリティ', icon: 'security' },
    { label: 'ビルド', icon: 'build' },
    { label: 'データ', icon: 'storage' },
    { label: 'クラウド', icon: 'cloud' },
    { label: '画像', icon: 'image' },
    { label: '動画', icon: 'videocam' },
    { label: '地図', icon: 'map' },
    { label: 'ヘルプ', icon: 'help' },
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
    isViewMode: false,
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
