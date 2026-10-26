(() => {
  if (window.__rightMouseGesturesInstalled) return;
  window.__rightMouseGesturesInstalled = true;
  const {GestureRecognizer,normalize} = RMGEngine;
  const text = {
    'zh-CN': {cancel:'无匹配指令 · 松开取消', forward:'前进', back:'返回', scrollUp:'向上滚动', scrollDown:'向下滚动', reload:'刷新页面', close:'关闭当前选项卡', tabLeft:'切换到左侧选项卡', tabRight:'切换到右侧选项卡', unmatched:'无匹配：{key} · 松开取消'},
    ja: {cancel:'該当する操作なし · 離すとキャンセル', forward:'進む', back:'戻る', scrollUp:'上へスクロール', scrollDown:'下へスクロール', reload:'ページを再読み込み', close:'現在のタブを閉じる', tabLeft:'左のタブに切り替え', tabRight:'右のタブに切り替え', unmatched:'該当なし：{key} · キャンセル'},
    en: {cancel:'No gesture · release to cancel', forward:'Forward', back:'Back', scrollUp:'Scroll up', scrollDown:'Scroll down', reload:'Reload page', close:'Close current tab', tabLeft:'Previous tab', tabRight:'Next tab', unmatched:'Unmatched: {key} · release to cancel'}
  };
  let settings=normalize(), overlay=null,svg=null,pathEl=null,labelEl=null,dotEl=null;
  const recognizer=new GestureRecognizer(settings);
  let points=[],lastX=0,lastY=0,mouseTarget=null;
  let suppressMenu=false,clearMenuTimer=null,drawPending=false,drawFrame=0;
  let pressedButton=false;
  const translate = key => (text[settings.language]||text['zh-CN'])[key]||key;
  chrome.storage.sync.get('rmgSettings').then(({rmgSettings}) => {
    settings=normalize(rmgSettings); recognizer.configure(settings);
  }).catch(()=>{});
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area==='sync' && changes.rmgSettings) {
      settings=normalize(changes.rmgSettings.newValue); recognizer.configure(settings);
    }
  });
  function clearSuppression(){
    suppressMenu=false;
    if(clearMenuTimer!==null){clearTimeout(clearMenuTimer);clearMenuTimer=null;}
  }
  function cleanup(){
    if(drawFrame)cancelAnimationFrame(drawFrame);
    drawPending=false;drawFrame=0;
    overlay?.remove();overlay=svg=pathEl=labelEl=dotEl=null;
    points=[];mouseTarget=null;recognizer.reset();pressedButton=false;
  }
  function clearWithoutAction(){ cleanup();clearSuppression(); }
  function ensureOverlay(){
    if(overlay?.isConnected)return;
    overlay=document.createElement('div'); overlay.id='rmg-overlay';
    svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    pathEl=document.createElementNS('http://www.w3.org/2000/svg','polyline');
    pathEl.setAttribute('class','rmg-path');svg.appendChild(pathEl);
    dotEl=document.createElementNS('http://www.w3.org/2000/svg','circle');
    dotEl.setAttribute('class','rmg-dot');dotEl.setAttribute('r','5');svg.appendChild(dotEl);
    labelEl=document.createElement('div');labelEl.className='rmg-label';
    overlay.append(svg,labelEl);(document.documentElement||document).appendChild(overlay);
  }
  function render(){
    drawPending=false;drawFrame=0;
    if(recognizer.phase!=='gesturing') return;
    ensureOverlay();
    pathEl.setAttribute('points',points.map(p=>`${p.x},${p.y}`).join(' '));
    dotEl.setAttribute('cx',lastX);dotEl.setAttribute('cy',lastY);
    const {key,action}=recognizer.snapshot();
    const label=action?translate(action):(key?translate('unmatched').replace('{key}',key):translate('cancel'));
    labelEl.replaceChildren();
    const strong=document.createElement('strong');strong.textContent=key||'…';
    labelEl.append(strong,document.createTextNode('　'+label));
    const rect=labelEl.getBoundingClientRect();
    const maxX=Math.max(8,window.innerWidth-rect.width-8),maxY=Math.max(8,window.innerHeight-rect.height-8);
    labelEl.style.left=`${Math.max(8,Math.min(maxX,lastX+16))}px`;
    labelEl.style.top=`${Math.max(8,Math.min(maxY,lastY+16))}px`;
  }
  function requestDraw(){if(!drawPending){drawPending=true;drawFrame=requestAnimationFrame(render);}}
  function recordPoint(x,y){
    lastX=x;lastY=y;
    if(!points.length || Math.hypot(x-points[points.length-1].x,y-points[points.length-1].y)>=2.5)points.push({x,y});
    if(points.length>420)points=points.filter((_,i)=>i%2===0); // bounded DOM work
  }
  function editableOrInteractive(e){
    return (e.composedPath?.()||[e.target]).some(node=>{
      if(!(node instanceof Element))return false;
      return node.isContentEditable || node.matches('input, textarea, select, option, [contenteditable], canvas, video');
    });
  }
  function begin(e){
    if(!e.isTrusted || e.button!==2 || pressedButton || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)return;
    clearSuppression();
    if(editableOrInteractive(e))return;
    pressedButton=true;
    recognizer.press(e.clientX,e.clientY);
    mouseTarget=e.target;
    lastX=e.clientX;lastY=e.clientY;
    points=[{x:lastX,y:lastY}];
    // Do NOT block the native right click while pending.
  }
  function move(e){
    if(!pressedButton)return;
    if(!(e.buttons&2)){clearWithoutAction();return;}
    if(!e.isTrusted)return;
    const oldPhase=recognizer.phase;
    recognizer.move(e.clientX,e.clientY);
    if(recognizer.phase!=='gesturing')return;
    if(oldPhase!=='gesturing')ensureOverlay();
    recordPoint(e.clientX,e.clientY);
    requestDraw();
    if(e.cancelable)e.preventDefault();
  }
  function scrollAtCursor(direction){
    const down=direction==='scrollDown';
    const desired=down?1:-1;
    let el=document.elementFromPoint(lastX,lastY) || mouseTarget;
    while(el){
      if(el.nodeType===1){
        const style=getComputedStyle(el);
        const scrolling=/(auto|scroll|overlay)/.test(style.overflowY) && el.scrollHeight>el.clientHeight+2;
        if(scrolling){
          const room=down?el.scrollHeight-el.clientHeight-el.scrollTop:el.scrollTop;
          if(room>1){el.scrollBy({top:desired*Math.max(160,el.clientHeight*.75),behavior:'auto'});return;}
        }
      }
      el=el.parentElement || el.getRootNode?.().host || null;
    }
    const scroller=document.scrollingElement;
    if(scroller)scroller.scrollBy({top:desired*Math.max(160,window.innerHeight*.75),behavior:'auto'});
    else window.scrollBy({top:desired*Math.max(160,window.innerHeight*.75),behavior:'auto'});
  }
  function finish(e){
    if(!pressedButton || e.button!==2)return;
    const result=recognizer.release();
    if(result.phase==='gesturing'){
      suppressMenu=true;
      clearMenuTimer=setTimeout(clearSuppression,250);
    }
    cleanup();
    if(!result.action)return;
    if(result.action==='scrollUp'||result.action==='scrollDown')scrollAtCursor(result.action);
    else chrome.runtime.sendMessage({type:'GESTURE_ACTION',action:result.action}).catch(()=>{});
  }
  document.addEventListener('mousedown',begin,true);
  document.addEventListener('mousemove',move,true);
  document.addEventListener('mouseup',finish,true);
  document.addEventListener('contextmenu',e=>{
    if(recognizer.phase==='gesturing'||suppressMenu){e.preventDefault();e.stopImmediatePropagation();clearSuppression();}
  },true);
  document.addEventListener('dragstart',e=>{if(recognizer.phase==='gesturing')e.preventDefault();},true);
  window.addEventListener('blur',clearWithoutAction);
  window.addEventListener('pagehide',clearWithoutAction);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearWithoutAction();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pressedButton){clearWithoutAction();}},true);
})();
