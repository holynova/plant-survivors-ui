/** The first boss is a milestone, never a session deadline. */
export const bosses:Record<string,{name:string;role:string;description:string;hp:number;speed:number}>={
 'boss-trim':{name:'巨人领主',role:'重击 · 召唤',description:'锁定落点后重击，半血召唤小鬼。离开蓄力区域后反击。',hp:2200,speed:38},
 'boss-captain':{name:'橄榄球队长',role:'冲锋 · 连击',description:'远处蓄力冲锋，近处快速连击；横向躲开冲锋后寻找破绽。',hp:2000,speed:50},
 'boss-marsh':{name:'沼泽大法师',role:'弹幕 · 召唤',description:'保持距离发射扇形法球，狂暴后发射环状弹幕。',hp:1900,speed:28},
 'boss-mech':{name:'屋顶机甲',role:'炮击 · 重装',description:'缓慢推进并发射高速三连炮，狂暴后扩大弹幕。',hp:2800,speed:22},
};
export const bossIds=Object.keys(bosses);
export function bossFor(stage:number,index:number){return bossIds[(index+[0,2,3][stage])%bossIds.length];}
export const bossInterval=120;
export function firstBossAt(stage:number){return 135+stage*30;}
export function nextBossAt(s:{stage:number;bossWaves:number}){return firstBossAt(s.stage)+s.bossWaves*bossInterval;}
