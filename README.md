<p align="center"><img src="icons/icon128.png" width="128" alt="HDR 开关图标：正方形蓝底上放大的白色 HDR 与灰色禁止环"></p>

# HDR 开关 / HDR Toggle

Chrome 扩展：点击工具栏图标，全局切换「SDR 优先」和「原始 HDR 能力」。作用于普通 HTTP / HTTPS 网页及其嵌入播放器，不局限于 YouTube。已播放的视频需要刷新页面重新选流。

Chrome extension: click the toolbar icon to toggle SDR preference globally across HTTP/HTTPS pages. Reload playing pages to renegotiate streams. Compatibility depends on the player.

**仓库 / Repo:** https://github.com/ZhangJP-wh/chrome-hdr-toggle  
**版本 / Version:** 1.1.4

## 给电脑小白：一分钟安装 / 1-minute install

1. 点击 **Code → Download ZIP** 并解压。 / Download and unzip.
2. 打开 `chrome://extensions`，开启「开发者模式」。 / Enable Developer mode.
3. 点击「加载已解压的扩展程序」，选择包含 `manifest.json` 的文件夹。 / Load unpacked.
4. 固定扩展图标，点击一次开启 SDR 优先，再点恢复原始能力。 / Pin and click the icon to toggle.
5. 刷新需要切换的视频页面。 / Reload video pages.

无需编译、登录或命令行。需要 Chrome 119 或更新版本。 / No build, login or CLI. Chrome 119+.

## 使用 / Usage

| 图标标记 / Badge | 含义 / Meaning |
|---|---|
| AUTO | 默认状态，保留播放器原有 HDR 能力 / Original capabilities |
| SDR | 已开启全站 SDR 优先策略 / SDR preference enabled globally |
| ! | 设置发生错误，请重新加载扩展重试 / Settings error; reload extension |

开关对所有普通网页同时生效并记住设置，包括其他窗口。它会立即改变已打开网页后续的能力检测和显示 HDR 信号；已经缓冲的 HDR 视频不会自动变为 SDR，必须刷新重新选流。恢复 AUTO 同样需要刷新。标记表示策略状态，不代表检测到了当前视频的实际 HDR 状态。不自动刷新网页，以免打断播放或丢失未提交内容。

The toggle persists across sessions and applies across windows. Capability probes and display HDR signals change immediately; buffered streams need a page reload. The badge indicates policy, not actual video HDR status. Pages are not automatically reloaded.

在 YouTube 上确认：徽章为 **SDR** 后刷新视频页，打开画质菜单或「详细统计信息 / Stats for nerds」。当前格式不应再标 HDR；编码应是 SDR（例如 `vp09.00`、`vp9`、8 位 `av01` 或 `avc1`），而不是 `vp9.2`、`vp09.02` 或带 PQ/HLG 的 10 位流。

On YouTube: with the badge on **SDR**, reload the watch page, then open the quality menu or Stats for nerds. The active format should not be marked HDR. Expect an SDR codec such as `vp09.00`, `vp9`, 8-bit `av01` or `avc1`, not `vp9.2`, `vp09.02`, or a 10-bit PQ/HLG stream.

## 原理与限制 / How it works and limits

在网页启动时拦截 MediaSource.isTypeSupported、HTMLMediaElement.canPlayType、MediaCapabilities.decodingInfo 和 VideoDecoder.isConfigSupported，拒绝常见 HDR / 10 位格式（含 YouTube 的短类型 `vp9.2`）。SDR 模式下还会把显示报成 SDR：`(dynamic-range: high)` 与 `(video-dynamic-range: high)` 不匹配，屏幕色深为 24，因此 `pixelDepth > 24` 且 `(color-gamut: p3)` 也不成立。YouTube 用这组信号决定要不要保留 HDR 流。

Intercepts media capability probes, including YouTube's short `vp9.2` type, and rejects common HDR/10-bit configurations. In SDR mode the page also sees an SDR display: `(dynamic-range: high)` and `(video-dynamic-range: high)` do not match, and screen color depth is 24, so `pixelDepth > 24` with `(color-gamut: p3)` fails too. YouTube uses those signals to decide whether to keep an HDR stream.

- **不能保证关闭任意播放窗口的 HDR。** 没有 Chrome 扩展 API 可直接控制所有视频的 HDR 输出；固定 HDR 文件、不做能力协商的播放器、DRM，以及不经过上述检测的 WebCodecs 播放路径可能不响应。
- 不做色调映射、不修改系统或浏览器的 HDR 输出设置。SDR 模式只让网页看到 SDR 显示和更窄的解码能力；AUTO 恢复原始信号。是否播放 HDR 仍由视频、网站、浏览器和显示设备决定。
- 会同时排除部分 10 位 SDR 格式，最高分辨率、帧率可能降低；没有 SDR 替代流时也可能无法播放，切回 AUTO 并刷新即可恢复。
- Chrome 内置页面、扩展商店及受限制页面无法注入。网站权限被限制时只能在允许的网站生效。仅覆盖当前 Chrome 配置文件。

