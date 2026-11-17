import {memo} from 'react';
export const HealthMeter=memo(function HealthMeter({hp,maxHp,hit,reduced}:{hp:number;maxHp:number;hit:boolean;reduced:boolean}){
 const ratio=Math.max(0,Math.min(1,hp/Math.max(1,maxHp))),value=Math.max(0,Math.ceil(hp));
 return <div className={`health-meter${hit?' is-hit':''}${ratio<=.25?' is-low':''}${reduced?' reduced-health':''}`} role="progressbar" aria-label="生命值" aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={value} aria-valuetext={`${value} / ${maxHp}${ratio<=.25?'，生命不足':''}`}>
  <i className="health-loss" aria-hidden="true" style={{transform:`scaleX(${ratio})`}}/>
  <i className="health-fill" aria-hidden="true" style={{transform:`scaleX(${ratio})`}}/>
  <span className="health-value" aria-hidden="true"><span>♥</span><b>{value}</b><small>/ {maxHp}</small></span>
 </div>;
});
