import {progression,eliteStats} from './balance.ts';
import {heroes,activePlants,type HeroId} from './catalog.ts';
export {heroes} from './catalog.ts';
export const names:Record<string,string>={pea:'豌豆射手',ice:'寒冰射手',boomerang:'回旋镖',mushroom:'大喷菇',sunflower:'向日葵',walnut:'坚果',bag:'弹药袋'};
export const descriptions:Record<string,string>={pea:'自动瞄准；提升伤害与连射',ice:'冰晶碎裂，减速敌人 2 秒',boomerang:'往返穿透；回程可再次命中',mushroom:'短程孢子扩散，穿透并击退',sunflower:'扩大拾取范围，增加经验',walnut:'增加 25 最大生命并恢复生命',bag:'加快攻击；主植物 5 级时进化'};
export type CombatEvent={id:number,time:number,type:string,x:number,y:number,kind:string,value:number};
export type Enemy={id:number,x:number,y:number,hp:number,max:number,speed:number,kind:string,slow:number,boss:boolean,elite?:'runner'|'guard',enraged?:boolean,hurt?:number,attack?:number,attackDuration?:number,attackCooldown?:number,aimX?:number,aimY?:number,chargeWindup?:number,charge?:number,chargeCooldown?:number,chargeX?:number,chargeY?:number,chargeVx?:number,chargeVy?:number,chargeHit?:boolean};
export type Shot={x:number,y:number,vx:number,vy:number,life:number,damage:number,kind:string,hits:number[],pierce?:number,volley?:number,age?:number,returning?:boolean,angle?:number,trail?:{x:number,y:number}[]};
export type Run=ReturnType<typeof createRun>;
export function createRun(starter='pea',stage=0,seed=12345,hero:HeroId='dave'){
 const character=heroes[hero]||heroes.dave;
 return {hero:heroes[hero]?hero:'dave' as HeroId,events:[] as CombatEvent[],eventId:0,moving:false,facing:1,stride:0,attackAt:-10,hitAt:-10,width:390,height:680,volley:0,time:0,duration:180+stage*30,stage,seed,id:0,x:195,y:350,hp:character.hp as number,maxHp:character.hp as number,invulnerable:0,xp:0,nextXp:progression.firstXp,level:1,kills:0,eliteKills:0,eliteWave:0,wave:1,status:'playing',plants:{[starter]:1} as Record<string,number>,starter,evolved:false,evolutionNotice:false,enemies:[] as Enemy[],shots:[] as Shot[],drops:[] as {x:number,y:number,value:number}[],damage:{} as Record<string,number>,cooldowns:{} as Record<string,number>,spawn:0,bossSpawned:false,bossDead:false,warning:0,alert:'',blast:{x:0,y:0,time:0},choices:[] as string[],rerolls:2};
}
export function emit(s:Run,type:string,x:number,y:number,kind='',value=0){s.events.push({id:++s.eventId,time:s.time,type,x,y,kind,value});if(s.events.length>160)s.events.shift();}
export function random(s:Run){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
export function attackInterval(s:Run,kind:string){if(!activePlants.includes(kind))return 0;return (kind==='mushroom'?1.8:kind==='boomerang'?1.25:.9)*heroes[s.hero].attackRate/(1+(s.plants[kind]||1)*.13+(s.plants.bag||0)*.08+(s.evolved&&kind===s.starter?.6:0));}
export function cooldownState(s:Run,kind:string){const total=attackInterval(s,kind),remaining=Math.max(0,s.cooldowns[kind]||0);return {total,remaining,progress:total?Math.max(0,Math.min(1,1-remaining/total)):1};}
export function choices(s:Run){const pool=Object.keys(names).filter(k=>(s.plants[k]||0)<5);for(let i=pool.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}const result=pool.slice(0,3);if(s.level%2===0&&(s.plants[s.starter]||0)<5&&!result.includes(s.starter))result[result.length-1]=s.starter;return result;}
export function select(s:Run,id:string){if(s.status!=='upgrade'||!s.choices.includes(id))return false;s.plants[id]=(s.plants[id]||0)+1;if(id==='walnut'){s.maxHp+=25;s.hp=Math.min(s.maxHp,s.hp+40);}if(!s.evolved&&s.plants[s.starter]>=5&&s.plants.bag){s.evolved=true;s.evolutionNotice=true;emit(s,'evolution',s.x,s.y,s.starter);}s.status='playing';s.choices=[];emit(s,'upgrade',s.x,s.y,id);return true;}
export function reroll(s:Run){if(s.status==='upgrade'&&s.rerolls>0){s.rerolls--;s.choices=choices(s);}}
function hit(s:Run,e:Enemy,damage:number,kind:string){
 if(e.hp<=0)return;damage*=e.elite==='guard'&&!(e.attack!>0)?.7:e.elite?.85:1;const applied=Math.min(e.hp,damage);e.hp-=damage;e.hurt=e.elite||e.boss?.08:.18;const angle=Math.atan2(e.y-s.y,e.x-s.x);const recoil=e.boss||e.elite?0:kind==='mushroom'?12:4;e.x+=Math.cos(angle)*recoil;e.y+=Math.sin(angle)*recoil;emit(s,'hit',e.x,e.y,kind,applied);s.damage[kind]=(s.damage[kind]||0)+applied;
 if(e.hp<=0){s.kills++;if(e.elite)s.eliteKills++;emit(s,'death',e.x,e.y,e.kind,e.boss?1:e.elite?2:0);s.drops.push({x:Math.max(40,Math.min(s.width-40,e.x)),y:Math.max(110,Math.min(s.height-90,e.y)),value:e.boss?20:e.elite?8:e.kind==='bucket'?2:1});if(e.boss)s.bossDead=true;}
}
function spawnEnemy(s:Run,kind:string,x:number,y:number,hp:number,speed:number,extra:Partial<Enemy>={}){s.enemies.push({id:++s.id,x,y,hp,max:hp,speed,kind,slow:0,boss:false,...extra});}
export function step(s:Run,dt:number,input={x:0,y:0}){
 if(s.status!=='playing'||s.evolutionNotice)return;dt=Math.max(0,Math.min(dt,.05));s.time+=dt;s.wave=Math.floor(Math.min(s.time,s.duration-1)/30)+1;
 s.invulnerable=Math.max(0,s.invulnerable-dt);s.blast.time=Math.max(0,s.blast.time-dt);
 const character=heroes[s.hero],len=Math.max(1,Math.hypot(input.x,input.y)),oldX=s.x,oldY=s.y;
 if(Math.abs(input.x)>.18)s.facing=input.x>0?1:-1;
 s.x=Math.max(45,Math.min(s.width-45,s.x+input.x/len*character.speed*dt));s.y=Math.max(85,Math.min(s.height-70,s.y+input.y/len*character.speed*dt));
 const distance=Math.hypot(s.x-oldX,s.y-oldY);s.moving=distance>.02;if(s.moving)s.stride+=distance/20; // Six grounded steps per second at base speed; no time-driven sliding at walls.
 s.spawn-=dt;if(s.spawn<=0&&s.enemies.length<110){s.spawn=Math.max(.26,1.25-s.time*.0043-s.stage*.055);const side=Math.floor(random(s)*4),x=side===0?-20:side===1?s.width+20:random(s)*s.width,y=side===2?65:side===3?s.height-40:85+random(s)*(s.height-170);const kind=s.time>45&&random(s)>.7?'bucket':random(s)>.6?'cone':'zombie';const hp=(kind==='bucket'?70:kind==='cone'?38:20)*(1+s.time/260+s.stage*.15);spawnEnemy(s,kind,x,y,hp,(kind==='bucket'?21:kind==='cone'?31:26)+s.stage*3+s.time*.035);}
 const eliteTimes=[40,80,s.duration-65];
 if(s.eliteWave<eliteTimes.length&&s.time>=eliteTimes[s.eliteWave]){const runner=s.eliteWave===0;s.eliteWave++;const stats=eliteStats(runner?'runner':'guard',s.stage,s.eliteWave);spawnEnemy(s,runner?'cone':'bucket',s.x<s.width/2?s.width-40:40,110,stats.hp,stats.speed,{elite:runner?'runner':'guard',chargeCooldown:2});s.warning=3;s.alert=runner?'精英来袭 · 疾走队长':'精英来袭 · 铁桶统领';emit(s,'boss',195,110,'elite');}
 if(s.time>=s.duration-45&&!s.bossSpawned){s.bossSpawned=true;spawnEnemy(s,'boss-trim',s.width/2,110,2200+s.stage*700,22,{boss:true});s.warning=4;s.alert='最终 Boss · 巨人领主';emit(s,'boss',195,110,'boss-trim');}
 s.warning=Math.max(0,s.warning-dt);
 for(const [kind,level] of Object.entries(s.plants)){
  if(!activePlants.includes(kind))continue;s.cooldowns[kind]=Math.max(0,(s.cooldowns[kind]||0)-dt);if(s.cooldowns[kind]>0)continue;
  let target:Enemy|undefined,nearest=Infinity;for(const e of s.enemies){const d=Math.hypot(e.x-s.x,e.y-s.y);if(e.hp>0&&d<nearest){nearest=d;target=e;}}
  if(!target||(kind==='mushroom'&&nearest>140))continue;
  s.cooldowns[kind]=attackInterval(s,kind);s.attackAt=s.time;emit(s,'shoot',s.x,s.y,kind);
  const volley=++s.volley;const a=Math.atan2(target.y-s.y,target.x-s.x),evolved=s.evolved&&kind===s.starter;
  const count=kind==='mushroom'?8:((evolved?3:kind==='pea'&&level>=3?2:1)+(kind==='boomerang'&&level>=3?1:0));
  for(let i=0;i<count;i++){
   const angle=kind==='mushroom'?i*Math.PI*2/count:a+(i-(count-1)/2)*.2;
   const speed=kind==='mushroom'?125+level*8:kind==='ice'?230:kind==='boomerang'?250:280;
   s.shots.push({x:s.x,y:s.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,angle,volley,age:0,returning:false,trail:[],life:kind==='mushroom'?.8:kind==='boomerang'?3:2,damage:(kind==='mushroom'?15+level*7:16+level*8)*character.damage,kind,pierce:kind==='ice'&&level>=3||kind==='pea'&&level>=4?2:1,hits:[]});
  }
 }
 for(const p of s.shots){
  p.life-=dt;p.age=(p.age||0)+dt;
  if(p.kind==='boomerang'){
   p.trail??=[];p.trail.push({x:p.x,y:p.y});if(p.trail.length>8)p.trail.shift();
   if(p.age>=.48&&!p.returning){p.returning=true;p.hits=[];emit(s,'return',p.x,p.y,p.kind);}
   if(p.returning){const dx=s.x-p.x,dy=s.y-p.y,d=Math.hypot(dx,dy);if(d<18){p.life=0;continue;}const blend=Math.min(1,dt*12);p.vx+=(dx/d*360-p.vx)*blend;p.vy+=(dy/d*360-p.vy)*blend;}
   else{const a=p.angle??Math.atan2(p.vy,p.vx),curve=Math.sin(p.age/.48*Math.PI)*100;p.vx=Math.cos(a)*250-Math.sin(a)*curve;p.vy=Math.sin(a)*250+Math.cos(a)*curve;}
  }
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  for(const e of s.enemies){if(e.hp>0&&!(p.kind==='boomerang'&&p.hits.length>=4)&&!p.hits.includes(e.id)&&Math.hypot(e.x-p.x,e.y-p.y)<(e.boss?36:e.elite?30:18)+(p.kind==='mushroom'?10:0)){hit(s,e,p.damage,p.kind);p.hits.push(e.id);if(p.kind==='mushroom'&&p.volley!==undefined)for(const sibling of s.shots)if(sibling!==p&&sibling.volley===p.volley)sibling.hits.push(e.id);if(p.kind==='ice')e.slow=2;if(p.kind!=='boomerang'&&p.kind!=='mushroom'&&p.hits.length>=(p.pierce||1)){p.life=0;break;}}}
 }
 s.shots=s.shots.filter(p=>p.life>0&&(p.kind==='boomerang'||p.x>-50&&p.x<s.width+50&&p.y>20&&p.y<s.height+20)).slice(-200);s.enemies=s.enemies.filter(e=>e.hp>0);
 for(const e of s.enemies){
  if(e.boss&&!e.enraged&&e.hp<=e.max*.5){e.enraged=true;e.speed=30;s.warning=3;s.alert='巨人领主狂暴 · 躲开重击';emit(s,'boss',e.x,e.y,'rage');for(let i=0;i<4;i++)spawnEnemy(s,i%2?'cone':'zombie',i%2?s.width-20:20,110+i*(s.height-200)/3,45+s.stage*10,32);}
  e.slow=Math.max(0,e.slow-dt);e.hurt=Math.max(0,(e.hurt||0)-dt);e.attackCooldown=Math.max(0,(e.attackCooldown||0)-dt);e.chargeCooldown=Math.max(0,(e.chargeCooldown||0)-dt);
  // Elites keep moving through hit feedback; repeated shots cannot stunlock them.
  if((e.chargeWindup||0)>0){e.chargeWindup=Math.max(0,e.chargeWindup!-dt);if(e.chargeWindup===0){const dx=e.chargeX!-e.x,dy=e.chargeY!-e.y,d=Math.hypot(dx,dy)||1;e.charge=.65;e.chargeVx=dx/d*240;e.chargeVy=dy/d*240;e.chargeHit=false;emit(s,'swipe',e.x,e.y,e.kind);}continue;}
  if((e.charge||0)>0){e.charge=Math.max(0,e.charge!-dt);e.x=Math.max(20,Math.min(s.width-20,e.x+e.chargeVx!*dt));e.y=Math.max(80,Math.min(s.height-45,e.y+e.chargeVy!*dt));if(!e.chargeHit&&Math.hypot(e.x-s.x,e.y-s.y)<35&&s.invulnerable<=0){const damage=Math.round(22*character.armor);s.hp-=damage;s.invulnerable=.8;s.hitAt=s.time;e.chargeHit=true;emit(s,'hurt',s.x,s.y,s.hero,damage);}continue;}
  const dx=s.x-e.x,dy=s.y-e.y,d=Math.hypot(dx,dy)||1,impact=e.boss?.28:.12;
  if((e.attack||0)>0){const before=e.attack!;e.attack=Math.max(0,before-dt);if(before>impact&&e.attack<=impact){
   const radius=e.boss?72:e.elite?50:32;emit(s,e.boss?'slam':'swipe',e.aimX??s.x,e.aimY??s.y,e.kind);
   if(Math.hypot(s.x-(e.aimX??e.x),s.y-(e.aimY??e.y))<radius&&s.invulnerable<=0){const damage=Math.round((e.boss?e.enraged?30:25:e.elite?24:12)*character.armor);s.hp-=damage;s.invulnerable=.8;s.hitAt=s.time;emit(s,'hurt',s.x,s.y,s.hero,damage);}
  }continue;}
  if(e.elite==='runner'&&e.chargeCooldown<=0&&d>65&&d<220){e.chargeWindup=.85;e.chargeCooldown=5;e.chargeX=s.x;e.chargeY=s.y;continue;}
  if(d<(e.boss?110:e.elite?65:34)&&e.attackCooldown<=0){e.attackDuration=e.boss?(e.enraged?1:1.2):e.elite?.9:.48;e.attack=e.attackDuration;e.attackCooldown=e.boss?(e.enraged?2.5:3.4):e.elite?2:1.15;e.aimX=s.x;e.aimY=s.y;continue;}
  if(e.elite||e.boss||(e.hurt||0)<=0){const slow=e.slow>0?(e.elite||e.boss?.75:.45):1;e.x+=dx/d*e.speed*slow*dt;e.y+=dy/d*e.speed*slow*dt;}
 }
 if(s.hp<=0){s.hp=0;s.status='lost';emit(s,'defeat',s.x,s.y,s.hero);return;}
 s.drops=s.drops.filter(d=>{const dist=Math.hypot(d.x-s.x,d.y-s.y);if(dist<35+character.pickup+(s.plants.sunflower||0)*15){emit(s,'pickup',d.x,d.y,'sun');s.xp+=d.value*(1+(s.plants.sunflower||0)*progression.sunflowerBonus)*character.xp;return false;}return true;});if(s.drops.length>180){const excess=s.drops.splice(0,s.drops.length-180);s.drops[0].value+=excess.reduce((v,d)=>v+d.value,0);}
 if(s.xp>=s.nextXp){s.xp-=s.nextXp;s.level++;s.nextXp=Math.ceil(s.nextXp*progression.growth+progression.increment);s.choices=choices(s);if(s.choices.length){s.status='upgrade';emit(s,'level',s.x,s.y,'sun');}else s.hp=Math.min(s.maxHp,s.hp+30);}
 if(s.time>=s.duration&&s.bossDead){s.status='won';emit(s,'victory',s.x,s.y,'sun');}
}
export const clock=(t:number)=>`${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;

// Keep one world unit scale in both orientations; rotation preserves the whole run.
export function resizeArena(s:Run,width:number,height:number){
 const sx=width/s.width,sy=height/s.height;if(sx===1&&sy===1)return;
 s.x*=sx;s.y*=sy;
 for(const group of [s.enemies,s.shots,s.drops,s.events])for(const item of group){item.x*=sx;item.y*=sy;}
 for(const e of s.enemies){if(e.aimX!==undefined)e.aimX*=sx;if(e.aimY!==undefined)e.aimY*=sy;if(e.chargeX!==undefined)e.chargeX*=sx;if(e.chargeY!==undefined)e.chargeY*=sy;}
 for(const p of s.shots)if(p.trail)for(const pt of p.trail){pt.x*=sx;pt.y*=sy;}
 s.width=width;s.height=height;s.x=Math.max(45,Math.min(width-45,s.x));s.y=Math.max(85,Math.min(height-70,s.y));
}
