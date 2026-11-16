import {useState,useRef,type ComponentType} from 'react';
import {plants} from './game/plants';
import {GameScroll} from './GameScroll';
import {heroes,heroIds,plantLore,enemyLore} from './game/catalog';
import {names,attackInterval,createRun} from './game/simulation';
type ArtProps={id:string,className?:string,alt?:string};
export function FieldGuide({Art,back}:{Art:ComponentType<ArtProps>,back:()=>void}){
 const scroll=useRef<HTMLElement>(null);
 const toTop=()=>requestAnimationFrame(()=>scroll.current?.scrollTo({top:0,behavior:'smooth'}));
 const [tab,setTab]=useState('plants'),[selected,setSelected]=useState('pea');
 const entries=tab==='heroes'?heroIds.map(id=>({id,art:heroes[id].art,name:heroes[id].name,role:heroes[id].title,description:heroes[id].description,detail:heroes[id].story,extra:`特性 · ${heroes[id].trait}`})):tab==='enemies'?enemyLore.map(e=>({...e,detail:'',extra:e.id==='boss-trim'?'首领基础生命 2200 · 每张后续地图 +700':e.id==='runner'?'精英基础生命 780 · 击败奖励 8 经验':e.id==='guard'?'精英基础生命 1200 · 后期 +350 · 奖励 8 经验':'生命随时间与关卡增长'})):Object.keys(names).map(id=>({id,art:id,name:names[id],role:plantLore[id].role,description:plantLore[id].mechanic,detail:`${plants[id].origin} · ${plantLore[id].evolution}`,extra:attackInterval(createRun(id),id)?`Lv.1 基础冷却 ${attackInterval(createRun(id),id).toFixed(2)} 秒 · 最高 Lv.5`:'被动植物 · 持续生效 · 最高 Lv.5'}));
 const entry=entries.find(e=>e.id===selected)||entries[0];
 return <div className="page field-guide"><header className="sign"><button className="back" aria-label="返回营地" onClick={back}>‹</button><h1>花园图鉴</h1></header><div className="guide-tabs" role="tablist" aria-label="图鉴分类">{[['plants',`植物 / 装备 · ${Object.keys(names).length}`],['heroes','主角 · 3'],['enemies',`僵尸 · ${enemyLore.length}`]].map(([id,label])=><button key={id} role="tab" aria-selected={tab===id} onClick={()=>{setTab(id);setSelected('');toTop()}}>{label}</button>)}</div><GameScroll ref={scroll} className="guide-scroll"><div className="guide-body"><section className="guide-detail paper" aria-live="polite"><div className="guide-portrait"><Art id={entry.art}/>{['runner','guard'].includes(entry.id)&&<span className="elite-label">精英</span>}</div><small>{entry.role}</small><h2>{entry.name}</h2><p>{entry.description}</p><div className="guide-stat">{entry.extra}</div>{entry.detail!==entry.description&&<p>{entry.detail}</p>}</section><div className="guide-grid">{entries.map(e=><button className={`plant-card ${e.id===entry.id?'selected':''}`} key={e.id} aria-label={`查看${e.name}`} aria-pressed={e.id===entry.id} onClick={()=>{setSelected(e.id);toTop()}}><Art id={e.art}/><b>{e.name}</b><small>{e.role.split(' · ')[0]}</small></button>)}</div><p className="guide-note">所有条目均可查看 · 实际数值会受到等级与主角特性影响</p></div></GameScroll></div>
}
