import {useLayoutEffect, useRef, useState} from 'react';
import {ChevronLeftIcon, ChevronRightIcon, DoubleArrowRightIcon, LockClosedIcon} from '@radix-ui/react-icons';
import {Sign, type GameArt} from './ForgeUI';
import {GameScroll} from './GameScroll';
import {heroes, heroIds, plantLore, enemyLore} from './game/catalog';
import {plants} from './game/plants';
import {awakeningText} from './game/awakening';
import type {GardenSave} from './game/progression';

const categories=[['plants','植物'],['enemies','僵尸'],['heroes','主角']] as const;

export function FieldGuide({Art,save,back}:{Art:GameArt;save:GardenSave;back:()=>void}){
  const [tab,setTab]=useState<(typeof categories)[number][0]>('plants');
  const [selected,setSelected]=useState<string|null>(null);
  const scroll=useRef<HTMLElement>(null);
  const gridPosition=useRef(0);
  useLayoutEffect(()=>{
    if(scroll.current)scroll.current.scrollTop=selected?0:gridPosition.current;
  },[selected,tab]);
  const entries=tab==='heroes' ? heroIds.map(id=>{
    const hero=heroes[id];
    return {id,art:hero.art,name:hero.name,role:hero.title,description:hero.description,detail:hero.story,extra:hero.trait,locked:false};
  }) : tab==='enemies' ? enemyLore.map(enemy=>({...enemy,detail:'',extra:enemy.role,locked:false})) :
    Object.entries(plants).map(([id,plant])=>({
      id,art:id,name:plant.name,role:plant.role,description:plantLore[id].mechanic,
      detail:plant.interval?awakeningText(id):plantLore[id].evolution,
      extra:plant.interval?`基础冷却 ${plant.interval.toFixed(2)} 秒`:'被动装备 · 持续生效',
      locked:!save.plants.includes(id),
    }));
  const entry=entries.find(item=>item.id===selected);
  const move=(delta:number)=>{
    const index=entries.findIndex(item=>item.id===selected);
    setSelected(entries[(index+delta+entries.length)%entries.length].id);
  };
  const close=()=>entry?setSelected(null):back();
  return <div className="page field-guide forge-guide">
    <Sign back={close}>{entry?'详情':'图鉴'}</Sign>
    {!entry&&<div className="guide-tabs" role="tablist" aria-label="图鉴分类">
      {categories.map(([id,label])=><button key={id} role="tab" aria-selected={tab===id} onClick={()=>{gridPosition.current=0;setTab(id);if(scroll.current)scroll.current.scrollTop=0}}>{label} · {id==='plants'?Object.keys(plants).length:id==='enemies'?enemyLore.length:heroIds.length}</button>)}
    </div>}
    {!entry&&tab==='plants'&&<p className="forge-guide-count">已收集 <b>{entries.filter(item=>!item.locked).length}/{entries.length}</b></p>}
    <GameScroll ref={scroll} className="guide-scroll forge-guide-scroll">
      {entry ? <div className="forge-specimen">
        <div className="forge-specimen-stage">
          <button className="cream-button" aria-label="上一条" onClick={()=>move(-1)}><ChevronLeftIcon/></button>
          <Art id={entry.art} alt={entry.name}/>
          <button className="cream-button" aria-label="下一条" onClick={()=>move(1)}><ChevronRightIcon/></button>
        </div>
        <h2>{entry.name}</h2>
        <section className="paper forge-specimen-info">
          <div className="forge-tags"><span>{entry.role}</span><span>{entry.extra}</span></div>
          <p>{entry.description}</p>
          {entry.locked&&<p className="forge-specimen-lock"><LockClosedIcon/> 未解锁 · {plants[entry.id].coins} 金币{plants[entry.id].gems>0?` + ${plants[entry.id].gems} 钻石`:''}</p>}
          {entry.detail&&<div className="forge-preview"><b>{tab==='plants'&&plants[entry.id].interval?'Lv.5 质变预览':'档案'}</b><p>{entry.detail}</p>{tab==='plants'&&entry.id==='pea'&&<div className="forge-preview-art"><Art id={entry.art}/><DoubleArrowRightIcon/><Art id="gatling" alt="进化搭配后的烈焰机枪"/></div>}</div>}
        </section>
      </div> : <div className="guide-grid">
        {entries.map(item=><button className={`plant-card ${item.locked?'plant-locked':''}`} key={item.id} aria-label={`查看${item.name}`} onClick={()=>{gridPosition.current=scroll.current?.scrollTop||0;setSelected(item.id)}}>
          <Art id={item.art}/><b>{item.name}</b>{item.locked?<small className="forge-locked"><LockClosedIcon/> 未解锁</small>:<small>{item.role.split(' · ')[0]}</small>}
        </button>)}
      </div>}
    </GameScroll>
  </div>;
}
