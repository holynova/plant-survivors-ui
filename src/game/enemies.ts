export type EnemyDefinition={name:string;art:string;hp:number;speed:number;size:number;xp:number;role:string;description:string;air?:boolean};
export const enemyDefinitions:Record<string,EnemyDefinition>={
 zombie:{name:'普通僵尸',art:'zombie',hp:24,speed:29,size:65,xp:1,role:'围堵 · 近战',description:'追逐玩家，抬手后挥击；可以利用前摇躲开。'},
 cone:{name:'路障僵尸',art:'cone',hp:43,speed:35,size:65,xp:1,role:'快步 · 近战',description:'耐打而且更快，与普通僵尸形成错速包围。'},
 bucket:{name:'铁桶僵尸',art:'bucket',hp:85,speed:25,size:65,xp:2,role:'重甲 · 近战',description:'高生命、慢速推进，适合用穿透和范围伤害处理。'},
 newspaper:{name:'读报僵尸',art:'newspaper',hp:60,speed:25,size:67,xp:2,role:'狂怒 · 加速',description:'半血时撕掉报纸进入狂怒，移速增加 85%。'},
 football:{name:'橄榄球僵尸',art:'football',hp:95,speed:41,size:76,xp:2,role:'突进 · 冲锋',description:'锁定方向后冲刺；预警出现后横向走位躲避。'},
 digger:{name:'矿工僵尸',art:'digger',hp:60,speed:33,size:67,xp:2,role:'潜地 · 绕后',description:'潜地时不可攻击，会在附近带裂纹的落点钻出；留意地面预警。'},
 dancer:{name:'舞王僵尸',art:'dancer',hp:110,speed:27,size:70,xp:3,role:'召唤 · 支援',description:'周期性召唤三只小鬼；优先击败可减少怪潮。'},
 wizard:{name:'巫师僵尸',art:'wizard',hp:72,speed:27,size:72,xp:2,role:'远程 · 法球',description:'保持距离，蓄力后发射瞄准当前位置的紫色法球。'},
 imp:{name:'小鬼僵尸',art:'imp',hp:20,speed:61,size:43,xp:1,role:'敏捷 · 包夹',description:'体型小、速度快但脆弱，容易绕到队伍侧面。'},
 balloon:{name:'气球僵尸',art:'balloon',hp:53,speed:40,size:94,xp:2,air:true,role:'飞行 · 突袭',description:'飘在地面上方，躲过地雷与火路；仙人掌、闪电和投掷植物可对付它。'},
 jetpack:{name:'喷气僵尸',art:'jetpack',hp:80,speed:48,size:72,xp:2,air:true,role:'飞行 · 射击',description:'用背包悬浮并发射能量弹；同样不会触发地雷。'},
 door:{name:'纱门僵尸',art:'door',hp:65,speed:29,size:70,xp:2,role:'护盾 · 防御',description:'持盾时减伤；投掷与激光绕过盾牌，磁力菇可以直接拆盾。'},
};
export const newEnemyIds=['newspaper','football','digger','dancer','wizard','imp','balloon','jetpack'];
export const enemyPool=(time:number,stage:number)=>{const t=time+stage*12;return ['zombie','cone',...(t>=12?['newspaper','imp']:[]),...(t>=28?['football','door']:[]),...(t>=45?['bucket','digger']:[]),...(t>=65?['balloon','wizard']:[]),...(t>=90?['dancer','jetpack']:[])];};
