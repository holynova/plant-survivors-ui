import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import * as api from '../src/game/simulation.ts';
import {activePlants} from '../src/game/plants.ts';
import {play} from './balance-runner.mjs';
const runs=[];
for(const starter of activePlants){let final;const wrapped={...api,step(s,...args){api.step(s,...args);final=s}};const r=play(wrapped,{starter,seed:431});const result={starter,status:r.status,time:r.time,damage:final.damage[starter]||0,totalDamage:Object.values(final.damage).reduce((a,b)=>a+b,0),level:r.level};runs.push(result);assert.ok(['won','lost'].includes(result.status),`${starter} must finish`);assert.ok(result.damage>0,`${starter} must deal damage itself`)}
await writeFile('docs/reports/v09/all-plants-campaign.json',JSON.stringify(runs,null,2)+'\n');console.log({plants:runs.length,wins:runs.filter(r=>r.status==='won').length,losses:runs.filter(r=>r.status==='lost').length,unfinished:0});
