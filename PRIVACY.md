# 隐私政策 / Privacy Policy

生效日期 / Effective date: 2026-11-17  
产品 / Product: HDR 开关 / HDR Toggle  
开发者 / Developer: ZhangJP-wh

## 数据处理 / Data handling

本扩展不收集、出售或向开发者及第三方传输个人信息、浏览历史、Cookie、账号信息或视频内容。扩展没有后端服务、分析统计、广告或远程执行代码。

This extension does not collect, sell, or transmit personal information, browsing history, cookies, account information, or video content to the developer or third parties. There are no backend services, analytics, advertisements, or remotely executed code.

## 本地设置 / Local settings

仅在 chrome.storage.local 保存一个 enabled 开关，用来记住是否开启 SDR 优先策略。该数据保存在当前浏览器配置文件中，不通过本扩展发送到外部服务器。移除扩展即可清除其存储的设置。

Only an enabled toggle is stored in chrome.storage.local to remember SDR preference in the current browser profile. The extension does not send it to external servers. Uninstalling removes the extension's stored settings.

## 网站访问与标签页 / Site access and tabs

HTTP 和 HTTPS 网站权限用于在网页及 iframe 中修改媒体能力检测结果，引导兼容播放器选择 SDR。点击开关时会临时枚举标签页并查看网址，以定位可同步设置的普通网页；不记录或上传这些网址，不读取网页正文或视频画面。脚本只处理媒体配置和开关事件。

HTTP and HTTPS host access allows media capability interception in pages and frames. Clicking the toggle temporarily enumerates tabs and checks their URLs to synchronize eligible pages. URLs are not logged, retained or uploaded. The extension does not read page text or video frames. Injected code processes media configurations and toggle events only.

## 用户选择 / Your choices

点击扩展图标可切换策略。可通过 Chrome 的扩展管理界面限制网站访问、停用或移除扩展。停用或移除后刷新已打开网页以清除注入脚本。

Click the icon to toggle the policy. Chrome extension settings allow restricting site access, disabling, or removing the extension. Reload open pages after disabling or removing it to clear injected scripts.

## 政策更新与联系 / Updates and contact

若数据处理方式发生变化，将更新本政策及商店隐私声明。问题反馈：https://github.com/ZhangJP-wh/chrome-hdr-toggle/issues 。请勿在公开 issue 中提交账号凭据或其他私人信息。

Changes to data practices will be reflected here and in the store disclosures. Contact: https://github.com/ZhangJP-wh/chrome-hdr-toggle/issues . Do not include credentials or private information in public issues.
