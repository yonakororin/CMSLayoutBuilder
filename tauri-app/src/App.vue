<template>
  <div id="app-root">
    <!-- Header -->
    <header class="app-header">
      <div class="flex items-center gap-3">
        <span class="material-icons lg" style="color:var(--accent)">dashboard_customize</span>
        <h1 class="app-title">CMS Layout Builder</h1>
      </div>
      <div class="flex items-center gap-2">
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
            <button class="btn-icon" @click="store.addPortalPage()">
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
            <button class="btn-icon danger" @click.stop="store.removePortalPage(p.id)" style="margin-left:auto">
              <span class="material-icons xs">close</span>
            </button>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-header">
            <span>メニューページ</span>
            <button class="btn-icon" @click="store.addMenuPage()">
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
            <button class="btn-icon danger" @click.stop="store.removeMenuPage(m.id)" style="margin-left:auto">
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
          <div class="flex gap-2" style="margin-top:16px">
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
    <DiffModal ref="diffModalRef" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { store } from './store.js'
import { storeHandle, loadHandle } from './db.js'
import PortalBuilder from './components/PortalBuilder.vue'
import MenuBuilder from './components/MenuBuilder.vue'
import HelpModal from './components/HelpModal.vue'
import DiffModal from './components/DiffModal.vue'
import { generatePortalPhp, generateMenuPhp } from './htmlExport.js'

