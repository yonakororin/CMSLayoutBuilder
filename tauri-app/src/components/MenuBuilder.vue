<template>
  <div class="menu-builder">
    <!-- Title -->
    <div class="menu-header">
      <InlineEdit
        v-model="page.name"
        fontSize="20px"
        fontWeight="700"
        placeholder="メニューページタイトル"
      />
    </div>

    <div class="menu-layout">
      <!-- Left sidebar: menus & submenus -->
      <div class="menu-sidebar">
        <div v-for="menu in page.menus" :key="menu.id" class="menu-group">
          <div class="menu-item" :class="{ active: isMenuActive(menu) }" @click="selectMenu(menu)">
            <InlineEdit v-model="menu.name" fontWeight="500" />
            <div v-if="!store.isViewMode" class="flex gap-1" @click.stop>
              <button class="btn-icon" @click.stop="addSubmenu(menu)" title="サブメニュー追加">
                <span class="material-icons xs">add</span>
              </button>
              <button class="btn-icon danger" @click="store.removeMenu(page.id, menu.id)">
                <span class="material-icons xs">delete</span>
              </button>
            </div>
          </div>
          <!-- Submenus -->
          <template v-if="expandedMenuId === menu.id">
            <div
              v-for="sub in menu.submenus"
              :key="sub.id"
              class="submenu-item"
              :class="{ active: activeTarget?.id === sub.id }"
              @click="selectSubmenu(sub)"
            >
              <InlineEdit v-model="sub.name" />
              <button v-if="!store.isViewMode" class="btn-icon danger" @click.stop="store.removeSubmenu(page.id, menu.id, sub.id)">
                <span class="material-icons xs">close</span>
              </button>
            </div>
          </template>
        </div>

        <button v-if="!store.isViewMode" class="btn btn-primary" style="margin-top:8px;" @click="store.addMenu(page.id)">
          <span class="material-icons xs">add</span> メニュー追加
        </button>
      </div>

      <!-- Right content: tabs + canvas -->
      <div class="menu-content">
        <template v-if="activeTarget">
          <!-- Tabs -->
          <div class="tab-bar">
            <div
              v-for="(tab, idx) in activeTarget.tabs"
              :key="tab.id"
              class="tab"
              :class="{ active: activeTabId === tab.id }"
              @click="activeTabId = tab.id"
            >
              <InlineEdit v-model="tab.name" fontSize="12px" />
              <button v-if="!store.isViewMode && activeTarget.tabs.length > 1" class="btn-icon danger" @click.stop="removeTab(tab.id)" style="padding:0">
                <span class="material-icons xs">close</span>
              </button>
            </div>
            <button v-if="!store.isViewMode" class="btn-icon" @click="addTab">
              <span class="material-icons sm">add</span>
            </button>
          </div>

          <!-- Toolbox -->
          <div v-if="!store.isViewMode" class="toolbox">
            <button
              v-for="ct in componentTypes"
              :key="ct.type"
              class="btn btn-ghost"
              @click="addComponent(ct.type)"
            >
              {{ ct.label }}
            </button>
          </div>

          <!-- Canvas -->
          <ComponentCanvas
            v-if="activeTab"
            :components="activeTab.components"
            @removeComponent="removeComponent"
          />
        </template>
        <div v-else class="empty-content">
          <span class="material-icons" style="font-size:48px; color:var(--text-muted)">touch_app</span>
          <p>左のメニューからアイテムを選択してください</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { store, COMPONENT_TYPES } from '../store.js'
import InlineEdit from './InlineEdit.vue'
import ComponentCanvas from './ComponentCanvas.vue'

export default {
  name: 'MenuBuilder',
  components: { InlineEdit, ComponentCanvas },
  props: {
    page: { type: Object, required: true },
  },
  setup(props) {
    const activeTarget = ref(null) // menu or submenu object (has .tabs)
    const activeTabId = ref(null)
    const expandedMenuId = ref(null)

    const activeTab = computed(() => {
      if (!activeTarget.value || !activeTarget.value.tabs) return null
      return activeTarget.value.tabs.find(t => t.id === activeTabId.value) || activeTarget.value.tabs[0] || null
    })

    function isMenuActive(menu) {
      if (!activeTarget.value) return false
      if (activeTarget.value.id === menu.id) return true
      return menu.submenus.some(s => s.id === activeTarget.value.id)
    }

    function selectMenu(menu) {
      if (expandedMenuId.value === menu.id) {
        // Toggle expansion to closed
        expandedMenuId.value = null;
        // If the current active content belongs to this menu, clear it
        if (activeTarget.value && (activeTarget.value.id === menu.id || menu.submenus.some(s => s.id === activeTarget.value.id))) {
          activeTarget.value = null;
          activeTabId.value = null;
        }
      } else {
        // Expand a new menu
        expandedMenuId.value = menu.id;
        
        // If it has no submenus, select the menu itself as the content target
        if (menu.submenus.length === 0) {
          activeTarget.value = menu;
          activeTabId.value = menu.tabs?.[0]?.id || null;
        } else {
          // It has submenus, so wait for the user to select one. Clear the pane.
          activeTarget.value = null;
          activeTabId.value = null;
        }
      }
    }

    function addSubmenu(menu) {
      store.addSubmenu(props.page.id, menu.id);
      expandedMenuId.value = menu.id;
    }

    function selectSubmenu(sub) {
      activeTarget.value = sub
      activeTabId.value = sub.tabs?.[0]?.id || null
    }

    function addTab() {
      if (activeTarget.value) {
        store.addTab(activeTarget.value)
        const tabs = activeTarget.value.tabs
        activeTabId.value = tabs[tabs.length - 1].id
      }
    }

    function removeTab(tabId) {
      if (activeTarget.value) {
        store.removeTab(activeTarget.value, tabId)
        if (activeTabId.value === tabId) {
          activeTabId.value = activeTarget.value.tabs?.[0]?.id || null
        }
      }
    }

    function addComponent(ctype) {
      if (activeTab.value) {
        store.addComponent(activeTab.value, ctype)
      }
    }

    function removeComponent(compId) {
      if (activeTab.value) {
        store.removeComponent(activeTab.value, compId)
      }
    }

    // Watch for page changes to reset selection
    watch(() => props.page.id, () => {
      activeTarget.value = null
      activeTabId.value = null
      expandedMenuId.value = null
    })

    return {
      store,
      componentTypes: COMPONENT_TYPES,
      activeTarget,
      activeTabId,
      expandedMenuId,
      activeTab,
      isMenuActive,
      selectMenu,
      addSubmenu,
      selectSubmenu,
      addTab,
      removeTab,
      addComponent,
      removeComponent,
    }
  },
}
</script>

<style scoped>
.menu-builder {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.menu-header {
  padding: 12px 16px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
}
.menu-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.menu-sidebar {
  width: 240px;
  min-width: 240px;
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.menu-group {
  margin-bottom: 4px;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition);
}
.menu-item:hover { background: var(--bg-hover); }
.menu-item.active { background: var(--accent-light); border-left: 3px solid var(--accent); }

.submenu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 4px 24px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  transition: background var(--transition);
}
.submenu-item:hover { background: var(--bg-hover); }
.submenu-item.active { background: var(--accent-light); }

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px;
}
.tab-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 6px;
  flex-wrap: wrap;
}
.tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-bottom: none;
  cursor: pointer;
  font-size: 12px;
  transition: all var(--transition);
}
.tab:hover { background: var(--bg-hover); }
.tab.active {
  background: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent);
}

.toolbox {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.empty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
}
</style>
