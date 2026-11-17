import type {Enemy} from './simulation.ts';
import {attackGeometry as g,impactRadius} from './attack-geometry.ts';
import tokens from '../design/tokens.json' with {type:'json'};
const p=tokens.colors,tau=Math.PI*2;
export function dangerRing(c:CanvasRenderingContext2D,x:number,y:number,r:number,progress:number,t:number,outline=false){
 progress=Math.max(0,Math.min(1,progress));c.save();c.translate(x,y);
 c.fillStyle=p['danger-dark'];c.globalAlpha=.26+progress*.14;c.beginPath();c.arc(0,0,r,0,tau);if(!outline)c.fill();
 c.globalAlpha=1;c.strokeStyle=p['danger-dark'];c.lineWidth=5;c.stroke();c.strokeStyle=p.danger;c.lineWidth=2;c.stroke();
 c.globalAlpha=.32;c.fillStyle=p.danger;c.beginPath();c.moveTo(0,0);c.arc(0,0,r-3,-Math.PI/2,-Math.PI/2+tau*progress);c.closePath();if(!outline)c.fill();
 c.globalAlpha=.9;c.strokeStyle=p['danger-light'];c.lineWidth=3;c.beginPath();c.arc(0,0,r,-Math.PI/2,-Math.PI/2+tau*progress);c.stroke();
 c.setLineDash([4,6]);c.globalAlpha=.55;c.lineWidth=1;c.beginPath();c.arc(0,0,Math.max(1,r-7),0,tau);c.stroke();c.setLineDash([]);
 c.globalAlpha=.9;c.strokeStyle=p['danger-light'];c.lineWidth=2;for(let i=0;i<4;i++){const a=i*tau/4;c.beginPath();c.moveTo(Math.cos(a)*(r-13),Math.sin(a)*(r-13));c.lineTo(Math.cos(a)*(r-5),Math.sin(a)*(r-5));c.stroke();}
 c.globalAlpha=.75+Math.sin(t*8)*.15;c.fillStyle=p.white;c.fillRect(-1.5,-7,3,8);c.fillRect(-1.5,4,3,3);c.restore();
}
export function enemyTelegraph(c:CanvasRenderingContext2D,e:Enemy,t:number,outline=false){
 const impact=e.boss?.28:.12;
 if((e.boss||e.elite)&&(e.attack||0)>impact)dangerRing(c,e.aimX!,e.aimY!,impactRadius(e),1-(e.attack!-impact)/((e.attackDuration||1.2)-impact),t,outline);
 if((e.chargeWindup||0)>0){const a=Math.atan2(e.chargeY!-e.y,e.chargeX!-e.x),progress=1-e.chargeWindup!/g.chargeWindup,length=g.chargeSpeed*g.chargeDuration,r=g.chargeRadius;c.save();c.translate(e.x,e.y);c.rotate(a);
 // Capsule includes the charging body's radius at both endpoints.
 c.beginPath();c.moveTo(0,-r);c.lineTo(length,-r);c.arc(length,0,r,-Math.PI/2,Math.PI/2);c.lineTo(0,r);c.arc(0,0,r,Math.PI/2,Math.PI*1.5);c.closePath();c.globalAlpha=.3;c.fillStyle=p['danger-dark'];if(!outline)c.fill();c.globalAlpha=.9;c.strokeStyle=p.danger;c.lineWidth=2;c.stroke();c.save();c.clip();c.globalAlpha=.25;c.fillStyle=p.danger;if(!outline)c.fillRect(-r,-r,(length+r*2)*progress,r*2);c.restore();
 c.globalAlpha=.85;c.strokeStyle=p['danger-light'];c.lineWidth=2;for(let x=28;x<length;x+=36){c.beginPath();c.moveTo(x-6,-7);c.lineTo(x+3,0);c.lineTo(x-6,7);c.stroke();}c.restore();}
 if((e.burrow||0)>0)dangerRing(c,e.aimX!,e.aimY!,25,1-e.burrow!/2.2,t,outline);
 if((e.cast||0)>0){c.save();c.setLineDash([5,7]);c.strokeStyle=p['danger-light'];c.globalAlpha=.6;c.lineWidth=1.5;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.aimX!,e.aimY!);c.stroke();c.restore();dangerRing(c,e.aimX!,e.aimY!,12,1-e.cast!/.65,t,outline);}
}
