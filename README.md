<p align="right"><a href="README.en.md">English</a></p>

<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="植物幸存者 Plant Survivors — 移动端花园生存游戏：豌豆射手自动攻击僵尸，无尽生存迎战轮换首领">
</p>

<p align="center">
  <a href="https://xiaosang.cc/plant-survivors-ui/">▶ 在线玩</a>
  ·
  <a href="https://github.com/holynova/plant-survivors-ui">GitHub 仓库</a>
</p>

植物幸存者是一款手机优先的单机幸存者游戏：任意位置触摸拖动走位，植物自动攻击；三位主角在三张大地图上自由行走，镜头持续跟随。26 种植物、18 类敌人，升级、进化、图鉴一应俱全；无尽生存，四位首领轮换登场，击败首领是里程碑，阵亡后解锁下一张地图。

**v0.14.1**：加载、营地和战场背景铺满屏幕，操作区避开刘海和底部手势区域。[全屏适配实跑截图](https://xiaosang.cc/plant-survivors-ui/qa/full-bleed)。

**v0.14.0**：营地保留图鉴、局外成长、解锁植物和教程四个入口。选人肖像、升级三选一和战斗角色比例也已调整。[查看 12 种屏幕的 252 张实跑截图](https://xiaosang.cc/plant-survivors-ui/qa/camp)。

## 截图

<p align="center">
  <img src="./assets/readme/screenshot-lobby.png" width="300" alt="新版营地：站立的戴夫、四个左侧入口和出发按钮">
  <img src="./assets/readme/screenshot-battle.png" width="300" alt="Boss 战：02:15，巨人领主血条，植物阵容迎战">
</p>

## 玩法

- **走位**：任意位置触摸拖动，左右手皆可；也支持键盘操作。
- **自动攻击**：植物按各自节奏自动开火，你只管走位、躲技能、拾阳光升级。
- **升级三选一**：升级时从三个选项里挑一个强化；可重洗（每局次数有限）。
- **进化**：主植物 Lv.5 + 指定搭配即可进化，三条进化路线——豌豆射手 → 烈焰机枪、寒冰射手 → 霜晶风暴、回旋镖 → 追风回旋阵。
- **三位主角**：戴夫（厚实围裙，高生命减伤）、小葵（阳光亲和，经验 +25%）、阿栓（超频背包，攻速移速更快）。
- **三张地图**：白天花园、夜晚花园、屋顶，各有地形机制与救援目标。
- **敌人**：12 种普通僵尸（普通、路障、铁桶、读报、橄榄球、矿工、舞王、巫师、小鬼、气球、喷气、纱门）+ 2 精英（疾走队长、铁桶统领）+ 4 位首领（巨人领主、橄榄球队长、沼泽大法师、屋顶机甲，轮换登场；首位 2:15 出现，此后每 2 分钟一位）。
- **无尽生存与里程碑**：没有局时终点；击败首领是里程碑，阵亡后解锁下一张地图。
- **局外成长**：精英和首领掉落金币、钻石，用于局外解锁新植物与永久成长；本地存档，战局可恢复。

## 内容

- **26 种植物**：豌豆、寒冰、回旋镖、大喷菇、卷心菜、玉米、西瓜、樱桃、火爆辣椒、土豆地雷、大嘴花、窝瓜、杨桃、仙人掌、菜问、火龙草、闪电芦苇、激光豆、竹笋炮手、椰子加农炮、冰冻生菜、电能卷心菜，另有向日葵、坚果、火炬树桩、磁力菇等被动与装备。最多同时携带 6 主动 + 3 被动。
- **图鉴**：花园图鉴收录全部植物与敌人，含机制说明。
- **音乐**：原版音乐通过作者官方播放器播放（需联网并点击播放）；另有四段离线原创合成配乐，支持暂停续播与独立音量。战斗音效、暂停、本地存档齐全。

## 本地运行

```bash
npm ci
npm run dev        # Vite 开发服务器
npm run build      # 生产构建
```

## 测试

```bash
npm run test:game  # 游戏逻辑测试：12 个测试文件 + 战役模拟
npm run test:sites
npm run test:mobile
npm run test:performance
```

## 技术

- React 19 + TypeScript + Vite；Canvas 渲染，确定性模拟核心（`src/game/simulation.ts`）可脱离界面独立测试。
- 移动端优先：原生安全区、横屏布局、触摸手势、资源预加载进度条。

```
src/Prototype.tsx     主界面与流程
src/game/simulation.ts  战斗模拟核心（移动 / 射击 / 升级 / 进化 / Boss）
src/game/plants.ts    26 种植物定义
src/game/enemies.ts   12 种敌人定义
src/game/catalog.ts   主角、精英、首领
src/game/renderer.ts  Canvas 渲染
src/game/audio.ts     音效与音乐
src/mobile/           移动端组件（轮播、底部抽屉、键盘等）
tests/                游戏逻辑 / 移动端 / 性能测试
```
