import {createRun,type Run} from './simulation.ts';
import {plants} from './plants.ts';
import {heroes} from './catalog.ts';
export const FIXED_STEP=1/60;
/** At most 12 simulation steps/frame; background time is explicitly paused. */
export class SimulationClock {
 private remaining=0;
 overloadSeconds=0;
 get alpha(){return Math.max(0,Math.min(1,this.remaining/FIXED_STEP));}
 reset(){this.remaining=0;}
 advance(seconds:number,tick:(dt:number)=>boolean|void){if(!Number.isFinite(seconds)||seconds<=0)return 0;this.remaining+=Math.min(seconds,.25);this.overloadSeconds+=Math.max(0,seconds-.25);let n=0;while(this.remaining+1e-9>=FIXED_STEP&&n<12){this.remaining-=FIXED_STEP;n++;if(tick(FIXED_STEP)===false){this.reset();break;}}if(this.remaining>=FIXED_STEP){this.overloadSeconds+=this.remaining;this.remaining%=FIXED_STEP;}return n;}
}
export type Preferences={sound:boolean;music:boolean;original:boolean;reduced:boolean;effectsVolume:number;musicVolume:number;warningVolume:number;pool:string[]};
export function parsePreferences(value:unknown,reduced=false):Preferences{const p=(value&&typeof value==='object'?value:{}) as Partial<Preferences>;const volume=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1,v)):.7;return{sound:p.sound!==false,music:p.music!==false,original:p.original!==false,reduced:typeof p.reduced==='boolean'?p.reduced:reduced,effectsVolume:volume(p.effectsVolume),musicVolume:volume(p.musicVolume),warningVolume:volume(p.warningVolume),pool:Array.isArray(p.pool)?[...new Set(p.pool.filter(id=>typeof id==='string'&&plants[id]))]:[]};}
export const CHECKPOINT_KEY='garden-run-v3',PREFERENCES_KEY='garden-preferences-v1';
export function encodeCheckpoint(run:Run){return JSON.stringify({version:3,savedAt:Date.now(),run});}
export function decodeCheckpoint(text:string|null):Run|null{try{if(!text||text.length>2_000_000)return null;const d=JSON.parse(text),r=d.run;if(d.version!==3||!r||!['playing','paused','upgrade'].includes(r.status)||!heroes[r.hero as keyof typeof heroes]||!plants[r.starter]||!Number.isInteger(r.stage)||r.stage<0||r.stage>2||typeof r.runId!=='string'||r.runId.length>100)return null;
 for(const key of ['time','hp','maxHp','x','y','worldWidth','worldHeight','coins','gems','seed','eventId','id','duration','level','nextXp'])if(typeof r[key]!=='number'||!Number.isFinite(r[key]))return null;
 const finite=(v:unknown):boolean=>typeof v==='number'?Number.isFinite(v):v===null||typeof v!=='object'||Object.values(v).every(finite);if(!finite(r)||r.time<0||r.time>31536000||r.hp<=0||r.hp>r.maxHp||r.x<0||r.y<0||r.x>r.worldWidth||r.y>r.worldHeight)return null;
 for(const key of ['enemies','shots','hostileShots','events','drops','zones','beams','choices','allowedPlants'])if(!Array.isArray(r[key])||r[key].length>2000)return null;
 if(!r.plants||Object.entries(r.plants).some(([id,level])=>!plants[id]||!Number.isInteger(level)||Number(level)<1||Number(level)>5))return null;
 const restored={...createRun(r.starter,r.stage,r.seed,r.hero),...r} as Run;if(r.bossWaves===undefined)restored.bossWaves=r.bossSpawned?1:0;if(r.bossKills===undefined)restored.bossKills=r.bossDead?1:0;restored.moving=false;if(restored.status==='playing')restored.status='paused';return restored;}catch{return null;}}
