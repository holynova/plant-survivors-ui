import {test} from 'node:test';import assert from 'node:assert/strict';
import {createRun,spawnEnemy,step} from '../src/game/simulation.ts';
import {moveBody,settleBodies} from '../src/game/bodies.ts';
import sharp from 'sharp';

test('walk into a stationary enemy: stop rather than crossing; side steps still work',()=>{
 const s=createRun();s.spawn=999;s.plants={};const start=s.x;
 spawnEnemy(s,'zombie',start+40,s.y,99,0,{attackCooldown:999});
 for(let i=0;i<40;i++)step(s,.02,{x:1,y:0});assert.ok(s.x<=start+18&&s.x>start);
 for(let i=0;i<20;i++)step(s,.02,{x:0,y:1});for(let i=0;i<30;i++)step(s,.02,{x:1,y:0});assert.ok(s.x>start+40);
});
test('solid scenery and bodies separate but a shrub, pond or balloon does not block the path',()=>{
 const s=createRun(),x=s.x,y=s.y;for(const index of [2,6,7]){moveBody(s,[{index,x,y,size:80}]);assert.equal(s.y,y);}
 moveBody(s,[{index:0,x,y,size:52}]);assert.ok(s.y>y);s.y=y;
 spawnEnemy(s,'balloon',x,y,1,0);moveBody(s,[]);assert.equal(s.x,x);
 const a=spawnEnemy(s,'cone',x+90,y,2,0),b=spawnEnemy(s,'cone',x+90,y,2,0);for(let i=0;i<10;i++)settleBodies(s,[]);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>22);
});
test('all 32 painted FX cells contain artwork and have a transparent four-pixel gutter',async()=>{
 for(const n of ['effects','munitions']){const {data,info:{width:w}}=await sharp('public/assets/game/release/v10-'+n+'.webp').raw().toBuffer({resolveWithObject:true});for(let cell=0;cell<16;cell++){let opaque=0;for(let y=0;y<128;y++)for(let x=0;x<128;x++){const a=data[((Math.floor(cell/4)*128+y)*w+cell%4*128+x)*4+3];if(x<4||x>123||y<4||y>123)assert.equal(a,0);if(a>64)opaque++;}assert.ok(opaque>40);}}});
