import {damageAt,attackPeriod} from './combat-stats.ts';
import type {Run} from './simulation.ts';
import {plants} from './plants.ts';
export const recipes:Record<string,{name:string;partner:string;effect:string}>={
 pea:{name:'烈焰机枪',partner:'torchwood',effect:'三线穿透射击，命中附加灼烧；保持距离拉出火线。'},
 ice:{name:'霜晶风暴',partner:'walnut',effect:'三路冰晶穿透，额外短暂冻结；控住敌群再穿过缺口。'},
 boomerang:{name:'追风回旋阵',partner:'sunflower',effect:'多枚回旋镖，回程伤害 +35%，每程最多穿过六个目标。'},
};
export function evolutionRecipe(id:string){return recipes[id]||{name:'花园觉醒',partner:'bag',effect:'主植物伤害强化，攻击冷却大幅缩短。'};}
export function canEvolve(s:Run){const r=evolutionRecipe(s.starter);return !s.evolved&&(s.plants[s.starter]||0)>=5&&!!(s.plants[r.partner]||s.plants.bag);}
export function recipeText(s:Run){const r=evolutionRecipe(s.starter);return `${plants[s.starter].name} ${s.plants[s.starter]||0}/5 ＋ ${plants[r.partner].name}${s.plants[r.partner]?' ✓':''}${r.partner!=='bag'?'（或弹药袋）':''} → ${r.name}`;}
export function upgradeBenefit(s:Run,id:string){const n=s.plants[id]||0,p=plants[id];if(!p.interval)return id==='walnut'?'生命上限 +25 · 立即回复 40':id==='sunflower'?'拾取范围 +15 · 经验加成 +8%':id==='bag'?'攻速系数 +8% · 满级主植物可进化':`灼烧每秒 ${5+n*4} → ${5+(n+1)*4}`;
 const before=attackPeriod(s,id,Math.max(1,n)),after=attackPeriod(s,id,n+1);const specials=id==='pea'&&n===2?' · 解锁双发':id==='pea'&&n===3?' · 解锁穿透':id==='ice'&&n===2?' · 解锁穿透':id==='boomerang'&&n===2?' · 多一枚回旋镖':'';const damage=(level:number)=>Math.round(damageAt(id,level)*(s.evolved&&s.starter===id?1.25:1));const hitLabel=id==='chomper'?'首领咬击':id==='jalapeno'?'每跳伤害':'命中伤害';return `${n?`${hitLabel} ${damage(n)} → ${damage(n+1)} · `:`${hitLabel} ${damage(n+1)} · `}${n?`冷却 ${before.toFixed(2)} → ${after.toFixed(2)} 秒`:`新植物 · 冷却 ${after.toFixed(2)} 秒`}${specials}`;}
