import {awakeningText} from './awakening.ts';
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
function upgradeSpecial(id:string,n:number){
 if(n===4)return 'Lv.5 质变：'+awakeningText(id);
 if(id==='pea'&&n===2)return '解锁双发';
 if((id==='pea'&&n===3)||(id==='ice'&&n===2))return '解锁穿透';
 if(id==='boomerang'&&n===2)return '多一枚回旋镖';
 return '';
}

export function upgradePreview(s:Run,id:string){
 const n=s.plants[id]||0,p=plants[id];
 if(!p.interval){
  const effect=id==='walnut'?'生命上限 +25 · 立即回复 40':id==='sunflower'?'拾取范围 +15 · 经验加成 +8%':id==='bag'?'攻速系数 +8% · 满级主植物可进化':`灼烧每秒 ${5+n*4} → ${5+(n+1)*4}`;
  return {summary:effect,detail:effect};
 }
 const damage=(level:number)=>Math.round(damageAt(id,level)*(s.evolved&&s.starter===id?1.25:1));
 const hitLabel=id==='chomper'?'首领咬击':id==='jalapeno'?'每跳伤害':'命中伤害';
 const hit=n?`${hitLabel} ${damage(n)} → ${damage(n+1)}`:`${hitLabel} ${damage(1)}`;
 const after=attackPeriod(s,id,n+1).toFixed(2);
 const cooldown=n?`冷却 ${attackPeriod(s,id,n).toFixed(2)} → ${after} 秒`:`新植物 · 冷却 ${after} 秒`;
 const special=upgradeSpecial(id,n);
 return {summary:special||(n?hit:p.role),detail:[hit,cooldown,special].filter(Boolean).join(' · ')};
}
export function upgradeBenefit(s:Run,id:string){return upgradePreview(s,id).detail;}
