import {useState, type ComponentType, type ReactNode} from 'react';
import {BackpackIcon, ChevronLeftIcon, ChevronRightIcon, DoubleArrowRightIcon, GearIcon, LockClosedIcon, PersonIcon, ReaderIcon, RocketIcon, CheckIcon} from '@radix-ui/react-icons';
import {GameScroll} from './GameScroll';
import {heroIds, heroes, type HeroId} from './game/catalog';
import {activePlants, plants} from './game/plants';
import {awakeningText} from './game/awakening';
import {stageStories} from './game/expedition';
import type {GardenSave} from './game/progression';

export type GameArt = ComponentType<{id:string;className?:string;alt?:string}>;

export function Sign({children,back}:{children:ReactNode;back?:()=>void}){
  return <header className="sign">
    {back&&<button className="back" aria-label="返回" onClick={back}><ChevronLeftIcon/></button>}
    <h1>{children}</h1>
  </header>;
}

export function Gold({children,onClick,disabled=false}:{children:ReactNode;onClick:()=>void;disabled?:boolean}){
  return <button className="gold" onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Wallet({Art,save,className=''}:{Art:GameArt;save:Pick<GardenSave,'coins'|'gems'>;className?:string}){
  return <div className={`forge-wallet ${className}`}>
    <span aria-label={`金币 ${save.coins}`}><Art id="ground-coin"/>{save.coins.toLocaleString('zh-CN')}</span>
    <span aria-label={`钻石 ${save.gems}`}><Art id="ground-gem"/>{save.gems.toLocaleString('zh-CN')}</span>
  </div>;
}

export const stages = ['阳光后院','月光泳池','屋顶花园'];

export function Camp({Art,save,version,ready,resume,onResume,onMap,onHeroes,onPlants,onGuide,onGrowth,onSettings}:{Art:GameArt;save:GardenSave;version:string;ready:boolean;resume:string|null;onResume:()=>void;onMap:()=>void;onHeroes:()=>void;onPlants:()=>void;onGuide:()=>void;onGrowth:()=>void;onSettings:()=>void}){
  const actions = [
    [PersonIcon,'主角',onHeroes],
    [BackpackIcon,'配装',onPlants],
    [RocketIcon,'成长',onGrowth],
    [ReaderIcon,'花园图鉴',onGuide],
    [GearIcon,'设置',onSettings],
  ] as const;
  return <div className="page forge-camp">
    <Art id="forge-workshop" className="camp-backdrop"/>
    <div className="camp-top"><Sign>营地</Sign><Wallet Art={Art} save={save}/></div>
    <nav className="camp-rail" aria-label="营地菜单">
      {actions.map(([Icon,label,action])=><button key={label} aria-label={label} title={label} onClick={action}>
        <Icon/><span>{label==='花园图鉴'?'图鉴':label}</span>
      </button>)}
    </nav>
    <Art id="forge-dave" className="camp-dave" alt="戴夫推着花园手推车"/>
    <div className="camp-actions">
      {resume&&<button className="cream-button" disabled={!ready} onClick={onResume}>继续远征 · {resume}</button>}
      <Gold disabled={!ready} onClick={onMap}><span>出发</span><DoubleArrowRightIcon/></Gold>
    </div>
    <div className="game-meta"><span>{version}</span><a href="https://github.com/holynova/plant-survivors-ui" target="_blank" rel="noreferrer">GitHub ↗</a></div>
  </div>;
}

export function ExpeditionMap({Art,stage,unlocked,back,select,next}:{Art:GameArt;stage:number;unlocked:number;back:()=>void;select:(stage:number)=>void;next:()=>void}){
  return <div className="page forge-map">
    <Sign back={back}>地图</Sign>
    <GameScroll className="forge-map-scroll">
      <div className="forge-map-list">
        {stages.map((name,index)=>{
          const locked=index>unlocked;
          return <button className="forge-map-tile" key={name} aria-pressed={stage===index} disabled={locked}
            aria-label={locked?`${name}，击败前一关首领后解锁`:name} onClick={()=>select(index)}>
            <Art id={['forge-map-day','forge-map-night','forge-map-roof'][index]}/>
            <span className="map-tile-caption"><strong>{name}</strong>{locked?<span className="map-badge"><LockClosedIcon/> 未解锁</span>:stage===index?<span className="map-badge current">当前</span>:null}</span>
          </button>;
        })}
      </div>
      <p className="forge-map-condition">{stageStories[stage].detail} 击败首领可解锁下一张地图。</p>
    </GameScroll>
    <div className="forge-footer"><Gold onClick={next}>前往花园 <DoubleArrowRightIcon/></Gold></div>
  </div>;
}

export function HeroSelect({Art,hero,select,back,next,shortcut}:{Art:GameArt;hero:HeroId;select:(hero:HeroId)=>void;back:()=>void;next:()=>void;shortcut:boolean}){
  return <div className="page forge-heroes">
    <Sign back={back}>主角</Sign>
    <GameScroll className="forge-heroes-scroll">
      <div className="forge-hero-list">
        {heroIds.map(id=>{
          const data=heroes[id];
          return <button className="forge-hero-card" aria-pressed={hero===id} key={id} onClick={()=>select(id)}>
            <span className="forge-hero-portrait"><Art id={id}/><b>{data.name}</b></span>
            <span className="forge-hero-copy"><strong>{data.trait}</strong><small>{data.description}</small></span>
            {hero===id&&<CheckIcon className="forge-hero-selected"/>}
          </button>;
        })}
      </div>
    </GameScroll>
    <div className="forge-footer"><Gold onClick={next}>{shortcut?'确认主角':'选择植物'} <ChevronRightIcon/></Gold></div>
  </div>;
}

export function PlantLoadout({Art,starter,pool,save,select,toggle,back,next,shortcut}:{Art:GameArt;starter:string;pool:string[];save:GardenSave;select:(id:string)=>void;toggle:(id:string)=>void;back:()=>void;next:()=>void;shortcut:boolean}){
  const [tab,setTab]=useState<'starter'|'pool'>('starter');
  const candidates=tab==='starter'?activePlants:activePlants.filter(id=>save.plants.includes(id));
  return <div className="page forge-loadout">
    <Sign back={back}>配装</Sign>
    <div className="guide-tabs forge-loadout-tabs" aria-label="配装类别">
      <button aria-pressed={tab==='starter'} onClick={()=>setTab('starter')}>起始植物</button>
      <button aria-pressed={tab==='pool'} onClick={()=>setTab('pool')}>升级候选</button>
    </div>
    <GameScroll className="forge-loadout-scroll">
      <div className="starter-grid">
        {candidates.map(id=>{
          const locked=!save.plants.includes(id),chosen=tab==='starter'?starter===id:pool.includes(id);
          return <button className={`plant-card ${chosen?'selected':''} ${locked?'plant-locked':''}`}
            key={id} aria-label={`${plants[id].name}${locked?'，未解锁':''}`} aria-pressed={chosen}
            disabled={tab==='pool'&&((!chosen&&pool.length>=8)||(chosen&&pool.length===1))}
            onClick={()=>tab==='starter'?select(id):toggle(id)}>
            <Art id={id}/>
            <b>{plants[id].name}</b>
            {locked?<small className="forge-locked"><LockClosedIcon/> 未解锁</small>:<small>{chosen?(tab==='starter'?'起始':'已加入'):'可选'}</small>}
          </button>;
        })}
      </div>
    </GameScroll>
    <div className="forge-loadout-summary">
      <div className="forge-section-title"><b>{tab==='starter'?'起始植物':'升级候选'}</b><span>{tab==='starter'?'Lv.5 质变':`${pool.length}/8`}</span></div>
      {tab==='starter'?<div className="forge-chosen"><Art id={starter}/><div><b>{plants[starter].name}</b><small>{awakeningText(starter)}</small></div></div>
        :<div className="forge-pool-strip">{pool.map(id=><Art key={id} id={id} alt={plants[id].name}/>)}</div>}
    </div>
    <div className="forge-footer prepare-footer"><Gold onClick={next}>{shortcut?'确认配装':'开始战斗'} <DoubleArrowRightIcon/></Gold></div>
  </div>;
}
