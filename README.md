# 植物幸存者 · Plant Survivors

[Demo](https://xiaosang.cc/plant-survivors-ui/) · [Repo](https://github.com/holynova/plant-survivors-ui)

v0.13.0：按方案一原稿等比重做 18 屏界面，包括戴夫营地、配装、战斗 HUD 和结算。 / The Sprout Forge edition rebuilds 18 screens around the reference proportions, including Dave’s camp, loadouts, the battle HUD and results.

手机优先的单机幸存者游戏：任意位置触摸拖动，左右手皆可；三位主角在三张大地图自由行走，镜头持续跟随。26 种植物、18 类敌人、升级进化与图鉴；精英和首领掉落金币、钻石，用于局外解锁与永久成长。首次进入显示资源加载进度，支持键盘、战斗音效、暂停和本地存档。

原版音乐通过作者官方播放器播放，需联网并点击播放；可选 Grasswalk、Moongrains、Graze the Roof 与 Brainiac Maniac。另有四段离线原创合成配乐，支持暂停续播和独立音量。没有模拟手机外壳、账号或云同步。

A mobile-first survival game with free-position touch movement, three heroes and three large scrolling worlds. It features 26 plants, 18 enemy types, distinct attacks, evolution, a field guide, and persistent coin/diamond unlocks. A progress bar preloads game assets. Native safe areas, landscape layouts, keyboard controls, sound effects and local saves are supported. Original PvZ music uses the composer's official online player and requires a playback click; the four original synthesized tracks are labeled separately, with pause/resume and independent volumes.

![手机实际运行截图 / Runtime browser capture](docs/reports/forge-precision/standard-390/standard-390-lobby.webp)

## 运行 / Run

```sh
npm ci
npm run dev
```

## 测试与构建 / Test and build

```sh
npm run test:game
npm run test:sites
npm run check:design
npm run test:mobile
npm run test:performance
npm run build:release
```

Production assets in `dist/client` target `/plant-survivors-ui/`. Copy this build into the portfolio repository's matching folder, commit to its master branch, then stage that committed tree and manually deploy the existing `xiaosang-portfolio` Worker. Do not create another Worker.

[重做版 18 屏对照 / UI comparison](https://xiaosang.cc/plant-survivors-ui/qa/precision) · [多尺寸截图报告 / Mobile report](docs/reports/forge-precision/index.html) · [v0.11 画面对照与验收 / Visual comparison](https://xiaosang.cc/plant-survivors-ui/qa/v11.html) · [设计系统 / Design system](docs/DESIGN-SYSTEM.md) · [固定测试流程 / QA workflow](docs/MOBILE-QA.md)

[v0.6 机制与手机验收 / Verification](docs/V06-VERIFICATION.md) · [设计依据 / Design and research](docs/V06-DESIGN.md) · [分阶段测试报告 / Test report](docs/TEST-REPORT.md) · [素材说明 / Assets](ASSETS.md)

![手机访问 / QR](assets/qr.png)
