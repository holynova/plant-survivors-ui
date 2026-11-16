export const mapSizes=[{width:4800,height:4800},{width:5400,height:4200},{width:4200,height:5600}];
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export type WorldView={x:number;y:number;width:number;height:number;worldWidth:number;worldHeight:number;cameraX:number;cameraY:number};
export function followCamera(s:WorldView,dt=1){const x=clamp(s.x-s.width/2,0,Math.max(0,s.worldWidth-s.width)),y=clamp(s.y-s.height/2,0,Math.max(0,s.worldHeight-s.height));const blend=1-Math.exp(-12*dt);s.cameraX+=(x-s.cameraX)*blend;s.cameraY+=(y-s.cameraY)*blend;}
export function worldToScreen(s:WorldView,x:number,y:number){return {x:x-s.cameraX,y:y-s.cameraY};}
export function visible(s:WorldView,x:number,y:number,padding=130){return x>s.cameraX-padding&&x<s.cameraX+s.width+padding&&y>s.cameraY-padding&&y<s.cameraY+s.height+padding;}
export function spawnRing(s:WorldView,random:()=>number){const a=random()*Math.PI*2,r=Math.hypot(s.width/2,s.height/2)+70;return {x:clamp(s.x+Math.cos(a)*r,32,s.worldWidth-32),y:clamp(s.y+Math.sin(a)*r,32,s.worldHeight-32)};}
