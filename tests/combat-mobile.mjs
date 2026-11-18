import {createServer} from 'vite';import {chromium} from 'playwright';import {mkdir,writeFile} from 'node:fs/promises';import {existsSync} from 'node:fs';import sharp from 'sharp';import assert from 'node:assert/strict';
import {phoneCases} from './responsive-check.mjs';
const srv=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'error'});await srv.listen();
const dir='docs/reports/combat-readability';await mkdir(dir,{recursive:true});let browser;
try{
 const mac='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';browser=await chromium.launch({executablePath:process.env.CHROME_BIN||(existsSync(mac)?mac:undefined)});
 const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await p.goto(srv.resolvedUrls.local[0]);await p.locator('.loading-screen').waitFor({state:'detached'});for(const sel of ['.camp-actions .gold','.forge-map .gold','.forge-heroes .gold','.prepare-footer .gold'])await p.locator(sel).click();
 const fixture=async patch=>p.evaluate(x=>window.__gardenQA.fixture(x),patch);
 const setup=await p.evaluate(()=>{const s=window.__gardenQA.snapshot();return {x:s.x,y:s.y}});
 await fixture({eliteWave:99,bossWaves:99,time:150,nextXp:1e6,spawn:999,plants:{pea:4,mushroom:3,lightning:2},enemies:[{id:145,kind:'boss-trim',boss:true,hp:1400,max:2200,x:setup.x+145,y:setup.y-90,speed:0,slow:0,attackCooldown:999}],invulnerable:0});
 const report=[];for(const cfg of phoneCases){await p.setViewportSize({width:cfg.w,height:cfg.h});await p.evaluate(v=>['top','right','bottom','left'].forEach((k,i)=>document.documentElement.style.setProperty('--safe-'+k,v[i]+'px')),cfg.safe||[0,0,0,0]);
 await fixture({status:'playing',evolutionNotice:false});await p.locator('.boss-gauge').waitFor();
 assert.deepEqual(await p.locator('.dock-level').allTextContents(),['Lv.4','Lv.3','Lv.2']);
 const snap=async(name)=>{const file=cfg.name+'-'+name+'.webp';await sharp(await p.screenshot()).webp({quality:75}).toFile(dir+'/'+file);report.push(file)};
 await snap('boss');await fixture({status:'upgrade',choices:['pea','ice','lightning']});const cards=p.locator('.upgrade-choice');await cards.first().waitFor();assert.deepEqual(await cards.locator('em').allTextContents(),['Lv.4 → 5','Lv.0 → 1','Lv.2 → 3']);
 for(const card of await cards.all()){assert.ok(await card.evaluate(e=>{const b=e.getBoundingClientRect(),m=e.querySelector('em').getBoundingClientRect();return m.x>=b.x&&m.right<=b.right+1&&m.bottom<=b.bottom+1&&b.right<=innerWidth+1}));}
 await snap('upgrade');}
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>['top','right','bottom','left'].forEach(k=>document.documentElement.style.setProperty('--safe-'+k,'0px')));
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.evaluate(()=>{const q=window.__gardenQA,s=q.snapshot();q.fixture({status:'playing',enemies:[],evolutionNotice:false,invulnerable:0,hostileShots:[{x:s.x,y:s.y,vx:0,vy:0,life:1,damage:18,kind:'wizard'}]});});await p.waitForFunction(()=>window.__gardenQA.snapshot().lastHitAmount>0);
 const hurt=await p.evaluate(()=>{const q=window.__gardenQA,s=q.snapshot();return {hp:s.hp,max:s.maxHp,hit:s.lastHitAmount,sound:q.audio().hurtPlayed}});assert.ok(hurt.hp<hurt.max&&hurt.sound>0);
 await sharp(await p.screenshot()).webp().toFile(dir+'/hurt.webp');const stress=await p.evaluate(()=>window.__gardenQA.benchmark('ceiling'));await writeFile(dir+'/stress.json',JSON.stringify(stress,null,2));await writeFile(dir+'/result.json',JSON.stringify({hurt,screens:report},null,2));
 await writeFile(dir+'/index.html','<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>战斗实跑验收</title><h1>战斗实跑验收</h1><p>12 种模拟视口 · Boss 血条、植物等级和升级三选一</p>'+['hurt.webp',...report].map(x=>'<a href="'+x+'"><img loading="lazy" width="160" src="'+x+'" alt="'+x+'"></a>').join(''));console.log('24 captures; actual damage:',hurt);
}finally{await browser?.close();await srv.close();}
