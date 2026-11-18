import {BattleHud} from './BattleHud';
import {RunPause} from './RunPause';
import {bossIds} from './game/bosses';
import {awakeningText} from './game/awakening';
import {useEffect,useRef,useState,type CSSProperties,type PointerEvent} from 'react';
import {SimulationClock,parsePreferences,encodeCheckpoint,decodeCheckpoint,CHECKPOINT_KEY,PREFERENCES_KEY} from './game/runtime';
import {versionLabel} from './game/version';
import {createRun,step,select,replacePassive,reroll,names,descriptions,clock,cooldownState,resizeArena,type Run} from './game/simulation';
import './prototype.css';
import './forge.css';
import './forge-precision.css';
import {DoubleArrowRightIcon, MixerHorizontalIcon, PlayIcon, ReloadIcon, SpeakerLoudIcon} from '@radix-ui/react-icons';
import {Camp, ExpeditionMap, Gold, HeroSelect, PlantLoadout, Sign, stages} from './ForgeUI';
import {renderBattle} from './game/renderer';
import {GameAudio} from './game/audio';
import {heroes,type HeroId} from './game/catalog';
import {FieldGuide} from './FieldGuide';
import {GameScroll} from './GameScroll';
import {GardenShop} from './GardenShop';
import {parseSave,bankLoot,settleRun,purchase,cost} from './game/progression';
import {activePlants,plants} from './game/plants';
import {evolutionRecipe,recipeText,upgradeBenefit} from './game/evolutions';
import {stageStories,tutorialText} from './game/expedition';
import {newEnemyIds} from './game/enemies';
import {audioBytes} from './game/audio-manifest';
import {preloadImages,imageCount} from './game/loading';
import {beginTouch,moveTouch,type TouchStick} from './game/touch';
import {OriginalMusic} from './OriginalMusic';
const base=window.location.pathname.startsWith('/plant-survivors-ui/')?'/plant-survivors-ui/':'/';
const asset=(id:string)=>`${base}assets/game/release/${id==='bag'?'bag-v2':id}.webp`;
function Art({id,className='',alt=''}:{id:string,className?:string,alt?:string}){if(id==='door')return <span className={`door-art ${className}`}><Art id="zombie"/><span>▥</span></span>;return <img className={`art ${className}`} src={['dave','flora','rusty','zombie','cone','bucket',...bossIds,...newEnemyIds].includes(id)?`${base}assets/game/animations/${id}-idle.webp`:asset(id)} alt={alt} draggable={false}/>}
function loadSave(){try{const tx=JSON.parse(localStorage.getItem('garden-transaction-v1')||'null');return parseSave(tx?.save||JSON.parse(localStorage.getItem('garden-save-v2')||localStorage.getItem('garden-save-v1')||'{}'));}catch{return parseSave({})}}
function readCheckpoint(){try{const tx=JSON.parse(localStorage.getItem('garden-transaction-v1')||'null');return decodeCheckpoint(tx?tx.checkpoint:localStorage.getItem(CHECKPOINT_KEY))}catch{return null}}
function stored(key:string){try{return localStorage.getItem(key)}catch{return null}}
function loadPreferences(){try{return parsePreferences(JSON.parse(stored(PREFERENCES_KEY)||'{}'),matchMedia('(prefers-reduced-motion: reduce)').matches)}catch{return parsePreferences({})}}
export default function Prototype(){
 const [unlock,setUnlock]=useState<{id:string;selectAfter:boolean}|null>(null);
 const [campShortcut,setCampShortcut]=useState(false);
 const [preferences,setPreferences]=useState(loadPreferences),[resume,setResume]=useState(readCheckpoint);
 const checkpointAt=useRef(-10);
 const [page,setPage]=useState('lobby'),[starter,setStarter]=useState('pea'),[hero,setHero]=useState<HeroId>('dave'),[stage,setStage]=useState(0),[save,setSave]=useState(loadSave),[storageError,setStorageError]=useState(false),[revision,render]=useState(0),[sound,setSound]=useState(preferences.sound),[music,setMusic]=useState(preferences.music),[reduced,setReduced]=useState(preferences.reduced),[audioError,setAudioError]=useState(false),[ready,setReady]=useState(false),[assetError,setAssetError]=useState(false),[loading,setLoading]=useState({done:0,total:imageCount+audioBytes,label:'准备花园'}),[loadAttempt,setLoadAttempt]=useState(0),[touch,setTouch]=useState<TouchStick|null>(null),[musicPanel,setMusicPanel]=useState(false),[originalMusic,setOriginalMusic]=useState(preferences.original);
 useEffect(()=>{try{localStorage.setItem(PREFERENCES_KEY,JSON.stringify({...preferences,sound,music,reduced,original:originalMusic}))}catch{setStorageError(true)}},[preferences,sound,music,reduced,originalMusic]);
 const savedPool=preferences.pool.filter(id=>save.plants.includes(id)&&activePlants.includes(id));
 const pool=savedPool.length?savedPool:save.plants.filter(id=>activePlants.includes(id)).slice(0,8);
 const runtimeMetrics=useRef({frames:0,steps:0,overloadSeconds:0});
 const benchmarking=useRef(false);
 const touchRef=useRef<TouchStick|null>(null);
 const run=useRef<Run>(createRun()),canvas=useRef<HTMLCanvasElement>(null),images=useRef<Record<string,HTMLImageElement>>({}),input=useRef({x:0,y:0}),keys=useRef(new Set<string>()),settled=useRef(false),audio=useRef(new GameAudio()),lastEvent=useRef(0),ending=useRef(0);const s=run.current;const saveRef=useRef(save);void revision;
 useEffect(()=>{if(!import.meta.env.DEV)return;const api={benchmark:async(name:'normal'|'ceiling'|'extreme')=>{benchmarking.current=true;const {benchmark}=await import('./qa/stress');return benchmark(canvas.current!,images.current,name,state=>{run.current=state;render(n=>n+1)})},stopBenchmark:()=>{benchmarking.current=false},timing:()=>({...runtimeMetrics.current}),audio:()=>audio.current.diagnostics(),captureAudio:()=>audio.current.capture(),snapshot:()=>structuredClone(run.current),fixture:(patch:Partial<Run>)=>{Object.assign(run.current,patch);render(n=>n+1)}};Object.assign(window,{__gardenQA:api});return()=>{delete (window as unknown as Record<string,unknown>).__gardenQA}},[]);
 function persist(next:typeof save){const active=['battle','build','abandon'].includes(page)?run.current:readCheckpoint();saveRef.current=next;setSave(next);try{localStorage.setItem('garden-transaction-v1',JSON.stringify({save:next,checkpoint:active&&['playing','paused','upgrade'].includes(active.status)?encodeCheckpoint(active):null}));localStorage.setItem('garden-save-v2',JSON.stringify(next));}catch{setStorageError(true);}}
 function checkpoint(){const state=run.current;if(!['playing','paused','upgrade'].includes(state.status))return;try{localStorage.setItem('garden-transaction-v1',JSON.stringify({save:saveRef.current,checkpoint:encodeCheckpoint(state)}));checkpointAt.current=state.time;}catch{setStorageError(true)}}
 function continueRun(){if(!resume||saveRef.current.settled.includes(resume.runId))return;reset();run.current=resume;audio.current.syncHit(resume.hitAt);const bank=saveRef.current.bank;if(bank.id===resume.runId){resume.coins=Math.max(resume.coins,bank.coins);resume.gems=Math.max(resume.gems,bank.gems)}setStarter(resume.starter);setHero(resume.hero);setStage(resume.stage);settled.current=false;lastEvent.current=resume.eventId;ending.current=0;void audio.current.unlock(base).catch(()=>setAudioError(true));setPage('battle')}
 function start(){reset();keys.current.clear();run.current=createRun(starter,stage,Date.now()>>>0,hero,{unlockedPlants:[...saveRef.current.plants.filter(id=>!activePlants.includes(id)),...pool.filter(id=>id!==starter).slice(0,7),starter],upgrades:saveRef.current.upgrades,runId:crypto.randomUUID()});settled.current=false;lastEvent.current=0;ending.current=0;void audio.current.unlock(base).then(()=>audio.current.setMusic(true)).catch(()=>setAudioError(true));input.current={x:0,y:0};checkpoint();setPage('battle');}
 function pause(){if(page!=='battle')return;reset();if(run.current.status==='playing'){run.current.status='paused';input.current={x:0,y:0};keys.current.clear();checkpoint();render(n=>n+1);}}
 useEffect(()=>{audio.current.enabled=sound;audio.current.musicEnabled=music&&!originalMusic;audio.current.effectsVolume=preferences.effectsVolume;audio.current.warningVolume=preferences.warningVolume;audio.current.musicVolume=preferences.musicVolume;audio.current.setMusic(page==='lobby'||(page==='battle'&&run.current.status==='playing'&&!run.current.evolutionNotice),page==='lobby'?'camp':run.current.enemies.some(e=>e.boss)?'boss':run.current.enemies.some(e=>e.elite)?'elite':'garden');},[sound,music,page,revision,originalMusic,preferences]);
 useEffect(()=>()=>audio.current.dispose(),[]);
 useEffect(()=>{let active=true;setAssetError(false);let imageDone=0,audioDone=0;const update=(label:string)=>{if(active)setLoading({done:imageDone+audioDone,total:imageCount+audioBytes,label});};Promise.all([preloadImages(base,p=>{imageDone=p.done;update(p.label)}).then(result=>{images.current=result}),audio.current.preload(base,(done)=>{audioDone=done;update('加载音乐与战斗音效')}).catch(()=>{audioDone=audioBytes;if(active)setAudioError(true);update('音效暂不可用，可静音开始')})]).then(()=>{if(active)setReady(true)}).catch(()=>{if(active)setAssetError(true)});return()=>{active=false}},[loadAttempt]);
 useEffect(()=>{const down=(e:KeyboardEvent)=>{if(page!=='battle')return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();keys.current.add(e.key.toLowerCase())}if(e.key==='Escape')pause()};const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());const blur=()=>{keys.current.clear();input.current={x:0,y:0};pause()};const hidden=()=>{if(document.hidden)blur()};window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden)}},[page]);
 useEffect(()=>{if(page!=='battle'||!ready)return;let raf=0,last=0,ui=0;const timer=new SimulationClock();let previous={x:run.current.x,y:run.current.y,cameraX:run.current.cameraX,cameraY:run.current.cameraY};
 const paint=()=>{const ctx=canvas.current?.getContext('2d'),state=run.current;const view=state.status==='playing'&&!state.evolutionNotice?{...state,x:previous.x+(state.x-previous.x)*timer.alpha,y:previous.y+(state.y-previous.y)*timer.alpha,cameraX:previous.cameraX+(state.cameraX-previous.cameraX)*timer.alpha,cameraY:previous.cameraY+(state.cameraY-previous.cameraY)*timer.alpha}:state;if(ctx)renderBattle(ctx,view,images.current,ending.current,reduced)};
 if(!benchmarking.current&&(run.current.status==='paused'||run.current.status==='upgrade'||run.current.evolutionNotice)){paint();checkpoint();return;}
 const draw=(now:number)=>{if(benchmarking.current){last=now;raf=requestAnimationFrame(draw);return;}const state=run.current,dt=last?Math.max(0,(now-last)/1000):0;last=now;const k=keys.current;
 const steps=timer.advance(dt,h=>{previous={x:state.x,y:state.y,cameraX:state.cameraX,cameraY:state.cameraY};step(state,h,{x:input.current.x+(k.has('d')||k.has('arrowright')?1:0)-(k.has('a')||k.has('arrowleft')?1:0),y:input.current.y+(k.has('s')||k.has('arrowdown')?1:0)-(k.has('w')||k.has('arrowup')?1:0)});return state.status==='playing'&&!state.evolutionNotice});if(import.meta.env.DEV){runtimeMetrics.current.frames++;runtimeMetrics.current.steps+=steps;runtimeMetrics.current.overloadSeconds+=timer.overloadSeconds;timer.overloadSeconds=0;}
 audio.current.playerHurt(state.hitAt);const events=state.events.filter(e=>e.id>lastEvent.current);audio.current.events(events);if(events.length)lastEvent.current=events.at(-1)!.id;if(state.moving&&state.status==='playing'&&!state.evolutionNotice)audio.current.play('step',.06);
 const bank=saveRef.current.bank;if((state.coins||state.gems)&&(bank.id!==state.runId||bank.coins!==state.coins||bank.gems!==state.gems))persist(bankLoot(saveRef.current,state));
 if(state.time-checkpointAt.current>=2)checkpoint();const terminal=['won','lost'].includes(state.status);if(terminal)ending.current+=Math.min(dt,.1);paint();
 if(terminal&&ending.current>.95){if(!settled.current){settled.current=true;persist(settleRun(saveRef.current,state));}try{localStorage.removeItem(CHECKPOINT_KEY)}catch{}setResume(null);reset();setPage('result');return;}
 if(now-ui>80||state.status!=='playing'||state.evolutionNotice){render(n=>n+1);ui=now;}if(state.status==='upgrade'||state.status==='paused'||state.evolutionNotice)return;raf=requestAnimationFrame(draw)};raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf)},[page,ready,reduced,s.status,s.evolutionNotice]);
 useEffect(()=>{const onExit=()=>{if(page==='battle'||page==='build')checkpoint()};window.addEventListener('pagehide',onExit);return()=>window.removeEventListener('pagehide',onExit)},[page]);
 useEffect(()=>{if(page!=='battle'||!canvas.current)return;const element=canvas.current;let landscape:boolean|undefined;
  const fit=()=>{const rect=element.getBoundingClientRect();if(!rect.width||!rect.height)return;const ratio=rect.width/rect.height,isLandscape=ratio>1;
   if(landscape!==undefined&&landscape!==isLandscape)pause();landscape=isLandscape;
   resizeArena(run.current,ratio>1?390*ratio:390,ratio>1?390:390/ratio);
   const dpr=Math.min(window.devicePixelRatio||1,2);const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);if(element.width!==w||element.height!==h){element.width=w;element.height=h;const ctx=element.getContext('2d');if(ctx)renderBattle(ctx,run.current,images.current,ending.current,reduced);}
  };const observer=new ResizeObserver(fit);observer.observe(element);fit();return()=>observer.disconnect();
 },[page]);
 function drag(e:PointerEvent<HTMLDivElement>){
  if(s.status!=='playing'||s.evolutionNotice||(e.target as Element).closest('button,a,input,select,summary,.modal-shade'))return;
  if(e.type==='pointerdown'){if(touchRef.current)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);touchRef.current=beginTouch(e.pointerId,e.clientX,e.clientY);setTouch(touchRef.current);return;}
  if(touchRef.current?.id!==e.pointerId)return;const next=moveTouch(touchRef.current,e.clientX,e.clientY);touchRef.current=next;input.current={x:next.x,y:next.y};setTouch(next);
 }
 const reset=(e?:PointerEvent<HTMLDivElement>)=>{if(e&&touchRef.current&&e.pointerId!==touchRef.current.id)return;input.current={x:0,y:0};touchRef.current=null;setTouch(null);};
 const selectPlant=(id:string)=>{
  if(save.plants.includes(id))setStarter(id);
  else setUnlock({id,selectAfter:true});
 };
 const togglePool=(id:string)=>setPreferences(p=>({...p,pool:pool.includes(id)?pool.filter(item=>item!==id):[...pool,id]}));
 const restoreDefaults=()=>{
  const defaults=parsePreferences({},matchMedia('(prefers-reduced-motion: reduce)').matches);
  setPreferences(p=>({...p,effectsVolume:defaults.effectsVolume,musicVolume:defaults.musicVolume,warningVolume:defaults.warningVolume}));
  setReduced(defaults.reduced);
  setSound(defaults.sound);
  setMusic(defaults.music);
  setOriginalMusic(defaults.original);
 };
 const volumeControl=(key:'effectsVolume'|'musicVolume'|'warningVolume',label:string)=><label className="forge-volume" key={key}>
  <span><SpeakerLoudIcon/>{label}</span>
  <input style={{'--volume':`${preferences[key]*100}%`} as CSSProperties} aria-label={label} type="range" min="0" max="1" step="0.05" value={preferences[key]} onChange={event=>setPreferences(p=>({...p,[key]:Number(event.target.value)}))}/>
 </label>;
 const settings=<div className="forge-settings">
  <div className="forge-settings-card">
   {volumeControl('effectsVolume','音效')}
   {volumeControl('musicVolume','音乐')}
   <button className="forge-setting-row" role="switch" aria-checked={reduced} onClick={()=>setReduced(v=>!v)}>减少动态 <span>{reduced?'开启':'关闭'}</span></button>
  </div>
  <button className="cream-button forge-reset" onClick={restoreDefaults}><ReloadIcon/>恢复默认</button>
  <details className="forge-audio-options">
   <summary>更多音频设置</summary>
   {volumeControl('warningVolume','危险提示音量')}
   <button className="forge-setting-row" role="switch" aria-checked={sound} onClick={()=>setSound(v=>!v)}>战斗音效 <span>{sound?'开启':'关闭'}</span></button>
   <button className="cream-button forge-music-open" onClick={()=>setMusicPanel(true)}><MixerHorizontalIcon/>背景音乐</button>
  </details>
 </div>;
 const openCampShortcut=(target:'heroes'|'prepare')=>{setCampShortcut(true);setPage(target);};
 const battlePlantEntries=Object.entries(s.plants);
 return <div className={`garden-app forge-ui ${reduced?'reduced':''}`}><main className={`game-frame view-${page}`}>
 {page==='lobby'&&<Camp Art={Art} save={save} version={versionLabel} ready={ready}
   resume={resume&&!save.settled.includes(resume.runId)?clock(resume.time):null}
   onResume={continueRun} onMap={()=>{setCampShortcut(false);setPage('map')}}
   onHeroes={()=>openCampShortcut('heroes')} onPlants={()=>openCampShortcut('prepare')}
   onGuide={()=>setPage('atlas')} onGrowth={()=>setPage('growth')} onSettings={()=>setPage('settings')}/>}
 {page==='map'&&<ExpeditionMap Art={Art} stage={stage} unlocked={save.unlocked} back={()=>setPage('lobby')} select={setStage} next={()=>setPage('heroes')}/>}
 {page==='heroes'&&<HeroSelect Art={Art} hero={hero} select={setHero} shortcut={campShortcut} back={()=>setPage(campShortcut?'lobby':'map')} next={()=>setPage(campShortcut?'lobby':'prepare')}/>}
 {page==='prepare'&&<PlantLoadout Art={Art} starter={starter} pool={pool} save={save} select={selectPlant} toggle={togglePool} shortcut={campShortcut} back={()=>setPage(campShortcut?'lobby':'heroes')} next={campShortcut?()=>setPage('lobby'):start}/>}
 {page==='settings'&&<div className="page forge-settings-page"><Sign back={()=>setPage('lobby')}>设置</Sign><GameScroll>{settings}</GameScroll></div>}
 {page==='battle'&&<div className={`arena live-arena hud-a ${Object.keys(s.plants).length<=6?'compact-dock':''} ${reduced?'reduced-motion':''}`} onPointerDown={drag} onPointerMove={drag} onPointerUp={reset} onPointerCancel={reset} onLostPointerCapture={reset}><canvas data-moving={s.moving} data-events={s.eventId} ref={canvas} width={390} height={680} aria-label="实时花园战场"/><BattleHud run={s} reduced={reduced} onPause={pause}/>{touch&&<div className="joystick floating-stick" aria-hidden="true" style={{left:touch.originX-34,top:touch.originY-34}}><span style={{transform:`translate(${touch.x*22}px,${touch.y*22}px)`}}/></div>}{tutorialText(s)&&!touch&&<div className="touch-hint">{tutorialText(s)}</div>}<div className="weapon-dock minimal-dock">{Object.entries(s.plants).filter(([id])=>plants[id].interval>0).map(([id,level])=>{const cd=cooldownState(s,id);return <button key={id} className="plant-card" aria-label={`${names[id]}，${level>=5?'已质变，':''}冷却 ${cd.remaining.toFixed(1)} 秒，查看本局花园`} onClick={()=>{pause();setPage('build')}}><Art id={id}/>{level>=5&&<i className="awakening-dot" aria-hidden="true"/>}<span className="cooldown-track" role="progressbar" aria-label={`${names[id]}充能`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(cd.progress*100)}><i style={{width:`${cd.progress*100}%`}}/></span></button>})}</div>

 {s.status==='upgrade'&&<div className="modal-shade"><section className="upgrade-content"><Sign>选择升级</Sign><div className="upgrade-list">{s.choices.map(id=><button className="upgrade-choice" key={id} onClick={()=>{select(s,id);reset();render(n=>n+1)}}><Art id={id}/><div><h2>{names[id]} Lv.{(s.plants[id]||0)+1}</h2><p>{descriptions[id]}</p><p className="upgrade-benefit">{upgradeBenefit(s,id)}</p></div></button>)}</div><p className="recipe-caption">武器 Lv.5 解锁质变 · 满级搭配被动可额外进化<br/>{recipeText(s)}</p>{!s.plants.bag&&s.replacements>0&&Object.keys(s.plants).filter(id=>!plants[id].interval).length>=3&&<details className="replacement"><summary>被动槽已满 · 替换一件为弹药袋</summary>{Object.keys(s.plants).filter(id=>!plants[id].interval).map(id=><button key={id} onClick={()=>{replacePassive(s,id);render(n=>n+1)}}>替换 {names[id]}</button>)}</details>}<Gold disabled={!s.rerolls} onClick={()=>{reroll(s);render(n=>n+1)}}><ReloadIcon/>换一批 · {s.rerolls}</Gold></section></div>}
 {s.status==='paused'&&<RunPause run={s} base={base} onResume={()=>{s.status='playing';render(n=>n+1)}} onBuild={()=>setPage('build')} settings={<>{settings}<button className="forge-retreat" onClick={()=>setPage('abandon')}>结束本局</button></>}/>}
 {s.evolutionNotice&&s.status==='playing'&&<div className="modal-shade"><section className="game-modal forge-evolution" role="dialog" aria-modal="true" aria-label="武器质变">
  <h1>武器质变！</h1>
  <div className="forge-evolution-art"><Art id={s.starter}/><DoubleArrowRightIcon/><Art id={s.starter==='pea'?'gatling':s.starter}/></div>
  <section className="paper"><h2>{evolutionRecipe(s.starter).name} <span>Lv.5</span></h2><p>{evolutionRecipe(s.starter).effect}</p></section>
  <Gold onClick={()=>{s.evolutionNotice=false;render(n=>n+1)}}>继续战斗</Gold>
 </section></div>}
 </div>}
 {page==='build'&&<div className="page forge-build">
  <Sign back={()=>setPage('battle')}>本局花园</Sign>
  <GameScroll className="forge-build-scroll">
   <section className="paper forge-build-loadout"><h2>出战植物 · {battlePlantEntries.filter(([id])=>activePlants.includes(id)).length}/6</h2>
    <div className="forge-pool-strip">{battlePlantEntries.filter(([id])=>activePlants.includes(id)).map(([id])=><Art key={id} id={id} alt={names[id]}/>)}</div>
   </section>
   <section className="paper forge-build-items"><h2>武器与伤害</h2>
    {battlePlantEntries.sort(([a],[b])=>(s.damage[b]||0)-(s.damage[a]||0)).map(([id,level])=><div className="forge-build-item" key={id}>
     <Art id={id}/><div><b>{names[id]} · Lv.{level}</b><small>{plants[id].interval?awakeningText(id):descriptions[id]}</small></div><strong>{Math.round(s.damage[id]||0).toLocaleString('zh-CN')}</strong>
    </div>)}
   </section>
   <p className="help">{recipeText(s)}</p>
  </GameScroll>
  <div className="forge-footer"><Gold onClick={()=>{s.status='playing';setPage('battle')}}><PlayIcon/>返回战斗</Gold></div>
 </div>}
 {page==='abandon'&&<div className="page forge-abandon"><Sign back={()=>setPage('battle')}>结束远征？</Sign><section className="paper"><p>撤退后会结算本局，保留已获得的奖励。</p></section><div className="forge-footer"><Gold onClick={()=>{s.status='lost';setPage('battle')}}>确认撤退</Gold><button className="cream-button" onClick={()=>setPage('battle')}>继续本局</button></div></div>}
 {page==='result'&&<div className="page forge-result">
  <GameScroll className="forge-result-scroll">
   <h1 className="forge-result-title"><span>生存结算</span><Art id="forge-result-banner"/></h1>
   <div className="forge-result-score"><span>生存时间</span><strong>{clock(s.time)}</strong></div>
   <div className="forge-result-kills"><span>本局击败</span><strong>{s.kills.toLocaleString('zh-CN')}</strong></div>
   <section className="forge-result-take" aria-label="本局收获">
    <h2>本局收获</h2>
    <div className="forge-result-reward">
     <div><Art id="ground-coin"/><b>×{s.coins}</b><small>金币</small></div>
     <div><Art id="ground-gem"/><b>×{s.gems}</b><small>钻石</small></div>
     <div><Art id="seed-v2"/><b>×{s.bossKills}</b><small>击败首领</small></div>
    </div>
   </section>
   <p className="forge-result-progress">{stages[s.stage]} · {s.lastDamage||'主动撤退'}</p>
   {s.bossKills>0&&<p className="forge-result-progress">{stageStories[s.stage].ending}</p>}
   {!!Object.keys(s.damage).length&&<details className="forge-damage"><summary>实际伤害统计</summary><div className="damage-list">{Object.entries(s.damage).sort((a,b)=>b[1]-a[1]).map(([id,n])=><div className="damage-row" key={id}><Art id={id}/><span>{names[id]}</span><meter value={n} max={Math.max(1,...Object.values(s.damage))}/><b>{Math.round(n)}</b></div>)}</div></details>}
  </GameScroll>
  <div className="forge-footer result-actions"><button className="cream-button" onClick={()=>setPage('lobby')}>返回营地</button><Gold onClick={start}><ReloadIcon/>再来一局</Gold></div>
 </div>}
 {page==='atlas'&&<FieldGuide Art={Art} save={save} back={()=>setPage('lobby')}/>}
 {page==='growth'&&<GardenShop save={save} onSave={persist} Art={Art} onUnlock={id=>setUnlock({id,selectAfter:false})} back={()=>setPage('lobby')}/>}
 </main>
 {unlock&&(()=>{
  const {id,selectAfter}=unlock,price=cost(save,id),affordable=save.coins>=price.coins&&save.gems>=price.gems;
  return <div className="modal-shade unlock-shade" role="dialog" aria-modal="true" aria-label="解锁植物">
   <section className="game-modal forge-unlock">
    <button className="forge-unlock-close" aria-label="关闭解锁确认" onClick={()=>setUnlock(null)}>×</button>
    <Art id={id} className="modal-plant"/>
    <h1>解锁植物</h1>
    <section className="paper"><h2>{names[id]}</h2><p>{descriptions[id]}</p><small>Lv.5 质变 · {awakeningText(id)}</small></section>
    <p className="unlock-cost"><Art id="ground-coin"/>{price.coins} 金币{price.gems>0&&<><Art id="ground-gem"/>{price.gems} 钻石</>}</p>
    <small>余额 · {save.coins} 金币 / {save.gems} 钻石</small>
    <Gold disabled={!affordable} onClick={()=>{
     const next=purchase(saveRef.current,id);
     if(next===saveRef.current)return;
     persist(next);
     if(selectAfter)setStarter(id);
     setUnlock(null);
    }}>{affordable?(selectAfter?'解锁并选择':'解锁植物'):'金币或钻石不足'}</Gold>
    <button className="cream-button" onClick={()=>setUnlock(null)}>取消</button>
   </section>
  </div>;
 })()}
 {!ready&&<div className="loading-screen forge-loading" role="status">
   <Art id="forge-loading" className="forge-loading-backdrop"/><Art id="logo-trim" className="forge-loading-logo" alt="植物幸存者"/><Art id="forge-dave" className="forge-loading-dave"/>
   <section className="forge-loading-content">
    <h1>{assetError?'素材加载失败':'正在载入…'}</h1>
    <div className="loading-track" role="progressbar" aria-label="资源加载进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(loading.done/loading.total*100)}><i style={{width:`${loading.done/loading.total*100}%`}}/><b>{Math.round(loading.done/loading.total*100)}%</b></div>
    <small>{assetError?'检查网络连接后重试':loading.label}</small>
    {assetError&&<Gold onClick={()=>setLoadAttempt(v=>v+1)}>重新加载</Gold>}
   </section>
 </div>}
 <OriginalMusic open={musicPanel} onClose={()=>setMusicPanel(false)} original={originalMusic} onOriginal={setOriginalMusic} music={music} onMusic={setMusic}/>{audioError&&<div className="audio-note" role="status">音频未能加载，仍可静音游玩</div>}{storageError&&<div className="toast">浏览器无法保存进度，本次奖励仍保留在当前页面。</div>}</div>;
}
