// Production preview, real loader held by one pending audio request (no fake scene).
import {preview} from 'vite';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import {phoneCases} from './responsive-check.mjs';

const dir='docs/reports/full-bleed';await mkdir(dir,{recursive:true});
const server=await preview({preview:{port:0,host:'127.0.0.1'},logLevel:'error'});
const url='http://127.0.0.1:'+server.httpServer.address().port;
let browser;const rows=[];
try {
  const mac='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  browser=await chromium.launch({executablePath:process.env.CHROME_BIN||(existsSync(mac)?mac:undefined)});
  const ctx=await browser.newContext({isMobile:true,hasTouch:true});
  const page=await ctx.newPage();let release;
  const gate=new Promise(r=>{release=r});
  await page.route('**/audio/click.wav',async route=>{await gate;await route.continue()});
  await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('.forge-loading-backdrop').waitFor();
  for(const scene of ['loading','camp','battle']){
    if(scene==='camp'){release();await page.locator('.loading-screen').waitFor({state:'detached'});}
    if(scene==='battle'){for(const sel of ['.camp-actions .gold','.forge-map .gold','.forge-heroes .gold','.prepare-footer .gold'])await page.locator(sel).click();}
    for(const cfg of phoneCases){
      await page.setViewportSize({width:cfg.w,height:cfg.h});await page.evaluate(safe=>['top','right','bottom','left'].forEach((s,i)=>document.documentElement.style.setProperty('--safe-'+s,safe[i]+'px')),cfg.safe||[0,0,0,0]);
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      if(scene==='battle'&&await page.locator('.resume-run').isVisible())await page.locator('.resume-run').click();
      const surface=page.locator({loading:'.forge-loading-backdrop',camp:'.camp-backdrop',battle:'.live-arena canvas'}[scene]);
      await surface.evaluate(e=>e.tagName==='IMG'?e.decode():true);
      const b=await surface.boundingBox();assert.ok(b&&Math.abs(b.x)<1&&Math.abs(b.y)<1&&Math.abs(b.width-cfg.w)<1&&Math.abs(b.height-cfg.h)<1,JSON.stringify({scene,cfg,b}));
      if(scene!=='battle'){
        const control=await page.locator(scene==='loading'?'.loading-track':'.camp-actions .gold').boundingBox(),[t,r,bt,l]=cfg.safe||[0,0,0,0];
        assert.ok(control&&control.x>=l-1&&control.y>=t-1&&control.x+control.width<=cfg.w-r+1&&control.y+control.height<=cfg.h-bt+1);
      }
      const file=cfg.name+'-'+scene+'.webp';await sharp(await page.screenshot()).webp({quality:76}).toFile(dir+'/'+file);
      rows.push({scene,cfg,file});
    }
  }
  await writeFile(dir+'/index.html','<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width, initial-scale=1"><title>全屏适配实跑截图</title><style>body{font:16px system-ui;margin:20px}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));gap:12px}img{width:100%;height:320px;object-fit:contain}figure{margin:0}</style><h1>全屏适配 · 12 种手机视口</h1><p>生产构建 · Chromium 模拟 · 加载画面、营地和战场背景四边覆盖校验通过。</p>'+['loading','camp','battle'].map((s,i)=>'<h2>'+['加载','营地','战斗'][i]+'</h2><section>'+rows.filter(x=>x.scene===s).map(({cfg,file})=>'<figure><a href="'+file+'"><img loading="lazy" src="'+file+'"></a><figcaption>'+cfg.name+' · '+cfg.w+' × '+cfg.h+'</figcaption></figure>').join('')+'</section>').join(''));
  console.log(rows.length+' full-bleed checks passed');
} finally {await browser?.close();await server.close();}
