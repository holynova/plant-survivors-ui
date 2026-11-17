import test from 'node:test';import assert from 'node:assert/strict';
import {propPlacement,lootPlacement} from '../src/game/grounding.ts';
import metadata from '../src/game/prop-metadata.json' with {type:'json'};
import {nearbyProps} from '../src/game/scenery.ts';
test('all twelve props place the opaque contact baseline exactly at world sort Y',()=>{for(let index=0;index<12;index++){const p={x:400,y:600,index,size:96},b=propPlacement(p);assert.equal(b.top+b.size*metadata[index].anchor,p.y);assert.ok(b.shadowWidth>0&&b.shadowWidth<48);}});
test('loot rests on the ground after spawn and reduced motion never creates a detached baseline',()=>{for(const kind of ['sun','coin','gem','heal'])for(const age of [-10,0,.1,.32,4]){const b=lootPlacement(kind,80,120,age,true);assert.equal(b.top+b.size*60/64,120);assert.equal(b.lift,0)}const rising=lootPlacement('heal',80,120,.16);assert.ok(rising.lift>0);assert.equal(rising.footY,120);const resting=lootPlacement('heal',80,120,1);assert.equal(resting.top+resting.size*60/64,120);});
test('camera scrolling never respawns overlapping props at different positions',()=>{const a={stage:0,worldWidth:4800,worldHeight:4800,cameraX:1200,cameraY:1800,width:390,height:844};const before=nearbyProps(a),after=nearbyProps({...a,cameraX:1250});for(const p of before.filter(p=>p.x>1250&&p.x<1590))assert.deepEqual(after.find(q=>q.x===p.x&&q.y===p.y),p);});
