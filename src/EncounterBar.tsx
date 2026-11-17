import type {Run} from './game/simulation';
import {bosses} from './game/bosses';
/** Only an active boss earns a second HUD line. All forecasts/elite details live in pause. */
export function EncounterBar({run:s}:{run:Run}){const boss=s.enemies.find(e=>e.boss&&e.hp>0);if(!boss)return null;return <div className="encounter-bar"><div className="boss-health"><b>{bosses[boss.kind]?.name||'巨人领主'}</b><meter aria-label={`${bosses[boss.kind]?.name||'巨人领主'}生命`} min={0} max={boss.max} value={Math.max(0,boss.hp)}/><span>{Math.ceil(boss.hp/boss.max*100)}%</span></div></div>}
