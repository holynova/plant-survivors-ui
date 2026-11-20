import {contactShadow,groundedProp,propPlacement,lootPlacement} from './grounding.ts';
import {bossIds} from './bosses.ts';
import {weaponPosition} from './orbit.ts';
import {artCell,projectileCell,rasterBurst} from './raster-fx.ts';
import {nearbyProps} from './scenery.ts';
import {enemyPose} from './enemy-animation.ts';
import {evolutionRecipe} from './evolutions.ts';
import {cachedText} from './render-cache.ts';
import {groundImpacts} from './ground-effects.ts';
import tokens from '../design/tokens.json' with {type:'json'};
import {terrainPatch,heroFrameSize,enemyFrameSize} from './art-scale.ts';
import type {Run,Enemy} from './simulation.ts';
import {heroes} from './catalog.ts';
import {plants,plantIds,activePlants} from './plants.ts';
import {enemyDefinitions,newEnemyIds} from './enemies.ts';
import {footAnchors} from './anchors.ts';
import {visible,clamp} from './world.ts';
import {enemyTelegraph} from './telegraphs.ts';
export const animationAssets=['dave','flora','rusty','zombie','cone','bucket',...bossIds,...newEnemyIds];
export const sceneAssets=['sun',...plantIds.filter(id=>id!=='bag')];
export type Images=Record<string,HTMLImageElement>;
const tau=Math.PI*2;
export function animationFrame(time:number,row:number,phase=0){return row*4+Math.floor(Math.max(0,time)*10+phase)%4;}
export function heroAnimationFrame(s:Run,endTime=0,reduced=false){if(s.status==='lost')return 12+Math.min(3,Math.floor(endTime/.75*4));const age=s.time+endTime-s.hitAt;if(age>=0&&age<.3)return 8+Math.min(3,Math.floor(age/.3*4));return s.moving&&!reduced?Math.floor(s.stride)%4:0;}
const frameMetadata=new WeakMap<HTMLImageElement,{one:boolean;tw:number;th:number;anchors?:readonly number[]}>();
function frame(c:CanvasRenderingContext2D,img:HTMLImageElement|undefined,index:number,x:number,y:number,w:number,h:number,flip=false,alpha=1,lean=0){if(!img)return;let meta=frameMetadata.get(img);if(!meta){const one=img.height<300,key=img.dataset.asset?.replace('anim-','')||'';meta={one,tw:img.width/4,th:one?img.height:img.height/4,anchors:footAnchors[key]};frameMetadata.set(img,meta);}const f=meta.one?index%4:index,anchor=meta.anchors?.[f]??.84,sx=f%4*meta.tw,sy=Math.floor(f/4)*meta.th;
 if(!flip&&!lean){const previous=alpha===1?1:c.globalAlpha;if(alpha!==1)c.globalAlpha=previous*alpha;c.drawImage(img,sx,sy,meta.tw,meta.th,x-w/2,y-h*anchor,w,h);if(alpha!==1)c.globalAlpha=previous;return;}
 c.save();c.translate(x,y);if(flip)c.scale(-1,1);if(lean)c.rotate(lean);if(alpha!==1)c.globalAlpha*=alpha;c.drawImage(img,sx,sy,meta.tw,meta.th,-w/2,-h*anchor,w,h);c.restore();}
function articulated(c:CanvasRenderingContext2D,img:HTMLImageElement|undefined,e:Enemy,x:number,y:number,size:number,flip:boolean,reduced:boolean,deathAge=-1){if(!img)return;const pose=enemyPose(e,deathAge,reduced);if(pose.state==='walk'){frame(c,img,pose.frame,x,y,size,size,flip);return;}
 const tw=img.width/4,th=img.height;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.rotate(pose.fall);c.scale(1,pose.scaleY);c.globalAlpha*=deathAge<0?1:Math.max(0,1-deathAge/1.1);
 // Two legs, torso and forward arm are independently pivoted cutouts, with overlap at joints.
 const piece=(sx:number,sy:number,sw:number,sh:number,px:number,py:number,angle:number)=>{c.save();c.translate((px-.5)*size,(py-.84)*size);c.rotate(angle);c.drawImage(img,sx*tw,sy*th,sw*tw,sh*th,(sx-px)*size,(sy-py)*size,sw*size,sh*size);c.restore()};
 piece(.12,.63,.40,.30,.36,.67,-pose.leg);piece(.49,.63,.40,.30,.60,.67,pose.leg);piece(.07,.03,.61,.65,.48,.67,pose.body);piece(.65,.08,.30,.57,.67,.38,pose.arm);c.restore();}
