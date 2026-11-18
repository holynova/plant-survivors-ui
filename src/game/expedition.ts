import type {Run} from './simulation.ts';
export type Landmark={id:string;kind:'cache'|'well'|'beacon';x:number;y:number;progress:number;done:boolean};
export const stageStories=[
 {mission:'救回散落的种子箱',detail:'金色箱子装着种子；绿色水井可以恢复生命。',ending:'戴夫把种子搬回温室。下一季的花园有了希望。'},
 {mission:'点亮泳池边的灯塔',detail:'池水会拖慢脚步，沿木桥绕行；点亮灯塔可带来补给。',ending:'月光映回池面，失散的植物终于找到了回家的路。'},
 {mission:'修复屋顶的集水装置',detail:'瓦片上的阵风会推动角色，沿挡风花盆接近装置。',ending:'最后一滴雨落进水箱，屋顶上的新芽重新抬起了头。'},
];
export function landmarks(width:number,height:number,stage:number):Landmark[]{const x=width/2,y=height/2;return[{id:'seed',kind:'cache',x:x+260,y:y-180,progress:0,done:false},{id:'water',kind:'well',x:x-290,y:y+100,progress:0,done:false},{id:'task',kind:'beacon',x:x+80,y:y+440,progress:0,done:false}];}
export function waveBeat(time:number){const phase=time%40;return phase<9?{name:'收集与恢复',spawn:1.65}:phase<28?{name:'敌群集结',spawn:1}:{name:'守住缺口',spawn:.75};}
// Local terrain mechanics, shared by simulation and rendering. Bridges remain traversable.
export function terrainEffect(s:Pick<Run,'x'|'y'|'stage'|'time'|'worldWidth'|'worldHeight'>){const cx=s.worldWidth/2,cy=s.worldHeight/2;const pool=s.stage===1&&s.x>cx-230&&s.x<cx+230&&Math.abs(s.y-(cy-340))<100&&Math.abs(s.x-cx)>38;const sheltered=s.stage===2&&Math.abs(s.x-cx)<75;return{pool,speed:pool?.72:1,wind:s.stage===2&&!sheltered&&s.time%24>17?22:0};}
export function stepExpedition(s:Run,dt:number,emit:(s:Run,type:string,x:number,y:number,kind?:string,value?:number)=>void){
 if(s.moving)s.tutorial.moved+=dt;
 for(const point of s.landmarks){if(point.done)continue;const near=Math.hypot(s.x-point.x,s.y-point.y)<42;if(near&&!(s.time-s.hitAt<1)){point.progress=Math.min(1,point.progress+dt/(point.kind==='cache'?1.3:s.hero==='flora'?1.8:3));if(point.progress>=1){point.done=true;s.objectives++;if(point.kind==='well')s.hp=Math.min(s.maxHp,s.hp+45);else{s.coins+=point.kind==='cache'?12:20;s.gems+=point.kind==='beacon'?1:0;s.xp+=point.kind==='cache'?4:7;}s.alert=point.kind==='well'?'水井恢复了生命':point.kind==='cache'?'种子已救回 · 金币 +12':'装置已修复 · 钻石 +1';s.warning=2;emit(s,'treasure',point.x,point.y,point.kind,35);}}}
 // Heroes ask for different positioning decisions, beyond base numerical attributes.
 s.heroAbility=Math.max(0,s.heroAbility-dt);
 if(s.hero==='dave'&&!s.moving&&s.time-s.hitAt>2)s.braced=Math.min(1,s.braced+dt/1.5);else s.braced=Math.max(0,s.braced-dt*2);
 if(s.hero==='rusty'&&s.moving)s.charge=Math.min(1,s.charge+dt/5);else if(s.hero==='rusty')s.charge=Math.max(0,s.charge-dt*.3);
 if(s.hero==='rusty'&&s.charge>=1&&s.heroAbility<=0){s.heroAbility=3;s.charge=0;emit(s,'pulse',s.x,s.y,'lightning',45);}
}
export function tutorialText(s:Run){if(s.tutorial.moved<1.2)return '按住空白战场并拖动 · 左右手皆可';if(!s.tutorial.collected)return '靠近金色阳光，自动拾取经验';if(!s.tutorial.upgraded)return '积攒阳光后，选择一次植物升级';if(!s.landmarks.some(p=>p.done)&&s.time<35)return '暂停 → 地图，查看附近探索点';return '';}
