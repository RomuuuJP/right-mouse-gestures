(() => {
  if (window.__rightMouseGesturesInstalled) return;
  window.__rightMouseGesturesInstalled = true;

  const AXIS_BIAS = 1.25;
  const text = {
    'zh-CN': {cancel:'未识别手势 — 松开将取消', forward:'前进', back:'返回', scrollUp:'向上滚动', scrollDown:'向下滚动', reload:'刷新页面', close:'关闭当前选项卡', tabLeft:'切换到左侧选项卡', tabRight:'切换到右侧选项卡', unmatched:'未匹配：{key} — 松开将取消'},
    ja: {cancel:'未認識のジェスチャー — 離すとキャンセル', forward:'進む', back:'戻る', scrollUp:'上へスクロール', scrollDown:'下へスクロール', reload:'ページを再読み込み', close:'現在のタブを閉じる', tabLeft:'左のタブに切り替え', tabRight:'右のタブに切り替え', unmatched:'未対応：{key} — 離すとキャンセル'},
    en: {cancel:'Unrecognized gesture — release to cancel', forward:'Forward', back:'Back', scrollUp:'Scroll up', scrollDown:'Scroll down', reload:'Reload page', close:'Close current tab', tabLeft:'Switch to tab on the left', tabRight:'Switch to tab on the right', unmatched:'No match: {key} — release to cancel'}
  };
  let settings = { language: 'zh-CN', sensitivity: 60 };
  chrome.storage.sync.get('rmgSettings').then(({rmgSettings}) => { if (rmgSettings) settings = {...settings, ...rmgSettings}; }).catch(() => {});
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.rmgSettings?.newValue) settings = {...settings, ...changes.rmgSettings.newValue};
  });
  const threshold = () => Math.round(52 - Math.min(100, Math.max(1, Number(settings.sensitivity) || 60)) * 0.4);
  const tr = key => (text[settings.language] || text['zh-CN'])[key] || text['zh-CN'][key] || key;
  const actionByGesture = { R: 'forward', L: 'back', U: 'scrollUp', D: 'scrollDown', UD: 'reload', DU: 'reload', DR: 'close', UL: 'tabLeft', UR: 'tabRight' };
  const actionLabel = {forward:'forward',back:'back',scrollUp:'scrollUp',scrollDown:'scrollDown',reload:'reload',close:'close',tabLeft:'tabLeft',tabRight:'tabRight'};
  let active = false, lastX = 0, lastY = 0, points = [], directions = [], overlay, pathEl, labelEl, dotEl;
  let lastDirection = '', suppressContextMenu = false, anchorX = 0, anchorY = 0;

  function ensureOverlay() {
    if (overlay?.isConnected) return;
    overlay = document.createElement('div'); overlay.id = 'rmg-overlay';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); pathEl.setAttribute('class', 'rmg-path'); svg.appendChild(pathEl);
    dotEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dotEl.setAttribute('class', 'rmg-dot'); dotEl.setAttribute('r', '5'); svg.appendChild(dotEl);
    labelEl = document.createElement('div'); labelEl.className = 'rmg-label'; overlay.append(svg, labelEl);
    (document.documentElement || document).appendChild(overlay);
  }
  function directionFrom(dx, dy) {
    const limit = threshold();
    if (Math.abs(dx) < limit && Math.abs(dy) < limit) return '';
    if (Math.abs(dx) > Math.abs(dy) * AXIS_BIAS) return dx > 0 ? 'R' : 'L';
    if (Math.abs(dy) > Math.abs(dx) * AXIS_BIAS) return dy > 0 ? 'D' : 'U';
    return '';
  }
  function currentGesture() { return directions.join(''); }
  function render() {
    ensureOverlay();
    pathEl.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
    dotEl.setAttribute('cx', lastX); dotEl.setAttribute('cy', lastY);
    const key = currentGesture(), action = actionByGesture[key];
    const label = action ? tr(actionLabel[action]) : (key ? tr('unmatched').replace('{key}', key) : tr('cancel'));
    labelEl.textContent = '';
    const strong = document.createElement('strong'); strong.textContent = key || '…';
    labelEl.append(strong, document.createTextNode('　' + label));
    labelEl.style.left = `${Math.min(lastX + 14, Math.max(8, innerWidth - 300))}px`;
    labelEl.style.top = `${Math.min(lastY + 14, Math.max(8, innerHeight - 56))}px`;
  }
  function begin(e) {
    if (e.button !== 2 || active) return;
    active = true; suppressContextMenu = true;
    lastX = e.clientX; lastY = e.clientY; points = [{x:lastX,y:lastY}]; directions = []; lastDirection = ''; anchorX = lastX; anchorY = lastY;
    render();
  }
  function move(e) {
    if (!active) return;
    lastX = e.clientX; lastY = e.clientY; points.push({x:lastX,y:lastY});
    const candidate = directionFrom(lastX - anchorX, lastY - anchorY);
    if (candidate && candidate !== lastDirection) { directions.push(candidate); lastDirection = candidate; anchorX = lastX; anchorY = lastY; }
    render(); e.preventDefault();
  }
  function finish(e) {
    if (!active || e.button !== 2) return;
    active = false;
    const action = actionByGesture[currentGesture()];
    if (action === 'scrollUp') window.scrollBy({top:-Math.max(400, innerHeight * 0.75),behavior:'auto'});
    else if (action === 'scrollDown') window.scrollBy({top:Math.max(400, innerHeight * 0.75),behavior:'auto'});
    else if (action) chrome.runtime.sendMessage({type:'GESTURE_ACTION',action}).catch(() => {});
    overlay?.remove(); overlay = null; directions = []; points = []; lastDirection = '';
    setTimeout(() => { suppressContextMenu = false; }, 80);
  }
  document.addEventListener('mousedown', begin, true);
  document.addEventListener('mousemove', move, true);
  document.addEventListener('mouseup', finish, true);
  document.addEventListener('contextmenu', e => { if (active || suppressContextMenu) { e.preventDefault(); e.stopPropagation(); } }, true);
  document.addEventListener('dragstart', e => { if (active) e.preventDefault(); }, true);
})();
