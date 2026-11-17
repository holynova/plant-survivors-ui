// One source for upgrade previews and combat damage. Entries are base + per-level growth.
const damage:Record<string,readonly [number,number]>={pea:[16,8],ice:[16,8],boomerang:[16,8],mushroom:[15,7],cabbage:[23,10],kernel:[23,10],melon:[43,16],coconut:[105,32],cabbagevolt:[30,13],starfruit:[20,9],cactus:[20,9],bamboo:[19,8],lightning:[23,10],laser:[30,13],potato:[100,32],cherry:[115,32],squash:[80,25],jalapeno:[17,6],snapdragon:[30,10],bonk:[34,14],chomper:[90,30],magnet:[12,8],iceberg:[10,7]};
export function damageAt(kind:string,level:number){const d=damage[kind];return d?d[0]+d[1]*level:0;}
import type {Run} from './simulation.ts';
import {plants} from './plants.ts';
import {heroes} from './catalog.ts';
export function attackPeriod(s:Run,kind:string,level=s.plants[kind]||1){const base=plants[kind]?.interval||0;return base?base*heroes[s.hero].attackRate/(1+level*.13+(s.plants.bag||0)*.08+(s.evolved&&kind===s.starter?.6:0)+(s.hero==='rusty'&&s.heroAbility>0?.45:0)):0;}
