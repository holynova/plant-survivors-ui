import type {Run} from './game/simulation';
import {bosses} from './game/bosses';

export function EncounterBar({run}:{run:Run}){
 const boss=run.enemies.find(e=>e.boss&&e.hp>0);if(!boss)return null;
 const name=bosses[boss.kind]?.name||'巨人领主',percent=Math.min(100,Math.ceil(boss.hp/boss.max*100));
 return <div className="encounter-bar"><div className="boss-health">
  <b><img alt="" src={`assets/game/animations/${bosses[boss.kind]?boss.kind:"boss-trim"}-idle.webp`}/>{name}</b><div className="boss-gauge" role="meter" aria-label={name+'生命'} aria-valuemin={0} aria-valuemax={boss.max} aria-valuenow={Math.ceil(boss.hp)}>
   <i style={{width:percent+'%'}}/><strong>{percent}%</strong>
  </div></div></div>;
}
