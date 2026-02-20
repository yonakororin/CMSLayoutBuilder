const USER_MENU_CSS = `
    .user-profile-menu { position: absolute; top: 24px; right: 32px; z-index: 100; }
    #user-menu-btn {
      display: flex; align-items: center; gap: 8px;
      background: var(--bg-card); border: 1px solid var(--border);
      padding: 8px 16px; border-radius: 20px; cursor: pointer;
      color: var(--text-main); font-size: 0.95rem; font-weight: 600;
      box-shadow: var(--shadow-sm); transition: all 0.2s;
    }
    #user-menu-btn:hover { box-shadow: var(--shadow-md); background: rgba(0,0,0,0.02); }
    #user-menu-btn .material-icons { font-size: 20px; color: var(--text-muted); }
    .user-dropdown-menu {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 12px; box-shadow: var(--shadow-md);
      width: 200px; display: none; flex-direction: column; overflow: hidden;
    }
    .user-dropdown-menu.show { display: flex; animation: dropIn 0.2s ease; }
    @keyframes dropIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .user-dropdown-menu a {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; text-decoration: none;
      color: var(--text-main); font-size: 0.9rem; font-weight: 500;
      transition: background 0.2s;
    }
    .user-dropdown-menu a:hover { background: rgba(0,0,0,0.03); }
    .user-dropdown-menu a .material-icons { color: var(--text-muted); font-size: 18px; }
`;

const USER_MENU_HTML = `
    <div class="user-profile-menu">
      <button id="user-menu-btn" onclick="document.getElementById('user-dropdown').classList.toggle('show')">
        <span class="material-icons">account_circle</span>
        <span id="user-name-display">ユーザー名</span>
        <span class="material-icons" style="font-size: 16px; margin-left: -4px;">arrow_drop_down</span>
      </button>
      <div id="user-dropdown" class="user-dropdown-menu">
        <a href="#" id="user-action-password" onclick="event.preventDefault(); console.log('Click: Password Change');">
          <span class="material-icons">vpn_key</span> パスワード変更
        </a>
        <a href="#" id="user-action-logout" onclick="event.preventDefault(); console.log('Click: Logout');">
          <span class="material-icons">logout</span> ログアウト
        </a>
      </div>
    </div>
`;

const USER_MENU_SCRIPT = `
    document.addEventListener('click', function(e) {
      const btn = document.getElementById('user-menu-btn');
      const dropdown = document.getElementById('user-dropdown');
      if (btn && dropdown && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
`;

