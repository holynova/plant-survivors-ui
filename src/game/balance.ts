export const progression={firstXp:10,growth:1.2,increment:3,sunflowerBonus:.08};
export const enemySize={normal:65,elite:118,boss:140};
export function eliteStats(kind:'runner'|'guard',stage:number,wave=1){return {hp:kind==='runner'?780+stage*200:1200+stage*300+(wave>=3?350:0),speed:kind==='runner'?57:36,damage:kind==='runner'?22:24,xp:8};}
