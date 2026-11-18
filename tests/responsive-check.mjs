import {mkdir,writeFile}from 'node:fs/promises';
import {forgeMeasurements,forgeReferenceSize} from './forge-geometry.mjs';
export const phoneCases=[
 {name:'small-320',w:320,h:568},{name:'android-360',w:360,h:640},{name:'compact-375',w:375,h:667},
 {name:'standard-390',w:390,h:844},{name:'standard-393',w:393,h:852},{name:'large-412',w:412,h:915},{name:'large-430',w:430,h:932},
 {name:'browser-short',w:360,h:560},{name:'landscape-667',w:667,h:375},{name:'landscape-844',w:844,h:390},
 {name:'safe-portrait',w:390,h:844,safe:[47,0,34,0]},{name:'safe-landscape',w:844,h:390,safe:[0,47,21,47]},
];
export async function checkPhones(p,cases,dir){
 await mkdir(dir,{recursive:true});const results=[];
 for(const cfg of cases){
  await p.cdp('Emulation.setDeviceMetricsOverride',{width:cfg.w,height:cfg.h,deviceScaleFactor:cfg.dpr||2,mobile:true});await p.goto(cfg.url||'http://127.0.0.1:5204/');await p.waitForFunction(()=>!document.querySelector('.loading-screen'),undefined,{timeout:25000});await p.waitForSelector('.camp-actions .gold');
  await p.evaluate(safe=>{['top','right','bottom','left'].forEach((side,i)=>document.documentElement.style.setProperty('--safe-'+side,(safe?.[i]||0)+'px'));},cfg.safe||[0,0,0,0]);
  const scenes=[];
  const inspect=async(scene,selectors=[])=>{await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await p.waitForFunction(()=>[...document.querySelectorAll('.garden-app img')].every(i=>i.complete&&i.naturalWidth>0),undefined,{timeout:5000});const info=await p.evaluate(({scene,selectors})=>{const f=document.querySelector('.game-frame').getBoundingClientRect();const rect=q=>{const e=document.querySelector(q);return e?e.getBoundingClientRect().toJSON():null;};return {scene,experienceColor:document.querySelector('.xp i')?getComputedStyle(document.querySelector('.xp i')).backgroundImage:null,touchTargets:[...document.querySelectorAll('.garden-app button')].filter(b=>b.getBoundingClientRect().height>0&&getComputedStyle(b).visibility!=='hidden').map(b=>({label:b.textContent.trim()||b.getAttribute('aria-label'),height:b.getBoundingClientRect().height})),w:innerWidth,h:innerHeight,frame:f.toJSON(),simulator:!!document.querySelector('.phone-stage,.device-menu-bar,.phone-bezel'),overflow:document.documentElement.scrollWidth>innerWidth,controls:selectors.map(q=>({q,rect:rect(q)})),images:[...document.querySelectorAll('.garden-app img')].every(i=>i.complete&&i.naturalWidth>0)};},{scene,selectors});
   info.errors=[];if(info.w!==cfg.w||info.h!==cfg.h||info.simulator||info.overflow||!info.images)info.errors.push('viewport / runtime / image / overflow failure');
   if(scene==='upgrade'){
    const spills=await p.evaluate(()=>[...document.querySelectorAll('.upgrade-choice')].flatMap(card=>{
     const frame=card.getBoundingClientRect();
     return [...card.querySelectorAll('.upgrade-art img,.upgrade-copy,.upgrade-copy strong,.upgrade-copy > span')].filter(el=>{
      const r=el.getBoundingClientRect();return r.left<frame.left||r.right>frame.right||r.top<frame.top||r.bottom>frame.bottom||el.scrollHeight>el.clientHeight+1;
     }).map(el=>el.className||el.tagName);
    }));
    if(spills.length)info.errors.push('upgrade card overflow: '+spills.join(', '));
   }
   if(cfg.w===390&&cfg.h===844&&!cfg.safe&&forgeMeasurements[scene]){
    info.geometry=await p.evaluate(({marks,design})=>{
     const {x,y,width,height}=document.querySelector('.game-frame').getBoundingClientRect();
     const unit=Math.min(width/design.width,height/design.height);
     const origin=[x+(width-design.width*unit)/2,y+(height-design.height*unit)/2,0,0];
     return marks.map(([selector,...source])=>{
      const r=document.querySelector(selector)?.getBoundingClientRect();
      const target=source.map((v,i)=>v===null?null:origin[i]+v*unit);
      const actual=r?[r.x,r.y,r.width,r.height]:null;
      const maxError=actual?Math.max(...target.map((n,i)=>n===null?0:Math.abs(n-actual[i]))):null;
      return {selector,source,target,actual,maxError};
     });
    },{marks:forgeMeasurements[scene],design:forgeReferenceSize});
    for(const box of info.geometry)if(box.maxError===null||box.maxError>4)info.errors.push(`reference geometry drift: ${box.selector} (${box.maxError?.toFixed(2)??'missing'} CSS px)`);
   }
   for(const c of info.controls){const r=c.rect,f=info.frame;if(!r||r.left<f.left-1||r.right>f.right+1||r.top<f.top-1||r.bottom>f.bottom+1)info.errors.push(`clipped ${c.q}`);}
   info.errors.push(...info.touchTargets.filter(t=>t.height<43).map(t=>`small touch target: ${t.label} (${t.height})`));info.pass=!info.errors.length;scenes.push(info);await writeFile(`${dir}/partial.json`,JSON.stringify({name:cfg.name,...cfg,scenes},null,2));await p.screenshot({path:`${dir}/${cfg.name}-${scene}.png`});
  };
  await inspect('lobby',['.camp-actions','.camp-rail','.game-meta','.camp-dave']);
  const labels=await p.evaluate(()=>Array.from(document.querySelectorAll('.camp-rail button'),b=>b.getAttribute('aria-label')));
  if(labels.join()!=='花园图鉴,局外成长,解锁植物,教程')throw Error('Unexpected camp destinations: '+labels);
  await p.click('.camp-rail button[aria-label="教程"]');await inspect('tutorial',['.forge-tutorial .sign','.forge-tutorial .game-scroll']);
  await p.click('.forge-tutorial .back');await p.click('.camp-settings');
  await inspect('settings',['.forge-settings-page .sign','.forge-settings-page .game-scroll']);
  await p.click('text="更多音频设置"');await p.click('text="背景音乐"');
  await inspect('music',['.original-music>.paper']);
  await p.click('text="返回游戏"');
  await p.click('loc=css:.forge-settings-page .back');
  await p.click('loc=css:.camp-actions .gold');
  await inspect('map',['.forge-map-list .forge-map-tile:first-child','.forge-footer']);
  await p.click('loc=css:.forge-map .gold');
  await inspect('heroes',['.forge-hero-card:first-child','.forge-footer']);
  await p.click('.forge-hero-card:nth-child(2)');await p.waitForSelector('.forge-hero-card:nth-child(2)[aria-pressed=true]');await p.click('.forge-hero-card:first-child');
  await p.click('loc=css:.forge-heroes .gold');
  await inspect('prepare',['.prepare-footer','.forge-loadout-summary']);
  await p.click('loc=css:.starter-grid .plant-locked >> nth=0');
  await inspect('unlock',['.unlock-shade .game-modal']);
  await p.click('loc=css:.forge-unlock .cream-button');
  await p.click('loc=css:.prepare-footer button');
  await p.waitForSelector('loc=css:canvas');
  await p.evaluate(()=>{const q=window.__gardenQA,s=q.snapshot();q.fixture({status:'playing',hp:80,maxHp:125,spawn:999,nextXp:100,xp:46,level:12,tutorial:{moved:99,collected:true,upgraded:true},time:60,eliteWave:1,warning:0,plants:{pea:3,ice:3,boomerang:3,mushroom:3,cabbage:2,lightning:2,walnut:1,sunflower:1,bag:1},enemies:[{id:888,x:s.x-95,y:s.y-60,hp:780,max:780,speed:0,kind:'cone',elite:'runner',slow:0,boss:false,chargeCooldown:99},{id:889,x:s.x+100,y:s.y+50,hp:1200,max:1200,speed:0,kind:'bucket',elite:'guard',slow:0,boss:false}],shots:[],drops:[]});});
  await p.waitForFunction(()=>document.querySelectorAll('.weapon-dock button').length===6);await inspect('battle',['.hud','.weapon-dock','.health-meter']);await p.evaluate(()=>{
   const q=window.__gardenQA,s=q.snapshot();
   const enemies=Array.from({length:32},(_,i)=>{
    const angle=i*2.4,radius=43+(i%6)*20;
    return {...s.enemies[0],id:950+i,x:s.x+Math.cos(angle)*radius,y:s.y+Math.sin(angle)*radius,kind:['zombie','cone','bucket'][i%3],elite:undefined,boss:false,speed:0};
   });
   q.fixture({enemies,hp:s.maxHp,invulnerable:2});
  });await inspect('crowd',['.hud','.weapon-dock']);
  await p.evaluate(()=>{const q=window.__gardenQA,s=q.snapshot();q.fixture({time:135,eliteWave:3,warning:0,bossSpawned:true,xp:45,nextXp:100,enemies:[{id:999,x:s.x+80,y:s.y+45,hp:2200,max:2200,speed:0,kind:'boss-trim',boss:true,slow:0,attack:1,attackDuration:1.2,aimX:s.x-40,aimY:s.y+20,attackCooldown:99}]})});await inspect('boss',['.boss-health']);await p.evaluate(()=>window.__gardenQA.fixture({status:'playing',evolutionNotice:true}));await inspect('evolution',['.game-modal']);await p.evaluate(()=>window.__gardenQA.fixture({status:'playing',evolutionNotice:false,bossSpawned:false,enemies:[]}));
  await p.evaluate(()=>window.__gardenQA.fixture({status:'upgrade',choices:['pea','ice','walnut']}));
  await inspect('upgrade',['.upgrade-content','.upgrade-choice:first-child','.upgrade-choice:last-child']);await p.click('loc=css:.upgrade-choice:first-child');
  await p.evaluate(()=>window.__gardenQA.fixture({status:'paused'}));
  await inspect('pause',['.pause-modal','.resume-run']);
  await p.click('loc=css:.pause-tabs button >> nth=2');
  await inspect('pause-map',['.pause-modal','.resume-run']);
  await p.click('loc=css:.pause-tabs button >> nth=0');
  await p.click('text="查看本局花园"');
  await inspect('build',['.forge-build .forge-footer']);
  await p.click('text="返回战斗"');
  await p.evaluate(()=>window.__gardenQA.fixture({status:'lost',time:567,coins:1260,gems:18,kills:548,bossKills:1,lastDamage:'巨人领主'}));
  await p.waitForSelector('text="返回营地"');
  await inspect('result',['.result-actions']);
  await p.click('text="返回营地"');
  await p.click('loc=css:.camp-rail button[aria-label="花园图鉴"]');
  await inspect('guide',['.guide-tabs']);
  await p.click('loc=css:.guide-grid .plant-card >> nth=0');
  await inspect('detail',['.forge-specimen-stage']);
  await p.click('loc=css:.forge-guide .back');await p.click('loc=css:.forge-guide .back');
  await p.click('loc=css:.camp-rail button[aria-label="解锁植物"]');
  await inspect('shop',['.forge-wallet','.shop-tabs','.shop-notice']);
  await p.click('.forge-shop .back');await p.click('.camp-rail button[aria-label="局外成长"]');await p.waitForSelector('.shop-tabs button:nth-child(2)[aria-pressed=true]');
  await inspect('permanent',['.shop-notice']);
  results.push({name:cfg.name,w:cfg.w,h:cfg.h,safe:cfg.safe||[0,0,0,0],dpr:cfg.dpr||2,scenes});await writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));console.log(`${cfg.name}: ${scenes.length} scenes checked, ${scenes.filter(s=>!s.pass).length} failed`);
 }
 return results;
}
