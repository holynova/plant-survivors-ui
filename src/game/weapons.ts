import type {Run,Enemy,Shot} from './simulation.ts';
import {heroes} from './catalog.ts';
import {enemyDefinitions} from './enemies.ts';
export type CombatApi={hit:(s:Run,e:Enemy,damage:number,kind:string)=>void;emit:(s:Run,type:string,x:number,y:number,kind?:string,value?:number)=>void};
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
export function blast(s:Run,x:number,y:number,radius:number,damage:number,kind:string,api:CombatApi,groundOnly=false){for(const e of s.enemies)if(e.hp>0&&!(e.burrow!>0)&&(!groundOnly||!enemyDefinitions[e.kind]?.air)&&Math.hypot(e.x-x,e.y-y)<radius+(e.boss?30:e.elite?24:14))api.hit(s,e,damage,kind);api.emit(s,'burst',x,y,kind,radius);}
export function chain(s:Run,first:Enemy,count:number,damage:number,kind:string,api:CombatApi){const seen=new Set<number>();let current:Enemy|undefined=first,previous={x:s.x,y:s.y};for(let i=0;i<count&&current;i++){api.emit(s,'arc',previous.x,previous.y,kind,current.id);s.beams.push({x:previous.x,y:previous.y,toX:current.x,toY:current.y,life:.24,maxLife:.24,kind,width:3});api.hit(s,current,damage*Math.pow(.87,i),kind);seen.add(current.id);previous=current;current=s.enemies.filter(e=>e.hp>0&&!(e.burrow!>0)&&!seen.has(e.id)&&distance(e,previous)<155).sort((a,b)=>distance(a,previous)-distance(b,previous))[0];}}
const shot=(s:Run,kind:string,angle:number,damage:number,speed=280,pierce=1):Shot=>({x:s.x,y:s.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:1.8,damage,kind,hits:[],pierce,age:0,angle});
export function specialAttack(s:Run,kind:string,level:number,target:Enemy,api:CombatApi){const a=Math.atan2(target.y-s.y,target.x-s.x),power=(s.evolved&&kind===s.starter?1.25:1)*heroes[s.hero].damage;
 if(['cabbage','kernel','melon','coconut','cabbagevolt'].includes(kind)){
  const radius=kind==='melon'?76:kind==='coconut'?112:kind==='cabbagevolt'?52:kind==='kernel'?30:42;
  const damage=(kind==='coconut'?105+level*32:kind==='melon'?43+level*16:kind==='cabbagevolt'?30+level*13:23+level*10)*power;
  s.shots.push({...shot(s,kind,a,damage,0),life:.7,totalLife:.7,lob:true,startX:s.x,startY:s.y,targetX:target.x,targetY:target.y,blast:radius,butter:kind==='kernel'&&s.volley%3===0});return true;
 }
 if(kind==='starfruit'||kind==='cactus'||kind==='bamboo'){
  const count=kind==='starfruit'?5:kind==='bamboo'?3:1;for(let i=0;i<count;i++)s.shots.push(shot(s,kind,kind==='starfruit'?a+i*Math.PI*2/5:a+(i-(count-1)/2)*.12,(kind==='bamboo'?19+level*8:20+level*9)*power,kind==='cactus'?410:320,kind==='cactus'?3+Math.floor(level/2):kind==='bamboo'?2:1+Math.floor(level/3)));return true;
 }
 if(kind==='lightning'){chain(s,target,2+level,(23+level*10)*power,kind,api);return true;}
 if(kind==='laser'){
  const length=420,dx=Math.cos(a),dy=Math.sin(a),width=14+level*2;s.beams.push({x:s.x,y:s.y,toX:s.x+dx*length,toY:s.y+dy*length,life:.32,maxLife:.32,kind,width});for(const e of s.enemies){const ex=e.x-s.x,ey=e.y-s.y,along=ex*dx+ey*dy;if(along>=0&&along<=length&&Math.abs(ex*dy-ey*dx)<width+(e.boss?28:15))api.hit(s,e,(30+level*13)*power,kind);}return true;
 }
 if(kind==='potato'){s.zones.push({x:s.x,y:s.y,kind,life:20,maxLife:20,arm:1,radius:85,damage:(100+level*32)*power,tick:0,angle:a});const mines=s.zones.filter(z=>z.kind==='potato');if(mines.length>8)mines[0].life=0;return true;}
 if(kind==='cherry'||kind==='squash'){const life=kind==='cherry'?.65:.6;s.zones.push({x:target.x,y:target.y,kind,life,maxLife:life,arm:life,radius:kind==='cherry'?100:78,damage:(kind==='cherry'?115+level*32:80+level*25)*power,tick:0,angle:a});return true;}
 if(kind==='jalapeno'){s.zones.push({x:s.x,y:s.y,kind,life:2.2,maxLife:2.2,arm:0,radius:24,damage:(17+level*6)*power,tick:0,angle:a});return true;}
 if(kind==='snapdragon'){
  s.zones.push({x:s.x,y:s.y,kind,life:.5,maxLife:.5,arm:0,radius:145,damage:0,tick:99,angle:a});for(const e of s.enemies){let delta=Math.atan2(e.y-s.y,e.x-s.x)-a;delta=Math.atan2(Math.sin(delta),Math.cos(delta));if(distance(s,e)<145&&Math.abs(delta)<Math.PI*.32){api.hit(s,e,(30+level*10)*power,kind);e.burn=2.5;e.burnDps=(7+level*3)*power;e.burnSource=kind;}}return true;
 }
 if(kind==='bonk'){blast(s,target.x,target.y,44,(34+level*14)*power,kind,api);s.beams.push({x:s.x,y:s.y,toX:target.x,toY:target.y,life:.24,maxLife:.24,kind,width:12});return true;}
 if(kind==='chomper'){api.hit(s,target,target.boss||target.elite?(90+level*30)*power:target.hp+1000,kind);s.hp=Math.min(s.maxHp,s.hp+4+level);api.emit(s,'bite',target.x,target.y,kind,58);return true;}
 if(kind==='magnet'){for(const e of s.enemies)if(distance(s,e)<235){e.shield=0;e.stripped=5;if(!e.boss&&!e.elite){e.x+=(s.x-e.x)*.14;e.y+=(s.y-e.y)*.14;}api.hit(s,e,(12+level*8)*power,kind);}api.emit(s,'pulse',s.x,s.y,kind,235);return true;}
 if(kind==='iceberg'){for(const e of s.enemies)if(distance(s,e)<165){e.stun=e.boss||e.elite?.22:1.3;e.slow=3;api.hit(s,e,(10+level*7)*power,kind);}api.emit(s,'pulse',s.x,s.y,kind,165);return true;}
 return false;
}
export function stepZones(s:Run,dt:number,api:CombatApi){for(const z of s.zones){z.life-=dt;z.arm=Math.max(0,z.arm-dt);z.tick-=dt;
 if(z.kind==='potato'&&z.arm<=0&&s.enemies.some(e=>e.hp>0&&!enemyDefinitions[e.kind]?.air&&!(e.burrow!>0)&&Math.hypot(e.x-z.x,e.y-z.y)<35)){blast(s,z.x,z.y,z.radius,z.damage,z.kind,api,true);z.life=0;}
 if((z.kind==='cherry'||z.kind==='squash')&&z.life<=0)blast(s,z.x,z.y,z.radius,z.damage,z.kind,api);
 if(z.kind==='jalapeno'&&z.tick<=0){z.tick=.3;const dx=Math.cos(z.angle),dy=Math.sin(z.angle);for(const e of s.enemies){const ex=e.x-z.x,ey=e.y-z.y,along=ex*dx+ey*dy;if(!enemyDefinitions[e.kind]?.air&&along>=0&&along<330&&Math.abs(ex*dy-ey*dx)<32)api.hit(s,e,z.damage,z.kind);}}
 }s.zones=s.zones.filter(z=>z.life>0);for(const beam of s.beams)beam.life-=dt;s.beams=s.beams.filter(b=>b.life>0);}
