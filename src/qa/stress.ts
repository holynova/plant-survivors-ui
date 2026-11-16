// Loaded only by the DEV QA hook. Uses the production simulation and renderer.
import {createRun,step,spawnEnemy,type Run} from '../game/simulation';
import {renderBattle,type Images} from '../game/renderer';
export const profiles={normal:[50,80,20,100,6],ceiling:[160,240,80,450,24],extreme:[320,800,160,800,48]} as const;
export function stressFixture(name:keyof typeof profiles,width:number,height:number){
 const s=createRun('pea',0,20261117);Object.assign(s,{width,height,cameraX:s.x-width/2,cameraY:s.y-height/2,hp:100000,maxHp:100000,nextXp:1e9,duration:1e9,spawn:1e9,eliteWave:3,plants:{pea:5,ice:5,boomerang:5,mushroom:5,cabbage:5,lightning:5},time:90});
 let seed=42;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};const pos=()=>({x:s.cameraX+20+rnd()*(width-40),y:s.cameraY+140+rnd()*Math.max(80,height-180)});const [enemies,shots,hostile,drops,zones]=profiles[name];
 for(let i=0;i<enemies;i++){const p=pos();spawnEnemy(s,['zombie','cone','bucket','football','wizard','dancer','newspaper'][i%7],p.x,p.y,1e8,15,{spawnGrace:0,skill:99,attackCooldown:99,...(i%20===0?{elite:'guard',attack:1,attackDuration:1.2,aimX:p.x+30,aimY:p.y+25}:{}),...(i===0?{boss:true,kind:'boss-trim'}:{})});}
 for(let i=0;i<shots;i++){const p=pos(),a=rnd()*Math.PI*2;s.shots.push({...p,vx:Math.cos(a)*150,vy:Math.sin(a)*150,life:10,damage:1,kind:['pea','ice','boomerang','starfruit','cactus'][i%5],hits:[],pierce:99,age:0,angle:a,trail:[]});}
 for(let i=0;i<hostile;i++)s.hostileShots.push({...pos(),vx:40,vy:30,life:10,damage:0,kind:i%2?'wizard':'jetpack'});
 for(let i=0;i<drops;i++)s.drops.push({...pos(),value:0,kind:i%3?'sun':i%2?'gem':'coin',born:80});
 for(let i=0;i<zones;i++)s.zones.push({...pos(),kind:i%2?'jalapeno':'snapdragon',life:4,maxLife:4,arm:0,radius:145,damage:0,tick:99,angle:rnd()*Math.PI*2});
 for(let i=0;i<24;i++){const p=pos(),q=pos();s.beams.push({...p,toX:q.x,toY:q.y,life:1,maxLife:1,kind:'lightning',width:2});}
 for(let i=0;i<200;i++)s.events.push({...pos(),id:i,time:s.time-i/400,type:i%6?'hit':'slam',kind:i%2?'pea':'ice',value:i%6?12:72});
 return s;
}
const percentile=(a:number[],q:number)=>[...a].sort((a,b)=>a-b)[Math.min(a.length-1,Math.floor(a.length*q))]||0;
export async function benchmark(canvas:HTMLCanvasElement,images:Images,name:keyof typeof profiles,onState?:(state:Run)=>void){
 const s=stressFixture(name,390,canvas.height/canvas.width*390),ctx=canvas.getContext('2d')!,pool={enemies:[...s.enemies],shots:[...s.shots],hostileShots:[...s.hostileShots],drops:[...s.drops],zones:[...s.zones],beams:[...s.beams],events:[...s.events]};
 onState?.(s);
 const frames:number[]=[],sim:number[]=[],paint:number[]=[],upkeep:number[]=[],total:number[]=[],diagnostic:{frame:number;simulation:number;render:number;work:number}[]=[];let last=0,n=0;const start=performance.now();
 await new Promise<void>(resolve=>{function frame(now:number){const begin=performance.now();
  // Restore fixed density every frame, including above-production-limit stress.
  s.enemies=pool.enemies.slice();s.shots=pool.shots.slice();s.hostileShots=pool.hostileShots.slice();s.drops=pool.drops.slice();s.zones=pool.zones.slice();s.beams=pool.beams.slice();s.events=pool.events.slice();s.hp=s.maxHp;s.invulnerable=10;s.status='playing';s.xp=0;
  for(const e of s.enemies){e.hp=e.max;if(e.elite||e.boss){e.attack=.4+((n%50)/50)*.7;e.attackDuration=1.2;}if(Math.abs(e.x-s.x)<25&&Math.abs(e.y-s.y)<25)e.x+=70;}
  for(const p of s.shots){p.life=10;p.hits.length=0;if(p.x<s.cameraX||p.x>s.cameraX+s.width)p.vx*=-1;if(p.y<s.cameraY+130||p.y>s.cameraY+s.height)p.vy*=-1;}
  for(const p of s.hostileShots){p.life=10;if(p.x>s.cameraX+s.width)p.x=s.cameraX;if(p.y>s.cameraY+s.height)p.y=s.cameraY+140;}
  for(const z of s.zones){z.life=4;z.tick=99;}for(const b of s.beams)b.life=1;for(let i=0;i<pool.events.length;i++)pool.events[i].time=s.time-(i%60)/100;
  const a=performance.now();step(s,1/60);const b=performance.now();s.shots=pool.shots;s.hostileShots=pool.hostileShots;s.drops=pool.drops;s.events=pool.events;renderBattle(ctx,s,images);const c=performance.now();
  diagnostic.push({frame:last?now-last:0,simulation:b-a,render:c-b,work:c-begin});if(n++>=30){frames.push(now-last);upkeep.push(a-begin);sim.push(b-a);paint.push(c-b);total.push(c-begin);}last=now;
  if(n<210&&performance.now()-start<18000)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
 const stats=(a:number[])=>({p50:percentile(a,.5),p95:percentile(a,.95),p99:percentile(a,.99),max:Math.max(...a)});
 return {name,diagnostic:diagnostic.slice(-60),elapsedMs:performance.now()-start,totalFrames:n,valid:frames.length>=60,counts:{enemies:pool.enemies.length,shots:pool.shots.length,hostile:pool.hostileShots.length,drops:pool.drops.length,zones:pool.zones.length,events:200,beams:24},samples:frames.length,frame:stats(frames),simulation:stats(sim),render:stats(paint),fixture:stats(upkeep),work:stats(total),framesOver50:frames.filter(x=>x>50).length,workOver16:total.filter(x=>x>16.7).length,canvas:[canvas.width,canvas.height],dpr:devicePixelRatio,ua:navigator.userAgent,seed:42};
}
