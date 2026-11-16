export type TouchStick={id:number;originX:number;originY:number;x:number;y:number};
export function beginTouch(id:number,x:number,y:number):TouchStick{return {id,originX:x,originY:y,x:0,y:0};}
// A tiny dead zone, immediate response, and a following origin avoid a stretched joystick.
export function moveTouch(stick:TouchStick,x:number,y:number):TouchStick{let dx=x-stick.originX,dy=y-stick.originY;const length=Math.hypot(dx,dy);let originX=stick.originX,originY=stick.originY;if(length>42){originX=x-dx/length*42;originY=y-dy/length*42;}const power=Math.min(1,Math.max(0,(length-2)/24));return {...stick,originX,originY,x:length?dx/length*power:0,y:length?dy/length*power:0};}
