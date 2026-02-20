export function generatePortalHtml(page) {
  let categoriesHtml = page.categories.map(cat => `
    <div class="category">
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
    /* Modern Dashboard Aesthetics */
    :root {
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --bg-main: #f8fafc;
      --bg-card: #ffffff;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      --radius: 12px;
    }
    body { 
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; 
      background: var(--bg-main); 
      color: var(--text-main);
      margin: 0; padding: 40px 20px; 
      min-height: 100vh;
      display: flex; flex-direction: column; align-items: center;
    }
    .container {
      width: 100%; max-width: 1000px;
    }
    h1 { 
      text-align: left; color: var(--text-main); 
      font-weight: 800; font-size: 2rem; letter-spacing: -0.025em;
      margin-top: 0; margin-bottom: 32px;
      padding-bottom: 16px; border-bottom: 2px solid var(--border);
    }
    .category { 
      background: var(--bg-card); border-radius: var(--radius); 
      padding: 24px; margin-bottom: 24px; 
      box-shadow: var(--shadow-sm); border: 1px solid var(--border);
    }
    .category h2 { 
      margin-top: 0; font-size: 1.25rem; font-weight: 600; 
      color: var(--text-main); margin-bottom: 20px;
    }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
    .card { 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 120px; border: 1px solid var(--border); border-radius: var(--radius);
      text-decoration: none; color: var(--text-main); 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
      background: linear-gradient(145deg, #ffffff, #f8fafc);
      padding: 16px; box-sizing: border-box;
    }
    .card:hover { 
      transform: translateY(-4px); box-shadow: var(--shadow-md); 
      border-color: var(--primary); background: #ffffff;
    }
    .icon { 
      font-size: 36px; margin-bottom: 12px; 
      color: var(--primary); transition: transform 0.3s ease;
    }
    .card:hover .icon { transform: scale(1.1); }
    .title { font-size: 0.875rem; font-weight: 500; text-align: center; line-height: 1.2; }
    
    /* Material Icons */
    @font-face {
      font-family: 'Material Icons';
      font-style: normal;
      font-weight: 400;
      src: url(https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
    }
    .icon { font-family: 'Material Icons'; font-weight: normal; font-style: normal; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; }
  </style>
</head>
<body>
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
        <div class="menu-item">
          <h3>${menu.name}</h3>
          <ul>${menu.submenus.map((sub, sIdx) => `
            <li><a href="#content-${mIdx}-${sIdx}" onclick="showContent('content-${mIdx}-${sIdx}')">${sub.name}</a></li>
          `).join('')}</ul>
        </div>
      `
    } else {
      return `
        <div class="menu-item menu-item-direct">
          <a href="#content-${mIdx}-main" onclick="showContent('content-${mIdx}-main')">${menu.name}</a>
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
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --bg-main: #f8fafc;
      --bg-sidebar: #ffffff;
      --bg-card: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --radius: 12px;
    }
    body { 
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; 
      display: flex; height: 100vh; margin: 0; background: var(--bg-main); 
      color: var(--text-main); overflow: hidden;
    }
    .sidebar { 
      box-sizing: border-box; width: 280px; min-width: 280px;
      background: var(--bg-sidebar); border-right: 1px solid var(--border); 
      padding: 20px; box-shadow: var(--shadow-sm); z-index: 10;
      display: flex; flex-direction: column; gap: 8px;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s;
      overflow-x: hidden; white-space: nowrap;
    }
    .sidebar.closed {
      width: 80px; min-width: 80px;
    }
    .sidebar-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
      padding-bottom: 16px; border-bottom: 2px solid var(--border);
    }
    .sidebar.closed .sidebar-header { border-bottom-color: transparent; }
    .hamburger {
      background: transparent; border: none; padding: 0;
      width: 40px; min-width: 40px; height: 40px; 
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--text-main); 
      border-radius: 8px; transition: background 0.2s;
    }
    .hamburger:hover { background: #f1f5f9; color: var(--primary); }
    h2.sidebar-title { 
      font-size: 1.25rem; font-weight: 800; letter-spacing: -0.025em;
      margin: 0; transition: opacity 0.2s; overflow: hidden;
    }
    .sidebar.closed h2.sidebar-title { opacity: 0; }
    .sidebar-content {
      display: flex; flex-direction: column; gap: 8px;
      transition: opacity 0.2s; opacity: 1; overflow-y: auto; height: 100%;
    }
    .sidebar.closed .sidebar-content { opacity: 0; pointer-events: none; }
    .menu-item { margin-bottom: 16px; }
    .menu-item h3 { 
      margin: 0 0 12px 0; font-size: 0.875rem; 
      text-transform: uppercase; letter-spacing: 0.05em; 
      color: var(--text-muted); font-weight: 700; 
    }
    .menu-item ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
    .menu-item a { 
      text-decoration: none; color: var(--text-main); font-size: 0.95rem; font-weight: 500;
      display: block; padding: 8px 12px; border-radius: 8px;
      transition: all 0.2s; border: 1px solid transparent;
    }
    .menu-item-direct a {
      font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); padding: 8px 12px; border-radius: 8px;
    }
    .menu-item a:hover { 
      background: #f1f5f9; color: var(--primary); 
    }
    /* Simple active indicator via JS click */
    .menu-item a:focus {
      background: #e0e7ff; color: var(--primary); border-color: rgba(99, 102, 241, 0.3);
    }
    .main { 
      flex: 1; padding: 32px; overflow-y: auto; position: relative;
    }
    
    .content-pane { 
      display: none; background: var(--bg-card); border-radius: var(--radius); 
      padding: 32px; box-shadow: var(--shadow-md); border: 1px solid var(--border);
      height: 100%; box-sizing: border-box; animation: fadeIn 0.3s ease;
    }
    .content-pane.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    
    .content-pane h3 { margin-top: 0; font-size: 1.5rem; font-weight: 700; margin-bottom: 24px; color: var(--text-main); }
    
    .tabs { 
      display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid var(--border); 
      padding-bottom: 0; 
    }
    .tab { 
      padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent; 
      font-size: 0.95rem; font-weight: 500; color: var(--text-muted); 
      transition: all 0.2s; margin-bottom: -1px;
    }
    .tab:hover { color: var(--text-main); }
    .tab.active { color: var(--primary); border-bottom-color: var(--primary); }
    
    .tab-content { 
      display: none; position: relative; width: 100%; 
      height: calc(100% - 100px); border: 1px dashed var(--border); 
      background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #ffffff 10px, #ffffff 20px);
      border-radius: 8px; overflow: auto; 
    }
    .tab-content.active { display: block; }
    
    .component { 
      position: absolute; border: 1px solid var(--border); background: var(--bg-card); 
      padding: 12px; box-sizing: border-box; box-shadow: var(--shadow-sm); 
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      transition: box-shadow 0.2s;
    }
    .component:hover { box-shadow: var(--shadow-md); border-color: #cbd5e1; }
    
    .c-html { background: transparent; border: none; box-shadow: none; color: var(--text-muted); font-size: 0.9rem; }
    .c-input { flex-direction: column; align-items: flex-start; justify-content: center; gap: 6px; }
    .c-input label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
    .c-input input, .c-input select { 
      width: 100%; padding: 8px 12px; border: 1px solid var(--border); 
      border-radius: 6px; box-sizing: border-box; font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s; background: #f8fafc;
    }
    .c-input input:focus, .c-input select:focus {
      outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); background: #fff;
    }
    .c-radio-check { flex-direction: row; justify-content: flex-start; }
    .c-radio-check label { cursor: pointer; font-size: 0.95rem; font-weight: 500; }
    
    #welcome.active {
       display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
    }
    #welcome h2 { font-size: 1.5rem; margin-bottom: 8px; color: var(--text-main); }
    #welcome p { color: var(--text-muted); font-size: 1rem; }
    
    /* Material Icons */
    @font-face {
      font-family: 'Material Icons'; font-style: normal; font-weight: 400;
      src: url(https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
    }
    .material-icons { font-family: 'Material Icons'; font-weight: normal; font-style: normal; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; }
  </style>
  <script>
    function toggleSidebar() {
      document.querySelector('.sidebar').classList.toggle('closed');
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
  if (!targetObj.tabs) return ''
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
    inner = '<label>ラベル</label><input type="text" placeholder="テキスト入力" />'
    cls += ' c-input'
  } else if (comp.type === 'カレンダー(ラベル付き)') {
    inner = '<label>日付</label><input type="date" />'
    cls += ' c-input'
  } else if (comp.type === 'セレクトボックス(ラベル付き)') {
    inner = '<label>選択</label><select><option>-- 選択 --</option></select>'
    cls += ' c-input'
  } else if (comp.type === 'ラジオボタン(ラベル付き)') {
    inner = '<label><input type="radio" name="${comp.id}" /> ラジオ</label>'
    cls += ' c-radio-check'
  } else if (comp.type === 'チェックボックス(ラベル付き)') {
    inner = '<label><input type="checkbox" /> チェック</label>'
    cls += ' c-radio-check'
  } else {
    inner = comp.type
  }

  return `<div class="${cls}" style="${style}">${inner}</div>`
}
