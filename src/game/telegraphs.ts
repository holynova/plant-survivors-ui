import type {Enemy} from './simulation.ts';
import {attackGeometry as g,impactRadius} from './attack-geometry.ts';
import tokens from '../design/tokens.json' with {type:'json'};
const p=tokens.colors,tau=Math.PI*2;
// One fill, no concentric border stack. Geometry remains exactly the damage footprint.
export function dangerRing(c:CanvasRenderingContext2D,x:number,y:number,r:number,progress:number,t:number,outline=false){if(outline)return;progress=Math.max(0,Math.min(1,progress));c.save();c.globalAlpha=.12+progress*.22;c.fillStyle=p.danger;c.beginPath();c.arc(x,y,r,0,tau);c.fill();c.globalAlpha=.16+progress*.18;c.beginPath();c.arc(x,y,Math.max(2,r*progress),0,tau);c.fill();c.globalAlpha=.65;c.fillStyle=p['danger-light'];c.fillRect(x-1,y-5,2,6);c.fillRect(x-1,y+3,2,2);c.restore();}
export function enemyTelegraph(c:CanvasRenderingContext2D,e:Enemy,t:number,outline=false){if(outline)return;const impact=e.boss?.28:.12;
 if((e.boss||e.elite)&&(e.attack||0)>impact)dangerRing(c,e.aimX!,e.aimY!,impactRadius(e),1-(e.attack!-impact)/((e.attackDuration||1.2)-impact),t);
 if((e.chargeWindup||0)>0){const a=Math.atan2(e.chargeY!-e.y,e.chargeX!-e.x),progress=1-e.chargeWindup!/g.chargeWindup,length=g.chargeSpeed*g.chargeDuration,r=g.chargeRadius;c.save();c.translate(e.x,e.y);c.rotate(a);c.beginPath();c.moveTo(0,-r);c.lineTo(length,-r);c.arc(length,0,r,-Math.PI/2,Math.PI/2);c.lineTo(0,r);c.arc(0,0,r,Math.PI/2,Math.PI*1.5);c.closePath();c.globalAlpha=.14+progress*.18;c.fillStyle=p.danger;c.fill();c.globalAlpha=.5;c.fillStyle=p['danger-light'];c.beginPath();c.moveTo(length-10,0);c.lineTo(length-24,-7);c.lineTo(length-24,7);c.closePath();c.fill();c.restore();}
 if((e.burrow||0)>0)dangerRing(c,e.aimX!,e.aimY!,25,1-e.burrow!/2.2,t);
}
