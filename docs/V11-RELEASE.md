# v0.11 发布与线上核验

- 游戏源码：main `3e79d2c0fd86abb6069779328ca1a75b9f3cbfbd`。
- 作品集：master `56dfe0008359eaf8d979cc6c1bad9d37c3b61f14`。
- 复用现有共享 Worker `xiaosang-portfolio`，未创建新域名、Worker 或发布分支。
- Cloudflare deployment/version：`e17eee1b-84f5-4c0c-98a6-1c478ae54fe3`。
- HTTPS release.json 回读版本 0.11.0 与源码提交一致。
- 线上实际进入游戏，验证移动、暂停、地图和继续；DEV QA hook 未打入生产环境。截图：`reports/v11/live-production.png`。
- 线上 JS、CSS、garden-props.webp、v11 报告均为 HTTP 200 且 Content-Type 正确（报告自动跳转到无后缀 URL）。
- 作品集线上 repos.json 已回读，标题、简介、Demo 和截图路径一致；原有二维码、GitHub URL、Umami 与域名复用。
- 构建、28 个受保护运行文件、434 个生产资源引用、README、版本递增、Wrangler dry-run 均通过。
- 作品集全局 Demo 检查存在已有的非本项目问题：`web-motion-showcase` 指向 `https://holynova.github.io/web-motion-showcase/`，与该检查要求的 xiaosang.cc 域名不符。已核对上一个提交中也存在，未修改其他项目或放宽校验器。
- TaskSpace 109 已关闭；本任务 Vite 5204 服务已停止。用户自行打开的原型页面保留。

游戏：https://xiaosang.cc/plant-survivors-ui/
报告：https://xiaosang.cc/plant-survivors-ui/qa/v11
