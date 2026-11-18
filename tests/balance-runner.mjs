// A deterministic, fallible kiting policy. Results describe this bot, not human win rates.
export function direction(s,stationary=false){
 if(stationary)return {x:0,y:0};
 let drop,nearest=Infinity;for(const p of s.drops){const d=Math.hypot(p.x-s.x,p.y-s.y);if(d<nearest){nearest=d;drop=p;}}
 const boss=s.time>s.duration-10?s.enemies.find(e=>e.boss):null;const target=boss||drop||{x:s.worldWidth/2+Math.sin(s.time*.07)*500,y:s.worldHeight/2+Math.cos(s.time*.07)*500};const l=Math.hypot(target.x-s.x,target.y-s.y)||1;let x=(target.x-s.x)/l,y=(target.y-s.y)/l;
 for(const e of s.enemies){const d=Math.hypot(e.x-s.x,e.y-s.y)||1;
  if((e.boss||e.elite)&&(e.attack||0)>(e.boss?.28:.12)){const ax=s.x-e.aimX,ay=s.y-e.aimY,ad=Math.hypot(ax,ay)||1;if(ad<(e.boss?100:70)){x+=(ax||1)/ad*12;y+=ay/ad*12;}}
  if((e.elite==='runner'||e.kind==='football')&&((e.chargeWindup||0)>0||(e.charge||0)>0)){const cx=e.chargeX??s.x,cy=e.chargeY??s.y,ax=cx-e.x,ay=cy-e.y,al=Math.hypot(ax,ay)||1;const cross=((s.x-e.x)*-ay+(s.y-e.y)*ax)/al;if(d<180&&Math.abs(cross)<55){const side=cross>=0?1:-1;x+=-ay/al*side*9;y+=ax/al*side*9;}}
  const safe=e.boss?125:e.elite?100:e.kind==='imp'?65:80;if(d<safe){x+=(s.x-e.x)/d*(safe-d)/16;y+=(s.y-e.y)/d*(safe-d)/16;}
 }
 for(const p of s.hostileShots||[]){const dx=s.x-p.x,dy=s.y-p.y,d=Math.hypot(dx,dy)||1;if(d<90){x+=dx/d*(90-d)/10;y+=dy/d*(90-d)/10;}}
 if(s.x<55)x+=2;if(s.x>s.worldWidth-55)x-=2;if(s.y<55)y+=2;if(s.y>s.worldHeight-55)y-=2;return {x,y};
}
export function play(api,{hero='dave',stage=0,starter='pea',seed=431,stationary=false,upgrades={},seconds=600}={}){
 const {createRun,step,select}=api,s=createRun(starter,stage,seed,hero,{upgrades});let frames=0,firstUpgrade=null,evolution=null;const levels={},elites=new Map();
 while(!['won','lost'].includes(s.status)&&frames++<seconds*30){
  if(s.status==='upgrade'){firstUpgrade??=s.time;const count=Object.keys(s.plants).filter(k=>!['bag','walnut','sunflower','torchwood'].includes(k)).length;const rank=[...(s.hp<s.maxHp*.6?['walnut']:[]),...(count<2?['cabbage','mushroom','ice','pea','boomerang'].filter(k=>!s.plants[k]):[]),starter,...(s.plants[starter]>=4?['bag']:[]),'cabbage','mushroom','ice','walnut','boomerang','bag','sunflower','pea'];select(s,[...s.choices].sort((a,b)=>rank.indexOf(a)-rank.indexOf(b))[0]);}
  if(s.evolved)evolution??=s.time;s.evolutionNotice=false;
  step(s,1/30,direction(s,stationary));
  for(const t of [30,60,120])if(s.time>=t&&levels[t]===undefined)levels[t]=s.level;
  for(const e of s.enemies.filter(e=>e.elite)){if(!elites.has(e.id))elites.set(e.id,{kind:e.elite,spawn:s.time,firstHit:null,death:null});const stat=elites.get(e.id);if(e.hp<e.max)stat.firstHit??=s.time;}
  for(const [id,stat]of elites)if(stat.death===null&&!s.enemies.some(e=>e.id===id)){stat.death=s.time;stat.engaged=stat.firstHit===null?null:s.time-stat.firstHit;}
 }
 return {hero,stage,starter,seed,stationary,status:s.status,bossKills:s.bossKills,bossWaves:s.bossWaves,boundedAt:seconds,time:s.time,hp:s.hp,kills:s.kills,level:s.level,levels,firstUpgrade,evolution,elites:[...elites.values()],plants:s.plants};
}
export function summarize(runs){const med=a=>{a=a.filter(x=>x!==null&&x!==undefined).sort((a,b)=>a-b);return a.length?+a[Math.floor(a.length/2)].toFixed(1):null};return {runs:runs.length,milestones:runs.filter(r=>r.bossKills>0).length,losses:runs.filter(r=>r.status==='lost').length,survivingAtLimit:runs.filter(r=>r.status==='playing'||r.status==='upgrade').length,firstUpgradeMedian:med(runs.map(r=>r.firstUpgrade)),level60Median:med(runs.map(r=>r.levels[60])),level120Median:med(runs.map(r=>r.levels[120])),finalLevelMedian:med(runs.map(r=>r.level)),evolutionMedian:med(runs.map(r=>r.evolution)),eliteCombatMedian:med(runs.flatMap(r=>r.elites.map(e=>e.engaged))),byStage:[0,1,2].map(stage=>({stage,milestones:runs.filter(r=>r.stage===stage&&r.bossKills>0).length,total:runs.filter(r=>r.stage===stage).length}))};}
