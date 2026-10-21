const GESTURES = {
  R: { label: '前进', action: 'forward' },
  L: { label: '返回', action: 'back' },
  U: { label: '向上滚动', action: 'scrollUp' },
  D: { label: '向下滚动', action: 'scrollDown' },
  UD: { label: '刷新页面', action: 'reload' },
  DU: { label: '刷新页面', action: 'reload' },
  DR: { label: '关闭当前选项卡', action: 'close' },
  UL: { label: '切换到左侧选项卡', action: 'tabLeft' },
  UR: { label: '切换到右侧选项卡', action: 'tabRight' }
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== 'GESTURE_ACTION') return;
  const tabId = sender.tab?.id ?? msg.tabId;
  if (tabId == null) return;
  (async () => {
    try {
      switch (msg.action) {
        case 'back': await chrome.tabs.goBack(tabId); break;
        case 'forward': await chrome.tabs.goForward(tabId); break;
        case 'reload': await chrome.tabs.reload(tabId); break;
        case 'close': await chrome.tabs.remove(tabId); break;
        case 'tabLeft':
        case 'tabRight': {
          const current = await chrome.tabs.get(tabId);
          const tabs = (await chrome.tabs.query({ windowId: current.windowId })).sort((a, b) => a.index - b.index);
          if (tabs.length < 2) break;
          const i = tabs.findIndex(t => t.id === tabId);
          const nextIndex = msg.action === 'tabLeft'
            ? (i - 1 + tabs.length) % tabs.length
            : (i + 1) % tabs.length;
          await chrome.tabs.update(tabs[nextIndex].id, { active: true });
          break;
        }
        case 'scrollUp':
        case 'scrollDown':
          // Scroll is handled in the content script so it works in the page's frame.
          break;
      }
      sendResponse({ ok: true });
    } catch (e) {
      sendResponse({ ok: false, error: String(e?.message || e) });
    }
  })();
  return true;
});
