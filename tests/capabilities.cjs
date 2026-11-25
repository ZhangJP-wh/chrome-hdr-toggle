const vm = require('node:vm'), fs = require('node:fs'), assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../sdr.js'), 'utf8');

function splitTop(query, separator) {
  const parts = [];
  let depth = 0, cur = '';
  const lower = query.toLowerCase();
  const needle = separator.toLowerCase();
  for (let i = 0; i < query.length; i++) {
    const ch = query[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth === 0 && lower.startsWith(needle, i)) { parts.push(cur); cur = ''; i += needle.length - 1; }
    else cur += ch;
  }
  parts.push(cur);
  return parts;
}
function wrapped(text) {
  if (!text.startsWith('(') || !text.endsWith(')')) return false;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') depth--;
    if (depth === 0 && i < text.length - 1) return false;
  }
  return depth === 0;
}
function mediaMatches(query) {
  return splitTop(query, ',').some(part => {
    const one = text => {
      text = text.trim();
      if (wrapped(text)) return one(text.slice(1, -1));
      if (/^not\s+/i.test(text)) return !one(text.replace(/^not\s+/i, ''));
      const ands = splitTop(text, ' and ');
      if (ands.length > 1) return ands.every(one);
      const feature = text.toLowerCase();
      if (feature === 'max-width: 0px') return false;
      if (feature === 'min-width: 1px' || feature === 'dynamic-range: standard' || feature === 'video-dynamic-range: standard' || feature === 'prefers-color-scheme: dark') return true;
      if (feature === 'dynamic-range: high' || feature === 'video-dynamic-range: high' || feature === 'color-gamut: p3' || feature === 'color-gamut: rec2020') return true;
      return false;
    };
    return one(part);
  });
}

function load({configurable = true} = {}) {
  const handlers = {};
  function Screen() {}
  for (const prop of ['pixelDepth', 'colorDepth']) {
    Object.defineProperty(Screen.prototype, prop, {configurable, enumerable: true, get() { return 30; }});
  }
  const screen = Object.create(Screen.prototype);
  const seen = [];
  const win = {
    addEventListener: (name, fn) => { handlers[name] = fn; },
    Screen,
    screen,
    matchMedia(query) { seen.push(query); return {media: query, matches: mediaMatches(query), addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}}; }
  };
  const ctx = {
    window: win,
    MediaSource: {isTypeSupported: () => true},
    HTMLMediaElement: function() {},
    navigator: {mediaCapabilities: {decodingInfo: async () => ({supported: true, smooth: true, powerEfficient: true})}},
    VideoDecoder: {isConfigSupported: async config => ({supported: true, config})}
  };
  ctx.HTMLMediaElement.prototype.canPlayType = () => 'probably';
  vm.createContext(ctx);
  vm.runInContext(source, ctx);
  return {ctx, handlers, win, seen};
}

(async () => {
  const {ctx, handlers, win} = load();
  const youtubeDisplay = () => win.matchMedia('(dynamic-range: high), (video-dynamic-range: high)').matches || win.screen.pixelDepth > 24 && win.matchMedia('(color-gamut: p3)').matches;
  for (const codec of ['vp09.02.51.10', 'vp9.2', 'vp09.2', 'av01.0.12M.10', 'av01.0.13M.10.0.110.09.16.09.0', 'hvc1.2.4.L153']) {
    assert.equal(ctx.MediaSource.isTypeSupported(`video/webm; codecs="${codec}"`), false, codec);
  }
  for (const codec of ['vp09.00.51.08', 'vp9', 'av01.0.12M.08', 'av01.0.08M.08', 'avc1.640028']) {
    assert.equal(ctx.MediaSource.isTypeSupported(`video/mp4; codecs="${codec}"`), true, codec);
  }
  assert.equal(ctx.MediaSource.isTypeSupported('video/webm; codecs="vp9"; eotf=smpte2084'), false);
  assert.equal(ctx.MediaSource.isTypeSupported('video/webm; codecs="vp9"; eotf=bt709'), true);
  assert.equal((await ctx.navigator.mediaCapabilities.decodingInfo({video:{transferFunction:'pq'}})).supported, false);
  assert.equal((await ctx.navigator.mediaCapabilities.decodingInfo({video:{contentType:'video/webm; codecs="vp9.2"'}})).supported, false);
  assert.equal((await ctx.navigator.mediaCapabilities.decodingInfo({video:{transferFunction:'srgb'}})).supported, true);
  assert.equal((await ctx.VideoDecoder.isConfigSupported({codec:'vp09.02.51.10.01.09.16.09.00'})).supported, false);
  assert.equal((await ctx.VideoDecoder.isConfigSupported({codec:'vp09.00.51.08', colorSpace:{transfer:'pq'}})).supported, false);
  assert.equal((await ctx.VideoDecoder.isConfigSupported({codec:'vp09.00.51.08'})).supported, true);
  assert.equal(ctx.HTMLMediaElement.prototype.canPlayType('video/webm; codecs="vp09.02.51.10"'), '');
  assert.equal(ctx.HTMLMediaElement.prototype.canPlayType('video/webm; codecs="vp9.2"'), '');
  assert.equal(youtubeDisplay(), false);
  assert.equal(win.screen.pixelDepth, 24);
  assert.equal(win.screen.colorDepth, 24);
  assert.equal(win.matchMedia('(dynamic-range: standard)').matches, true);
  assert.equal(win.matchMedia('(not (dynamic-range: high))').matches, true);
  assert.equal(win.matchMedia('(dynamic-range: high), (min-width: 1px)').matches, true);
  assert.equal(win.matchMedia('(prefers-color-scheme: dark)').media, '(prefers-color-scheme: dark)');
  assert.equal(win.matchMedia('(color-gamut: p3)').matches, true);

  handlers['hdr-toggle-state']({detail:false});
  assert.equal(ctx.MediaSource.isTypeSupported('video/webm; codecs="vp09.02.51.10"'), true);
  assert.equal(ctx.MediaSource.isTypeSupported('video/webm; codecs="vp9.2"'), true);
  assert.equal((await ctx.navigator.mediaCapabilities.decodingInfo({video:{transferFunction:'pq'}})).supported, true);
  assert.equal(youtubeDisplay(), true);
  assert.equal(win.screen.pixelDepth, 30);
  handlers['hdr-toggle-state']({detail:true});
  assert.equal(ctx.MediaSource.isTypeSupported('video/webm; codecs="vp09.02.51.10"'), false);
  assert.equal(youtubeDisplay(), false);
  assert.equal(win.screen.pixelDepth, 24);

  const locked = load({configurable:false});
  assert.equal(locked.win.screen.pixelDepth, 30);
  assert.equal(locked.win.matchMedia('(dynamic-range: high), (video-dynamic-range: high)').matches, false);
  assert.equal(locked.win.matchMedia('(color-gamut: p3)').matches, false);
  assert.equal(locked.win.matchMedia('(dynamic-range: high), (video-dynamic-range: high)').matches || locked.win.screen.pixelDepth > 24 && locked.win.matchMedia('(color-gamut: p3)').matches, false);
  console.log('capability, display and toggle checks passed');
})();