export default {
  name: 'App',
  components: { PortalBuilder, MenuBuilder, HelpModal, DiffModal },
  setup() {
    const snackMessage = ref('')
    const diffModalRef = ref(null)
    const showHelp = ref(false)

      onMounted(async () => {
        try {
          const savedHandle = await loadHandle('last_project')
          if (savedHandle) {
            const permission = await savedHandle.queryPermission({ mode: 'readwrite' })
            if (permission === 'granted') {
              await loadProject(savedHandle)
              await syncProjectWithFileSystem(savedHandle)
            }
          }
        } catch (e) {
          console.error('Auto-load fail:', e)
        }
      })

      async function syncProjectWithFileSystem(dirHandle) {
        // Scan for manual folders (Discovery)
        const portalNames = []
        const menuNames = []
        try {
          const portalDir = await dirHandle.getDirectoryHandle('portal')
          for await (const entry of portalDir.values()) {
            if (entry.kind === 'directory') portalNames.push(entry.name)
          }
        } catch(e) {}
        try {
          const menuDir = await dirHandle.getDirectoryHandle('menu')
          for await (const entry of menuDir.values()) {
            if (entry.kind === 'directory') menuNames.push(entry.name)
          }
        } catch(e) {}

        const changed = store.syncFromFileSystem(portalNames, menuNames)
        console.log('Discovery sync completed, changed:', changed)
        return changed
      }


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
          if (!store.dirHandle) {
            store.dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
          } else {
            const permission = await store.dirHandle.requestPermission({ mode: 'readwrite' })
            if (permission !== 'granted') {
              store.dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
            }
          }
          const dirHandle = store.dirHandle;

          const plannedWrites = []

          // 1. Project JSON
          const projectJsonStr = store.toJSON()
          const fileHandle = await dirHandle.getFileHandle('cms_project.json', { create: true })
          let oldJson = null
          try { oldJson = await (await fileHandle.getFile()).text() } catch(e) {}
          plannedWrites.push({ handle: fileHandle, path: 'cms_project.json', newContent: projectJsonStr, oldContent: oldJson })

          try {
            // 2. Portal Pages
            const portalDir = await dirHandle.getDirectoryHandle('portal', { create: true })
            for (const page of store.portalPages) {
              const php = generatePortalPhp(page)
              const ph = await portalDir.getFileHandle('index.php', { create: true })
              let oldPhp = null
              try { oldPhp = await (await ph.getFile()).text() } catch(e) {}
              plannedWrites.push({ handle: ph, path: 'portal/index.php', newContent: php, oldContent: oldPhp })
            }

            // 3. Menu Pages
            const menuDir = await dirHandle.getDirectoryHandle('menu', { create: true })
            for (const page of store.menuPages) {
              const options = { includeMainJs: page.isNew };
              const php = generateMenuPhp(page, options)
              const pageDir = await menuDir.getDirectoryHandle(page.name, { create: true })
              const mh = await pageDir.getFileHandle('index.php', { create: true })
              let oldPhp = null
              try { oldPhp = await (await mh.getFile()).text() } catch(e) {}
              plannedWrites.push({ handle: mh, path: `menu/${page.name}/index.php`, newContent: php, oldContent: oldPhp })

              // Add main.js if it's a new page
              if (page.isNew) {
                const jsDir = await pageDir.getDirectoryHandle('js', { create: true })
                const jsh = await jsDir.getFileHandle('main.js', { create: true })
                let oldJs = null
                try { oldJs = await (await jsh.getFile()).text() } catch(e) {}
                plannedWrites.push({ 
                  handle: jsh, 
                  path: `menu/${page.name}/js/main.js`, 
                  newContent: '// ' + page.name + ' UI Logic\nconsole.log("' + page.name + ' loaded");\n', 
                  oldContent: oldJs,
                  onSaved: () => { delete page.isNew; }
                })
              }
            }
          } catch (htmlErr) {
            console.error('HTML export warning:', htmlErr)
          }

          // Filter writes to only those that changed
          const diffWrites = plannedWrites.filter(w => w.oldContent !== w.newContent)

          if (diffWrites.length === 0) {
            window.UI?.showModal?.('メッセージ', '<p>変更されたファイルはありません。すべて最新の状態です。</p>', null, null, 'OK')
            return
          }

          // Show Diff Modal and wait for user selection
          const selectedWrites = await diffModalRef.value.open(diffWrites)
          if (!selectedWrites || selectedWrites.length === 0) return // Cancelled

          const loadingEl = document.getElementById('glb-loading-overlay')
          if (loadingEl) window.UI?.showLoading?.("保存中...")
          
          for (const w of selectedWrites) {
            const writer = await w.handle.createWritable()
            await writer.write(w.newContent)
            await writer.close()
            if (w.onSaved) w.onSaved()
          }
          if (loadingEl) window.UI?.hideLoading?.()

          store.projectPath = dirHandle.name
          showSnack('保存が完了しました: ' + dirHandle.name)
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

    async function loadProject(handleOrEvent = null) {
      const specificHandle = (handleOrEvent && handleOrEvent.kind === 'directory') ? handleOrEvent : null;
      try {
        if (window.showDirectoryPicker) {
          const dirHandle = specificHandle || await window.showDirectoryPicker()
          store.dirHandle = dirHandle;
          
          const fileHandle = await dirHandle.getFileHandle('cms_project.json')
          const file = await fileHandle.getFile()
          const text = await file.text()
          store.fromJSON(text)

          // Auto-discovery sync on every load
          const foundNew = await syncProjectWithFileSystem(dirHandle)

          store.projectPath = dirHandle.name
          store.selectedPageType = null
          store.selectedPageId = null
          
          await storeHandle('last_project', dirHandle)
          
          if (foundNew) {
            showSnack('新しいフォルダを発見し反映しました。「SAVE」して保存してください。')
          } else {
            showSnack('プロジェクト情報を読み込みました: ' + dirHandle.name)
          }
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

    store.triggerSave = saveProject;

    return {
      store,
      selectedPortalPage,
      selectedMenuPage,
      selectPage,
      saveProject,
      loadProject,
      snackMessage,
      showHelp,
      diffModalRef,
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
  padding: 4px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  height: 40px;
  min-height: 40px;
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
  width: 180px;
  min-width: 180px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sidebar-section {
  margin-bottom: 8px;
}
.sidebar-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
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