function sprite(c:CanvasRenderingContext2D,img:HTMLImageElement|undefined,x:number,y:number,w:number,h=w,angle=0,alpha=1){if(!img)return;if(!angle&&alpha===1){c.drawImage(img,x-w/2,y-h/2,w,h);return;}c.save();if(alpha!==1)c.globalAlpha*=alpha;c.translate(x,y);if(angle)c.rotate(angle);c.drawImage(img,-w/2,-h/2,w,h);c.restore();}
function circle(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string|CanvasGradient){c.fillStyle=color;c.beginPath();c.arc(x,y,Math.max(0,r),0,tau);c.fill();}
let shadowImage:HTMLCanvasElement|undefined;
function shadow(c:CanvasRenderingContext2D,x:number,y:number,w:number,air=false){if(!shadowImage){shadowImage=document.createElement('canvas');shadowImage.width=128;shadowImage.height=40;const ctx=shadowImage.getContext('2d')!;ctx.scale(1,.3125);const g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#183119aa');g.addColorStop(.4,'#18311966');g.addColorStop(1,'#18311900');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);}if(air){const a=c.globalAlpha;c.globalAlpha=a*.45;c.drawImage(shadowImage,x-w,y-w*.27,w*2,w*.54);c.globalAlpha=a;}else c.drawImage(shadowImage,x-w,y-w*.27,w*2,w*.54);}
// Frame padding differs by hero. These sizes give 78–79 visible idle pixels at a 390-unit viewport.

const outlines=new WeakMap<HTMLImageElement,Map<string,HTMLCanvasElement>>();
function heroOutline(c:CanvasRenderingContext2D,s:Run,images:Images,endTime:number,reduced:boolean){const img=images['anim-'+heroes[s.hero].art];if(!img)return;const size=heroFrameSize[s.hero],f=heroAnimationFrame(s,endTime,reduced),anchor=footAnchors[heroes[s.hero].art]?.[f]??.84,key=`${f}-${size}`;let cache=outlines.get(img);if(!cache){cache=new Map();outlines.set(img,cache)}let edge=cache.get(key);if(!edge){edge=document.createElement('canvas');edge.width=edge.height=size+8;const ctx=edge.getContext('2d')!;for(const [dx,dy]of [[-1.5,0],[1.5,0],[0,-1.5],[0,1.5]])frame(ctx,img,f,size/2+4+dx,size*anchor+4+dy,size,size);ctx.globalCompositeOperation='source-in';ctx.fillStyle=tokens.colors['sun-light'];ctx.fillRect(0,0,size+8,size+8);ctx.globalCompositeOperation='destination-out';frame(ctx,img,f,size/2+4,size*anchor+4,size,size);cache.set(key,edge)}c.save();c.translate(s.x,s.y);if(s.facing<0)c.scale(-1,1);c.globalAlpha=.85;c.drawImage(edge,-size/2-4,-size*anchor-4);c.restore();}
function text(c:CanvasRenderingContext2D,label:string,x:number,y:number,color=tokens.colors.paper,size=11){cachedText(c,label,x,y,color,size);}
const groundPatterns=new WeakMap<CanvasRenderingContext2D,WeakMap<HTMLImageElement,CanvasPattern>>();
function terrain(c:CanvasRenderingContext2D,s:Run,images:Images){
 const [w,h]=terrainPatch[s.stage]||terrainPatch[0],im=images[['garden-grass','garden-night','garden-roof'][s.stage]];
 if(im){
  let pat=groundPatterns.get(c)?.get(im);
  if(!pat){const tile=document.createElement('canvas');tile.width=4*w;tile.height=4*h;const ctx=tile.getContext('2d')!;
   for(let iy=0;iy<2;iy++)for(let ix=0;ix<2;ix++){ctx.save();ctx.translate(ix*4*w,iy*4*h);ctx.scale(ix?-1:1,iy?-1:1);ctx.drawImage(im,0,0,2*w,2*h);ctx.restore();}
   pat=c.createPattern(tile,'repeat')!;pat.setTransform(new DOMMatrix().scale(.5));let cache=groundPatterns.get(c);if(!cache)groundPatterns.set(c,cache=new WeakMap());cache.set(im,pat);}
  c.fillStyle=pat;c.fillRect(Math.floor(s.cameraX)-1,Math.floor(s.cameraY)-1,s.width+3,s.height+3);
 }
 // Distinct painted biome textures and generated world-space scenery.
 for(const prop of nearbyProps(s)){const box=propPlacement(prop);contactShadow(c,prop.x+3,prop.y+1,box.shadowWidth,s.stage,.8);if(prop.index===7)groundedProp(c,prop,images['garden-props'],s.stage);}
 if(s.stage===1){const x=s.worldWidth/2,y=s.worldHeight/2-340;groundedProp(c,{index:7,x:x-90,y:y+120,size:240},images['garden-props'],s.stage);groundedProp(c,{index:7,x:x+90,y:y+120,size:240},images['garden-props'],s.stage);groundedProp(c,{index:5,x,y:y+80,size:140},images['garden-props'],s.stage);}
 for(const point of s.landmarks){if(!visible(s,point.x,point.y,80))continue;const color=point.kind==='well'?tokens.colors['leaf-light']:tokens.colors.sun;c.save();c.globalAlpha=point.done?.45:1;shadow(c,point.x,point.y,24);sprite(c,images[point.kind==='cache'?'chest-v2':point.kind==='well'?'sunflower':'crystal-v2'],point.x,point.y-14,42);if(point.progress>0&&!point.done){c.strokeStyle=tokens.colors['sun-light'];c.lineWidth=4;c.beginPath();c.arc(point.x,point.y,36,-Math.PI/2,-Math.PI/2+tau*point.progress);c.stroke();}text(c,point.done?'已完成':point.kind==='cache'?'种子箱 · 停留救援':point.kind==='well'?'水井 · 停留恢复':'装置 · 停留修复',point.x,point.y+51,color,11);c.restore();}
 c.strokeStyle='#4d542d';c.lineWidth=24;c.strokeRect(12,12,s.worldWidth-24,s.worldHeight-24);c.strokeStyle='#c4b47e';c.lineWidth=4;c.setLineDash([12,9]);c.strokeRect(25,25,s.worldWidth-50,s.worldHeight-50);c.setLineDash([]);
}
function loot(c:CanvasRenderingContext2D,s:Run,images:Images,t:number,reduced=false){for(const d of s.drops){if(!visible(s,d.x,d.y,30))continue;const kind=d.kind||'sun',box=lootPlacement(kind,d.x,d.y,t-(d.born??-10),reduced),im=images['ground-'+kind];contactShadow(c,d.x,d.y,box.shadowWidth,s.stage,1-box.lift*.035);if(im)c.drawImage(im,box.left,box.top,box.size,box.size);}}
function zones(c:CanvasRenderingContext2D,s:Run,images:Images,t:number){for(const z of s.zones){if(!visible(s,z.x,z.y,350))continue;const progress=1-z.life/z.maxLife;if(['potato','cherry','squash'].includes(z.kind)){shadow(c,z.x,z.y,15);const jump=z.kind==='squash'?Math.sin(progress*Math.PI)*70:0;sprite(c,images[z.kind],z.x,z.y-12-jump,z.kind==='squash'?54:32,undefined,z.kind==='cherry'?Math.sin(t*22)*.12:0);if(z.kind==='potato'&&z.arm<=0)circle(c,z.x+3,z.y-22,2,Math.sin(t*7)>0?'#ff714e':'#ffc16d');continue;}const line=z.kind==='jalapeno';c.save();c.translate(z.x,z.y);c.rotate(z.angle);c.globalAlpha*=Math.min(1,z.life*3);for(let i=0;i<6;i++){const x=i*(line?52:23),y=Math.sin(i*5+t*5)*(line?12:x*.2);artCell(c,images['v10-effects'],8+Math.floor(t*9+i)%4,4,4,x,y,line?72:55,55,0,.7);}c.restore();}}
function actor(c:CanvasRenderingContext2D,s:Run,e:Enemy,images:Images,t:number,reduced:boolean){if(!visible(s,e.x,e.y))return;const def=enemyDefinitions[e.kind],size=enemyFrameSize(e.kind,!!e.elite,e.boss),air=!!def?.air;shadow(c,e.x,e.y,e.boss?34:e.elite?27:size*.18,air);if(e.burrow!>0){for(let i=0;i<4;i++)circle(c,e.x+Math.sin(i*5+t*6)*10,e.y+Math.cos(i*4)*4,3,'#8a704d');return;}
 const row=e.hurt!>0?2:e.attack!>0?1:0,atk=e.attackDuration||.48;let f=row===1?4+Math.min(3,Math.floor((1-e.attack!/atk)*4)):row===2?8:Math.floor(e.stride||0)%4;if(reduced&&row===0)f=0;const img=images['anim-'+(e.kind==='door'?'zombie':e.kind)],lift=air?10+(reduced?0:Math.sin(t*3+e.id)*2):0,lean=newEnemyIds.includes(e.kind)&&e.attack!>0?Math.sin((1-e.attack!/atk)*Math.PI)*.16:0;
 if(bossIds.includes(e.kind)&&e.kind!=='boss-trim'){const action=(e.attack!>0||e.cast!>0||e.chargeWindup!>0||e.charge!>0),f=action?3:Math.floor((e.stride||0)*.65)%3;frame(c,img,f,e.x,e.y,size,size,s.x<e.x,1,action?Math.sin(t*12)*.025:0);}else if(newEnemyIds.includes(e.kind))articulated(c,img,e,e.x,e.y-lift,size,s.x<e.x,reduced);else frame(c,img,f,e.x,e.y-lift,size,size,s.x<e.x,e.spawnGrace!>0?.65:1,lean);
 if(e.kind==='door'&&e.shield!>0){c.save();c.translate(e.x+(s.x<e.x?-7:7),e.y-29);c.fillStyle='#9db6a280';c.strokeStyle='#675944';c.lineWidth=3;c.fillRect(-12,-23,24,40);c.strokeRect(-12,-23,24,40);c.lineWidth=.7;for(let y=-20;y<16;y+=5){c.beginPath();c.moveTo(-11,y);c.lineTo(11,y);c.stroke();}for(let x=-8;x<12;x+=5){c.beginPath();c.moveTo(x,-22);c.lineTo(x,16);c.stroke();}c.restore();}
 if(e.hurt!>.05){c.save();c.globalCompositeOperation='screen';if(newEnemyIds.includes(e.kind)){c.globalAlpha=.5;articulated(c,img,e,e.x,e.y-lift,size,s.x<e.x,reduced);}else frame(c,img,f,e.x,e.y-lift,size,size,s.x<e.x,.5,lean);c.restore();}
 if(e.slow>0||e.stun!>0){artCell(c,images['v10-munitions'],1,4,4,e.x,e.y-3,size*.45,16,0,.5);if(e.stun!>0)for(let i=0;i<3;i++)circle(c,e.x+Math.cos(t*5+i*2)*13,e.y-size*.83,2,'#ffeb88');}
 if(e.burn!>0)artCell(c,images['v10-effects'],8+Math.floor(t*8)%4,4,4,e.x,e.y-18,40,40,0,.6);
 if(e.elite||e.enraged)text(c,e.elite?(e.elite==='runner'?'疾走精英':'重甲精英'):'狂怒',e.x,e.y-size*.88,e.enraged?'#ffbb7e':'#ffe7a0',10);
 if(e.elite||e.hp<e.max){const w=e.elite?50:30;c.fillStyle='#492b22';c.fillRect(e.x-w/2,e.y-size*.81,w,4);c.fillStyle=e.elite?'#efb955':'#a3db54';c.fillRect(e.x-w/2,e.y-size*.81,w*Math.max(0,e.hp/e.max),4);}
}
function projectiles(c:CanvasRenderingContext2D,s:Run,images:Images,t:number){const atlas=images['v10-munitions'];for(const p of s.shots){if(!visible(s,p.x,p.y,100))continue;const age=p.age||0,jump=p.lob?Math.sin(Math.min(1,age/(p.totalLife||.7))*Math.PI)*85:0,key=p.butter?'butter':p.kind==='pea'&&s.plants.torchwood?'fire':p.kind,index=projectileCell[key]??0,size=p.kind==='mushroom'?32+age*16:p.lob?27:p.kind==='boomerang'?31:p.kind==='cactus'?25:19;
 if(p.lob)shadow(c,p.x,p.y,8);
 if(p.kind==='boomerang'&&p.trail)for(let i=0;i<p.trail.length;i+=3){const v=p.trail[i];artCell(c,atlas,3,4,4,v.x,v.y-7,24,24,age*23,.08+i*.015);}
 artCell(c,atlas,index,4,4,p.x,p.y-7-jump,size,size,p.kind==='boomerang'||p.kind==='starfruit'?age*18:p.lob?age*4:Math.atan2(p.vy,p.vx));}
 for(const b of s.beams){if(Math.max(b.x,b.toX)<s.cameraX-20||Math.min(b.x,b.toX)>s.cameraX+s.width+20||Math.max(b.y,b.toY)<s.cameraY-20||Math.min(b.y,b.toY)>s.cameraY+s.height+20)continue;const dx=b.toX-b.x,dy=b.toY-b.y,dist=Math.hypot(dx,dy);artCell(c,atlas,b.kind==='laser'?13:b.kind==='bonk'?0:14,4,4,(b.x+b.toX)/2,(b.y+b.toY)/2-8,dist,b.kind==='laser'?b.width*3:35,Math.atan2(dy,dx),b.life/b.maxLife);}
}
function events(c:CanvasRenderingContext2D,s:Run,images:Images,t:number){let numbers=0,sparks=0;for(let index=s.events.length-1;index>=0;index--){const ev=s.events[index];if(ev.type==='hit'&&sparks++>48)continue;const age=t-ev.time;if(age<0||age>1.1||!visible(s,ev.x,ev.y,140))continue;
 if(ev.type==='death'){const size=enemyFrameSize(ev.kind,ev.value===2,ev.value===1);if(newEnemyIds.includes(ev.kind))articulated(c,images['anim-'+ev.kind],{kind:ev.kind} as Enemy,ev.x,ev.y,size,false,false,age);else frame(c,images['anim-'+(ev.kind==='door'?'zombie':ev.kind)],12+Math.min(3,Math.floor(age/.8*4)),ev.x,ev.y,size,size,false,Math.min(1,(1.1-age)/.5),newEnemyIds.includes(ev.kind)||bossIds.includes(ev.kind)&&ev.kind!=='boss-trim'?Math.min(1,age*3)*1.2:0);}
 if(['hit','pickup','level','evolution','hurt','heal'].includes(ev.type)&&age<.6){const size=ev.type==='level'||ev.type==='evolution'?90:ev.type==='pickup'?20:ev.type==='heal'?65:38;rasterBurst(c,images['v10-effects'],ev.kind,age,ev.x,ev.y-15,size);}
 if(ev.type==='hit'&&ev.value>=1&&age<.55&&numbers++<tokens.combat.maxDamageLabels){c.save();c.globalAlpha=Math.min(1,(.55-age)*4);text(c,String(Math.ceil(ev.value)),ev.x,ev.y-30-age*28,'#fff3bc');c.restore();}
 if(ev.type==='pickup'&&ev.kind!=='sun'&&age<.7){c.save();c.globalAlpha=1-age/.7;text(c,`+${ev.value}${ev.kind==='gem'?' 钻石':ev.kind==='heal'?' 生命':' 金币'}`,ev.x,ev.y-18-age*25,ev.kind==='gem'?'#a8efff':'#ffe094');c.restore();}
 }}
function navigation(c:CanvasRenderingContext2D,s:Run){
 for(const e of s.enemies){if(!e.boss&&!e.elite)continue;const ex=e.x-s.cameraX,ey=e.y-s.cameraY;if(ex>22&&ex<s.width-22&&ey>85&&ey<s.height-22)continue;const dx=ex-s.width/2,dy=ey-s.height/2,factor=Math.min((s.width/2-22)/Math.max(1,Math.abs(dx)),(s.height/2-45)/Math.max(1,Math.abs(dy))),ax=clamp(s.width/2+dx*factor,20,s.width-20),ay=clamp(s.height/2+dy*factor,88,s.height-72);c.save();c.translate(ax,ay);c.rotate(Math.atan2(dy,dx));c.fillStyle=e.boss?tokens.colors['danger-light']:tokens.colors['sun-light'];c.strokeStyle=tokens.colors['wood'];c.lineWidth=2;c.beginPath();c.moveTo(10,0);c.lineTo(-7,-7);c.lineTo(-4,0);c.lineTo(-7,7);c.closePath();c.fill();c.stroke();c.restore();}
}
function latestShot(s:Run,id:string){for(let i=s.events.length-1;i>=0;i--)if(s.events[i].type==='shoot'&&s.events[i].kind===id)return s.events[i];}
const actorLists=new WeakMap<CanvasRenderingContext2D,Enemy[]>();
export function renderBattle(c:CanvasRenderingContext2D,s:Run,images:Images,endTime=0,reduced=false){const t=s.time+endTime;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,c.canvas.width,c.canvas.height);c.save();c.scale(c.canvas.width/s.width,c.canvas.height/s.height);c.save();c.translate(-s.cameraX,-s.cameraY);terrain(c,s,images);groundImpacts(c,s,t,images['v10-effects']);for(const e of s.enemies)if(visible(s,e.x,e.y,260))enemyTelegraph(c,e,t);c.save();c.globalAlpha=tokens.combat.friendlyOpacity;zones(c,s,images,reduced?0:t);c.restore();loot(c,s,images,t,reduced);
 const decor=nearbyProps(s).filter(p=>p.index!==7).sort((a,b)=>a.y-b.y);let decorIndex=0;const drawDecor=(y:number)=>{while(decorIndex<decor.length&&decor[decorIndex].y<y){const p=decor[decorIndex++];groundedProp(c,p,images['garden-props'],s.stage,Math.hypot(p.x-s.x,p.y-s.y)<65?.45:1);}};const weapons=Object.keys(s.plants).filter(k=>activePlants.includes(k));const drawWeapons=(front:boolean)=>{for(const id of weapons){const p=weaponPosition(s,id);if((p.y>=s.y-25)!==front)continue;const ev=latestShot(s,id),age=t-(ev?.time??-10),pulse=age>=0&&age<.2?Math.sin(age/.2*Math.PI)*4:0;shadow(c,p.x,p.y+16,10);sprite(c,images[id],p.x,p.y,35+pulse);}};drawWeapons(false);const actors=actorLists.get(c)||[];actorLists.set(c,actors);actors.length=0;for(const enemy of s.enemies)if(visible(s,enemy.x,enemy.y))actors.push(enemy);actors.sort((a,b)=>a.y-b.y);let heroDrawn=false;const drawHero=()=>{shadow(c,s.x,s.y,s.hero==='dave'?19:15);const size=heroFrameSize[s.hero],age=t-s.hitAt,hit=age>=0&&age<.3,force=hit?1-age/.3:0,lean=reduced?0:-s.facing*Math.sin(Math.max(0,age)/.3*Math.PI)*force*.12,img=images['anim-'+heroes[s.hero].art],f=heroAnimationFrame(s,endTime,reduced);c.save();if(hit&&!reduced)c.translate(-s.facing*5*Math.sin(age/.3*Math.PI),-4*Math.sin(age/.3*Math.PI));frame(c,img,f,s.x,s.y,size,size,s.facing<0,!reduced&&s.invulnerable>0&&Math.sin(t*25)>0?.72:1,hit?lean:0);
 if(hit){c.save();c.globalCompositeOperation='screen';frame(c,img,f,s.x,s.y,size,size,s.facing<0,force*.8,lean);c.restore();if(!reduced){c.save();c.globalAlpha=force;c.strokeStyle=tokens.colors['danger-light'];c.lineWidth=2;for(let i=0;i<6;i++){const a=i*tau/6,r=19+(1-force)*15;c.beginPath();c.moveTo(s.x+Math.cos(a)*r,s.y-30+Math.sin(a)*r);c.lineTo(s.x+Math.cos(a)*(r+9*force),s.y-30+Math.sin(a)*(r+9*force));c.stroke();}c.restore();}}c.restore();};for(const enemy of actors){if(!heroDrawn&&enemy.y>s.y){drawDecor(s.y);drawHero();heroDrawn=true;}drawDecor(enemy.y);actor(c,s,enemy,images,t,reduced);}if(!heroDrawn){drawDecor(s.y);drawHero();}drawDecor(Infinity);drawWeapons(true);
 c.save();c.globalAlpha=tokens.combat.friendlyOpacity;events(c,s,images,reduced?Math.floor(t*6)/6:t);projectiles(c,s,images,reduced?Math.floor(t*6)/6:t);c.restore();for(const p of s.hostileShots)if(visible(s,p.x,p.y,24))artCell(c,images['v10-munitions'],15,4,4,p.x,p.y,30,30,Math.atan2(p.vy,p.vx));heroOutline(c,s,images,endTime,reduced);
 // Draw above enemies and friendly FX, even if the capped combat event queue evicted the hit.
 const hurtAge=t-s.hitAt;
 if(hurtAge>=0&&hurtAge<.65&&s.lastHitAmount){
  c.save();const fade=Math.min(1,(.65-hurtAge)*5);c.globalAlpha=fade;
  const lift=reduced?0:Math.min(1,hurtAge/.35)*12;
  const x=s.x,y=s.y-heroFrameSize[s.hero]*.66-lift;
  c.font='1000 19px system-ui';c.textAlign='center';c.lineJoin='round';c.lineWidth=5;
  const label='−'+s.lastHitAmount;c.strokeStyle='#512620';c.strokeText(label,x,y);c.fillStyle='#fff2cc';c.fillText(label,x,y);
  if(!reduced&&hurtAge<.23){c.translate(s.x,s.y-30);c.strokeStyle='#ffda87';c.lineWidth=3;for(let i=0;i<7;i++){c.rotate(tau/7);c.beginPath();c.moveTo(25+hurtAge*35,0);c.lineTo(36+hurtAge*45,0);c.stroke();}}
  c.restore();
 }
 if(s.evolved)text(c,evolutionRecipe(s.starter).name,s.x,s.y+34,tokens.colors['sun-light'],10);c.restore();navigation(c,s);if(!reduced&&t-s.hitAt>=0&&t-s.hitAt<.25){c.fillStyle=`rgba(180,30,15,${(.25-(t-s.hitAt))*.45})`;c.fillRect(0,0,s.width,s.height);}c.restore();}
