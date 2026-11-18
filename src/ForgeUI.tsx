import {useState, type ComponentType, type ReactNode} from 'react';
import {ChevronLeftIcon, ChevronRightIcon, DoubleArrowRightIcon, FileTextIcon, GearIcon, MixIcon, LockClosedIcon, QuestionMarkCircledIcon, HeartFilledIcon, LightningBoltIcon, StarFilledIcon, CheckIcon} from '@radix-ui/react-icons';
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

export function Camp({Art,save,version,ready,resume,onResume,onMap,onPlants,onGuide,onGrowth,onTutorial,onSettings}:{Art:GameArt;save:GardenSave;version:string;ready:boolean;resume:string|null;onResume:()=>void;onMap:()=>void;onPlants:()=>void;onGuide:()=>void;onGrowth:()=>void;onTutorial:()=>void;onSettings:()=>void}){
  const actions = [
    {label:'花园图鉴', image:'seed-v2', open:onGuide},
    {label:'局外成长', image:'ground-gem', open:onGrowth},
    {label:'解锁植物', image:'pea', open:onPlants},
    {label:'教程', image:null, open:onTutorial},
  ];
  return <div className="page forge-camp">
    <Art id="forge-workshop" className="camp-backdrop"/>
    <div className="camp-top"><Sign>营地</Sign><Wallet Art={Art} save={save}/><button className="camp-settings" aria-label="设置" onClick={onSettings}><GearIcon/></button></div>
    <nav className="camp-rail" aria-label="营地菜单">
      {actions.map(({label,image,open})=><button key={label} aria-label={label} onClick={open}>
        {image?<Art id={image}/>:<QuestionMarkCircledIcon/>}<span>{label}</span>
      </button>)}
    </nav>
    <Art id="forge-dave-standing" className="camp-dave" alt="戴夫手持园艺铲站在温室中"/>
    <div className="camp-actions">
      {resume&&<button className="cream-button" disabled={!ready} onClick={onResume}>继续远征 · {resume}</button>}
      <Gold disabled={!ready} onClick={onMap}><span>出发</span><DoubleArrowRightIcon/></Gold>
    </div>
    <div className="game-meta"><span>{version}</span><a href="https://github.com/holynova/plant-survivors-ui" target="_blank" rel="noreferrer">GitHub ↗</a></div>
  </div>;
}

const lessons = [
  ['forge-map-day','移动与攻击','按住战场空白处，向想去的方向拖动。两只手都能操作，松手停下。植物会自动攻击。'],
  ['ground-sun','收集与升级','走近阳光获取经验。经验条满后，从三张卡中选一张。下方绿条显示植物的攻击冷却。'],
  ['gatling','武器质变','同一株武器升到 Lv.5 会改变攻击方式。满级主植物配上对应被动，还能进化。'],
  ['ground-heal','闪避与补给','离开敌人的地面警示区。受伤时捡回复果实，或在水井附近停留直到恢复。'],
  ['ground-coin','局外成长','精英与首领会掉落金币和钻石。回营后可解锁植物、购买永久强化，再次出发。'],
] as const;
export function Tutorial({Art,back}:{Art:GameArt;back:()=>void}){
  return <div className="page forge-tutorial"><Sign back={back}>教程</Sign>
    <GameScroll><div className="tutorial-lessons">{lessons.map(([id,title,body])=>
      <article className="tutorial-lesson" key={title}><Art id={id}/><div><h2>{title}</h2><p>{body}</p></div></article>
    )}</div></GameScroll>
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

const heroStats = {
  dave:['生命 125','减伤 20%','站稳再减伤'],
  flora:['经验 +25%','拾取更远','取水更快'],
  rusty:['冷却 −20%','移速 +15%','移动充能'],
} as const;
const statIcons=[HeartFilledIcon,LightningBoltIcon,StarFilledIcon];
export function HeroSelect({Art,hero,select,back,next}:{Art:GameArt;hero:HeroId;select:(hero:HeroId)=>void;back:()=>void;next:()=>void}){
  return <div className="page forge-heroes">
    <Sign back={back}>主角</Sign>
    <GameScroll className="forge-heroes-scroll">
      <div className="forge-hero-list">
        {heroIds.map(id=>{
          const data=heroes[id];
          return <button className="forge-hero-card" aria-pressed={hero===id} key={id} aria-label={data.name+"，"+data.description} title={data.description} onClick={()=>select(id)}>
            <span className="forge-hero-portrait"><Art id={"portrait-"+id}/><b>{data.name}</b></span>
            <span className="forge-hero-copy">{heroStats[id].map((line,index)=>{const Icon=statIcons[index];return <span key={line}><Icon/>{line}</span>})}</span>
            {hero===id&&<CheckIcon className="forge-hero-selected"/>}
          </button>;
        })}
      </div>
    </GameScroll>
    <div className="forge-footer"><Gold onClick={next}>选择植物 <ChevronRightIcon/></Gold></div>
  </div>;
}

export function PlantLoadout({Art,starter,pool,save,select,toggle,back,next}:{Art:GameArt;starter:string;pool:string[];save:GardenSave;select:(id:string)=>void;toggle:(id:string)=>void;back:()=>void;next:()=>void}){
  const [tab,setTab]=useState<'starter'|'pool'>('starter');
  const candidates=tab==='starter'?activePlants:activePlants.filter(id=>save.plants.includes(id));
  return <div className="page forge-loadout">
    <Sign back={back}>配装</Sign>
    <div className="guide-tabs forge-loadout-tabs" aria-label="配装类别">
      <button aria-pressed={tab==='starter'} onClick={()=>setTab('starter')}><MixIcon/>起始植物</button>
      <button aria-pressed={tab==='pool'} onClick={()=>setTab('pool')}><FileTextIcon/>升级候选</button>
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
            {locked?<small className="forge-locked"><LockClosedIcon/> 未解锁</small>:<span className={`forge-card-state ${chosen?'is-chosen':''}`}>{chosen?(tab==='starter'?'起始':'已加入'):'可选'}</span>}
          </button>;
        })}
      </div>
    </GameScroll>
    <div className="forge-loadout-summary">
      <div className="forge-section-title"><b>出战候选 ({pool.length}/8)</b></div>
      <div className="forge-pool-strip" aria-label={`起始植物 ${plants[starter].name}，Lv.5 质变：${awakeningText(starter)}`}>
        {[starter,...pool.filter(id=>id!==starter)].slice(0,8).map(id=><div className={`forge-pool-slot ${id===starter?'is-starter':''}`} key={id} title={`${plants[id].name} · ${awakeningText(id)}`}><Art id={id} alt={plants[id].name}/></div>)}
      </div>
    </div>
    <div className="forge-footer prepare-footer"><Gold onClick={next}>开始战斗 <DoubleArrowRightIcon/></Gold></div>
  </div>;
}
