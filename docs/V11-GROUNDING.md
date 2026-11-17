# v0.11 — HUD A 与原版庭院风格

用户选择方案 A；以 2009 年原版白天草坪、夜间墓碑截图作为视觉参考。游戏中的新版素材由图像模型生成，并非原版切图或原版官方素材。原图、提示词和导出流程见 `v11-art-sources.json` 与 `scripts/prepare-v11-assets.mjs`。

## 依据与落实

- 原版墓碑采用不规则轮廓、粗暗描边、少量明暗面；草坪的大色块比旧版细碎草纹安静。使用两种墓碑、低矮灌木、三石组合、歪木栅栏、池塘、芦苇、木桥、烟囱、通风口、花盆和温室。参考截图：[夜间墓碑](https://source.roboflow.com/03dLkRIIvpZhuTxkgmMI7rtOcUj1/00BJ4DPaVvrmJUZNES6K/original.jpg)、[白天草坪](https://gameoxigen.com/images/uploads/background.png)。
- [EA 原版说明书](https://akamai.cdn.ea.com/eadownloads/u/f/manuals/GAME-PVZ/en_US_readme.html)记录夜间墓碑、掉落金币/阳光和种子包充能。这里只借鉴造型；墓碑为场景装饰，没有新增挡路或刷怪机制。
- [Unity 2D 光影技术](https://discussions.unity.com/t/2d-light-and-shadow-techniques-with-the-universal-render-pipeline/1641848)讨论接地柔影与俯视视角中的阴影限制。本项目采用缓存的小型柔和接触阴影，不为每个装饰物增加实时灯光或模糊滤镜。阴影留在世界坐标的脚底；掉落物只在出现时短暂弹起。
- [Unity Sprite Renderer](https://docs.unity.com/en-us/engine/6000.7/manual/unity2d/sprite/sprite-renderer-reference)支持使用 pivot 作为排序点。这里将素材有效底部作为世界坐标锚点，与主角/怪物共同按脚底 Y 排序，修复前后遮挡；切图处理过滤相邻单元的残片。
- [Riot 场景清晰度](https://www.riotgames.com/en/news/valorant-shaders-and-gameplay-clarity)强调画面、性能和可读性的平衡。我们据此降低地面细节对比、移除掉落物外侧光环，保持物品轮廓清晰；夜景用一次性缓存的环境色处理道具。这些是应用到本项目的设计判断，不是文献对本项目效果的实测结论。

## HUD

战斗中只保留顶部单行生命/等级/时间/暂停、顶边经验、底部主动植物冷却和交战中的首领血条。金币、钻石、击败数、波次、下位首领、精英和地图放进暂停页。本局/植物/地图/设置四页可查看详细信息，保留查看本局花园和继续战斗。

## 验证与边界

- 30 项相关离线测试通过（含锚点、掉落物、无限战斗、探索与发布 Worker）。类型检查、设计系统检查通过。
- 固定 12 个屏幕配置 × 15 场景 = 180 项通过；另测 390×844 与 320×568 的 4 个暂停页，共 8 项，以及继续、移动、再暂停。截图见 `reports/v11/`。
- `reports/v11/index.html` 提供实际浏览器截图和性能数据。艺术对照采用 DEV 固定场景，冻结游戏后隐藏暂停遮罩；不是 AI 合成的游戏截图。三种地貌图固定世界位置；完整 UI 测试未隐藏遮罩。
- 6 组固定数量压力测试每组采样 180 帧。极限组 320 怪、800 玩家投射物、160 敌方投射物、800 掉落物、48 技能区、200 事件、24 光束。1× P95 处理 3.7ms；4× P95 处理 14.5ms，但帧间隔中位数 31.4ms，不能宣称稳定 60 FPS。
- v0.10 历史双轮均值仅作回归参考；本轮不是交替重跑基线，且 HUD 改为全屏画布，画布高度发生变化。CPU 降速与视口仿真不等于真实手机测量。
- 普通 1× 组 P95 从历史 1.85ms 到 2.3ms，单轮有波动；生产上限组从 2.4ms 到 1.8ms。不能据此宣称所有场景均提速。
- 新增资源使用 WebP，移除预加载列表中 4 个不再使用的旧素材，94 张运行图像合计约 3.62MiB。保留旧版源文件和历史报告。
