import sharp from 'sharp';
import fs from 'node:fs/promises';
const sources={...JSON.parse(await fs.readFile('docs/animation-sources.json','utf8')),...JSON.parse(await fs.readFile('docs/hero-animation-sources.json','utf8'))};
const out='public/assets/game/animations';await fs.mkdir(out,{recursive:true});
const report={};
for(const [id,source] of Object.entries(sources)){
 if(id.startsWith('battle-')){await sharp(source.source).resize(780,1360,{fit:'fill'}).png().toFile(`public/assets/game/${id}.png`);continue;}
 const path=source.cleaned||source.source;const im=sharp(path);const meta=await im.metadata();const stats=await im.stats();if(stats.channels[3].min!==0)throw Error(`${id}: background not truly transparent`);
 const frames=[];let maxW=0,maxH=0;
 for(let i=0;i<16;i++){const left=Math.round(i%4*meta.width/4),top=Math.round(Math.floor(i/4)*meta.height/4),right=Math.round((i%4+1)*meta.width/4),bottom=Math.round((Math.floor(i/4)+1)*meta.height/4);
 const tile=await sharp(path).extract({left,top,width:right-left,height:bottom-top}).ensureAlpha().raw().toBuffer({resolveWithObject:true});const {data,info}=tile;let x0=info.width,y0=info.height,x1=0,y1=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){if(data[(y*info.width+x)*4+3]>60){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}
 if(x1<=x0)throw Error(`${id} frame ${i} empty`);const crop={left:x0,top:y0,width:x1-x0+1,height:y1-y0+1};maxW=Math.max(maxW,crop.width);maxH=Math.max(maxH,crop.height);frames.push({data,info,crop});}
 const cell=192,scale=Math.min(170/maxW,150/maxH);const layers=[];
 for(let i=0;i<16;i++){const f=frames[i];const width=Math.max(1,Math.round(f.crop.width*scale)),height=Math.max(1,Math.round(f.crop.height*scale));const input=await sharp(f.data,{raw:f.info}).extract(f.crop).resize(width,height).png().toBuffer();layers.push({input,left:i%4*cell+Math.round((cell-width)/2),top:Math.floor(i/4)*cell+(id==='fx'?Math.round((cell-height)/2):Math.round(cell*.84)-height)});}
 await sharp({create:{width:cell*4,height:cell*4,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).webp({quality:92,alphaQuality:100}).toFile(`${out}/${id}.webp`);
 if(!['plants','fx'].includes(id))await sharp(`${out}/${id}.webp`).extract({left:0,top:0,width:cell,height:cell}).webp().toFile(`${out}/${id}-idle.webp`);
 report[id]={frames:16,cell,anchor:[.5,.84],sharedScale:scale,alphaMin:stats.channels[3].min};
}
await fs.writeFile(`${out}/manifest.json`,JSON.stringify(report,null,2));console.log(report);
