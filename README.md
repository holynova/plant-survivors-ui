# 植物幸存者 · Plant Survivors

[Demo](https://xiaosang.cc/plant-survivors-ui/) · [Repo](https://github.com/holynova/plant-survivors-ui)

v0.7.0：统一后院设计系统、地面预警与冲击特效、可重复的压力和多尺寸验收。 / v0.7.0 adds shared design tokens, ground effects and repeatable mobile/performance QA.

手机优先的单机幸存者游戏：任意位置触摸拖动，左右手皆可；三位主角在三张大地图自由行走，镜头持续跟随。26 种植物、15 类敌人、升级进化与图鉴；精英和首领掉落金币、钻石，用于局外解锁与永久成长。首次进入显示资源加载进度，支持键盘、战斗音效、暂停和本地存档。

原版音乐通过作者官方播放器播放，需联网并点击播放；可选 Grasswalk、Moongrains、Graze the Roof 与 Brainiac Maniac。另保留离线合成音乐。没有模拟手机外壳、账号或云同步。

A mobile-first survival game with free-position touch movement, three heroes and three large scrolling worlds. It features 26 plants, 15 enemy types, distinct attacks, evolution, a field guide, and persistent coin/diamond unlocks. A progress bar preloads game assets. Native safe areas, landscape layouts, keyboard controls, sound effects and local saves are supported. Original PvZ music uses the composer's official online player and requires a playback click; the synthesized offline loop is labeled separately.

![手机实际运行截图 / Runtime browser capture](assets/mobile-v07.png)

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

[多尺寸截图报告 / Mobile report](https://xiaosang.cc/plant-survivors-ui/qa/) · [设计系统 / Design system](docs/DESIGN-SYSTEM.md) · [固定测试流程 / QA workflow](docs/MOBILE-QA.md)

[v0.6 机制与手机验收 / Verification](docs/V06-VERIFICATION.md) · [设计依据 / Design and research](docs/V06-DESIGN.md) · [分阶段测试报告 / Test report](docs/TEST-REPORT.md) · [素材说明 / Assets](ASSETS.md)

![手机访问 / QR](assets/qr.png)
