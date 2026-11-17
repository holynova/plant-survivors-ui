import {bosses} from './bosses.ts';
export const heroes = {
 dave: {name:'戴夫', title:'后院守护者', art:'dave', hp:125, speed:120, attackRate:1, damage:1, xp:1, pickup:0, armor:.8, color:'#f4ce63', trait:'厚实围裙', description:'生命 125 · 减伤 20%；站稳 1.5 秒获得额外 25% 减伤', story:'老邻居带着熟悉的小推车，挡在花园最前面。适合第一次远征。'},
 flora: {name:'小葵', title:'阳光园丁', art:'flora', hp:100, speed:120, attackRate:1, damage:1, xp:1.25, pickup:20, armor:1, color:'#b6e769', trait:'阳光亲和', description:'经验 +25% · 拾取范围 +20；修复与取水更快', story:'她能听见植物的悄悄话。更早升级，用丰富的植物组合守住花园。'},
 rusty: {name:'阿栓', title:'花园机械师', art:'rusty', hp:85, speed:138, attackRate:.8, damage:1, xp:1, pickup:0, armor:1, color:'#8ee5ff', trait:'超频背包', description:'攻击冷却 −20% · 移速 +15%；持续移动充能，触发 3 秒超频', story:'把旧零件装成植物的动力背包。火力更快，但需要灵活走位。'},
} as const;
export type HeroId=keyof typeof heroes;
export const heroIds=Object.keys(heroes) as HeroId[];
export {activePlants,plantLore} from './plants.ts';
import {enemyDefinitions} from './enemies.ts';
export const enemyLore=[...Object.entries(enemyDefinitions).map(([id,d])=>({id,art:d.art,name:d.name,role:d.role,description:d.description})),
{id:'runner',art:'cone',name:'疾走队长',role:'精英 · 冲锋',description:'第 40 秒登场，锁定方向后冲锋。必掉金币和钻石，用于局外解锁。'},
{id:'guard',art:'bucket',name:'铁桶统领',role:'精英 · 重甲',description:'第 80 秒和后期登场；重甲减伤，抬手时暴露破绽。必掉金币与钻石。'},
...Object.entries(bosses).map(([id,b])=>({id,art:id,name:b.name,role:'首领 · '+b.role,description:b.description+' 击败后仍可继续生存，掉落大量金币、钻石和回复果实。'}))];
