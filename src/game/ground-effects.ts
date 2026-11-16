import tokens from '../design/tokens.json' with {type:'json'};
import type {Run} from './simulation.ts';
import {visible} from './world.ts';
const p=tokens.colors,tau=Math.PI*2;
function ring(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,Math.max(0,r),0,tau);c.stroke();}
// Ground-only impacts stay below feet, with a bounded lifetime and no entity allocations.
export function groundImpacts(c:CanvasRenderingContext2D,s:Run,t:number){for(const ev of s.events){const age=t-ev.time;if(age<0||age>1.1||!visible(s,ev.x,ev.y,250)||!['slam','burst','pulse','summon'].includes(ev.type))continue;
 const hostile=ev.type==='slam'||ev.type==='summon'||ev.kind==='dirt',ice=ev.kind==='iceberg',magic=ev.kind==='magnet',radius=Math.max(12,ev.value||45),progress=Math.min(1,age/.5),color=hostile?p.danger:ice?p.frost:magic?p.magic:p.sun;
 c.save();c.globalAlpha=(1-age/1.1)*.6;c.fillStyle=hostile?p['danger-dark']:ice?p.gem:p['wood-dark'];c.beginPath();c.ellipse(ev.x,ev.y,radius*.85,radius*.85,0,0,tau);c.fill();
 c.globalAlpha=(1-progress)*.85;ring(c,ev.x,ev.y,radius*progress,color,5*(1-progress)+1);ring(c,ev.x,ev.y,radius*progress*.7,p.white,1);
 c.globalAlpha=(1-age/1.1)*.65;c.strokeStyle=color;c.lineWidth=1.5;
 for(let i=0;i<8;i++){const a=i*tau/8+ev.id*.7,r=radius*(.35+((i*7)%5)*.1);c.beginPath();c.moveTo(ev.x+Math.cos(a)*radius*.12,ev.y+Math.sin(a)*radius*.12);c.lineTo(ev.x+Math.cos(a+.12)*r*.65,ev.y+Math.sin(a+.12)*r*.65);c.lineTo(ev.x+Math.cos(a)*r,ev.y+Math.sin(a)*r);c.stroke();}
 if(ice||magic){c.setLineDash(magic?[10,8]:[2,8]);ring(c,ev.x,ev.y,radius*(.8+progress*.2),color,2);}c.restore();
}}
