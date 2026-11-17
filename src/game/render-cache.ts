import tokens from '../design/tokens.json' with {type:'json'};
export type Glyph={image:HTMLCanvasElement;width:number;height:number;x:number;y:number};
let measureContext:CanvasRenderingContext2D|undefined;
const labels=new Map<string,Glyph>();
function raster(width:number,height:number,x:number,y:number,paint:(c:CanvasRenderingContext2D)=>void):Glyph{const image=document.createElement('canvas');image.width=Math.ceil(width*2);image.height=Math.ceil(height*2);const c=image.getContext('2d')!;c.scale(2,2);c.translate(x,y);paint(c);return{image,width,height,x,y};}
export function stamp(c:CanvasRenderingContext2D,g:Glyph,x:number,y:number,sx=1,sy=1){c.drawImage(g.image,x-g.x*sx,y-g.y*sy,g.width*sx,g.height*sy);}
export function cachedText(c:CanvasRenderingContext2D,label:string,x:number,y:number,color:string,size:number){const key=`${size}|${color}|${label}`;let g=labels.get(key);if(!g){const measure=measureContext??=document.createElement('canvas').getContext('2d')!;measure.font=`bold ${size}px system-ui`;const width=Math.ceil(measure.measureText(label).width)+8,baseline=size+4;g=raster(width,Math.ceil(size*1.7)+8,width/2,baseline,ctx=>{ctx.font=`bold ${size}px system-ui`;ctx.textAlign='center';ctx.strokeStyle=tokens.colors.ink;ctx.lineWidth=3;ctx.strokeText(label,0,0);ctx.fillStyle=color;ctx.fillText(label,0,0);});if(labels.size>=256)labels.delete(labels.keys().next().value!);labels.set(key,g);}stamp(c,g,x,y);}
export function cacheDiagnostics(){let bytes=0;for(const g of labels.values())bytes+=g.image.width*g.image.height*4;return{labels:labels.size,bytes};}
