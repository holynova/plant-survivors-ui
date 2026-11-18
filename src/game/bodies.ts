// Positions are foot anchors in world pixels. Clearance is deliberately smaller
// than the painted silhouette; combat sensors, loot and telegraphs remain independent.
import type {Enemy,Run} from './simulation';
import {EnemyIndex} from './enemy-index.ts';
import type {Prop} from './scenery';
const playerRadius=11;
export const bodyRadius=(e:Enemy)=>e.boss?29:e.elite?21:e.kind==='imp'?8:e.kind==='bucket'||e.kind==='football'?15:12;
const airborne=(e:Enemy)=>e.kind==='balloon'||e.kind==='jetpack'||(e.burrow||0)>0;
type Point={x:number;y:number};
function separate(p:Point,x:number,y:number,rx:number,ry:number,strength=1){
 const dx=p.x-x,dy=p.y-y;if(Math.abs(dx)>=rx||Math.abs(dy)>=ry)return;
 const d=Math.hypot(dx/rx,dy/ry);if(d===0){p.x+=rx*strength;return}
 if(d<1){const scale=(1/d-1)*strength;p.x+=dx*scale;p.y+=dy*scale;}
}
const footprints=[.30,.41,0,.32,.31,0,0,0,.31,.34,.29,.39];
function scenery(p:Point,r:number,props:Prop[]){for(const prop of props){const half=prop.size*footprints[prop.index];if(half)separate(p,prop.x,prop.y-4,r+half,r+half*.42);}}
export function moveBody(s:Run,props:Prop[]){for(const e of s.enemies)if(e.hp>0&&!airborne(e))separate(s,e.x,e.y,playerRadius+bodyRadius(e),playerRadius+bodyRadius(e));scenery(s,playerRadius,props);s.x=Math.max(40,Math.min(s.worldWidth-40,s.x));s.y=Math.max(40,Math.min(s.worldHeight-40,s.y));}
const grids=new WeakMap<Run,EnemyIndex>();
export function settleBodies(s:Run,props:Prop[]){
 let grid=grids.get(s);if(!grid){grid=new EnemyIndex();grids.set(s,grid)}grid.rebuild(s.enemies);
 for(let i=0;i<s.enemies.length;i++){const e=s.enemies[i];if(e.hp<=0||airborne(e))continue;const r=bodyRadius(e);
  // Dense mobs yield softly to their nearest occupants; cap work in piles.
  let active=0;for(const j of grid.query(e.x,e.y,r+29)){if(i===j)continue;const other=s.enemies[j],reach=r+bodyRadius(other);if(other.hp<=0||airborne(other)||(e.x-other.x)**2+(e.y-other.y)**2>=reach*reach)continue;
   separate(e,other.x,other.y,reach,reach,e.boss?.10:.35);if(++active===6)break;}
  scenery(e,r,props);separate(e,s.x,s.y,r+playerRadius,r+playerRadius);
  e.x=Math.max(16,Math.min(s.worldWidth-16,e.x));e.y=Math.max(16,Math.min(s.worldHeight-16,e.y));grid.move(i,e.x,e.y);
 }
}
