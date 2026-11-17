export type PlantDefinition={name:string;description:string;role:string;mechanic:string;origin:string;interval:number;coins:number;gems:number;color:string};
const p=(name:string,description:string,role:string,mechanic:string,origin:string,interval:number,coins=0,gems=0,color='#88bd42'):PlantDefinition=>({name,description,role,mechanic,origin,interval,coins,gems,color});
export const plants:Record<string,PlantDefinition>={
 pea:p('豌豆射手','自动瞄准；Lv.3 双发，Lv.4 穿透','单体 · 连射','发射绿色豌豆，升级增加伤害、连射和穿透。','一代',.9),
 ice:p('寒冰射手','冰晶减速；Lv.3 穿透','控制 · 减速','冰晶使普通僵尸减速 55%，精英与首领减速 25%，持续 2 秒。','一代',.95,0,0,'#75dfff'),
 boomerang:p('回旋镖','去程穿透；回程再次命中','穿透 · 往返','弧线飞出后追随主角返回；每程最多命中 4 个目标。','二代',1.3,0,0,'#ffcc68'),
 mushroom:p('大喷菇','近距孢子，穿透并击退','近距 · 扩散','八向孢子扩散，每轮对同一僵尸只结算一次伤害。','一代',1.8,0,0,'#c080e0'),
 sunflower:p('向日葵','扩大拾取范围，经验 +8% / 级','被动 · 成长','每级拾取范围 +15，阳光经验 +8%。','一代',0,0,0,'#f5c64b'),
 walnut:p('坚果','生命上限 +25，并回复 40','被动 · 生存','提升生命上限，立即回复生命；最多 5 级。','一代',0,0,0,'#cc9451'),
 bag:p('弹药袋','提升攻速；满级主植物进化','装备 · 加速','每级增加 8% 攻速系数；任意主动主植物 Lv.5 时进化。','花园装备',0,0,0,'#c0a174'),
 cabbage:p('卷心菜投手','抛物线落点攻击，越过盾牌','投掷 · 破盾','卷心菜沿抛物线飞向锁定落点，对小范围造成伤害，绕过正面盾牌。','一代',1.55),
 kernel:p('玉米投手','玉米溅射；每三轮投掷黄油','投掷 · 定身','交替投掷玉米和黄油，黄油短暂定身；精英与首领的定身时间缩短。','一代',1.65,35,0,'#f6d46a'),
 melon:p('西瓜投手','重型西瓜，大片溅射伤害','投掷 · 爆发','西瓜落地后对周围僵尸造成大范围伤害。','一代',2.8,65,1,'#62b65b'),
 cherry:p('樱桃炸弹','锁定落点，短暂引燃后爆炸','爆炸 · 清群','在目标脚下放置樱桃，0.65 秒后爆炸；无法跟踪已经离开的目标。','一代',5.5,70,1,'#ff6e64'),
 jalapeno:p('火爆辣椒','沿瞄准方向留下一条火路','火焰 · 持续','喷出长条火焰，火路持续灼烧经过的僵尸。','一代',5.2,65,1,'#ff8a49'),
 potato:p('土豆地雷','沿行进路线埋雷，成熟后触发','陷阱 · 爆炸','原地留下地雷，1 秒后武装；敌人靠近后引爆，最多保留 8 枚。','一代',3.6,30,0,'#dcb06f'),
 chomper:p('大嘴花','吞掉近身普通僵尸，少量回血','近战 · 吞噬','吞噬近距离普通僵尸；对精英和首领改为重咬，不会直接秒杀。','一代',4.8,65,1,'#bb69cb'),
 squash:p('窝瓜','跃向目标，落地范围重击','跳跃 · 重击','锁定敌人位置后跳起砸落，造成范围伤害和击退。','一代',4.1,45,0,'#b4ce59'),
 starfruit:p('杨桃','同时向五个方向发射星弹','多向 · 压制','五角星弹向周围射出；升级增加穿透目标数。','一代',1.5,45,0,'#ffe078'),
 cactus:p('仙人掌','高速尖刺，穿透并克制飞行','穿透 · 对空','尖刺穿过多个目标，对气球与喷气僵尸造成额外伤害。','一代',1.1,45,0,'#9fda76'),
 torchwood:p('火炬树桩','豌豆命中后附带持续燃烧','被动 · 火焰','将豌豆变成火焰豌豆，命中后持续燃烧；可与豌豆射手组成流派。','一代',0,55,1,'#ffa34d'),
 magnet:p('磁力菇','磁力脉冲，拆除盾牌并牵引','控制 · 破甲','脉冲移除纱门护盾，削弱铁桶统领护甲，并将普通敌人拉向脉冲中心。','一代',5.2,60,1,'#d986bb'),
 bonk:p('菜问','近身快速挥拳','近战 · 连击','对附近目标及小范围敌人快速挥拳，伤害集中在贴身距离。','二代',1.15,40,0,'#99d15e'),
 snapdragon:p('火龙草','扇形喷火，持续灼烧','火焰 · 扇形','向前方扇形喷火，命中敌人持续燃烧；有效距离较短。','二代',2.1,65,1,'#ffad58'),
 lightning:p('闪电芦苇','闪电在附近僵尸之间跳跃','电击 · 连锁','连锁电弧在多个敌人间跳跃，对空中敌人同样有效。','二代',1.85,75,2,'#8bf4ef'),
 laser:p('激光豆','直线激光，无限穿透','激光 · 贯穿','沿瞄准方向发射长距离激光，对射线上的所有敌人结算伤害。','二代',2.2,80,2,'#8df1c8'),
 bamboo:p('竹笋炮手','三连竹矛，贯穿前方敌群','穿透 · 三连','发射三支细长竹矛；把三代竹笋的直线压制转化为可移动火力。','三代',1.7,70,1,'#b8db68'),
 coconut:p('椰子加农炮','超重炮弹，远程大范围爆炸','重炮 · 爆发','抛射椰子炮弹，爆炸半径大，冷却较长。','二代',5.1,100,3,'#d6a26b'),
 iceberg:p('冰冻生菜','寒霜脉冲，冻结身边敌人','冰霜 · 保命','释放近身冰霜脉冲；普通敌人冻结 1.3 秒，精英与首领只短暂受控。','二代',5.4,55,1,'#b4efff'),
 cabbagevolt:p('电能卷心菜','带电抛射，落点连锁电击','投掷 · 连锁','以三代 Cabbage-volt 为灵感；带电卷心菜落地溅射，并从落点向附近敌人放电。','三代',2.6,110,3,'#7dffff'),
};
export const plantIds=Object.keys(plants);
export const activePlants=plantIds.filter(id=>plants[id].interval>0);
export const starterPlants=activePlants;
export const basePlants=plantIds.filter(id=>plants[id].coins===0&&plants[id].gems===0);
export const names=Object.fromEntries(plantIds.map(id=>[id,plants[id].name]));
export const descriptions=Object.fromEntries(plantIds.map(id=>[id,plants[id].description]));
export const plantLore=Object.fromEntries(plantIds.map(id=>[id,{role:plants[id].role,mechanic:plants[id].mechanic,evolution:plants[id].interval?(id==='pea'?'Lv.5 + 火炬树桩或弹药袋：烈焰机枪':id==='ice'?'Lv.5 + 坚果或弹药袋：霜晶风暴':id==='boomerang'?'Lv.5 + 向日葵或弹药袋：追风回旋阵':'主植物 Lv.5 + 弹药袋：强化攻击与冷却'):'持续生效，无主动攻击冷却'}]));
export const MAX_ACTIVE=6,MAX_PASSIVE=3;
