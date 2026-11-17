import {EnemyIndex} from './enemy-index.ts';
import {attackGeometry as geometry,impactRadius} from './attack-geometry.ts';
import {progression,eliteStats} from './balance.ts';
import {heroes,type HeroId} from './catalog.ts';
import {plants,activePlants,basePlants,MAX_ACTIVE,MAX_PASSIVE,names,descriptions} from './plants.ts';
import {enemyDefinitions,enemyPool} from './enemies.ts';
import {mapSizes,clamp,followCamera,spawnRing} from './world.ts';
import {specialAttack,stepZones,blast,chain} from './weapons.ts';
export {heroes,names,descriptions};
export type CombatEvent={id:number,time:number,type:string,x:number,y:number,kind:string,value:number};
export type Enemy={id:number,x:number,y:number,hp:number,max:number,speed:number,kind:string,slow:number,boss:boolean,elite?:'runner'|'guard',enraged?:boolean,hurt?:number,attack?:number,attackDuration?:number,attackCooldown?:number,aimX?:number,aimY?:number,chargeWindup?:number,charge?:number,chargeCooldown?:number,chargeX?:number,chargeY?:number,chargeVx?:number,chargeVy?:number,chargeHit?:boolean,stun?:number,burn?:number,burnDps?:number,burnTick?:number,burnSource?:string,shield?:number,stripped?:number,skill?:number,burrow?:number,cast?:number,stride?:number,spawnGrace?:number};
export type Shot={x:number,y:number,vx:number,vy:number,life:number,damage:number,kind:string,hits:number[],pierce?:number,volley?:number,age?:number,returning?:boolean,angle?:number,trail?:{x:number,y:number}[],lob?:boolean,startX?:number,startY?:number,targetX?:number,targetY?:number,totalLife?:number,blast?:number,butter?:boolean};
export type Drop={x:number;y:number;value:number;kind?:'sun'|'coin'|'gem';born?:number;vx?:number;vy?:number};
export type Zone={x:number;y:number;kind:string;life:number;maxLife:number;arm:number;radius:number;damage:number;tick:number;angle:number};
export type Beam={x:number;y:number;toX:number;toY:number;life:number;maxLife:number;kind:string;width:number};
export type Run=ReturnType<typeof createRun>;
export type RunOptions={unlockedPlants?:string[];upgrades?:Record<string,number>;runId?:string};
export function createRun(starter='pea',stage=0,seed=12345,hero:HeroId='dave',options:RunOptions={}){
 const character=heroes[hero]||heroes.dave,world=mapSizes[stage]||mapSizes[0],upgrades=options.upgrades||{},hp=character.hp+(upgrades.vigor||0)*8;
 const allowed=[...new Set([...(options.unlockedPlants||basePlants),starter])].filter(id=>!!plants[id]);if(!plants[starter]?.interval)starter='pea';
 return {runId:options.runId||`${seed}-${stage}-${hero}`,hero:heroes[hero]?hero:'dave' as HeroId,events:[] as CombatEvent[],eventId:0,moving:false,facing:1,stride:0,attackAt:-10,hitAt:-10,width:390,height:680,worldWidth:world.width,worldHeight:world.height,cameraX:world.width/2-195,cameraY:world.height/2-340,volley:0,time:0,duration:180+stage*30,stage,seed,id:0,x:world.width/2,y:world.height/2,hp,maxHp:hp,invulnerable:0,xp:0,nextXp:progression.firstXp,level:1,kills:0,eliteKills:0,eliteWave:0,wave:1,status:'playing',plants:{[starter]:1} as Record<string,number>,allowedPlants:allowed,starter,evolved:false,evolutionNotice:false,enemies:[] as Enemy[],shots:[] as Shot[],hostileShots:[] as {x:number;y:number;vx:number;vy:number;life:number;damage:number;kind:string}[],zones:[] as Zone[],beams:[] as Beam[],drops:[] as Drop[],coins:0,gems:0,pickupBonus:(upgrades.magnetism||0)*8,fortune:(upgrades.fortune||0)*.1,damage:{} as Record<string,number>,cooldowns:{} as Record<string,number>,spawn:0,bossSpawned:false,bossDead:false,bossDefeatedAt:0,warning:0,alert:'',blast:{x:0,y:0,time:0},choices:[] as string[],rerolls:2};
}
export function emit(s:Run,type:string,x:number,y:number,kind='',value=0){s.events.push({id:++s.eventId,time:s.time,type,x,y,kind,value});if(s.events.length>200)s.events.shift();}
export function random(s:Run){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
export function attackInterval(s:Run,kind:string){const base=plants[kind]?.interval||0;return base?base*heroes[s.hero].attackRate/(1+(s.plants[kind]||1)*.13+(s.plants.bag||0)*.08+(s.evolved&&kind===s.starter?.6:0)):0;}
export function cooldownState(s:Run,kind:string){const total=attackInterval(s,kind),remaining=Math.max(0,s.cooldowns[kind]||0);return {total,remaining,progress:total?clamp(1-remaining/total,0,1):1};}
export function choices(s:Run){const active=Object.keys(s.plants).filter(k=>activePlants.includes(k)).length,passive=Object.keys(s.plants).length-active;const pool=s.allowedPlants.filter(k=>(s.plants[k]||0)<5&&(s.plants[k]||((activePlants.includes(k)?active<MAX_ACTIVE:passive<MAX_PASSIVE))));for(let i=pool.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}const result=pool.slice(0,3);if(s.level%2===0&&(s.plants[s.starter]||0)<5&&!result.includes(s.starter))result[result.length?result.length-1:0]=s.starter;return result;}
export function select(s:Run,id:string){if(s.status!=='upgrade'||!s.choices.includes(id)||!plants[id])return false;s.plants[id]=(s.plants[id]||0)+1;if(id==='walnut'){s.maxHp+=25;s.hp=Math.min(s.maxHp,s.hp+40);}if(!s.evolved&&s.plants[s.starter]>=5&&s.plants.bag){s.evolved=true;s.evolutionNotice=true;emit(s,'evolution',s.x,s.y,s.starter);}s.status='playing';s.choices=[];emit(s,'upgrade',s.x,s.y,id);return true;}
export function reroll(s:Run){if(s.status==='upgrade'&&s.rerolls>0){s.rerolls--;s.choices=choices(s);}}
export function dropTreasure(s:Run,e:Enemy){const coinCount=e.boss?10:6,coinValue=e.boss?6:3,gems=e.boss?4:1,bonus=Math.round(coinCount*coinValue*s.fortune);for(let i=0;i<coinCount+gems;i++){const a=i*2.399963229728653,r=24+random(s)*26;s.drops.push({x:clamp(e.x+Math.cos(a)*r,24,s.worldWidth-24),y:clamp(e.y+Math.sin(a)*r,24,s.worldHeight-24),kind:i<coinCount?'coin':'gem',value:i<coinCount?coinValue+Math.floor(bonus/coinCount)+(i<bonus%coinCount?1:0):1,born:s.time,vx:Math.cos(a)*70,vy:Math.sin(a)*70});}emit(s,'treasure',e.x,e.y,e.boss?'boss':'elite',coinCount);}
export function hitEnemy(s:Run,e:Enemy,damage:number,kind:string,damageOverTime=false){
 if(e.hp<=0||(e.burrow||0)>0)return;
 if(e.kind==='door'&&(e.shield||0)>0&&!['laser','cabbage','kernel','melon','coconut','cabbagevolt','magnet','chomper'].includes(kind)){e.shield=Math.max(0,e.shield!-damage);damage*=.35;}
 damage*=e.elite==='guard'&&!(e.attack!>0)&&!(e.stripped!>0)?.7:e.elite?.85:1;
 const applied=Math.min(e.hp,damage);e.hp-=damage;if(!damageOverTime)e.hurt=e.elite||e.boss?.08:.18;const angle=Math.atan2(e.y-s.y,e.x-s.x),recoil=damageOverTime||e.boss||e.elite?0:kind==='mushroom'?12:kind==='squash'?18:3;e.x=clamp(e.x+Math.cos(angle)*recoil,16,s.worldWidth-16);e.y=clamp(e.y+Math.sin(angle)*recoil,16,s.worldHeight-16);emit(s,'hit',e.x,e.y,kind,applied);s.damage[kind]=(s.damage[kind]||0)+applied;
 if(kind==='pea'&&s.plants.torchwood){e.burn=2;e.burnDps=5+s.plants.torchwood*4;e.burnSource='torchwood';}
 if(e.hp<=0){s.kills++;if(e.elite)s.eliteKills++;emit(s,'death',e.x,e.y,e.kind,e.boss?1:e.elite?2:0);s.drops.push({x:clamp(e.x,25,s.worldWidth-25),y:clamp(e.y,25,s.worldHeight-25),value:e.boss?20:e.elite?8:enemyDefinitions[e.kind]?.xp||1,kind:'sun'});if(e.elite||e.boss)dropTreasure(s,e);else if(random(s)<.12)s.drops.push({x:e.x,y:e.y,value:1+(s.fortune>0&&random(s)<s.fortune?1:0),kind:'coin',born:s.time});if(e.boss){s.bossDead=true;s.bossDefeatedAt=s.time;}}
}
export function spawnEnemy(s:Run,kind:string,x:number,y:number,hp:number,speed:number,extra:Partial<Enemy>={}){const e:Enemy={id:++s.id,x,y,hp,max:hp,speed,kind,slow:0,boss:false,shield:kind==='door'?70:0,skill:kind==='dancer'?5:kind==='digger'?3:2,stride:0,spawnGrace:.5,...extra};s.enemies.push(e);return e;}
const api={hit:hitEnemy,emit};
const indexes=new WeakMap<Run,EnemyIndex>();
function hurtPlayer(s:Run,raw:number){if(s.invulnerable>0)return;const damage=Math.round(raw*heroes[s.hero].armor);s.hp=Math.max(0,s.hp-damage);s.invulnerable=.8;s.hitAt=s.time;emit(s,'hurt',s.x,s.y,s.hero,damage);}
function collect(s:Run,d:Drop){emit(s,'pickup',d.x,d.y,d.kind||'sun',d.value);if(d.kind==='coin')s.coins+=d.value;else if(d.kind==='gem')s.gems+=d.value;else s.xp+=d.value*(1+(s.plants.sunflower||0)*progression.sunflowerBonus)*heroes[s.hero].xp;}
export function step(s:Run,dt:number,input={x:0,y:0}){
 if(s.status!=='playing'||s.evolutionNotice)return;dt=clamp(dt,0,.05);s.time+=dt;s.wave=Math.floor(Math.min(s.time,s.duration-1)/30)+1;s.invulnerable=Math.max(0,s.invulnerable-dt);s.blast.time=Math.max(0,s.blast.time-dt);
 const character=heroes[s.hero],len=Math.max(1,Math.hypot(input.x,input.y)),oldX=s.x,oldY=s.y;if(Math.abs(input.x)>.18)s.facing=input.x>0?1:-1;
 s.x=clamp(s.x+input.x/len*character.speed*dt,40,s.worldWidth-40);s.y=clamp(s.y+input.y/len*character.speed*dt,40,s.worldHeight-40);const moved=Math.hypot(s.x-oldX,s.y-oldY);s.moving=moved>.02;if(s.moving)s.stride+=moved/20;followCamera(s,dt);
 s.spawn-=dt;if(s.spawn<=0&&s.enemies.length<160){s.spawn=Math.max(.2,1.1-s.time*.004-s.stage*.07);const at=spawnRing(s,()=>random(s)),pool=enemyPool(s.time,s.stage),kind=pool[Math.floor(random(s)*pool.length)],def=enemyDefinitions[kind];spawnEnemy(s,kind,at.x,at.y,def.hp*(1+s.time/280+s.stage*.16),def.speed+s.stage*2+s.time*.025);}
 const eliteTimes=[40,80,s.duration-65];if(s.eliteWave<eliteTimes.length&&s.time>=eliteTimes[s.eliteWave]){const runner=s.eliteWave===0;s.eliteWave++;const stats=eliteStats(runner?'runner':'guard',s.stage,s.eliteWave),at=spawnRing(s,()=>random(s));spawnEnemy(s,runner?'cone':'bucket',at.x,at.y,stats.hp,stats.speed+7,{elite:runner?'runner':'guard',chargeCooldown:2});s.warning=3;s.alert=runner?'精英来袭 · 疾走队长':'精英来袭 · 铁桶统领';emit(s,'boss',at.x,at.y,'elite');}
 if(s.time>=s.duration-45&&!s.bossSpawned){s.bossSpawned=true;const at=spawnRing(s,()=>random(s));spawnEnemy(s,'boss-trim',at.x,at.y,2200+s.stage*700,44,{boss:true});s.warning=4;s.alert='最终 Boss · 巨人领主';emit(s,'boss',at.x,at.y,'boss-trim');}s.warning=Math.max(0,s.warning-dt);
 for(const [kind,level] of Object.entries(s.plants)){
  if(!activePlants.includes(kind))continue;s.cooldowns[kind]=Math.max(0,(s.cooldowns[kind]||0)-dt);if(s.cooldowns[kind]>0)continue;
  let target:Enemy|undefined,nearest=Infinity;for(const e of s.enemies){const d=Math.hypot(e.x-s.x,e.y-s.y);if(e.hp>0&&!(e.burrow!>0)&&d<nearest&&d<480){nearest=d;target=e;}}
  const range=kind==='mushroom'?140:kind==='bonk'?85:kind==='chomper'?95:kind==='snapdragon'?145:kind==='iceberg'?165:480;
  if(!target||nearest>range)continue;s.cooldowns[kind]=attackInterval(s,kind);s.attackAt=s.time;emit(s,'shoot',s.x,s.y,kind);s.volley++;if(specialAttack(s,kind,level,target,api))continue;
  const volley=s.volley,a=Math.atan2(target.y-s.y,target.x-s.x),evolved=s.evolved&&kind===s.starter,count=kind==='mushroom'?8:((evolved?3:kind==='pea'&&level>=3?2:1)+(kind==='boomerang'&&level>=3?1:0));
  for(let i=0;i<count;i++){const angle=kind==='mushroom'?i*Math.PI*2/count:a+(i-(count-1)/2)*.2,speed=kind==='mushroom'?125+level*8:kind==='ice'?230:kind==='boomerang'?250:280;s.shots.push({x:s.x,y:s.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,angle,volley,age:0,returning:false,trail:[],life:kind==='mushroom'?.8:kind==='boomerang'?3:2,damage:(kind==='mushroom'?15+level*7:16+level*8)*character.damage,kind,pierce:kind==='ice'&&level>=3||kind==='pea'&&level>=4?2:1,hits:[]});}
 }
 stepZones(s,dt,api);
 let index:EnemyIndex|undefined;if(s.shots.length*s.enemies.length>2048){index=indexes.get(s);if(!index){index=new EnemyIndex();indexes.set(s,index);}index.rebuild(s.enemies);}
 for(const p of s.shots){p.life-=dt;p.age=(p.age||0)+dt;
  if(p.lob){const progress=clamp(p.age/(p.totalLife||.7),0,1);p.x=p.startX!+(p.targetX!-p.startX!)*progress;p.y=p.startY!+(p.targetY!-p.startY!)*progress;if(p.life<=0){blast(s,p.targetX!,p.targetY!,p.blast||40,p.damage,p.kind,api);if(p.butter)for(const e of s.enemies)if(Math.hypot(e.x-p.x,e.y-p.y)<45)e.stun=e.boss||e.elite?.2:1;if(p.kind==='cabbagevolt'){const first=s.enemies.find(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<160);if(first)chain(s,first,3,p.damage*.55,p.kind,api);}index?.rebuild(s.enemies);}continue;}
  if(p.kind==='boomerang'){p.trail??=[];p.trail.push({x:p.x,y:p.y});if(p.trail.length>8)p.trail.shift();if(p.age>=.48&&!p.returning){p.returning=true;p.hits=[];emit(s,'return',p.x,p.y,p.kind);}if(p.returning){const dx=s.x-p.x,dy=s.y-p.y,d=Math.hypot(dx,dy);if(d<18){p.life=0;continue;}const blend=Math.min(1,dt*12);p.vx+=(dx/d*360-p.vx)*blend;p.vy+=(dy/d*360-p.vy)*blend;}else{const a=p.angle??Math.atan2(p.vy,p.vx),curve=Math.sin(p.age/.48*Math.PI)*100;p.vx=Math.cos(a)*250-Math.sin(a)*curve;p.vy=Math.sin(a)*250+Math.cos(a)*curve;}}
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  const candidates=index?.query(p.x,p.y,p.kind==='mushroom'?46:36);
  for(let cursor=0,count=candidates?candidates.length:s.enemies.length;cursor<count;cursor++){const enemyIndex=candidates?candidates[cursor]:cursor,e=s.enemies[enemyIndex];if(e.hp>0&&!(e.burrow!>0)&&!(p.kind==='boomerang'&&p.hits.length>=4)&&!p.hits.includes(e.id)&&(e.x-p.x)**2+(e.y-p.y)**2<((e.boss?36:e.elite?30:e.kind==='imp'?13:18)+(p.kind==='mushroom'?10:0))**2){hitEnemy(s,e,p.damage*(p.kind==='cactus'&&enemyDefinitions[e.kind]?.air?1.6:1),p.kind);index?.move(enemyIndex,e.x,e.y);p.hits.push(e.id);if(p.kind==='mushroom'&&p.volley!==undefined)for(const sibling of s.shots)if(sibling!==p&&sibling.volley===p.volley)sibling.hits.push(e.id);if(p.kind==='ice')e.slow=2;if(p.kind!=='boomerang'&&p.kind!=='mushroom'&&p.hits.length>=(p.pierce||1)){p.life=0;break;}}}
 }
 s.shots=s.shots.filter(p=>p.life>0&&Math.hypot(p.x-s.x,p.y-s.y)<900).slice(-240);s.enemies=s.enemies.filter(e=>e.hp>0);
 for(const e of [...s.enemies]){
  e.spawnGrace=Math.max(0,(e.spawnGrace||0)-dt);if(e.spawnGrace>0)continue;
  if(e.burn!>0){const elapsed=Math.min(e.burn!,dt);e.burn=Math.max(0,e.burn!-dt);e.burnTick=(e.burnTick||0)+elapsed;if(e.burnTick>=.25||e.burn===0){hitEnemy(s,e,(e.burnDps||8)*e.burnTick,e.burnSource||'torchwood',true);e.burnTick=0;}if(e.hp<=0)continue;}
  for(const field of ['slow','hurt','attackCooldown','chargeCooldown','skill','stun','stripped'] as const)e[field]=Math.max(0,(e[field]||0)-dt);
  if(e.stun!>0)continue;
  if(e.kind==='newspaper'&&!e.enraged&&e.hp<e.max*.5){e.enraged=true;e.speed*=1.85;emit(s,'rage',e.x,e.y,e.kind);}
  if(e.boss&&!e.enraged&&e.hp<=e.max*.5){e.enraged=true;e.speed=55;s.warning=3;s.alert='巨人领主狂暴 · 躲开重击';emit(s,'boss',e.x,e.y,'rage');for(let i=0;i<4;i++){const at=spawnRing(s,()=>random(s));spawnEnemy(s,i%2?'imp':'cone',at.x,at.y,45+s.stage*10,45);}}
  const dx=s.x-e.x,dy=s.y-e.y,d=Math.hypot(dx,dy)||1;
  if(e.burrow!>0){e.burrow=Math.max(0,e.burrow!-dt);const a=Math.min(1,dt*4);e.x+=(e.aimX!-e.x)*a;e.y+=(e.aimY!-e.y)*a;if(e.burrow===0){e.stun=.3;emit(s,'burst',e.x,e.y,'dirt',34);}continue;}
  if(e.kind==='digger'&&e.skill!<=0&&d<450){const a=random(s)*Math.PI*2;e.aimX=clamp(s.x+Math.cos(a)*115,40,s.worldWidth-40);e.aimY=clamp(s.y+Math.sin(a)*115,40,s.worldHeight-40);e.burrow=2.2;e.skill=8;continue;}
  if(e.cast!>0){e.cast=Math.max(0,e.cast!-dt);if(e.cast===0){const a=Math.atan2(e.aimY!-e.y,e.aimX!-e.x);s.hostileShots.push({x:e.x,y:e.y,vx:Math.cos(a)*140,vy:Math.sin(a)*140,life:3,damage:e.kind==='jetpack'?13:16,kind:e.kind});emit(s,'enemyShot',e.x,e.y,e.kind);}continue;}
  if(['wizard','jetpack'].includes(e.kind)&&e.skill!<=0&&d<360){e.cast=.65;e.aimX=s.x;e.aimY=s.y;e.skill=3.4;continue;}
  if(e.kind==='dancer'&&e.skill!<=0&&s.enemies.length<155){e.skill=8;emit(s,'summon',e.x,e.y,e.kind,55);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;spawnEnemy(s,'imp',clamp(e.x+Math.cos(a)*40,30,s.worldWidth-30),clamp(e.y+Math.sin(a)*40,30,s.worldHeight-30),22+s.stage*6,57);}continue;}
  if(e.chargeWindup!>0){e.chargeWindup=Math.max(0,e.chargeWindup!-dt);if(e.chargeWindup===0){const qx=e.chargeX!-e.x,qy=e.chargeY!-e.y,dist=Math.hypot(qx,qy)||1;e.charge=geometry.chargeDuration;e.chargeVx=qx/dist*geometry.chargeSpeed;e.chargeVy=qy/dist*geometry.chargeSpeed;e.chargeHit=false;emit(s,'swipe',e.x,e.y,e.kind);}continue;}
  if(e.charge!>0){e.charge=Math.max(0,e.charge!-dt);e.x=clamp(e.x+e.chargeVx!*dt,20,s.worldWidth-20);e.y=clamp(e.y+e.chargeVy!*dt,20,s.worldHeight-20);if(!e.chargeHit&&Math.hypot(e.x-s.x,e.y-s.y)<geometry.chargeRadius&&s.invulnerable<=0){hurtPlayer(s,e.elite?22:18);e.chargeHit=true;}e.stride=(e.stride||0)+dt*15;continue;}
  const impact=e.boss?.28:.12;
  if(e.attack!>0){const before=e.attack!;e.attack=Math.max(0,before-dt);if(before>impact&&e.attack<=impact){const radius=impactRadius(e);emit(s,e.boss||e.elite?'slam':'swipe',e.aimX??s.x,e.aimY??s.y,e.kind,radius);if(Math.hypot(s.x-(e.aimX??e.x),s.y-(e.aimY??e.y))<radius)hurtPlayer(s,e.boss?e.enraged?30:25:e.elite?24:12);}continue;}
  if((e.elite==='runner'||e.kind==='football')&&e.chargeCooldown!<=0&&d>65&&d<280){e.chargeWindup=geometry.chargeWindup;e.chargeCooldown=e.elite?5:6;e.chargeX=s.x;e.chargeY=s.y;continue;}
  if(d<(e.boss?110:e.elite?65:34)&&e.attackCooldown!<=0){e.attackDuration=e.boss?(e.enraged?1:1.2):e.elite?.9:.48;e.attack=e.attackDuration;e.attackCooldown=e.boss?(e.enraged?2.5:3.4):e.elite?2:1.15;e.aimX=s.x;e.aimY=s.y;continue;}
  if(e.elite||e.boss||(e.hurt||0)<=0){const slow=e.slow>0?(e.elite||e.boss?.75:.45):1,retreat=['wizard','jetpack'].includes(e.kind)&&d<145?-1:1;e.x=clamp(e.x+dx/d*e.speed*slow*dt*retreat,16,s.worldWidth-16);e.y=clamp(e.y+dy/d*e.speed*slow*dt*retreat,16,s.worldHeight-16);e.stride=(e.stride||0)+e.speed*slow*dt/16;}
  if(!e.boss&&!e.elite&&d>Math.max(s.width,s.height)+600){const at=spawnRing(s,()=>random(s));e.x=at.x;e.y=at.y;e.spawnGrace=.6;}
 }
 for(const p of s.hostileShots){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(Math.hypot(p.x-s.x,p.y-s.y)<19){hurtPlayer(s,p.damage);p.life=0;}}s.hostileShots=s.hostileShots.filter(p=>p.life>0).slice(-80);
 s.enemies=s.enemies.filter(e=>e.hp>0);
 s.drops=s.drops.filter(d=>{const age=s.time-(d.born??-10);if(age<.4){d.x=clamp(d.x+(d.vx||0)*dt*(1-age/.4),20,s.worldWidth-20);d.y=clamp(d.y+(d.vy||0)*dt*(1-age/.4),20,s.worldHeight-20);}const dist=Math.hypot(d.x-s.x,d.y-s.y),reach=70+character.pickup+s.pickupBonus+(s.plants.sunflower||0)*15;if(dist<reach&&age>.25){if(dist<20){collect(s,d);return false;}d.x+=(s.x-d.x)/dist*Math.min(dist,dt*360);d.y+=(s.y-d.y)/dist*Math.min(dist,dt*360);}return true;});
 if(s.drops.length>450){const suns=s.drops.filter(d=>!d.kind||d.kind==='sun');if(suns.length>200){const group=suns.slice(0,100),first=group[0];first.value=group.reduce((v,d)=>v+d.value,0);const removed=new Set(group.slice(1));s.drops=s.drops.filter(d=>!removed.has(d));}}
 if(s.hp<=0){s.hp=0;s.status='lost';emit(s,'defeat',s.x,s.y,s.hero);return;}
 if(s.xp>=s.nextXp){s.xp-=s.nextXp;s.level++;s.nextXp=Math.ceil(s.nextXp*progression.growth+progression.increment);s.choices=choices(s);if(s.choices.length){s.status='upgrade';emit(s,'level',s.x,s.y,'sun');}else s.hp=Math.min(s.maxHp,s.hp+30);}
 if(s.time>=s.duration&&s.bossDead&&s.time-s.bossDefeatedAt>=1.6){for(const d of s.drops)if(d.kind==='coin'||d.kind==='gem')collect(s,d);s.drops=s.drops.filter(d=>!['coin','gem'].includes(d.kind||''));s.status='won';emit(s,'victory',s.x,s.y,'sun');}
}
export const clock=(t:number)=>`${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;
// Rotation changes the camera viewport, never physical world positions or locked telegraphs.
export function resizeArena(s:Run,width:number,height:number){s.width=width;s.height=height;s.cameraX=clamp(s.x-width/2,0,s.worldWidth-width);s.cameraY=clamp(s.y-height/2,0,s.worldHeight-height);}
