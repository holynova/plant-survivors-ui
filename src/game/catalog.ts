export const heroes = {
 dave: {name:'戴夫', title:'后院守护者', art:'dave', hp:125, speed:120, attackRate:1, damage:1, xp:1, pickup:0, armor:.8, color:'#f4ce63', trait:'厚实围裙', description:'生命 125 · 受到伤害降低 20%', story:'老邻居带着熟悉的小推车，挡在花园最前面。适合第一次远征。'},
 flora: {name:'小葵', title:'阳光园丁', art:'flora', hp:100, speed:120, attackRate:1, damage:1, xp:1.25, pickup:20, armor:1, color:'#b6e769', trait:'阳光亲和', description:'经验 +25% · 拾取范围 +20', story:'她能听见植物的悄悄话。更早升级，用丰富的植物组合守住花园。'},
 rusty: {name:'阿栓', title:'花园机械师', art:'rusty', hp:85, speed:138, attackRate:.8, damage:1, xp:1, pickup:0, armor:1, color:'#8ee5ff', trait:'超频背包', description:'攻击冷却 −20% · 移速 +15% · 生命 85', story:'把旧零件装成植物的动力背包。火力更快，但需要灵活走位。'},
} as const;
export type HeroId=keyof typeof heroes;
export const heroIds=Object.keys(heroes) as HeroId[];
export const activePlants=['pea','ice','boomerang','mushroom'];
export const plantLore:Record<string,{role:string,mechanic:string,evolution:string}>={
 pea:{role:'单体 · 连射',mechanic:'绿色圆豌豆，Lv.3 双发，Lv.4 可穿透两个目标。基础伤害 16 + 等级 × 8。',evolution:'Lv.5 + 弹药袋：三重豌豆连射'},
 ice:{role:'控制 · 减速',mechanic:'蓝色冰晶弹，Lv.3 可穿透两个目标；普通敌人减速 55%，精英与首领减速 25%，持续 2 秒。基础伤害 16 + 等级 × 8。',evolution:'Lv.5 + 弹药袋：三路冰晶'},
 boomerang:{role:'穿透 · 往返',mechanic:'金色旋转镖，飞出后转向追随主角返回；每程最多穿透 4 个目标；去程、回程各可命中同一敌人一次。Lv.3 增加一枚。',evolution:'Lv.5 + 弹药袋：三路回旋镖'},
 mushroom:{role:'近距 · 范围',mechanic:'向四周喷出紫色孢子，短程扩散、穿透并击退敌人。同轮孢子对每个敌人命中一次，伤害 15 + 等级 × 7。',evolution:'局内支援植物，无独立进化'},
 sunflower:{role:'被动 · 成长',mechanic:'每级拾取范围 +15，阳光经验 +8%。',evolution:'持续生效，无攻击冷却'},
 walnut:{role:'被动 · 生存',mechanic:'每级最大生命 +25，立即恢复 40 生命（不超过上限）。',evolution:'持续生效，无攻击冷却'},
 bag:{role:'被动 · 加速',mechanic:'每级增加 8% 攻速系数；主植物达到 Lv.5 时触发进化。',evolution:'适用于豌豆、寒冰、回旋镖'},
};
export const enemyLore=[
 {id:'zombie',art:'zombie',name:'普通僵尸',role:'普通 · 围堵',description:'持续追逐主角，近身抬手后挥击。看到前摇，移开就能躲过。'},
 {id:'cone',art:'cone',name:'路障僵尸',role:'普通 · 快步',description:'比普通僵尸更耐打、移动更快。寒冰能减缓它的包围。'},
 {id:'bucket',art:'bucket',name:'铁桶僵尸',role:'普通 · 重甲',description:'45 秒后加入怪潮，生命较高但移动较慢。用穿透弹道削弱整群。'},
 {id:'runner',art:'cone',name:'疾走队长',role:'精英 · 第 2 波',description:'第 40 秒出现；体型巨大，锁定方向预警后冲锋；抗击退，击败掉落 8 点基础经验。'},
 {id:'guard',art:'bucket',name:'铁桶统领',role:'精英 · 第 3 波 / 后期',description:'第 80 秒及最终首领前出现；高生命、非攻击时减伤 30%；重击前摇暴露破绽，掉落 8 点基础经验。'},
 {id:'boss-trim',art:'boss-trim',name:'巨人领主',role:'最终 Boss · 狂暴',description:'倒计时剩 45 秒登场。锁定脚下圆圈后重击；半血时狂暴并召唤僵尸。必须击败它且守到计时结束才能胜利。'},
];
