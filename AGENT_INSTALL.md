# 安装与验证 / Installation and verification

加载仓库根目录（包含 manifest.json）到 Chrome 119+。无构建步骤、无外部依赖。

1. 在 chrome://extensions 加载已解压扩展；确认没有错误。
2. 初始应为 AUTO；点击一次为 SDR，另一个窗口应共享状态；再次点击为 AUTO。
3. 在有 HDR / SDR 替代流的视频网站刷新并比较画质菜单、详细统计信息及显示器输出。
4. 在第二个不同域名的视频网站和跨域 iframe 中重复。固定 HDR 文件可能不支持，不将 badge 当成播放验证。
5. 重启 Chrome 后检查状态保存；禁用或移除后刷新页面确认恢复。
6. 本地运行：node tests/capabilities.cjs 和 node tests/background.cjs。

Read README limitations before reporting results. Never claim universal HDR output control. Do not automatically reload user tabs or publish browsing data.
