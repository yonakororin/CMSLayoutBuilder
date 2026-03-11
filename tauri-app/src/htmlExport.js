// ============================================================
// CMS Layout Builder – HTML/PHP Export (Bootstrap 5)
// ============================================================

// Bootstrap 5 CDN links
const BS_CDN = `
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
`;
const BS_JS = `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"><\/script>`;

// User profile menu (Bootstrap dropdown)
const USER_MENU_HTML = `
    <div class="dropdown position-absolute" style="top: 16px; right: 24px; z-index: 100;">
      <button id="user-menu-btn" class="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <span class="material-icons" style="font-size:20px;">account_circle</span>
        <span id="user-name-display">ユーザー名</span>
        <span class="material-icons" style="font-size:16px;">arrow_drop_down</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item d-flex align-items-center gap-2" href="#" id="user-action-password" onclick="event.preventDefault(); console.log('Click: Password Change');">
          <span class="material-icons" style="font-size:18px;">vpn_key</span> パスワード変更
        </a></li>
        <li><a class="dropdown-item d-flex align-items-center gap-2" href="#" id="user-action-logout" onclick="event.preventDefault(); console.log('Click: Logout');">
          <span class="material-icons" style="font-size:18px;">logout</span> ログアウト
        </a></li>
      </ul>
    </div>
`;

// GLB UI overlay CSS (kept as-is, these are custom overlays that don't conflict with Bootstrap)
const GLB_UI_CSS = `
    .glb-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999999 !important; opacity: 0; pointer-events: none; transition: opacity 0.2s; backdrop-filter: blur(2px); }
    .glb-overlay.show { opacity: 1; pointer-events: auto; }
    .glb-modal { background: #fff; border-radius: 12px; width: 400px; max-width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); transform: translateY(20px); transition: transform 0.2s; display: flex; flex-direction: column; overflow: hidden; }
    .glb-overlay.show .glb-modal { transform: translateY(0); }
    .glb-modal-header { padding: 16px 20px; font-weight: 600; font-size: 1.1rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .glb-modal-body { padding: 20px; font-size: 0.95rem; line-height: 1.5; color: #334155; overflow-y: auto; max-height: 60vh; }
    .glb-modal-footer { padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px; }
    .glb-btn { padding: 8px 16px; border-radius: 6px; border: none; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .glb-btn-cancel { background: #e2e8f0; color: #475569; }
    .glb-btn-cancel:hover { background: #cbd5e1; }
    .glb-btn-primary { background: #4f46e5; color: #fff; }
    .glb-btn-primary:hover { filter: brightness(1.1); }
    .glb-btn-info { background: #3b82f6; color: #fff; }
    .glb-btn-info:hover { background: #2563eb; }
    .glb-btn-warning { background: #f59e0b; color: #fff; }
    .glb-btn-warning:hover { background: #d97706; }
    .glb-btn-danger { background: #ef4444; color: #fff; }
    .glb-btn-danger:hover { background: #dc2626; }
    .glb-btn-none { background: transparent; color: #64748b; border: 1px solid transparent; }
    .glb-btn-none:hover { background: #f1f5f9; color: #334155; }
    .glb-input { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; margin-top: 12px; box-sizing: border-box; font-family: inherit; }
    .glb-input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15); }
    .glb-loader { display: flex; flex-direction: column; align-items: center; gap: 12px; color: #fff; font-weight: 500; }
    .glb-spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: glb-spin 1s linear infinite; }
    @keyframes glb-spin { to { transform: rotate(360deg); } }
    .glb-progress-box { background: #fff; padding: 20px; border-radius: 12px; width: 300px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; }
    .glb-progress-label { font-size: 0.9rem; font-weight: 600; color: #334155; margin-bottom: 12px; }
    .glb-progress-bar-wrap { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .glb-progress-bar-fill { height: 100%; background: #4f46e5; width: 0%; transition: width 0.3s ease; }
`;

