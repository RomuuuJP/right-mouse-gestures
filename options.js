const messages = {
 'zh-CN': {eyebrow:'CHROME EXTENSION',title:'鼠标手势设置',subtitle:'按住右键移动，松开后执行手势。',generalTitle:'常规设置',generalDesc:'自定义识别手感和界面语言。',languageLabel:'显示语言',languageHelp:'更改设置页和手势提示的语言。',sensitivityLabel:'手势灵敏度',sensitivityHelp:'越高越容易识别短距离移动；越低则需要更明显的移动。',lessSensitive:'低',moreSensitive:'高',previewLabel:'手势预览',previewHelp:'提示会显示识别到的方向和对应指令。',previewText:'关闭当前选项卡',reset:'恢复默认',save:'保存设置',gesturesTitle:'手势说明',gesturesDesc:'在网页中按住鼠标右键，按下列方向移动。',forward:'前进',back:'返回',scrollUp:'向上滚动',scrollDown:'向下滚动',reload:'刷新页面',closeTab:'关闭当前选项卡',tabLeft:'切换到左侧选项卡',tabRight:'切换到右侧选项卡',cancelNote:'不匹配任何指令的手势会被取消，不执行操作。',footer:'设置会自动保存到此 Chrome 用户配置中。',saved:'设置已保存',resetDone:'已恢复默认设置',threshold:'当前识别距离约为 {n} 像素。'},
 'ja': {eyebrow:'CHROME 拡張機能',title:'マウスジェスチャー設定',subtitle:'右ボタンを押したまま動かし、離すと実行します。',generalTitle:'一般設定',generalDesc:'感度と言語をカスタマイズします。',languageLabel:'表示言語',languageHelp:'設定画面とジェスチャー表示の言語を変更します。',sensitivityLabel:'ジェスチャー感度',sensitivityHelp:'高いほど短い移動を認識しやすく、低いほど大きな移動が必要です。',lessSensitive:'低',moreSensitive:'高',previewLabel:'ジェスチャー表示',previewHelp:'認識した方向と実行する操作を表示します。',previewText:'現在のタブを閉じる',reset:'初期設定に戻す',save:'設定を保存',gesturesTitle:'ジェスチャー一覧',gesturesDesc:'ウェブページ上で右ボタンを押したまま、次の方向に動かします。',forward:'進む',back:'戻る',scrollUp:'上へスクロール',scrollDown:'下へスクロール',reload:'ページを再読み込み',closeTab:'現在のタブを閉じる',tabLeft:'左のタブに切り替え',tabRight:'右のタブに切り替え',cancelNote:'一致する操作がないジェスチャーはキャンセルされます。',footer:'設定はこの Chrome プロファイルに保存されます。',saved:'設定を保存しました',resetDone:'初期設定に戻しました',threshold:'現在の認識距離：約 {n} ピクセル'},
 'en': {eyebrow:'CHROME EXTENSION',title:'Mouse Gesture Settings',subtitle:'Hold the right mouse button, move, then release to run a gesture.',generalTitle:'General settings',generalDesc:'Customize gesture sensitivity and display language.',languageLabel:'Display language',languageHelp:'Changes the language used on this page and in gesture hints.',sensitivityLabel:'Gesture sensitivity',sensitivityHelp:'Higher sensitivity recognizes shorter movements; lower sensitivity requires clearer movement.',lessSensitive:'Low',moreSensitive:'High',previewLabel:'Gesture preview',previewHelp:'The overlay shows the recognized direction and action.',previewText:'Close current tab',reset:'Restore defaults',save:'Save settings',gesturesTitle:'Gesture reference',gesturesDesc:'Hold the right mouse button on a webpage and move in these directions.',forward:'Forward',back:'Back',scrollUp:'Scroll up',scrollDown:'Scroll down',reload:'Reload page',closeTab:'Close current tab',tabLeft:'Switch to tab on the left',tabRight:'Switch to tab on the right',cancelNote:'Gestures that do not match an action are cancelled.',footer:'Settings are saved to this Chrome profile.',saved:'Settings saved',resetDone:'Defaults restored',threshold:'Current recognition distance: about {n} px'}
};
const language = document.querySelector('#language');
const sensitivity = document.querySelector('#sensitivity');
const value = document.querySelector('#sensitivityValue');
const hint = document.querySelector('#sensitivityHint');
const status = document.querySelector('#saveStatus');
let currentLang = 'zh-CN';
const defaults = { language: 'zh-CN', sensitivity: 60 };
function thresholdFor(v) { return Math.round(64 - Number(v) * 0.48); }
function t(key) { return (messages[currentLang] || messages['zh-CN'])[key] || messages['zh-CN'][key] || key; }
function applyLanguage(lang) {
  currentLang = messages[lang] ? lang : 'zh-CN';
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => { const key = el.dataset.i18n; if (t(key)) el.textContent = t(key); });
  updateSensitivityLabel();
}
function updateSensitivityLabel() {
  value.textContent = `${sensitivity.value}%`;
  hint.textContent = t('threshold').replace('{n}', thresholdFor(sensitivity.value));
}
function readControls() { return { language: language.value, sensitivity: Number(sensitivity.value) }; }
async function save(showStatus = true) {
  const settings = readControls();
  await chrome.storage.sync.set({ rmgSettings: settings });
  if (showStatus) { status.textContent = t('saved'); setTimeout(() => { status.textContent = ''; }, 2200); }
}
language.addEventListener('change', () => { applyLanguage(language.value); save(false); });
sensitivity.addEventListener('input', updateSensitivityLabel);
sensitivity.addEventListener('change', () => save(false));
document.querySelector('#save').addEventListener('click', () => save(true));
document.querySelector('#reset').addEventListener('click', async () => { language.value = defaults.language; sensitivity.value = defaults.sensitivity; applyLanguage(defaults.language); await save(false); status.textContent = t('resetDone'); setTimeout(() => { status.textContent = ''; }, 2200); });
chrome.storage.sync.get('rmgSettings').then(({rmgSettings}) => {
  const settings = {...defaults, ...(rmgSettings || {})};
  language.value = messages[settings.language] ? settings.language : defaults.language;
  sensitivity.value = Math.min(100, Math.max(1, Number(settings.sensitivity) || defaults.sensitivity));
  applyLanguage(language.value);
});
