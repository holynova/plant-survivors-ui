export const names:Record<string,string>={pea:'豌豆射手',ice:'寒冰射手',boomerang:'回旋镖',mushroom:'大喷菇',sunflower:'向日葵',walnut:'坚果',bag:'弹药袋'};
export const descriptions:Record<string,string>={pea:'自动瞄准；提升伤害与连射',ice:'冰弹减速敌人；提升伤害',boomerang:'穿透敌群；提升投射物数量',mushroom:'周期喷射，击退周围敌人',sunflower:'扩大拾取范围，增加经验',walnut:'增加 25 最大生命并恢复生命',bag:'加快攻击；主植物 5 级时进化'};
export type CombatEvent={id:number,time:number,type:string,x:number,y:number,kind:string,value:number};
export type Enemy={id:number,x:number,y:number,hp:number,max:number,speed:number,kind:string,slow:number,boss:boolean,hurt?:number,attack?:number,attackCooldown?:number,aimX?:number,aimY?:number};
export type Shot={x:number,y:number,vx:number,vy:number,life:number,damage:number,kind:string,hits:number[]};
export type Run=ReturnType<typeof createRun>;
export function createRun(starter='pea',stage=0,seed=12345){return {events:[] as CombatEvent[],eventId:0,moving:false,facing:1,stride:0,attackAt:-10,hitAt:-10,time:0,duration:180+stage*30,stage,seed,id:0,x:195,y:350,hp:100,maxHp:100,invulnerable:0,xp:0,nextXp:5,level:1,kills:0,status:'playing',plants:{[starter]:1} as Record<string,number>,starter,evolved:false,evolutionNotice:false,enemies:[] as Enemy[],shots:[] as Shot[],drops:[] as {x:number,y:number,value:number}[],damage:{} as Record<string,number>,cooldowns:{} as Record<string,number>,spawn:0,bossSpawned:false,bossDead:false,warning:0,blast:{x:0,y:0,time:0},choices:[] as string[],rerolls:2};}
export function emit(s:Run,type:string,x:number,y:number,kind='',value=0){s.events.push({id:++s.eventId,time:s.time,type,x,y,kind,value});if(s.events.length>160)s.events.shift();}
export function random(s:Run){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
export function choices(s:Run){const pool=Object.keys(names).filter(k=>(s.plants[k]||0)<5);for(let i=pool.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}const result=pool.slice(0,3);if(s.level%2===0&&(s.plants[s.starter]||0)<5&&!result.includes(s.starter))result[result.length-1]=s.starter;return result;}
export function select(s:Run,id:string){if(s.status!=='upgrade'||!s.choices.includes(id))return false;s.plants[id]=(s.plants[id]||0)+1;if(id==='walnut'){s.maxHp+=25;s.hp=Math.min(s.maxHp,s.hp+40);}if(!s.evolved&&s.plants[s.starter]>=5&&s.plants.bag){s.evolved=true;s.evolutionNotice=true;emit(s,'evolution',s.x,s.y,s.starter);}s.status='playing';s.choices=[];emit(s,'upgrade',s.x,s.y,id);return true;}
export function reroll(s:Run){if(s.status==='upgrade'&&s.rerolls>0){s.rerolls--;s.choices=choices(s);}}
function hit(s:Run,e:Enemy,damage:number,kind:string){if(e.hp<=0)return;const real=Math.min(e.hp,damage);e.hp-=damage;e.hurt=.22;const angle=Math.atan2(e.y-s.y,e.x-s.x);e.x+=Math.cos(angle)*(e.boss?1:5);e.y+=Math.sin(angle)*(e.boss?1:5);emit(s,'hit',e.x,e.y,kind,real);s.damage[kind]=(s.damage[kind]||0)+real;if(e.hp<=0){s.kills++;emit(s,'death',e.x,e.y,e.kind,e.boss?1:0);s.drops.push({x:Math.max(40,Math.min(350,e.x)),y:Math.max(110,Math.min(590,e.y)),value:e.boss?30:e.kind==='bucket'?3:1});if(e.boss)s.bossDead=true;}}
export function step(s:Run,dt:number,input={x:0,y:0}){if(s.status!=='playing'||s.evolutionNotice)return;dt=Math.max(0,Math.min(dt,.05));s.time+=dt;s.invulnerable=Math.max(0,s.invulnerable-dt);s.blast.time=Math.max(0,s.blast.time-dt);s.moving=Math.hypot(input.x,input.y)>.1;if(Math.abs(input.x)>.1)s.facing=input.x>0?1:-1;if(s.moving)s.stride+=dt*9;const len=Math.max(1,Math.hypot(input.x,input.y));s.x=Math.max(45,Math.min(345,s.x+input.x/len*120*dt));s.y=Math.max(85,Math.min(610,s.y+input.y/len*120*dt));
 s.spawn-=dt;if(s.spawn<=0&&s.enemies.length<110){s.spawn=Math.max(.22,1.35-s.time*.004-s.stage*.06);const side=Math.floor(random(s)*4),x=side===0?-20:side===1?410:random(s)*390,y=side===2?65:side===3?640:85+random(s)*510;const kind=s.time>45&&random(s)>.7?'bucket':random(s)>.6?'cone':'zombie';const hp=(kind==='bucket'?70:kind==='cone'?38:20)*(1+s.time/300+s.stage*.1);s.enemies.push({id:++s.id,x,y,hp,max:hp,speed:(kind==='bucket'?19:kind==='cone'?29:24)+s.stage*2+s.time*.025,kind,slow:0,boss:false});}
 if(s.time>=s.duration-45&&!s.bossSpawned){s.bossSpawned=true;const hp=1200+s.stage*500;s.enemies.push({id:++s.id,x:195,y:95,hp,max:hp,speed:22,kind:'boss-trim',slow:0,boss:true});s.warning=4;emit(s,'boss',195,95,'boss-trim');}
 s.warning=Math.max(0,s.warning-dt);
 for(const [kind,level] of Object.entries(s.plants)){if(['walnut','sunflower','bag'].includes(kind))continue;s.cooldowns[kind]=(s.cooldowns[kind]||0)-dt;if(s.cooldowns[kind]>0)continue;s.cooldowns[kind]=(kind==='mushroom'?1.8:.9)/(1+level*.13+(s.plants.bag||0)*.08+(s.evolved&&kind===s.starter?.6:0));
 if(kind==='mushroom'){s.attackAt=s.time;emit(s,'shoot',s.x,s.y,kind);for(const e of s.enemies)if(Math.hypot(e.x-s.x,e.y-s.y)<85+level*8){hit(s,e,15+level*9,kind);const a=Math.atan2(e.y-s.y,e.x-s.x);e.x+=Math.cos(a)*15;e.y+=Math.sin(a)*15;}s.blast={x:s.x,y:s.y,time:.25};continue;}
 const e=s.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0];if(!e)continue;s.attackAt=s.time;emit(s,'shoot',s.x,s.y,kind);const a=Math.atan2(e.y-s.y,e.x-s.x),count=(s.evolved&&kind===s.starter?3:1)+(kind==='boomerang'&&level>=3?1:0);for(let i=0;i<count;i++){const angle=a+(i-(count-1)/2)*.16;s.shots.push({x:s.x,y:s.y,vx:Math.cos(angle)*250,vy:Math.sin(angle)*250,life:2,damage:16+level*8,kind,hits:[]});}}
 for(const p of s.shots){p.life-=dt;if(p.kind==='boomerang'&&p.life<1){const a=Math.atan2(s.y-p.y,s.x-p.x);p.vx=Math.cos(a)*290;p.vy=Math.sin(a)*290;}p.x+=p.vx*dt;p.y+=p.vy*dt;for(const e of s.enemies){if(e.hp>0&&!p.hits.includes(e.id)&&Math.hypot(e.x-p.x,e.y-p.y)<(e.boss?36:18)){hit(s,e,p.damage,p.kind);p.hits.push(e.id);if(p.kind==='ice')e.slow=2;if(p.kind!=='boomerang'){p.life=0;break;}}}}
 s.shots=s.shots.filter(p=>p.life>0&&p.x>-50&&p.x<440&&p.y>20&&p.y<700).slice(-200);s.enemies=s.enemies.filter(e=>e.hp>0);
 for(const e of s.enemies){
 e.slow=Math.max(0,e.slow-dt);e.hurt=Math.max(0,(e.hurt||0)-dt);e.attackCooldown=Math.max(0,(e.attackCooldown||0)-dt);
 const dx=s.x-e.x,dy=s.y-e.y,d=Math.hypot(dx,dy)||1;
 if((e.attack||0)>0){const before=e.attack!;e.attack=Math.max(0,before-dt);if(before>(e.boss?.28:.12)&&e.attack<=(e.boss?.28:.12)){
 const radius=e.boss?72:32;emit(s,e.boss?'slam':'swipe',e.aimX??s.x,e.aimY??s.y,e.kind);
 if(Math.hypot(s.x-(e.aimX??e.x),s.y-(e.aimY??e.y))<radius&&s.invulnerable<=0){s.hp-=e.boss?25:10;s.invulnerable=.8;s.hitAt=s.time;emit(s,'hurt',s.x,s.y,'dave',e.boss?25:10);}
 }continue;}
 if(d<(e.boss?110:34)&&e.attackCooldown<=0){e.attack=e.boss?1.2:.48;e.attackCooldown=e.boss?3.4:1.3;e.aimX=s.x;e.aimY=s.y;continue;}
 if((e.hurt||0)<=0){e.x+=dx/d*e.speed*(e.slow>0?.45:1)*dt;e.y+=dy/d*e.speed*(e.slow>0?.45:1)*dt;}
 }

 if(s.hp<=0){s.hp=0;s.status='lost';emit(s,'defeat',s.x,s.y,'dave');return;}
 s.drops=s.drops.filter(d=>{const dist=Math.hypot(d.x-s.x,d.y-s.y);if(dist<35+(s.plants.sunflower||0)*15){emit(s,'pickup',d.x,d.y,'sun');s.xp+=d.value*(1+(s.plants.sunflower||0)*.12);return false;}return true;});if(s.drops.length>180){const excess=s.drops.splice(0,s.drops.length-180);s.drops[0].value+=excess.reduce((v,d)=>v+d.value,0);}
 if(s.xp>=s.nextXp){s.xp-=s.nextXp;s.level++;s.nextXp=Math.ceil(s.nextXp*1.16+2);s.choices=choices(s);if(s.choices.length){s.status='upgrade';emit(s,'level',s.x,s.y,'sun');}else s.hp=Math.min(s.maxHp,s.hp+30);}
 if(s.time>=s.duration&&s.bossDead){s.status='won';emit(s,'victory',s.x,s.y,'sun');}
}
export const clock=(t:number)=>`${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;
