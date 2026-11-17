import {activePlants} from './plants.ts';
/** Shared world-space muzzle and sprite position: one stable slot per equipped weapon. */
export function weaponPosition(s:{x:number;y:number;time:number;plants:Record<string,number>},kind:string){const ids=Object.keys(s.plants).filter(id=>activePlants.includes(id)),i=Math.max(0,ids.indexOf(kind)),a=-Math.PI/2+i*Math.PI*2/Math.max(1,ids.length)+s.time*.22,r=ids.length>4?72:62;return{x:s.x+Math.cos(a)*r,y:s.y-26+Math.sin(a)*r*.72};}
