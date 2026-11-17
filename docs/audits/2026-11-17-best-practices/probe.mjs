import {createRun,step,spawnEnemy,choices} from '../../../src/game/simulation.ts';
import {plantIds} from '../../../src/game/plants.ts';
import {writeFileSync} from 'node:fs';
function clockProbe(fps){const s=createRun();s.plants={};s.spawn=9999;const x=s.x;for(let i=0;i<fps*10;i++)step(s,1/fps,{x:1,y:0});return{fps,wallSeconds:10,gameSeconds:s.time,distance:s.x-x};}
function kernelProbe(mixed){const s=createRun('kernel');s.spawn=9999;s.invulnerable=999;s.plants=mixed?{kernel:1,pea:1}:{kernel:1};spawnEnemy(s,'bucket',s.x+100,s.y,1e8,0,{attackCooldown:999,spawnGrace:0});const shots=[];let id=0;for(let f=0;f<60*12;f++){step(s,1/60);const es=s.events.filter(e=>e.id>id);id=s.eventId;if(es.some(e=>e.type==='shoot'&&e.kind==='kernel'))shots.push({time:+s.time.toFixed(3),butter:s.shots.filter(p=>p.kind==='kernel').at(-1)?.butter,globalVolley:s.volley});}return shots;}
const s=createRun('pea',0,42,'dave',{unlockedPlants:plantIds});s.plants={pea:5,sunflower:1,walnut:1,torchwood:1};let bagAvailable=false;for(let i=0;i<100;i++)if(choices(s).includes('bag'))bagAvailable=true;
const result={timestamp:new Date().toISOString(),clock:[60,30,20,10].map(clockProbe),kernelSolo:kernelProbe(false),kernelWithPea:kernelProbe(true),evolutionSlotTrap:{plants:s.plants,bagAvailableAfter100Rerolls:bagAvailable}};
writeFileSync(new URL('./evidence/probes.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
