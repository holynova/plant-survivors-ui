import type {Enemy} from './simulation.ts';
export type EnemyPose={state:'walk'|'windup'|'strike'|'hurt'|'death';frame:number;body:number;arm:number;leg:number;scaleY:number;fall:number};
/** Cutout pose controller for the eight single-row enemies. Anchors stay at ground contact. */
export function enemyPose(e:Enemy,deathAge=-1,reduced=false):EnemyPose{
 if(deathAge>=0){const t=Math.min(1,deathAge/.7);return{state:'death',frame:0,body:t*.4,arm:-t*1.1,leg:t*.65,scaleY:1-t*.45,fall:t*1.25};}
 if((e.hurt||0)>0)return{state:'hurt',frame:0,body:-.10,arm:-.22,leg:0,scaleY:.95,fall:0};
 const wind=(e.cast||0)>0?1-e.cast!/.65:(e.chargeWindup||0)>0?1-e.chargeWindup!/.75:(e.attack||0)>0?1-e.attack!/(e.attackDuration||.48):0;
 if((e.cast||0)>0||(e.chargeWindup||0)>0||(e.attack||0)>0){const strike=wind>.65,football=e.kind==='football';return{state:strike?'strike':'windup',frame:0,body:football?.18:Math.sin(wind*Math.PI)*.08,arm:football?-.35:strike?.65:-.9*wind,leg:football?.18:0,scaleY:football?.92:1,fall:0};}
 return{state:'walk',frame:reduced?0:Math.floor(e.stride||0)%4,body:0,arm:0,leg:0,scaleY:1,fall:0};
}
