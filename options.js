const messages = {
 'zh-CN': {eyebrow:'CHROME EXTENSION',title:'鼠标手势设置',subtitle:'普通右键保持原样；右键拖动超过阈值后才进入手势模式。',generalTitle:'常规设置',generalDesc:'自定义手势识别距离、转折灵敏度和语言。',languageLabel:'显示语言',languageHelp:'更改设置页和手势提示的语言。',sensitivityLabel:'首段方向灵敏度',sensitivityHelp:'越高越容易识别短距离的首次直线移动。',lessSensitive:'低',moreSensitive:'高',previewLabel:'手势预览',previewHelp:'手势激活后显示轨迹、方向和对应指令。',previewText:'关闭当前选项卡',reset:'恢复默认',save:'保存设置',gesturesTitle:'手势说明',gesturesDesc:'按住鼠标右键，拖动超过启动距离后画出下列手势。',forward:'前进',back:'返回',scrollUp:'向上滚动',scrollDown:'向下滚动',reload:'刷新页面',closeTab:'关闭当前选项卡',tabLeft:'切换到左侧选项卡',tabRight:'切换到右侧选项卡',cancelNote:'普通右键点击保留原生菜单；已激活但不匹配指令的手势会取消。',footer:'设置使用 Chrome 同步存储，修改后自动保存。',saved:'设置已保存',resetDone:'已恢复默认设置',threshold:'首段方向需要约 {n} 像素。',activationLabel:'手势启动距离',activationHelp:'鼠标移动超过此距离才进入手势模式，普通右键点击不会显示轨迹。',turnLabel:'折线转折距离',turnHelp:'第二段折线距离；反方向折返可以更短。',shortDistance:'短',longDistance:'长',activationHint:'调大可防止轻微抖动触发手势。',turnHint:'反向折返从前一段运动的极值点计算。'},
 'ja': {eyebrow:'CHROME 拡張機能',title:'マウスジェスチャー設定',subtitle:'通常の右クリックはそのまま。一定距離動かすとジェスチャーになります。',generalTitle:'一般設定',generalDesc:'方向認識・開始距離・折り返しの感度と言語を調整します。',languageLabel:'表示言語',languageHelp:'設定画面とジェスチャー表示の言語を変更します。',sensitivityLabel:'最初の方向の感度',sensitivityHelp:'感度が高いほど、短い直線移動で方向を認識します。',lessSensitive:'低',moreSensitive:'高',previewLabel:'ジェスチャー表示',previewHelp:'軌跡と方向、実行する操作を表示します。',previewText:'現在のタブを閉じる',reset:'初期設定に戻す',save:'設定を保存',gesturesTitle:'ジェスチャー一覧',gesturesDesc:'右ボタンを押し、開始距離を超えて以下の方向へ動かします。',forward:'進む',back:'戻る',scrollUp:'上へスクロール',scrollDown:'下へスクロール',reload:'ページを再読み込み',closeTab:'現在のタブを閉じる',tabLeft:'左のタブに切り替え',tabRight:'右のタブに切り替え',cancelNote:'通常の右クリックメニューは保持され、未対応のジェスチャーはキャンセルされます。',footer:'設定は Chrome 同期ストレージへ自動保存されます。',saved:'設定を保存しました',resetDone:'初期設定に戻しました',threshold:'最初の方向の認識距離：約 {n} ピクセル',activationLabel:'ジェスチャー開始距離',activationHelp:'この距離以上の移動でジェスチャーを開始します。',turnLabel:'方向転換の距離',turnHelp:'2番目の線分に必要な距離。逆方向への折り返しは短めです。',shortDistance:'短',longDistance:'長',activationHint:'大きくすると微小な動きでの誤作動を防げます。',turnHint:'折り返しは前の線分の最遠点から測定します。'},
 'en': {eyebrow:'CHROME EXTENSION',title:'Mouse Gesture Settings',subtitle:'Normal right-clicks still work; gestures begin after dragging far enough.',generalTitle:'General settings',generalDesc:'Adjust direction recognition, activation distance, turning threshold and language.',languageLabel:'Display language',languageHelp:'Changes the settings and gesture hint language.',sensitivityLabel:'First-stroke sensitivity',sensitivityHelp:'Higher sensitivity recognizes a shorter initial directional stroke.',lessSensitive:'Low',moreSensitive:'High',previewLabel:'Gesture preview',previewHelp:'A trail, direction and action appear after activation.',previewText:'Close current tab',reset:'Restore defaults',save:'Save settings',gesturesTitle:'Gesture reference',gesturesDesc:'Hold the right button, drag past the activation distance, then draw a gesture.',forward:'Forward',back:'Back',scrollUp:'Scroll up',scrollDown:'Scroll down',reload:'Reload page',closeTab:'Close current tab',tabLeft:'Previous tab',tabRight:'Next tab',cancelNote:'Normal right-clicks retain the native menu; unmatched gestures are cancelled.',footer:'Settings automatically save to Chrome sync storage.',saved:'Settings saved',resetDone:'Defaults restored',threshold:'Initial direction requires about {n} px.',activationLabel:'Activation distance',activationHelp:'Dragging beyond this distance activates gestures instead of a normal right-click.',turnLabel:'Turn distance',turnHelp:'Required distance for a second stroke; reversals need slightly less.',shortDistance:'Short',longDistance:'Long',activationHint:'Increase this to avoid accidental gestures from tiny movements.',turnHint:'Reversal distance is measured from the previous stroke’s furthest point.'}
};
const controls={
 language:document.querySelector('#language'),
 sensitivity:document.querySelector('#sensitivity'),
 activationDistance:document.querySelector('#activationDistance'),
 turnDistance:document.querySelector('#turnDistance')
};
const defaults={language:'zh-CN',sensitivity:60,activationDistance:12,turnDistance:14};
const status=document.querySelector('#saveStatus');
let currentLang='zh-CN';
function t(k){return (messages[currentLang]||messages['zh-CN'])[k]||messages['zh-CN'][k]||k;}
function strokeThreshold(v){return Math.round(53-Math.min(100,Math.max(1,Number(v)||60))*.46);}
function renderValues(){
 document.querySelector('#sensitivityValue').textContent=`${controls.sensitivity.value}%`;
 document.querySelector('#sensitivityHint').textContent=t('threshold').replace('{n}',strokeThreshold(controls.sensitivity.value));
 document.querySelector('#activationValue').textContent=`${controls.activationDistance.value}px`;
 document.querySelector('#turnValue').textContent=`${controls.turnDistance.value}px`;
}
function applyLanguage(lang){
 currentLang=messages[lang]?lang:'zh-CN';document.documentElement.lang=currentLang;
 document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});
 renderValues();
}
function readControls(){return {language:controls.language.value,sensitivity:Number(controls.sensitivity.value),activationDistance:Number(controls.activationDistance.value),turnDistance:Number(controls.turnDistance.value)};}
let statusTimer=null;
function notify(message){status.textContent=message;clearTimeout(statusTimer);statusTimer=setTimeout(()=>status.textContent='',2200);}
async function save(showStatus=false){
 try{await chrome.storage.sync.set({rmgSettings:readControls()});if(showStatus)notify(t('saved'));}
 catch(err){notify(String(err?.message||err));}
}
controls.language.addEventListener('change',()=>{applyLanguage(controls.language.value);save();});
for(const name of ['sensitivity','activationDistance','turnDistance']){
 controls[name].addEventListener('input',renderValues);
 controls[name].addEventListener('change',()=>save());
}
document.querySelector('#save').addEventListener('click',()=>save(true));
document.querySelector('#reset').addEventListener('click',async()=>{
 for(const [key,value] of Object.entries(defaults))controls[key].value=value;
 applyLanguage(defaults.language);await save();notify(t('resetDone'));
});
chrome.storage.sync.get('rmgSettings').then(({rmgSettings})=>{
 const saved={...defaults,...(rmgSettings||{})};
 for(const key of Object.keys(defaults)) if(saved[key]!==undefined) controls[key].value=saved[key];
 if(!messages[controls.language.value])controls.language.value=defaults.language;
 applyLanguage(controls.language.value);
}).catch(()=>applyLanguage(defaults.language));
