<template>
  <div id="app-root">
    <!-- Header -->
    <header class="app-header">
      <div class="flex items-center gap-3">
        <span class="material-icons lg" style="color:var(--accent)">dashboard_customize</span>
        <h1 class="app-title">CMS Layout Builder</h1>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost" @click="store.isViewMode = !store.isViewMode">
          <span class="material-icons sm">{{ store.isViewMode ? 'edit' : 'visibility' }}</span> 
          {{ store.isViewMode ? '編集モード' : 'ビューワモード' }}
        </button>
        <button class="btn btn-ghost" @click="showHelp = true">
          <span class="material-icons sm">help_outline</span> Help
        </button>
        <button class="btn btn-ghost" @click="loadProject">
          <span class="material-icons sm">folder_open</span> Load
        </button>
        <button class="btn btn-primary" @click="saveProject">
          <span class="material-icons sm">save</span> Save
        </button>
      </div>
    </header>

    <div class="app-body">
      <!-- Left sidebar: page list -->
      <nav class="app-sidebar">
        <div class="sidebar-section">
          <div class="sidebar-section-header">
            <span>ポータルページ</span>
            <button v-if="!store.isViewMode" class="btn-icon" @click="store.addPortalPage()">
              <span class="material-icons sm">add</span>
            </button>
          </div>
          <div
            v-for="p in store.portalPages"
            :key="p.id"
            class="sidebar-item"
            :class="{ active: store.selectedPageType === 'portal' && store.selectedPageId === p.id }"
            @click="selectPage('portal', p.id)"
          >
            <span class="material-icons sm">web</span>
            <span class="truncate">{{ p.name }}</span>
            <button v-if="!store.isViewMode" class="btn-icon danger" @click.stop="store.removePortalPage(p.id)" style="margin-left:auto">
              <span class="material-icons xs">close</span>
            </button>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-header">
            <span>メニューページ</span>
            <button v-if="!store.isViewMode" class="btn-icon" @click="store.addMenuPage()">
              <span class="material-icons sm">add</span>
            </button>
          </div>
          <div
            v-for="m in store.menuPages"
            :key="m.id"
            class="sidebar-item"
            :class="{ active: store.selectedPageType === 'menu' && store.selectedPageId === m.id }"
            @click="selectPage('menu', m.id)"
          >
            <span class="material-icons sm">menu_book</span>
            <span class="truncate">{{ m.name }}</span>
            <button v-if="!store.isViewMode" class="btn-icon danger" @click.stop="store.removeMenuPage(m.id)" style="margin-left:auto">
              <span class="material-icons xs">close</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- Main content -->
      <main class="app-main">
        <PortalBuilder
          v-if="store.selectedPageType === 'portal' && selectedPortalPage"
          :page="selectedPortalPage"
        />
        <MenuBuilder
          v-else-if="store.selectedPageType === 'menu' && selectedMenuPage"
          :page="selectedMenuPage"
        />
        <div v-else class="welcome">
          <span class="material-icons" style="font-size:64px; color:var(--accent); opacity:0.4">dashboard_customize</span>
          <h2>CMS Layout Builder</h2>
          <p>左のサイドバーからページを選択するか、新しいページを作成してください。</p>
          <div v-if="!store.isViewMode" class="flex gap-2" style="margin-top:16px">
            <button class="btn btn-primary" @click="store.addPortalPage()">
              <span class="material-icons sm">add</span> ポータルページ追加
            </button>
            <button class="btn btn-primary" @click="store.addMenuPage()">
              <span class="material-icons sm">add</span> メニューページ追加
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Help Modal -->
    <HelpModal v-if="showHelp" @close="showHelp = false" />

    <!-- Snackbar -->
    <Transition name="snack">
      <div v-if="snackMessage" class="snackbar">{{ snackMessage }}</div>
    </Transition>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { store } from './store.js'
import PortalBuilder from './components/PortalBuilder.vue'
import MenuBuilder from './components/MenuBuilder.vue'
import HelpModal from './components/HelpModal.vue'
import { generatePortalHtml, generateMenuHtml } from './htmlExport.js'