const GLB_UI_SCRIPT = `
    window.UI = {
      createOverlay(id, innerHtml) {
        let el = document.getElementById(id);
        if (!el) { el = document.createElement('div'); el.id = id; el.className = 'glb-overlay'; el.innerHTML = innerHtml; document.body.appendChild(el); }
        return el;
      },
      showLoading(text = "Now Loading...") {
        const el = this.createOverlay('glb-loading-overlay', '<div class="glb-loader"><div class="glb-spinner"></div><div id="glb-loading-text"></div></div>');
        document.getElementById('glb-loading-text').innerText = text;
        void el.offsetWidth; el.classList.add('show');
      },
      hideLoading() { const el = document.getElementById('glb-loading-overlay'); if (el) el.classList.remove('show'); },
      showProgress(percent, labelText = "Processing...") {
        const el = this.createOverlay('glb-progress-overlay', '<div class="glb-progress-box"><div class="glb-progress-label" id="glb-progress-label"></div><div class="glb-progress-bar-wrap"><div class="glb-progress-bar-fill" id="glb-progress-fill"></div></div></div>');
        document.getElementById('glb-progress-label').innerText = labelText;
        document.getElementById('glb-progress-fill').style.width = Math.min(100, Math.max(0, percent)) + '%';
        void el.offsetWidth; el.classList.add('show');
      },
      hideProgress() { const el = document.getElementById('glb-progress-overlay'); if (el) el.classList.remove('show'); },
      showModal(optOrTitle, contHtml, onConfirm, onCancel, btnConfirm = "OK", btnCancel = "キャンセル") {
        let options = optOrTitle;
        if (typeof optOrTitle === 'string') {
          options = { title: optOrTitle, contentHtml: contHtml || '', buttons: [
            { label: btnCancel, style: 'None', onClick: onCancel },
            { label: btnConfirm, style: 'Primary', onClick: onConfirm }
          ]};
        }
        const { title = '', contentHtml = '', buttons = [] } = options || {};
        const el = this.createOverlay('glb-modal-overlay', '<div class="glb-modal"><div class="glb-modal-header" id="glb-modal-header"></div><div class="glb-modal-body" id="glb-modal-body"></div><div class="glb-modal-footer" id="glb-modal-footer"></div></div>');
        document.getElementById('glb-modal-header').innerText = title;
        document.getElementById('glb-modal-body').innerHTML = contentHtml;
        const footer = document.getElementById('glb-modal-footer');
        footer.innerHTML = '';
        buttons.forEach((btnInfo) => {
          const btn = document.createElement('button');
          const style = (btnInfo.style || 'Primary').toLowerCase();
          btn.className = 'glb-btn glb-btn-' + (style === 'none' ? 'none' : (['primary', 'info', 'warning', 'danger'].includes(style) ? style : 'cancel'));
          btn.innerText = btnInfo.label || 'Button';
          btn.onclick = () => { if (btnInfo.onClick) btnInfo.onClick(); this.hideModal(); };
          footer.appendChild(btn);
        });
        void el.offsetWidth; el.classList.add('show');
      },
      hideModal() { const el = document.getElementById('glb-modal-overlay'); if (el) el.classList.remove('show'); },
      showPrompt(optOrTitle, descHtml, defValue, onConfirm, onCancel, btnConfirm = "決定", btnCancel = "キャンセル") {
        let options = optOrTitle;
        if (typeof optOrTitle === 'string') {
          options = { title: optOrTitle, descriptionHtml: descHtml || '', defaultValue: defValue || '', buttons: [
            { label: btnCancel, style: 'None', onClick: onCancel },
            { label: btnConfirm, style: 'Info', onClick: (val) => { if(onConfirm) onConfirm(val); } }
          ]};
        }
        const { title = '値の入力', descriptionHtml = '', defaultValue = '', buttons = [] } = options || {};
        const bodyHtml = (descriptionHtml || '') + '<input type="text" id="glb-prompt-input" class="glb-input" value="' + (defaultValue || '').replace(/"/g, '&quot;') + '" />';
        const mappedButtons = buttons.map(btnInfo => ({
          label: btnInfo.label, style: btnInfo.style,
          onClick: () => { const val = document.getElementById('glb-prompt-input').value; if (btnInfo.onClick) btnInfo.onClick(val); }
        }));
        this.showModal({ title, contentHtml: bodyHtml, buttons: mappedButtons });
        setTimeout(() => { const input = document.getElementById('glb-prompt-input'); if (input) input.focus(); }, 100);
      }
    };
`;

