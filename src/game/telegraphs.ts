import type {Enemy} from './simulation.ts';
const tau=Math.PI*2;
export function dangerRing(c:CanvasRenderingContext2D,x:number,y:number,r:number,progress:number,t:number){
 c.save();c.translate(x,y);const g=c.createRadialGradient(0,0,r*.25,0,0,r);g.addColorStop(0,'#f23b2510');g.addColorStop(.75,'#c7332440');g.addColorStop(1,'#ff653a88');c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,tau);c.fill();
 c.strokeStyle='#582d25cc';c.lineWidth=6;c.stroke();c.strokeStyle='#ffd78b';c.lineWidth=2;c.stroke();
 c.setLineDash([5,7]);c.strokeStyle='#fff0ba99';c.lineWidth=1;c.beginPath();c.arc(0,0,r-7,0,tau);c.stroke();c.setLineDash([]);
 c.strokeStyle='#ffbe62';c.lineWidth=4;c.beginPath();c.arc(0,0,r+4,-Math.PI/2,-Math.PI/2+tau*progress);c.stroke();
 c.strokeStyle='#ffe2a1aa';c.lineWidth=1.5;c.beginPath();c.arc(0,0,r*(1-progress),0,tau);c.stroke();
 for(let i=0;i<8;i++){c.save();c.rotate(i*tau/8);c.fillStyle='#fff0b9';c.beginPath();c.moveTo(r-13,-3);c.lineTo(r-18,0);c.lineTo(r-13,3);c.fill();c.restore();}
 c.globalAlpha=.65+Math.sin(t*8)*.15;c.strokeStyle='#ffe2a1';c.lineWidth=2;c.beginPath();c.moveTo(-7,0);c.lineTo(7,0);c.moveTo(0,-7);c.lineTo(0,7);c.stroke();c.restore();
}
export function enemyTelegraph(c:CanvasRenderingContext2D,e:Enemy,t:number){
 const impact=e.boss?.28:.12;
 if((e.boss||e.elite)&&(e.attack||0)>impact)dangerRing(c,e.aimX!,e.aimY!,e.boss?72:50,1-(e.attack!-impact)/((e.attackDuration||1.2)-impact),t);
 if((e.chargeWindup||0)>0){const a=Math.atan2(e.chargeY!-e.y,e.chargeX!-e.x),progress=1-e.chargeWindup!/.85;c.save();c.translate(e.x,e.y);c.rotate(a);const g=c.createLinearGradient(0,0,202,0);g.addColorStop(0,'#bc3e2b18');g.addColorStop(1,'#f95f447d');c.fillStyle=g;c.fillRect(0,-35,202,70);c.strokeStyle='#ffd995';c.lineWidth=2;c.strokeRect(0,-35,202,70);c.fillStyle='#ff9c4a40';c.fillRect(0,-35,202*progress,70);c.strokeStyle='#fff0c0';c.lineWidth=3;for(let x=32;x<202;x+=40){c.beginPath();c.moveTo(x-7,-10);c.lineTo(x+5,0);c.lineTo(x-7,10);c.stroke();}c.restore();}
 if((e.burrow||0)>0)dangerRing(c,e.aimX!,e.aimY!,25,1-e.burrow!/2.2,t);
 if((e.cast||0)>0){c.save();c.setLineDash([4,7]);c.strokeStyle='#e6b7ff99';c.lineWidth=1.5;c.beginPath();c.moveTo(e.x,e.y-20);c.lineTo(e.aimX!,e.aimY!);c.stroke();c.restore();}
}
