// Shared by damage resolution and ground telegraphs. Units are world pixels.
export const attackGeometry={bossRadius:72,eliteRadius:50,normalRadius:32,chargeSpeed:280,chargeDuration:.72,chargeRadius:35,chargeWindup:.85,fireLength:330,fireHalfWidth:32,coneRadius:145,coneHalfAngle:Math.PI*.32};
export function impactRadius(e:{boss:boolean;elite?:string}){return e.boss?attackGeometry.bossRadius:e.elite?attackGeometry.eliteRadius:attackGeometry.normalRadius;}