// ============================================================
// Portal Page Export (Bootstrap 5 + PHP)
// ============================================================
export function generatePortalPhp(page) {
  let categoriesHtml = page.categories.map(cat => `
    <?php /* カテゴリ: ${cat.name} — 表示条件をここに記述 */ ?>
    <?php /* if (isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin','user'])): */ ?>
    <div class="card mb-3 border-top-0" style="border-top: 4px solid ${cat.themeColor || '#4f46e5'} !important;">
      <div class="card-body">
        <h5 class="card-title fw-bold" style="color: ${cat.themeColor || '#4f46e5'};">${cat.name}</h5>
        <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-2">
          ${cat.cards.map(card => `
            <?php /* カード: ${card.title} — 表示条件をここに記述 */ ?>
            <?php /* if (...): */ ?>
            <div class="col">
              <a class="card h-100 text-decoration-none text-center p-2 border card-link" href="${card.link || '#'}" target="_blank">
                <div class="card-body p-1 d-flex flex-column align-items-center justify-content-center">
                  <span class="material-icons mb-1" style="font-size: 30px; color: ${cat.themeColor || '#4f46e5'};">${card.icon}</span>
                  <span class="small fw-semibold text-dark">${card.title}</span>
                </div>
              </a>
            </div>
            <?php /* endif; */ ?>
          `).join('')}
        </div>
      </div>
    </div>
    <?php /* endif; */ ?>
  `).join('')

  return `<?php session_start(); ?>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.name}</title>
  ${BS_CDN}
  <style>
    body { background: #f8f9fa; }
    .card-link:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s; }
    .card-link { transition: all 0.2s; }
    ${GLB_UI_CSS}
  </style>
</head>
<body>
  ${USER_MENU_HTML}
  <div class="container py-4" style="max-width: 1400px;">
    <h1 class="fw-bold mb-4 pb-3 border-bottom"><?php echo htmlspecialchars('${page.name.replace(/'/g, "\\'")}'); ?></h1>
    ${categoriesHtml}
  </div>
  ${BS_JS}
  <script>
    ${GLB_UI_SCRIPT}
  </script>
</body>
</html>`
}

