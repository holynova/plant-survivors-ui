# 视觉资产与提示词记录

所有图片位于 `public/assets/game/`。用户选定的原图另保存为 `public/reference.png`。

## 素材来源

- 原图提取：三个关卡缩略图、出战准备人物插图、进化标题和展示、结算庆祝插图。`scripts/extract-reference.mjs` 记录初始裁切区域；后续缩短进化/结算裁切，以排除下方界面文本。
- ImageGen生成：lobby-bg、battle-bg、sprites、ui-skin、boss、logo、items、effects。均实际附带第一套参考图，使用内置工具，无CLI/API回退。
- sprites拆分：pea、sunflower、walnut、ice、boomerang、mushroom、gatling、sun、zombie、cone、bucket、dave。
- ui-skin拆分：button、sign、parchment、slot；paper-v2和wood-v2是纹理内部的无文字区域。
- items拆分：bag-v2、crystal-v2、chest-v2、seed-v2。
- effects拆分：projectile、warning。boss-trim、logo-trim仅移除生成图透明外边距。
- 通用操作图标使用已有Radix图标包；人物、植物、场景、装饰、攻击预警均使用栅格资产，没有用emoji或手绘SVG替代。

## 最终生成提示规格

每项均要求严格匹配参考中的绿草、棕木、奶油纸、金黄色按钮与厚描边卡通风格。

1. lobby-bg：390×844逻辑比例，蓝天、左侧郊区房屋、栅栏和草坪，戴夫推着豌豆/向日葵/坚果推车；顶部留标题空间，底部留按钮空间；无文字、UI和边框。
2. battle-bg：同画风的俯视开阔草坪，边缘花朵，左下栅栏、右下屋顶；无角色、敌人、拾取物或UI。
3. sprites：透明背景4列3行，逐格放置豌豆、向日葵、坚果、寒冰；回旋镖、大喷菇、机枪豌豆、阳光；普通/路障/铁桶僵尸和戴夫推车；完整身体，无文字。
4. ui-skin：透明2×2，黄色空白主按钮、空白木牌、带角叶的羊皮纸、绿色槽位边框；全部无文字。
5. boss：透明伽刚特尔，完整身体、木棒、灰绿皮肤、棕色外衣，面向左下，匹配参考首领。
6. logo：透明“植物／幸存者”两行，绿色上行、金黄色下行、深棕描边、右上小僵尸头。
7. items：透明2×2，弹药皮包、蓝晶体、紫金宝箱、绿种子金边代币，无文字。
8. effects：透明横向双格，一枚带短尾迹的绿色豌豆弹，一片红色透明扇形地面攻击预警，橙色发光边缘，无地面或UI。

实际输出分辨率由工具决定。完整原始调用提示保存在本会话资产子任务工具记录中。此处资产为题材原型生成图，未声称是原作官方提取素材。

## v0.3.0 动画与音频

使用内置 imagegen（未使用 API/CLI 回退）从已选角色立绘生成整张动作图集。五个角色各 16 帧：行走、攻击、受击、死亡各 4 帧。植物攻击与命中特效各 16 帧，共 112 个动画帧。路障与首领图集经过第二次透明背景修正。原始选定输出保存在 `assets/animation-source/`，完整提示词及生成方式见 `docs/animation-sources.json`。`scripts/normalize-atlases.mjs` 使用共享缩放、脚底锚点归一化，最终 WebP 位于 `public/assets/game/animations/`。

夜晚泳池、屋顶花园使用独立生成背景。弹道拖尾、伤害数字、拾取漂浮、地面阴影、震屏与首领预警由 Canvas 渲染；角色肢体动作使用实际连续帧。

`public/assets/game/audio/` 含 17 个事件音效与 1 个 38.4 秒循环配乐，均由 `scripts/generate-audio.py` 原创合成，无第三方音频。用户点击出发后解锁音频；音效、音乐可分别关闭，暂停和切后台停止配乐。音效限制并发与同类重复频率。

## v0.4.0 主角与稳定步态

新增小葵（flora）与阿栓（rusty），每人一张 16 帧图集；内置 imagegen 生成，未使用 CLI/API。选定原始图在 `assets/animation-source/flora.png` 与 `rusty.png`，完整提示词保存在 `docs/hero-animation-sources.json`。最终资源位于 `public/assets/game/animations/`，现在总计 9 个图集、144 个动作／特效帧。

运行 `npm run assets:normalize` 可重建全部图集，先统一缩放与脚底锚点，再通过 `scripts/stabilize-walk.mjs` 按推车轮轴或帽子／头部稳定区域做平移配准（不逐帧缩放）。实际偏移记录在 manifest 的 walkRegistration 中。植物发射不再切换主角步态；受击与死亡仍优先。

豌豆为绿色圆弹，寒冰为蓝色晶体，回旋镖为金色 V 形旋转物及往返轨迹，孢子为短程紫色粒子团，均为游戏 Canvas 原生特效。精英保留对应僵尸动作，配金色脚环、独立大小与精英标记；最终首领有狂暴光晕。