export function generatePortalHtml(page) {
  let categoriesHtml = page.categories.map(cat => `
    <div class="category" style="--category-theme: ${cat.themeColor || '#4f46e5'};">
      <h2>${cat.name}</h2>
      <div class="cards">
        ${cat.cards.map(card => `
          <a class="card" href="${card.link || '#'}" target="_blank">
            <span class="icon">${card.icon}</span>
            <span class="title">${card.title}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${page.name}</title>
  <style>
    /* Premium Modern Dashboard Aesthetics */
    :root {
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --bg-main: #f1f5f9;
      --bg-card: #ffffff;
      --text-main: #0f172a;
      --text-muted: #475569;
      --border: #cbd5e1;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
      --shadow-md: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
      --shadow-hover: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
      --radius: 16px;
    }
    body { 
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; 
      background: var(--bg-main); 
      background-image: radial-gradient(circle at top right, #e0e7ff, transparent 40%),
                        radial-gradient(circle at bottom left, #e0e7ff, transparent 40%);
      color: var(--text-main);
      margin: 0; padding: 24px 16px; 
      min-height: 100vh;
      display: flex; flex-direction: column; align-items: center;
      box-sizing: border-box;
    }
    .container {
      width: 100%; max-width: 1400px;
    }
    h1 { 
      text-align: left; color: var(--text-main); 
      font-weight: 800; font-size: 2.5rem; letter-spacing: -0.03em;
      margin-top: 0; margin-bottom: 24px;
      padding-bottom: 12px; border-bottom: 2px solid var(--border);
    }
    .category { 
      background: var(--bg-card); border-radius: var(--radius); 
      padding: 16px 20px; margin-bottom: 16px; 
      box-shadow: var(--shadow-md); border: 1px solid rgba(255,255,255,0.6);
      border-top: 4px solid var(--category-theme);
      backdrop-filter: blur(10px);
    }
    .category h2 { 
      margin-top: 0; font-size: 1.3rem; font-weight: 700; 
      color: var(--category-theme); margin-bottom: 12px;
      letter-spacing: -0.01em;
    }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
    .card { 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 80px; border: 1px solid var(--border); border-radius: 10px;
      text-decoration: none; color: var(--text-main); 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      padding: 8px; box-sizing: border-box;
    }
    .card:hover { 
      transform: translateY(-4px); box-shadow: var(--shadow-hover); 
      border-color: var(--category-theme); background: #ffffff;
    }
    .icon { 
      font-size: 30px; margin-bottom: 8px; 
      color: var(--category-theme); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .card:hover .icon { transform: scale(1.1) translateY(-2px); filter: brightness(0.9); }
    .title { font-size: 0.85rem; font-weight: 600; text-align: center; line-height: 1.2; }
    
    /* Material Icons */
    @font-face {
      font-family: 'Material Icons';
      font-style: normal;
      font-weight: 400;
      src: url(https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
    }
    .icon, .material-icons { font-family: 'Material Icons'; font-weight: normal; font-style: normal; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; }
    ${USER_MENU_CSS}
  </style>
  <script>
    ${USER_MENU_SCRIPT}
  </script>
</head>
<body>
  ${USER_MENU_HTML}
  <div class="container">
    <h1>${page.name}</h1>
    ${categoriesHtml}
  </div>
</body>
</html>`
}

export function generateMenuHtml(page) {
  let menusHtml = page.menus.map((menu, mIdx) => {
    if (menu.submenus.length > 0) {
      return `
        <div class="menu-item has-submenu">
          <div class="menu-title" onclick="toggleSubmenu('${mIdx}')">
            <span>${menu.name}</span>
            <span class="material-icons expand-icon">expand_more</span>
          </div>
          <ul id="submenu-${mIdx}" class="submenu">${menu.submenus.map((sub, sIdx) => `
            <li><a href="#content-${mIdx}-${sIdx}" onclick="showContent('content-${mIdx}-${sIdx}')">${sub.name}</a></li>
          `).join('')}</ul>
        </div>
      `
    } else {
      return `
        <div class="menu-item menu-item-direct">
          <div class="menu-title" onclick="showContentDirect('content-${mIdx}-main')">
            <span>${menu.name}</span>
          </div>
        </div>
      `
    }
  }).join('')

  let contentsHtml = page.menus.map((menu, mIdx) => {
    if (menu.submenus.length === 0) {
      return generateTabsHtml(menu, `content-${mIdx}-main`)
    } else {
      return menu.submenus.map((sub, sIdx) => generateTabsHtml(sub, `content-${mIdx}-${sIdx}`)).join('')
    }
  }).join('')

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${page.name}</title>
  <style>
    :root {
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --bg-main: #f1f5f9;
      --bg-sidebar: #0f172a;      /* Sleek Dark Sidebar */
      --sidebar-text: #f8fafc;
      --sidebar-muted: #94a3b8;
      --sidebar-border: #1e293b;
      --sidebar-hover: #1e293b;
      --sidebar-active: #38bdf8;  /* Vibrant Sky Blue Accent */
      --bg-card: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      --radius: 16px;
    }
    body { 
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; 
      display: flex; height: 100vh; margin: 0; background: var(--bg-main); 
      color: var(--text-main); overflow: hidden;
    }
    .sidebar { 
      box-sizing: border-box; width: 220px; min-width: 220px;
      background: var(--bg-sidebar); border-right: 1px solid var(--sidebar-border); 
      padding: 16px 12px; z-index: 10;
      display: flex; flex-direction: column; gap: 4px;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s;
      overflow-x: hidden; white-space: nowrap; color: var(--sidebar-text);
      box-shadow: 4px 0 24px rgba(0,0,0,0.15);
    }
    .sidebar.closed {
      width: 72px; min-width: 72px; padding: 16px 12px;
    }
    .sidebar-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
      padding-bottom: 16px; border-bottom: 2px solid var(--sidebar-border);
    }
    .sidebar.closed .sidebar-header { border-bottom-color: transparent; justify-content: center; }
    .hamburger {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 0;
      width: 44px; min-width: 44px; height: 44px; 
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--sidebar-text); 
      border-radius: 12px; transition: all 0.3s;
    }
    .hamburger:hover { background: rgba(255,255,255,0.1); color: var(--sidebar-active); border-color: rgba(255,255,255,0.2); transform: scale(1.05); }
    h2.sidebar-title { 
      font-size: 1.35rem; font-weight: 800; letter-spacing: -0.025em;
      margin: 0; transition: opacity 0.2s; overflow: hidden; color: var(--sidebar-text);
    }
    .sidebar.closed h2.sidebar-title { opacity: 0; }
    
    .sidebar-content {
      display: flex; flex-direction: column; gap: 4px;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1); opacity: 1; 
      overflow-y: auto; overflow-x: hidden; height: 100%;
    }
    .sidebar.closed .sidebar-content { opacity: 0; pointer-events: none; }
    
    /* Menu Titles & Submenus (Dark Theme) */
    .menu-item { margin-bottom: 0; }
    .menu-title {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 12px; font-size: 0.9rem; font-weight: 600;
      color: var(--sidebar-text); border-radius: 8px;
      cursor: pointer; transition: all 0.2s;
      border: 1px solid transparent;
    }
    .menu-title:hover {
      background: var(--sidebar-hover); color: var(--sidebar-text);
      border-color: rgba(255,255,255,0.05);
    }
    /* Active indicator */
    .menu-title:focus {
      background: var(--sidebar-hover); color: var(--sidebar-active); 
      border-color: rgba(56, 189, 248, 0.3);
    }
    .expand-icon { font-size: 20px; color: var(--sidebar-muted); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .menu-title:hover .expand-icon { color: var(--sidebar-active); }
    .menu-item.open .expand-icon { transform: rotate(180deg); color: var(--sidebar-active); } 
    
    .menu-item ul { 
      list-style: none; padding: 0; margin: 4px 0 0 12px; 
      display: none; flex-direction: column; gap: 2px; 
      border-left: 2px solid var(--sidebar-border);
    }
    .menu-item.open ul { display: flex; animation: slideDown 0.3s ease; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    
    .menu-item a { 
      text-decoration: none; color: var(--sidebar-muted); font-size: 0.85rem; font-weight: 500;
      display: block; padding: 6px 10px; border-radius: 8px; margin-left: 10px;
      transition: all 0.2s; border: 1px solid transparent;
    }
    .menu-item a:hover { 
      background: rgba(255,255,255,0.05); color: var(--sidebar-text); 
    }
    
    /* Main Content Area */
    .main { 
      flex: 1; padding: 24px; overflow-y: auto; position: relative;
      background-image: radial-gradient(circle at center, #ffffff 0%, transparent 100%);
    }
    
    .content-pane { 
      display: none; background: rgba(255,255,255,0.8); border-radius: var(--radius); 
      padding: 24px; box-shadow: var(--shadow-md); border: 1px solid rgba(255,255,255,0.6);
      backdrop-filter: blur(10px);
      height: 100%; box-sizing: border-box; animation: fadeIn 0.4s ease;
    }
    .content-pane.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .content-pane h3 { margin-top: 0; font-size: 1.75rem; font-weight: 800; margin-bottom: 16px; color: var(--text-main); letter-spacing: -0.02em; }
    
    .tabs { 
      display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid var(--border); 
      padding-bottom: 0; 
    }
    .tab { 
      padding: 8px 16px; cursor: pointer; border-bottom: 3px solid transparent; 
      font-size: 1rem; font-weight: 600; color: var(--text-muted); 
      transition: all 0.2s; margin-bottom: -2px; border-radius: 8px 8px 0 0;
    }
    .tab:hover { color: var(--text-main); background: rgba(0,0,0,0.02); }
    .tab.active { color: var(--primary); border-bottom-color: var(--primary); background: rgba(79, 70, 229, 0.05); }
    
    .tab-content { 
      display: none; position: relative; width: 100%; 
      height: calc(100% - 100px); border: 1px dashed var(--border); 
      background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #ffffff 10px, #ffffff 20px);
      border-radius: 8px; overflow: auto; 
    }
    .tab-content.active { display: block; }
    
    .component { 
      position: absolute; border: 1px solid var(--border); background: var(--bg-card); 
      padding: 4px; box-sizing: border-box; box-shadow: var(--shadow-sm); 
      border-radius: 6px; display: flex; align-items: center; justify-content: center;
      transition: box-shadow 0.2s;
    }
    .component:hover { box-shadow: var(--shadow-md); border-color: #cbd5e1; }
    
    .c-html { background: transparent; border: none; box-shadow: none; color: var(--text-muted); font-size: 0.9rem; margin: 0; }
    .c-input { flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px; }
    .c-input label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0px; }
    .c-input input, .c-input select { 
      width: 100%; padding: 4px 8px; border: 1px solid var(--border); 
      border-radius: 4px; box-sizing: border-box; font-size: 0.85rem;
      transition: all 0.2s; background: #f8fafc;
    }
    .c-input input:focus, .c-input select:focus {
      outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15); background: #ffffff;
    }
    .c-radio-check { flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 0; }
    .c-radio-check label { cursor: pointer; font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 4px; padding: 1px 0; }
    
    .c-table { flex-direction: column; padding: 0; overflow: hidden; justify-content: flex-start; }
    .c-table-wrap { width: 100%; flex: 1; overflow-y: auto; overflow-x: auto; }
    .c-table table { width: 100%; border-collapse: collapse; min-width: 300px; }
    .c-table th { background: #f8fafc; padding: 8px 12px; text-align: left; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); border-bottom: 2px solid var(--border); position: sticky; top: 0; box-shadow: 0 2px 0 0 var(--border); }
    .c-table td { padding: 8px 12px; font-size: 0.85rem; color: var(--text-main); border-bottom: 1px solid #e2e8f0; }
    .c-table tbody tr:hover td { background: rgba(0,0,0,0.01); }
    .c-table-footer { width: 100%; padding: 8px 12px; background: #ffffff; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; }
    .c-table-footer .info { font-size: 0.85rem; color: var(--text-muted); }
    .c-table-footer .pagination { display: flex; gap: 4px; }
    .c-table-footer .page-btn { background: #ffffff; border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 0.85rem; color: var(--text-main); transition: all 0.2s; }
    .c-table-footer .page-btn:hover { background: #f1f5f9; }
    .c-table-footer .page-btn.active { background: var(--primary); color: #ffffff; border-color: var(--primary); }
    
    .c-button { flex-direction: column; justify-content: center; align-items: center; background: transparent; border: none; box-shadow: none; padding: 4px; }
    .c-button button { 
      width: 100%; height: 100%; border: none; border-radius: 6px; font-family: inherit;
      background: var(--primary); color: #ffffff; font-size: 0.9rem; font-weight: 600; 
      cursor: pointer; box-shadow: var(--shadow-sm); transition: all 0.2s;
    }
    .c-button button:hover { background: var(--primary-hover); box-shadow: var(--shadow-md); transform: translateY(-1px); }
    
    #welcome.active {
       display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
       background: transparent; box-shadow: none; border: none;
    }
    #welcome h2 { font-size: 1.8rem; margin-bottom: 12px; color: var(--text-main); }
    #welcome p { color: var(--text-muted); font-size: 1.1rem; max-width: 400px; line-height: 1.6; }
    
    /* Material Icons */
    @font-face {
      font-family: 'Material Icons'; font-style: normal; font-weight: 400;
      src: url(https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
    }
    .material-icons { font-family: 'Material Icons'; font-weight: normal; font-style: normal; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; }
    ${USER_MENU_CSS}
  </style>
  <script>
    ${USER_MENU_SCRIPT}
    
    function toggleSidebar() {
      document.querySelector('.sidebar').classList.toggle('closed');
    }
    function toggleSubmenu(mIdx) {
      let isCollapsing = false;
      const targetContainer = document.getElementById('submenu-' + mIdx)?.parentElement;
      if (targetContainer && targetContainer.classList.contains('open')) {
        isCollapsing = true;
      }
      
      // Close all submenus
      document.querySelectorAll('.menu-item.has-submenu').forEach(el => {
        el.classList.remove('open');
      });

      if (isCollapsing) {
        showContent('welcome');
      } else {
        if (targetContainer) targetContainer.classList.add('open');
        showContent('welcome');
      }
    }
    function showContentDirect(id) {
      // Menu without submenus: close any open submenus
      document.querySelectorAll('.menu-item.has-submenu').forEach(el => {
        el.classList.remove('open');
      });
      showContent(id);
    }
    function showContent(id) {
      document.querySelectorAll('.content-pane').forEach(el => el.classList.remove('active'));
      const target = document.getElementById(id);
      if (target) target.classList.add('active');
    }
    function showTab(paneId, tabId) {
      const pane = document.getElementById(paneId);
      if (!pane) return;
      pane.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
      pane.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      pane.querySelector('[data-tab="' + tabId + '"]').classList.add('active');
      pane.querySelector('.tab-content-' + tabId).classList.add('active');
    }
  </script>
</head>
<body>
  <div class="sidebar">
    <div class="sidebar-header">
      <button class="hamburger" onclick="toggleSidebar()" title="メニューの開閉">
        <span class="material-icons">menu</span>
      </button>
      <h2 class="sidebar-title">${page.name}</h2>
    </div>
    <div class="sidebar-content">
      ${menusHtml}
    </div>
  </div>
  <div class="main">
    ${USER_MENU_HTML}
    ${contentsHtml}
    <div id="welcome" class="content-pane active">
      <h2>メニューを選択してください</h2>
      <p>左側のメニューから項目を選択すると、ここに内容が表示されます。</p>
    </div>
  </div>
</body>
</html>`
}

function generateTabsHtml(targetObj, paneId) {
  if (!targetObj.tabs || targetObj.tabs.length === 0) return ''

  if (targetObj.tabs.length === 1) {
    const tab = targetObj.tabs[0]
    const contents = tab.components.map(comp => generateComponentHtml(comp)).join('')
    return `
      <div id="${paneId}" class="content-pane">
        <h3>${targetObj.name}</h3>
        <div class="tab-content active" style="border:none; height:calc(100% - 60px); background:transparent;">
          ${contents}
        </div>
      </div>
    `
  }

  const tabsNav = targetObj.tabs.map((tab, idx) => `
    <div class="tab ${idx === 0 ? 'active' : ''}" data-tab="${tab.id}" onclick="showTab('${paneId}', '${tab.id}')">${tab.name}</div>
  `).join('')

  const tabsContent = targetObj.tabs.map((tab, idx) => `
    <div class="tab-content tab-content-${tab.id} ${idx === 0 ? 'active' : ''}">
      ${tab.components.map(comp => generateComponentHtml(comp)).join('')}
    </div>
  `).join('')

  return `
    <div id="${paneId}" class="content-pane">
      <h3>${targetObj.name}</h3>
      <div class="tabs">${tabsNav}</div>
      ${tabsContent}
    </div>
  `
}

function generateComponentHtml(comp) {
  const style = `left: ${comp.x}px; top: ${comp.y}px; width: ${comp.w}px; height: ${comp.h}px;`
  let inner = ''
  let cls = 'component'
  if (comp.type === 'HTML表示領域') {
    inner = 'HTML表示領域'
    cls += ' c-html'
  } else if (comp.type === 'インプット(ラベル付き)') {
    inner = `<label>${comp.label || 'ラベル'}</label><input type="text" placeholder="テキスト入力" />`
    cls += ' c-input'
  } else if (comp.type === 'カレンダー(ラベル付き)') {
    inner = `<label>${comp.label || '日付'}</label><input type="date" />`
    cls += ' c-input'
  } else if (comp.type === 'セレクトボックス(ラベル付き)') {
    const opts = comp.options || ['-- 選択 --'];
    const optsHtml = opts.map(o => `<option ${o === comp.defaultValue ? 'selected' : ''}>${o}</option>`).join('');
    inner = `<label>${comp.label || '選択'}</label><select>${optsHtml}</select>`
    cls += ' c-input'
  } else if (comp.type === 'ラジオボタン(ラベル付き)') {
    const opts = comp.options || ['ラジオ'];
    const optsHtml = opts.map(o => `<label><input type="radio" name="${comp.id}" ${o === comp.defaultValue ? 'checked' : ''} /> ${o}</label>`).join('');
    inner = `<label style="font-size:0.8rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; margin-bottom: 2px;">${comp.label || 'ラジオ選択'}</label>` + optsHtml;
    cls += ' c-radio-check'
  } else if (comp.type === 'チェックボックス(ラベル付き)') {
    const opts = comp.options || ['チェック'];
    // For checkboxes, defaultValue can be an exact match check. If they want multiple, this simple logic just matches the string.
    const optsHtml = opts.map(o => `<label><input type="checkbox" name="${comp.id}[]" ${o === comp.defaultValue ? 'checked' : ''} /> ${o}</label>`).join('');
    inner = `<label style="font-size:0.8rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; margin-bottom: 2px;">${comp.label || 'チェック選択'}</label>` + optsHtml;
    cls += ' c-radio-check'
  } else if (comp.type === 'テーブル(ページネーション付)') {
    inner = `
      <div class="c-table-wrap">
        <table>
          <thead>
            <tr><th>ユーザーID</th><th>氏名</th><th>ステータス</th><th>登録日</th></tr>
          </thead>
          <tbody>
            <tr><td>001</td><td>山田 太郎</td><td><span style="color:#10b981;">● アクティブ</span></td><td>2024/01/10</td></tr>
            <tr><td>002</td><td>佐藤 花子</td><td><span style="color:#f59e0b;">● 保留</span></td><td>2024/02/15</td></tr>
            <tr><td>003</td><td>鈴木 一郎</td><td><span style="color:#ef4444;">● 停止</span></td><td>2024/03/20</td></tr>
            <tr><td>004</td><td>田中 次郎</td><td><span style="color:#10b981;">● アクティブ</span></td><td>2024/04/05</td></tr>
          </tbody>
        </table>
      </div>
      <div class="c-table-footer">
        <div class="info">全12件中 1-4件を表示</div>
        <div class="pagination">
          <button class="page-btn"><span class="material-icons" style="font-size:14px;">chevron_left</span></button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <button class="page-btn"><span class="material-icons" style="font-size:14px;">chevron_right</span></button>
        </div>
      </div>
    `
    cls += ' c-table'
  } else if (comp.type === 'ボタン') {
    inner = `<button type="button">${comp.label || 'ボタン'}</button>`
    cls += ' c-button'
  } else {
    inner = comp.type
  }

  return `<div class="${cls}" style="${style}">${inner}</div>`
}