// ============================================================
// Menu Page Export (Bootstrap 5 + PHP)
// ============================================================
export function generateMenuPhp(page) {
  let menusHtml = page.menus.map((menu, mIdx) => {
    if (menu.submenus.length > 0) {
      return `
        <li class="nav-item">
          <a class="nav-link text-white d-flex justify-content-between align-items-center" data-bs-toggle="collapse" href="#submenu-${mIdx}" role="button" aria-expanded="false">
            <span>${menu.name}</span>
            <span class="material-icons" style="font-size:20px;">expand_more</span>
          </a>
          <div class="collapse" id="submenu-${mIdx}">
            <ul class="nav flex-column ms-3">${menu.submenus.map((sub, sIdx) => `
              <li class="nav-item">
                <a class="nav-link text-white-50 py-1" href="#" onclick="event.preventDefault(); showContent('content-${mIdx}-${sIdx}')">${sub.name}</a>
              </li>
            `).join('')}</ul>
          </div>
        </li>
      `
    } else {
      return `
        <li class="nav-item">
          <a class="nav-link text-white" href="#" onclick="event.preventDefault(); showContentDirect('content-${mIdx}-main')">${menu.name}</a>
        </li>
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

  return `<?php session_start(); ?>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.name}</title>
  ${BS_CDN}
  <style>
    body { overflow: hidden; }
    .sidebar {
      width: 240px; min-width: 240px; min-height: 100vh;
      background: #0f172a; transition: width 0.3s, min-width 0.3s;
      overflow-x: hidden; overflow-y: auto;
    }
    .sidebar.closed { width: 60px; min-width: 60px; }
    .sidebar.closed .sidebar-content,
    .sidebar.closed .sidebar-title { display: none; }
    .main-content { flex: 1; overflow-y: auto; height: 100vh; background: #f8f9fa; }
    .content-pane { display: none; }
    .content-pane.active { display: block; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .tab-canvas {
      position: relative; width: 100%; min-height: 400px;
      border: 1px solid #dee2e6; border-radius: 8px;
      background: #fff;
    }
    .component { position: absolute; border: 1px solid #dee2e6; background: #fff; padding: 4px; box-sizing: border-box; border-radius: 6px; max-width: calc(100% - 48px); }
    .c-html { display: block; overflow: auto; background: transparent; border: none; }
    .c-input { display: flex; flex-direction: column; gap: 2px; }
    .c-radio-check { display: flex; flex-direction: column; gap: 0; }
    .c-table { display: flex; flex-direction: column; padding: 0; overflow: hidden; }
    .c-button { display: flex; justify-content: center; align-items: center; background: transparent; border: none; padding: 4px; }
    .c-button button { width: 100%; height: 100%; }
    ${GLB_UI_CSS}
  </style>
</head>
<body>
  <div class="d-flex">
    <!-- Sidebar -->
    <nav class="sidebar d-flex flex-column p-3">
      <div class="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom border-secondary">
        <button class="btn btn-outline-light btn-sm" onclick="document.querySelector('.sidebar').classList.toggle('closed')" title="メニューの開閉">
          <span class="material-icons">menu</span>
        </button>
        <h5 class="sidebar-title text-white fw-bold mb-0 text-truncate">${page.name}</h5>
      </div>
      <ul class="sidebar-content nav flex-column gap-1">
        ${menusHtml}
      </ul>
    </nav>

    <!-- Main Content -->
    <div class="main-content p-4 position-relative">
      ${USER_MENU_HTML}
      ${contentsHtml}
      <div id="welcome" class="content-pane active d-flex flex-column align-items-center justify-content-center" style="height: 60vh;">
        <h2 class="text-muted">メニューを選択してください</h2>
        <p class="text-secondary">左側のメニューから項目を選択すると、ここに内容が表示されます。</p>
      </div>
    </div>
  </div>

  ${BS_JS}
  <script>
    ${GLB_UI_SCRIPT}

    function showContentDirect(id) {
      // Close any open collapse submenus
      document.querySelectorAll('.sidebar .collapse.show').forEach(el => {
        bootstrap.Collapse.getOrCreateInstance(el).hide();
      });
      showContent(id);
    }
    function showContent(id) {
      document.querySelectorAll('.content-pane').forEach(el => el.classList.remove('active'));
      const target = document.getElementById(id);
      if (target) {
        target.classList.add('active');
        window.dispatchEvent(new CustomEvent('glbContentShown', { detail: { id: id } }));
      }
    }
    function showTab(paneId, tabId) {
      const pane = document.getElementById(paneId);
      if (!pane) return;
      // Use Bootstrap Tab API
      const tabEl = pane.querySelector('[data-bs-target="#tab-' + paneId + '-' + tabId + '"]');
      if (tabEl) {
        bootstrap.Tab.getOrCreateInstance(tabEl).show();
      }
      window.dispatchEvent(new CustomEvent('glbTabShown', { detail: { paneId: paneId, tabId: tabId } }));
    }
  </script>
</body>
</html>`
}

// ============================================================
// Tab content generation (Bootstrap 5 tabs)
// ============================================================
function generateTabsHtml(targetObj, paneId) {
  if (!targetObj.tabs || targetObj.tabs.length === 0) return ''

  if (targetObj.tabs.length === 1) {
    const tab = targetObj.tabs[0]
    const contents = tab.components.map((comp, idx) => generateComponentHtml(comp, idx)).join('')
    return `
      <div id="${paneId}" class="content-pane">
        <h3 class="fw-bold mb-3">${targetObj.name}</h3>
        <div class="tab-canvas">
          ${contents}
        </div>
      </div>
    `
  }

  const tabsNav = targetObj.tabs.map((tab, idx) => `
    <li class="nav-item" role="presentation">
      <button class="nav-link ${idx === 0 ? 'active' : ''}" id="btn-${paneId}-${tab.id}" data-bs-toggle="tab" data-bs-target="#tab-${paneId}-${tab.id}" type="button" role="tab">${tab.name}</button>
    </li>
  `).join('')

  const tabsContent = targetObj.tabs.map((tab, idx) => `
    <div class="tab-pane fade ${idx === 0 ? 'show active' : ''}" id="tab-${paneId}-${tab.id}" role="tabpanel">
      <div class="tab-canvas">
        ${tab.components.map((comp, ci) => generateComponentHtml(comp, ci)).join('')}
      </div>
    </div>
  `).join('')

  return `
    <div id="${paneId}" class="content-pane">
      <h3 class="fw-bold mb-3">${targetObj.name}</h3>
      <ul class="nav nav-tabs mb-3" role="tablist">
        ${tabsNav}
      </ul>
      <div class="tab-content">
        ${tabsContent}
      </div>
    </div>
  `
}

// ============================================================
// Component HTML generation (Bootstrap 5 classes)
// ============================================================
function generateComponentHtml(comp, idx) {
  const zIndex = idx !== undefined ? ` z-index: ${idx + 1};` : ''
  let widthStyle = `${comp.w}px`
  if (comp.type === 'テーブル(ページネーション付)' || (comp.w > 600)) {
    widthStyle = 'calc(100% - 48px)'
  }
  const style = `left: ${comp.x}px; top: ${comp.y}px; width: ${widthStyle}; height: ${comp.h}px;${zIndex}`
  let inner = ''
  let cls = 'component'
  let outerIdAttr = comp.customId ? ` id="${comp.customId}"` : ''

  if (comp.type === 'HTML表示領域') {
    inner = comp.htmlContent || '<p class="text-muted text-center">HTMLコンテンツ</p>'
    cls += ' c-html'
  } else if (comp.type === 'インプット(ラベル付き)') {
    const inputId = comp.customId ? ` id="${comp.customId}"` : ''
    outerIdAttr = ''
    inner = `<label class="form-label small fw-semibold text-muted"${comp.customId ? ` for="${comp.customId}"` : ''}>${comp.label || 'ラベル'}</label><input type="text"${inputId} class="form-control form-control-sm" placeholder="テキスト入力" />`
    cls += ' c-input'
  } else if (comp.type === 'カレンダー(ラベル付き)') {
    const inputId = comp.customId ? ` id="${comp.customId}"` : ''
    outerIdAttr = ''
    inner = `<label class="form-label small fw-semibold text-muted"${comp.customId ? ` for="${comp.customId}"` : ''}>${comp.label || '日付'}</label><input type="date"${inputId} class="form-control form-control-sm" />`
    cls += ' c-input'
  } else if (comp.type === 'セレクトボックス(ラベル付き)') {
    const inputId = comp.customId ? ` id="${comp.customId}"` : ''
    outerIdAttr = ''
    const opts = comp.options || ['-- 選択 --'];
    const optsHtml = opts.map(o => `<option ${o === comp.defaultValue ? 'selected' : ''}>${o}</option>`).join('');
    inner = `<label class="form-label small fw-semibold text-muted"${comp.customId ? ` for="${comp.customId}"` : ''}>${comp.label || '選択'}</label><select${inputId} class="form-select form-select-sm">${optsHtml}</select>`
    cls += ' c-input'
  } else if (comp.type === 'ラジオボタン(ラベル付き)') {
    const opts = comp.options || ['ラジオ'];
    const optsHtml = opts.map(o => `<div class="form-check"><input class="form-check-input" type="radio" name="${comp.id}" ${o === comp.defaultValue ? 'checked' : ''} /><label class="form-check-label small">${o}</label></div>`).join('');
    inner = `<label class="form-label small fw-semibold text-muted">${comp.label || 'ラジオ選択'}</label>` + optsHtml;
    cls += ' c-radio-check'
  } else if (comp.type === 'チェックボックス(ラベル付き)') {
    const opts = comp.options || ['チェック'];
    const optsHtml = opts.map(o => `<div class="form-check"><input class="form-check-input" type="checkbox" name="${comp.id}[]" ${o === comp.defaultValue ? 'checked' : ''} /><label class="form-check-label small">${o}</label></div>`).join('');
    inner = `<label class="form-label small fw-semibold text-muted">${comp.label || 'チェック選択'}</label>` + optsHtml;
    cls += ' c-radio-check'
  } else if (comp.type === 'テーブル(ページネーション付)') {
    const tableLabel = comp.label ? `<label class="form-label small fw-semibold text-muted px-2">${comp.label}</label>` : ''
    const columns = comp.columns || ['カラム1', 'カラム2', 'カラム3']
    const thHtml = columns.map(c => `<th class="small">${c}</th>`).join('')
    const tdPlaceholder = columns.map(() => `<td class="small">---</td>`).join('')
    inner = tableLabel + `
      <div class="table-responsive flex-grow-1">
        <table class="table table-sm table-hover table-bordered mb-0">
          <thead class="table-light">
            <tr>${thHtml}</tr>
          </thead>
          <tbody>
            <tr>${tdPlaceholder}</tr>
            <tr>${tdPlaceholder}</tr>
          </tbody>
        </table>
      </div>
      <nav class="d-flex justify-content-between align-items-center px-2 py-1 border-top bg-light small">
        <span class="text-muted">全0件中 0-0件を表示</span>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item disabled"><a class="page-link" href="#">&laquo;</a></li>
          <li class="page-item active"><a class="page-link" href="#">1</a></li>
          <li class="page-item disabled"><a class="page-link" href="#">&raquo;</a></li>
        </ul>
      </nav>
    `
    cls += ' c-table'
  } else if (comp.type === 'ボタン') {
    const btnId = comp.customId ? ` id="${comp.customId}"` : ''
    outerIdAttr = ''
    const btnOnClick = comp.customOnClick ? ` onclick="${comp.customOnClick.replace(/"/g, '&quot;')}"` : ''
    inner = `<button type="button"${btnId}${btnOnClick} class="btn btn-primary w-100 h-100">${comp.label || 'ボタン'}</button>`
    cls += ' c-button'
  } else {
    inner = comp.type
  }

  const additionalClass = comp.customClass ? ` ${comp.customClass}` : ''
  const outerOnClick = (comp.type !== 'ボタン' && comp.customOnClick) ? ` onclick="${comp.customOnClick.replace(/"/g, '&quot;')}"` : ''

  return `<div${outerIdAttr}${outerOnClick} class="${cls}${additionalClass}" style="${style}">${inner}</div>`
}
