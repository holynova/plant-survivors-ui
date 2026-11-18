import {useRef, useState} from 'react';
import {CheckIcon} from '@radix-ui/react-icons';
import {GameScroll} from './GameScroll';
import {Sign, Wallet, type GameArt} from './ForgeUI';
import {plants, plantIds} from './game/plants';
import {upgrades, cost, purchase, type GardenSave} from './game/progression';

const upgradeArt:Record<keyof typeof upgrades,string>={vigor:'walnut',magnetism:'magnet',fortune:'bag'};

export function GardenShop({save,onSave,onUnlock,Art,back}:{save:GardenSave;onSave:(s:GardenSave)=>void;onUnlock:(id:string)=>void;Art:GameArt;back:()=>void}){
  const [tab,setTab]=useState<'plants'|'upgrades'>('plants');
  const [notice,setNotice]=useState('');
  const scroll=useRef<HTMLElement>(null);
  const buyUpgrade=(id:string)=>{
    const next=purchase(save,id);
    if(next===save)return;
    onSave(next);
    setNotice(`${upgrades[id as keyof typeof upgrades].name}升至 Lv.${next.upgrades[id]}`);
  };
  return <div className="page garden-shop forge-shop">
    <div className="forge-shop-header"><Sign back={back}>{tab==='plants'?'种子商店':'永久成长'}</Sign><Wallet Art={Art} save={save}/></div>
    <div className="guide-tabs shop-tabs">
      <button aria-pressed={tab==='plants'} onClick={()=>{setTab('plants');setNotice('');scroll.current?.scrollTo(0,0)}}>植物种子</button>
      <button aria-pressed={tab==='upgrades'} onClick={()=>{setTab('upgrades');setNotice('');scroll.current?.scrollTo(0,0)}}>永久成长</button>
    </div>
    <GameScroll ref={scroll} className="shop-scroll">
      <div className="forge-shop-list">
        {(tab==='plants'?plantIds:Object.keys(upgrades)).map(id=>{
          const plant=tab==='plants'?plants[id]:undefined;
          const upgrade=upgrades[id as keyof typeof upgrades];
          const price=cost(save,id);
          const level=save.upgrades[id]||0;
          const affordable=save.coins>=price.coins&&save.gems>=price.gems;
          const label=plant?.name||upgrade.name;
          return <article className="forge-shop-row" key={id}>
            <Art id={plant?id:upgradeArt[id as keyof typeof upgrades]}/>
            <div className="forge-shop-copy"><h2>{label}</h2><small>{plant?plant.role:`Lv.${level} / ${upgrade.max}`}</small>{!plant&&<p>{upgrade.description}</p>}</div>
            {price.owned?<span className="forge-owned"><CheckIcon/>{plant?'已拥有':'已满级'}</span>:
            <button className="forge-price" disabled={!plant&&!affordable} onClick={()=>plant?onUnlock(id):buyUpgrade(id)}
              aria-label={`${plant?'解锁':'升级'}${label}，${price.coins} 金币${price.gems?`，${price.gems} 钻石`:''}${affordable?'':'，余额不足'}`}>
              <span><Art id="ground-coin"/>{price.coins}{price.gems>0&&<><Art id="ground-gem"/>{price.gems}</>}</span>
              {!affordable&&<small>余额不足</small>}
            </button>}
          </article>;
        })}
      </div>
    </GameScroll>
    <p className="shop-notice" role="status">{notice||(tab==='plants'?`已解锁 ${plantIds.filter(id=>save.plants.includes(id)).length}/${plantIds.length} 株植物`:'永久强化会在下一次远征生效')}</p>
  </div>;
}
