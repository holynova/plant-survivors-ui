import {enemySize} from './balance.ts';
import type {Run,Enemy} from './simulation.ts';
import {heroes} from './catalog.ts';
export const animationAssets=['dave','flora','rusty','zombie','cone','bucket','boss-trim','plants','fx'];
export const sceneAssets=['battle-bg','battle-night','battle-roof','sun','sunflower','walnut'];
export type Images=Record<string,HTMLImageElement>;
export function animationFrame(time:number,row:number,phase=0){return row*4+Math.floor(Math.max(0,time)*10+phase)%4;}
export function heroAnimationFrame(s:Run,endTime=0,reduced=false){
 if(s.status==='lost')return 12+Math.min(3,Math.floor(endTime/.75*4));
 const hitAge=s.time+endTime-s.hitAt;
 if(hitAge>=0&&hitAge<.3)return 8+Math.min(3,Math.floor(hitAge/.3*4));
 return s.moving&&!reduced?Math.floor(s.stride)%4:0;
}
function frame(ctx:CanvasRenderingContext2D,img:HTMLImageElement,index:number,x:number,y:number,w:number,h:number,flip=false,alpha=1){ctx.save();ctx.translate(x,y);ctx.scale(flip?-1:1,1);ctx.globalAlpha=alpha;const tw=img.width/4,th=img.height/4;ctx.drawImage(img,index%4*tw,Math.floor(index/4)*th,tw,th,-w/2,-h*.84,w,h);ctx.restore();}
function sprite(ctx:CanvasRenderingContext2D,img:HTMLImageElement|undefined,x:number,y:number,w:number,h:number,angle=0,alpha=1){if(!img)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(img,-w/2,-h/2,w,h);ctx.restore();}
function circle(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function shadow(ctx:CanvasRenderingContext2D,x:number,y:number,w:number){ctx.fillStyle='#19331338';ctx.beginPath();ctx.ellipse(x,y+6,w,.22*w,0,0,Math.PI*2);ctx.fill();}
export function renderBattle(ctx:CanvasRenderingContext2D,s:Run,images:Images,endTime=0,reduced=false){
 const t=s.time+endTime;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.save();ctx.scale(ctx.canvas.width/s.width,ctx.canvas.height/s.height);const shake=!reduced&&t-s.hitAt<.18?Math.sin(t*80)*1.1:0;ctx.translate(shake,0);
 const bg=images[['battle-bg','battle-night','battle-roof'][s.stage]],cover=Math.max(s.width/bg.width,s.height/bg.height);ctx.drawImage(bg,(s.width-bg.width*cover)/2,(s.height-bg.height*cover)/2,bg.width*cover,bg.height*cover);
 // Small ambient fireflies / pollen, independent of combat readability.
 for(let i=0;i<10;i++){const x=(i*47+Math.sin(t*.3+i)*12)%s.width,y=85+(i*61)%(s.height-160);circle(ctx,x,y,1.3,s.stage===1?'#b8f1ca88':'#fff3a044');}
 for(const e of s.enemies){
  const impact=e.boss?.28:.12;
  if((e.boss||e.elite)&&(e.attack||0)>impact){const progress=1-(e.attack!-impact)/((e.attackDuration||1.2)-impact),radius=e.boss?72:50;ctx.fillStyle='#d8403540';ctx.strokeStyle='#ffe0a5';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.aimX!,e.aimY!,radius,0,Math.PI*2);ctx.fill();ctx.stroke();circle(ctx,e.aimX!,e.aimY!,radius*progress,'#ff735355');}
  if((e.chargeWindup||0)>0){const dx=e.chargeX!-e.x,dy=e.chargeY!-e.y,d=Math.hypot(dx,dy)||1;ctx.strokeStyle='#d8403548';ctx.lineWidth=70;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+dx/d*156,e.y+dy/d*156);ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle='#ffd180';ctx.stroke();ctx.lineCap='butt';}
 }
 for(const d of s.drops){const glow=1+Math.sin(t*4+d.x)*.09;sprite(ctx,images.sun,d.x,d.y+Math.sin(t*3+d.x)*2,20*glow,20*glow);}
 const actors:Array<{y:number,enemy?:Enemy}>=[...s.enemies.map(enemy=>({y:enemy.y,enemy})),{y:s.y}];actors.sort((a,b)=>a.y-b.y);
 for(const a of actors){const e=a.enemy;if(e){shadow(ctx,e.x,e.y,e.boss?35:e.elite?29:14);if(e.elite){ctx.strokeStyle=e.elite==='runner'?'#ffe170':'#ffb477';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y+4,32,11,0,0,Math.PI*2);ctx.stroke();ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff0b3';ctx.strokeStyle='#563614';ctx.lineWidth=3;const label=e.elite==='runner'?'疾走精英':(e.attack||0)>0?'破绽！':'重甲精英';ctx.strokeText(label,e.x,e.y-105);ctx.fillText(label,e.x,e.y-105);}if(e.enraged){circle(ctx,e.x,e.y-25,38,'#d94c2225');}const row=(e.hurt||0)>0?2:(e.attack||0)>0?1:0;const atk=e.attackDuration||(e.boss?1.2:.48);let f=row===1?4+Math.min(3,Math.floor((1-e.attack!/atk)*4)):row===2?8+Math.min(3,Math.floor((.18-e.hurt!)/.18*4)):animationFrame(t*.6*(e.slow>0?.45:1),0,e.id);if(reduced&&row===0)f=0;const size=e.boss?enemySize.boss:e.elite?enemySize.elite:enemySize.normal;frame(ctx,images['anim-'+e.kind],f,e.x,e.y,size,size,s.x<e.x);if(e.slow>0){ctx.strokeStyle='#90e8ff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y,19,7,0,0,Math.PI*2);ctx.stroke();}
 if((e.hurt||0)>.12){ctx.save();ctx.globalCompositeOperation='screen';frame(ctx,images['anim-'+e.kind],f,e.x,e.y,size,size,s.x<e.x,.65);ctx.restore();}
 if(e.elite||e.hp<e.max){const bar=e.elite?50:30;ctx.fillStyle='#492b22';ctx.fillRect(e.x-bar/2,e.y-size*.83,bar,4);ctx.fillStyle='#a3db54';ctx.fillRect(e.x-bar/2,e.y-size*.83,bar*e.hp/e.max,4);}
 }else{shadow(ctx,s.x,s.y,24);const f=heroAnimationFrame(s,endTime,reduced); // Plant recoil stays independent of locomotion.
 const heroSize=s.hero==='dave'?94:82;frame(ctx,images['anim-'+heroes[s.hero].art],f,s.x,s.y,heroSize,heroSize,s.facing<0,s.invulnerable>0&&Math.sin(t*45)>0?.6:1);
 ctx.fillStyle=heroes[s.hero].color;ctx.beginPath();ctx.ellipse(s.x,s.y+5,19,5,0,0,Math.PI*2);ctx.globalAlpha=.25;ctx.fill();ctx.globalAlpha=1;
 const latestShots:Record<string,number>={};for(const ev of s.events)if(ev.type==='shoot')latestShots[ev.kind]=ev.time;
 const plants=Object.keys(s.plants).filter(k=>['pea','ice','boomerang','mushroom'].includes(k));plants.forEach((kind,i)=>{const angle=-Math.PI/2+(i-(plants.length-1)/2)*.7;const x=s.x+Math.cos(angle)*33,y=s.y+Math.sin(angle)*30;const age=t-(latestShots[kind]??-10);const col=age<.32?Math.min(3,Math.floor(age/.32*4)):0;const row=['pea','ice','boomerang','mushroom'].indexOf(kind);frame(ctx,images['anim-plants'],row*4+col,x,y,32,32,s.facing<0);});
 if(s.plants.walnut){ctx.strokeStyle='#e4cb7b70';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s.x,s.y-15,34,38,0,0,Math.PI*2);ctx.stroke();}
 }}
 for(const ev of s.events){const age=t-ev.time;if(age<0||age>1.1)continue;
 if(ev.type==='death'){const size=ev.value===1?enemySize.boss:ev.value===2?enemySize.elite:enemySize.normal;frame(ctx,images['anim-'+ev.kind],12+Math.min(3,Math.floor(age/.8*4)),ev.x,ev.y,size,size,false,Math.min(1,(1.1-age)/.35));}
 if(['hit','slam','pickup','level','evolution','hurt'].includes(ev.type)){const duration=ev.type==='slam'?.65:.45;if(age<duration){const row=ev.type==='level'||ev.type==='evolution'||ev.type==='pickup'?3:ev.kind==='ice'?1:ev.kind==='mushroom'?2:0;const size=ev.type==='slam'?145:ev.type==='level'||ev.type==='evolution'?100:ev.type==='pickup'?32:48;frame(ctx,images['anim-fx'],row*4+Math.min(3,Math.floor(age/duration*4)),ev.x,ev.y+size*.32,size,size,false,1-age/duration*.4);}
 if((ev.type==='hit'||ev.type==='hurt')&&age<.65){ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#4b2c26';ctx.fillStyle=ev.type==='hurt'?'#ff9c88':'#fff3bc';ctx.globalAlpha=Math.min(1,(.65-age)*4);const label=String(Math.ceil(ev.value));ctx.strokeText(label,ev.x,ev.y-30-age*28);ctx.fillText(label,ev.x,ev.y-30-age*28);ctx.globalAlpha=1;}}
 if(ev.type==='shoot'&&age<.16){const a=age/.16;ctx.strokeStyle=ev.kind==='ice'?'#9ceaff':'#ffe492';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ev.x,ev.y,12+a*12,0,Math.PI*2);ctx.stroke();}
 }
 for(const p of s.shots){
  const age=p.age||0,angle=Math.atan2(p.vy,p.vx);
  if(p.kind==='boomerang'&&p.trail?.length){ctx.strokeStyle=p.returning?'#fff1a9aa':'#e7b84e88';ctx.lineWidth=3;ctx.beginPath();p.trail.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.lineTo(p.x,p.y);ctx.stroke();}
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);
  if(p.kind==='boomerang'){ctx.rotate(age*23);ctx.lineJoin='round';ctx.strokeStyle='#774828';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-10,-6);ctx.lineTo(0,5);ctx.lineTo(10,-6);ctx.stroke();ctx.strokeStyle=p.returning?'#fff1a9':'#f8d268';ctx.lineWidth=4;ctx.stroke();}
  else if(p.kind==='mushroom'){const radius=5+age*11;circle(ctx,0,0,radius,'#9e5bd760');circle(ctx,0,0,radius*.65,'#c896e5b0');for(let i=0;i<3;i++)circle(ctx,Math.cos(i*2.1+age*3)*radius*.7,Math.sin(i*2.1+age*3)*radius*.7,2,'#f3ccff');}
  else if(p.kind==='ice'){ctx.strokeStyle='#9cedff99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-23,-3);ctx.lineTo(-7,0);ctx.moveTo(-18,4);ctx.lineTo(-7,0);ctx.stroke();ctx.fillStyle='#8adaff';ctx.strokeStyle='#e8fcff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-3,-6);ctx.lineTo(-8,0);ctx.lineTo(-3,6);ctx.closePath();ctx.fill();ctx.stroke();}
  else{ctx.strokeStyle='#a6dd5570';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(-2,0);ctx.stroke();circle(ctx,0,0,6,'#75b92d');circle(ctx,-1,-1.5,2.5,'#ddff9b');}ctx.restore();
 }
 if(s.blast.time>0){for(let i=0;i<8;i++){const a=i*Math.PI/4,age=(.25-s.blast.time)/.25;frame(ctx,images['anim-fx'],8+Math.min(3,Math.floor(age*4)),s.blast.x+Math.cos(a)*age*85,s.blast.y+Math.sin(a)*age*85,48,48,false,1-age*.4);}}
 if(t-s.hitAt<.25){ctx.fillStyle=`rgba(180,30,15,${(.25-(t-s.hitAt))*.45})`;ctx.fillRect(0,0,s.width,s.height);}ctx.restore();
}
