(() => {
  'use strict';
  if (globalThis.__hdrToggleInstalled) return;
  globalThis.__hdrToggleInstalled = true;
  let enabled = true;
  window.addEventListener('hdr-toggle-state', event => { enabled = event.detail === true; });

  // Reject HDR profiles while retaining ordinary 8-bit VP9/AV1 and AVC.
  // YouTube rewrites a blocked vp09.02 probe into the short type "vp9.2".
  function hdr(type) {
    if (typeof type !== 'string') return false;
    return /\bvp0?9\.0?[23]\b/i.test(type)
      || /\bav01\.\d\.\d{2}[mh]\.12\b/i.test(type)
      || /\bav01\.\d\.\d{2}[mh]\.10\b/i.test(type)
      || /\b(?:hvc1|hev1)\.2\./i.test(type)
      || /(?:eotf|transfer-function)\s*=\s*["']?(?:pq|hlg|smpte2084|arib-std-b67)/i.test(type);
  }
  function hdrTransfer(value) {
    const transfer = String(value || '').toLowerCase();
    return transfer === 'pq' || transfer === 'hlg' || transfer === 'smpte2084' || transfer === 'arib-std-b67';
  }

  for (const api of [globalThis.MediaSource, globalThis.ManagedMediaSource]) {
    if (!api?.isTypeSupported) continue;
    const original = api.isTypeSupported;
    api.isTypeSupported = function(type) { return enabled && hdr(type) ? false : Reflect.apply(original, this, arguments); };
  }
  if (globalThis.HTMLMediaElement) {
    const original = HTMLMediaElement.prototype.canPlayType;
    HTMLMediaElement.prototype.canPlayType = function(type) { return enabled && hdr(type) ? '' : Reflect.apply(original, this, arguments); };
  }
  const caps = navigator.mediaCapabilities;
  if (caps?.decodingInfo) {
    const original = caps.decodingInfo;
    caps.decodingInfo = function(config) {
      const video = config?.video;
      if (enabled && video && (hdr(video.contentType) || hdrTransfer(video.transferFunction) || video.hdrMetadataType)) {
        return Promise.resolve({supported:false, smooth:false, powerEfficient:false, keySystemAccess:null});
      }
      return Reflect.apply(original, this, arguments);
    };
  }
  if (globalThis.VideoDecoder?.isConfigSupported) {
    const original = VideoDecoder.isConfigSupported;
    VideoDecoder.isConfigSupported = function(config) {
      if (enabled && (hdr(config?.codec) || hdrTransfer(config?.colorSpace?.transfer))) {
        return Promise.resolve({supported:false, config});
      }
      return Reflect.apply(original, this, arguments);
    };
  }

  // YouTube's format filter keeps an HDR stream when the display looks HDR-capable,
  // even if the codec string itself is only "vp9". Report an SDR display instead:
  // dynamic-range / video-dynamic-range high do not match, and color depth is 8-bit
  // so the pixelDepth > 24 && (color-gamut: p3) clause fails too.
  let depthSpoofed = false;
  const ScreenRef = window.Screen;
  if (ScreenRef?.prototype) {
    const spoof = prop => {
      const desc = Object.getOwnPropertyDescriptor(ScreenRef.prototype, prop);
      if (!desc || typeof desc.get !== 'function' || desc.configurable === false) return false;
      const native = desc.get;
      Object.defineProperty(ScreenRef.prototype, prop, {
        configurable: true,
        enumerable: !!desc.enumerable,
        get() { return enabled ? 24 : native.call(this); }
      });
      return true;
    };
    try { depthSpoofed = spoof('pixelDepth'); spoof('colorDepth'); }
    catch (e) { depthSpoofed = false; }
  }
  if (typeof window.matchMedia === 'function') {
    const original = window.matchMedia.bind(window);
    const wrapped = function(query) { return original(rewriteQuery(query)); };
    try { window.matchMedia = wrapped; }
    catch (e) { Object.defineProperty(window, 'matchMedia', {configurable:true, writable:true, value:wrapped}); }
  }
  function rewriteQuery(query) {
    if (!enabled || typeof query !== 'string') return query;
    // A contradictory width query is false at every viewport size, including a
    // 0px iframe at document_start. An unknown feature value would make "not (...)" false too.
    const never = '(min-width: 1px) and (max-width: 0px)';
    let next = query.replace(/(video-)?dynamic-range\s*:\s*high\b/gi, never);
    if (!depthSpoofed) {
      let depth = 24;
      try { depth = window.screen?.pixelDepth || window.screen?.colorDepth || 24; } catch (e) {}
      if (depth > 24) next = next.replace(/color-gamut\s*:\s*(?:p3|rec2020)\b/gi, never);
    }
    return next;
  }
})();