export default {
  name: 'App',
  components: { PortalBuilder, MenuBuilder, HelpModal },
  setup() {
    const snackMessage = ref('')
    const showHelp = ref(false)

    function showSnack(msg) {
      snackMessage.value = msg
      setTimeout(() => { snackMessage.value = '' }, 2500)
    }

    const selectedPortalPage = computed(() => store.getPortalPage(store.selectedPageId))
    const selectedMenuPage = computed(() => store.getMenuPage(store.selectedPageId))

    function selectPage(type, id) {
      store.selectedPageType = type
      store.selectedPageId = id
    }

    // ---- Save / Load via File API ----
    async function saveProject() {
      try {
        // Use File System Access API if available, otherwise download
        if (window.showDirectoryPicker) {
          const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
          const fileHandle = await dirHandle.getFileHandle('cms_project.json', { create: true })
          const writable = await fileHandle.createWritable()
          await writable.write(store.toJSON())
          await writable.close()

          try {
            // Write Portal Pages
            const portalDir = await dirHandle.getDirectoryHandle('ポータルページ', { create: true })
            for (const page of store.portalPages) {
              const html = generatePortalHtml(page)
              const pageDir = await portalDir.getDirectoryHandle(page.name, { create: true })
              const ph = await pageDir.getFileHandle('index.html', { create: true })
              const pw = await ph.createWritable()
              await pw.write(html)
              await pw.close()
            }

            // Write Menu Pages
            const menuDir = await dirHandle.getDirectoryHandle('メニューページ', { create: true })
            for (const page of store.menuPages) {
              const html = generateMenuHtml(page)
              const pageDir = await menuDir.getDirectoryHandle(page.name, { create: true })
              const mh = await pageDir.getFileHandle('index.html', { create: true })
              const mw = await mh.createWritable()
              await mw.write(html)
              await mw.close()
            }
          } catch (htmlErr) {
            console.error('HTML export warning:', htmlErr)
            // Continue since JSON was saved
          }

          store.projectPath = dirHandle.name
          showSnack('プロジェクトとHTMLを出力しました: ' + dirHandle.name)
        } else {
          // Fallback: download as file
          const blob = new Blob([store.toJSON()], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'cms_project.json'
          a.click()
          URL.revokeObjectURL(url)
          showSnack('プロジェクトファイルをダウンロードしました')
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e)
          showSnack('保存に失敗しました')
        }
      }
    }

    async function loadProject() {
      try {
        if (window.showDirectoryPicker) {
          const dirHandle = await window.showDirectoryPicker()
          const fileHandle = await dirHandle.getFileHandle('cms_project.json')
          const file = await fileHandle.getFile()
          const text = await file.text()
          store.fromJSON(text)
          store.projectPath = dirHandle.name
          store.selectedPageType = null
          store.selectedPageId = null
          showSnack('両方のページとプロジェクト設定を読み込みました: ' + dirHandle.name)
        } else {
          // Fallback: file input
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = '.json'
          input.onchange = async (e) => {
            const file = e.target.files[0]
            if (file) {
              const text = await file.text()
              store.fromJSON(text)
              store.selectedPageType = null
              store.selectedPageId = null
              showSnack('プロジェクトを読み込みました')
            }
          }
          input.click()
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e)
          showSnack('読み込みに失敗しました')
        }
      }
    }

    return {
      store,
      selectedPortalPage,
      selectedMenuPage,
      selectPage,
      saveProject,
      loadProject,
      snackMessage,
      showHelp,
    }
  },
}
</script>

<style scoped>
#app-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* ---- Header ---- */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  height: 50px;
  min-height: 50px;
}
.app-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

/* ---- Body ---- */
.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ---- Sidebar ---- */
.app-sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar-section {
  margin-bottom: 8px;
}
.sidebar-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  transition: all var(--transition);
}
.sidebar-item:hover { background: var(--bg-hover); }
.sidebar-item.active {
  background: var(--accent-light);
  color: var(--accent);
  border-left: 3px solid var(--accent);
}

/* ---- Main ---- */
.app-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ---- Welcome ---- */
.welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
}
.welcome h2 {
  font-size: 24px;
  color: var(--text-primary);
  margin-top: 8px;
}

/* ---- Snackbar ---- */
.snackbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: #fff;
  padding: 10px 24px;
  border-radius: var(--radius);
  font-size: 13px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  z-index: 2000;
}
.snack-enter-active { animation: slideUp 0.25s ease; }
.snack-leave-active { animation: slideUp 0.2s ease reverse; }
</style>
