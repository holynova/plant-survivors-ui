import type {Run} from './simulation.ts';
import {visible} from './world.ts';
import {rasterBurst} from './raster-fx.ts';
export function groundImpacts(c:CanvasRenderingContext2D,s:Run,t:number,atlas?:HTMLImageElement){for(const ev of s.events){const age=t-ev.time;if(age<0||age>.6||!visible(s,ev.x,ev.y,250)||!['slam','burst','pulse','summon','bite','treasure','heal'].includes(ev.type))continue;const size=ev.type==='heal'?60:Math.min(190,Math.max(32,(ev.value||45)*1.6));rasterBurst(c,atlas,ev.type==='slam'?'slam':ev.kind,age,ev.x,ev.y-8,size,ev.type==='slam'?.8:.65);}}