Not a universal HDR output switch or a tone mapper. SDR mode only reports an SDR display and narrower decode capability to the page; AUTO restores the original signals. Fixed HDR files, DRM, and WebCodecs players that skip the probes above may be unaffected. Some 10-bit SDR streams are also excluded; resolution or frame rate can fall, or playback may fail without an SDR alternative. Restore AUTO and reload to recover. Restricted pages and other Chrome profiles are outside scope.

参考 / References: [Chrome scripting](https://developer.chrome.com/docs/extensions/reference/api/scripting), [Media Capabilities](https://www.w3.org/TR/media-capabilities/).

## 给 AI Agent / For AI Agents

按 [AGENT_INSTALL.md](AGENT_INSTALL.md) 安装并验证。

## 更新 / Updating

替换文件后，在 `chrome://extensions` 点击「重新加载」，检查网站访问权限，再刷新视频页面。旧版 YouTube SDR 建议移除以免重复拦截。GitHub 更新不会自动升级已安装副本。

Replace files, reload the extension, review site access and refresh video pages. Remove the old YouTube SDR extension to avoid duplicate interception. Installed copies do not auto-update from GitHub.

## 隐私 / Privacy

[完整隐私政策 / Full privacy policy](PRIVACY.md)

没有服务器、遥测、Cookie 读取或内容上传。只用本地存储保存开关。全站网站访问权限用于注入媒体能力与显示动态范围脚本；临时枚举标签页以同步所有页面，不保存或发送网址。不含外部脚本或依赖。

No servers, telemetry, cookie access or uploads. Local storage contains only the toggle. Site access injects the media-capability and display dynamic-range script; tab enumeration synchronizes open pages without saving or transmitting URLs.

## 验证 / Validation

提供模拟能力检测与开关测试。真实网站、DRM 和 HDR 显示器兼容性尚未全面验证，不承诺所有视频有效。

Includes simulated capability and toggle tests. Real-site, DRM and HDR-display compatibility is not comprehensively verified.

## 变更 / Changelog

### 1.1.4

收紧同一枚蓝底 HDR 禁止标志的裁切。正方形画布不变，尽量去掉标志周围的蓝边，放大白色 HDR 字母和灰色禁止环。字母比圆环更宽，所以上下仍留有蓝边，字母不会被裁掉。工具栏尺寸与 `icons/icon-source.png`（1024×1024）一并替换，图标路径不变。行为与 1.1.3 相同。

Tightened the crop of the same blue HDR prohibition mark. The square canvas stays; surrounding blue is reduced so the white HDR letters and gray prohibition ring are larger. Blue remains above and below the ring because the letters are wider than the ring is tall, which keeps the letters unclipped. Toolbar sizes and `icons/icon-source.png` (1024×1024) are replaced together. Icon paths are unchanged. Behavior is unchanged from 1.1.3.

### 1.1.3

替换工具栏与商店图标为蓝底、白色 HDR 字样、灰色禁止环。源图为 `icons/icon-source.png`（1024×1024）。行为与 1.1.2 相同。

Replaced the toolbar and listing icons with the blue HDR prohibition mark. Source artwork is `icons/icon-source.png` (1024×1024). Behavior is unchanged from 1.1.2.

### 1.1.2

修复 YouTube 上 SDR 优先不生效的问题。当前播放器在认为显示器支持 HDR 时会留下 HDR 流：它检查 `(dynamic-range: high)`、`(video-dynamic-range: high)`，以及色深大于 24 且 `(color-gamut: p3)`。只拒绝完整的 `vp09.02` 时，播放器会改用短类型 `vp9.2` 继续选 HDR。SDR 模式现在向页面报告 SDR 显示，并拒绝 `vp9.2`。已打开的视频仍需刷新后重新选流。

Fixes SDR preference on YouTube. The current player keeps an HDR stream when the display looks HDR-capable: it checks `(dynamic-range: high)`, `(video-dynamic-range: high)`, and color depth above 24 with `(color-gamut: p3)`. Rejecting only the long `vp09.02` string makes it fall back to the short type `vp9.2` and still select HDR. SDR mode now reports an SDR display and rejects `vp9.2`. Refresh an open video to pick a new stream.

### 1.1.1

替换为透明背景的玻璃 HDR 图标，保留 PNG 透明通道。 / Transparent glass HDR icons with preserved alpha.

### 1.1.0

采用用户提供的液态玻璃 HDR 图标；扩大为 HTTP/HTTPS 全站；改为点击图标全局切换，保存状态并同步已打开页面。默认 AUTO。

Liquid-glass HDR icons, global HTTP/HTTPS scope, one-click persistent toggle and live capability synchronization. Defaults to AUTO.

### 1.0.0

初始 YouTube SDR 版本。 / Initial YouTube SDR version.

## License

MIT。图标由项目所有者提供。 / MIT. Icon supplied by the project owner.

