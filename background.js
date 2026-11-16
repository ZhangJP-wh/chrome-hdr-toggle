const ID = 'hdr-global';
const matches = ['http://*/*', 'https://*/*'];
let queue = Promise.resolve();
async function sync() {
  const {enabled = false} = await chrome.storage.local.get('enabled');
  const registered = await chrome.scripting.getRegisteredContentScripts({ids:[ID]});
  if(enabled && !registered.length) await chrome.scripting.registerContentScripts([{id:ID,matches,js:['sdr.js'],runAt:'document_start',world:'MAIN',allFrames:true,matchOriginAsFallback:true}]);
  if(!enabled && registered.length) await chrome.scripting.unregisterContentScripts({ids:[ID]});
  await chrome.action.setBadgeText({text:enabled?'SDR':'AUTO'});
  await chrome.action.setBadgeBackgroundColor({color:enabled?'#176b55':'#627080'});
  await chrome.action.setTitle({title:enabled?'SDR 优先已开启（刷新视频后应用）；点击恢复自动 HDR':'原始 HDR 能力已恢复（刷新视频后应用）；点击优先 SDR'});
  return enabled;
}
async function toggle() {
  const {enabled = false} = await chrome.storage.local.get('enabled');
  await chrome.storage.local.set({enabled:!enabled});
  const next = await sync();
  const tabs = await chrome.tabs.query({});
  await Promise.allSettled(tabs.filter(t=>t.id && /^https?:/.test(t.url||'')).map(async t=>{
    if(next) await chrome.scripting.executeScript({target:{tabId:t.id,allFrames:true},world:'MAIN',files:['sdr.js']});
    await chrome.scripting.executeScript({target:{tabId:t.id,allFrames:true},world:'MAIN',func:value=>window.dispatchEvent(new CustomEvent('hdr-toggle-state',{detail:value})),args:[next]});
  }));
}
function schedule(job) {queue=queue.then(job).catch(async error=>{console.error('HDR Toggle:',error);await chrome.action.setBadgeText({text:'!'});await chrome.action.setTitle({title:'设置未完全应用，请重新加载扩展后重试'});});}
chrome.action.onClicked.addListener(()=>schedule(toggle));
chrome.runtime.onInstalled.addListener(()=>schedule(sync));
chrome.runtime.onStartup.addListener(()=>schedule(sync));
