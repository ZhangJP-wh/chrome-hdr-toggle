(() => {
  'use strict';
  if (globalThis.__hdrToggleInstalled) return;
  globalThis.__hdrToggleInstalled = true;
  let enabled = true;
  window.addEventListener('hdr-toggle-state', event => { enabled = event.detail === true; });
  // Reject HDR profiles while retaining ordinary 8-bit VP9/AV1 and AVC.
  function hdr(type) {
    if (typeof type !== 'string') return false;
    return /\bvp0?9\.0[23]\b/i.test(type) || /\bav01\.\d\.\d{2}[mh]\.12\b/i.test(type) || /\bav01\.\d\.\d{2}[mh]\.10\b/i.test(type) || /\b(?:hvc1|hev1)\.2\./i.test(type) || /(?:eotf|transfer-function)\s*=\s*["']?(?:pq|hlg|smpte2084)/i.test(type);
  }
  for (const api of [globalThis.MediaSource, globalThis.ManagedMediaSource]) {
    if (!api?.isTypeSupported) continue;
    const original = api.isTypeSupported;
    api.isTypeSupported = function(type) {return enabled && hdr(type) ? false : Reflect.apply(original,this,arguments);};
  }
  if(globalThis.HTMLMediaElement) {
    const original = HTMLMediaElement.prototype.canPlayType;
    HTMLMediaElement.prototype.canPlayType = function(type) {return enabled && hdr(type)?'':Reflect.apply(original,this,arguments);};
  }
  const caps = navigator.mediaCapabilities;
  if(caps?.decodingInfo) {
    const original = caps.decodingInfo;
    caps.decodingInfo = function(config) {
      const video = config?.video;
      if(enabled && video && (hdr(video.contentType) || ['pq','hlg'].includes(video.transferFunction) || video.hdrMetadataType)) return Promise.resolve({supported:false,smooth:false,powerEfficient:false,keySystemAccess:null});
      return Reflect.apply(original,this,arguments);
    };
  }
})();
