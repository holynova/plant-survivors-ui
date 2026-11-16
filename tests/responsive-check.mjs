import {mkdir,writeFile}from 'node:fs/promises';
export const phoneCases=[
 {name:'small-320',w:320,h:568},{name:'android-360',w:360,h:640},{name:'compact-375',w:375,h:667},
 {name:'standard-390',w:390,h:844},{name:'standard-393',w:393,h:852},{name:'large-412',w:412,h:915},{name:'large-430',w:430,h:932},
 {name:'browser-short',w:360,h:560},{name:'landscape-667',w:667,h:375},{name:'landscape-844',w:844,h:390},
 {name:'safe-portrait',w:390,h:844,safe:[47,0,34,0]},{name:'safe-landscape',w:844,h:390,safe:[0,47,21,47]},
];
export async function checkPhones(p,cases,dir){
 await mkdir(dir,{recursive:true});const results=[];
 for(const cfg of cases){
  await p.cdp('Emulation.setDeviceMetricsOverride',{width:cfg.w,height:cfg.h,deviceScaleFactor:1,mobile:true});await p.goto('http://127.0.0.1:5204/');await p.waitForSelector('text="开始远征 ▷"');
  await p.evaluate(safe=>{['top','right','bottom','left'].forEach((side,i)=>document.documentElement.style.setProperty('--safe-'+side,(safe?.[i]||0)+'px'));},cfg.safe||[0,0,0,0]);
  const scenes=[];
  const inspect=async(scene,selectors=[])=>{await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await p.waitForFunction(()=>[...document.querySelectorAll('.garden-app img')].every(i=>i.complete&&i.naturalWidth>0),undefined,{timeout:5000});const info=await p.evaluate(({scene,selectors})=>{const f=document.querySelector('.game-frame').getBoundingClientRect();const rect=q=>{const e=document.querySelector(q);return e?e.getBoundingClientRect().toJSON():null;};return {scene,w:innerWidth,h:innerHeight,frame:f.toJSON(),simulator:!!document.querySelector('.phone-stage,.device-menu-bar,.phone-bezel'),overflow:document.documentElement.scrollWidth>innerWidth,controls:selectors.map(q=>({q,rect:rect(q)})),images:[...document.querySelectorAll('.garden-app img')].every(i=>i.complete&&i.naturalWidth>0)};},{scene,selectors});
   if(info.w!==cfg.w||info.h!==cfg.h||info.simulator||info.overflow||!info.images)throw Error(`${cfg.name}/${scene}: viewport, runtime, image or overflow failure ${JSON.stringify(info)}`);
   for(const c of info.controls){const r=c.rect,f=info.frame;if(!r||r.left<f.left-1||r.right>f.right+1||r.top<f.top-1||r.bottom>f.bottom+1)throw Error(`${cfg.name}/${scene}: clipped ${c.q} ${JSON.stringify(r)}`);}
   scenes.push(info);await p.screenshot({path:`${dir}/${cfg.name}-${scene}.png`});
  };
  await inspect('lobby',['.lobby-actions','.bottom-nav','.game-meta']);await p.click('text="开始远征 ▷"');await inspect('map');await p.click('text="前往花园 ▷"');await inspect('prepare',['.prepare-footer','.hero-grid']);await p.click('loc=css:.prepare-footer button');await p.waitForSelector('loc=css:canvas');
  await p.evaluate(()=>{const q=window.__gardenQA,s=q.snapshot();q.fixture({status:'playing',hp:125,maxHp:125,spawn:999,nextXp:99999,time:60,eliteWave:1,warning:0,plants:{pea:3,ice:3,boomerang:3,mushroom:3,walnut:1,sunflower:1,bag:1},enemies:[{id:888,x:s.width*.28,y:s.height*.5,hp:780,max:780,speed:0,kind:'cone',elite:'runner',slow:0,boss:false,chargeCooldown:99},{id:889,x:s.width*.72,y:s.height*.48,hp:1200,max:1200,speed:0,kind:'bucket',elite:'guard',slow:0,boss:false}],shots:[],drops:[]});});
  await p.waitForFunction(()=>document.querySelectorAll('.weapon-dock button').length===7);await inspect('battle',['.hud','.joystick','.weapon-dock']);const overlap=await p.evaluate(()=>{const a=document.querySelector('.joystick').getBoundingClientRect(),b=document.querySelector('.weapon-dock').getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top});if(overlap)throw Error(`${cfg.name}: joystick overlaps weapons`);
  await p.evaluate(()=>window.__gardenQA.fixture({status:'upgrade',choices:['pea','ice','walnut']}));await inspect('upgrade',['.upgrade-content']);await p.click('loc=css:.upgrade-choice:first-child');await p.evaluate(()=>window.__gardenQA.fixture({status:'paused'}));await inspect('pause');await p.click('text="查看本局花园"');await inspect('build',['.view-build>.page>.gold']);await p.click('text="返回战斗"');await p.evaluate(()=>window.__gardenQA.fixture({status:'lost'}));await p.waitForSelector('text="返回营地"');await inspect('result');await p.click('text="返回营地"');await p.click('text="花园图鉴"');await p.click('text="僵尸 · 6"');await p.click('loc=css:button[aria-label="查看巨人领主"]');await p.waitForFunction(()=>document.querySelector('.guide-scroll').scrollTop<2);await inspect('guide',['.guide-tabs']);results.push({name:cfg.name,w:cfg.w,h:cfg.h,safe:cfg.safe||[0,0,0,0],scenes});await writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));console.log(`${cfg.name}: ${scenes.length} scenes passed`);
 }
 return results;
}
