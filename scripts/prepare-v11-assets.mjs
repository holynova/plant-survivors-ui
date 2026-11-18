import sharp from 'sharp';import fs from 'node:fs/promises';
const out='public/assets/game/release',src='assets/source-v11',clear={r:0,g:0,b:0,alpha:0};
const meta=await sharp(`${src}/garden-atlas.png`).metadata(),layers=[],props=[];
for(let i=0;i<16;i++){
 const left=Math.round(i%4*meta.width/4),top=Math.round(Math.floor(i/4)*meta.height/4),right=Math.round((i%4+1)*meta.width/4),bottom=Math.round((Math.floor(i/4)+1)*meta.height/4);
 const raw=await sharp(`${src}/garden-atlas.png`).extract({left,top,width:right-left,height:bottom-top}).ensureAlpha().raw().toBuffer({resolveWithObject:true});let x0=raw.info.width,y0=raw.info.height,x1=0,y1=0;
 // Reject fragments from neighboring atlas cells before measuring the opaque foot.
 const {width:w,height:h}=raw.info,seen=new Uint8Array(w*h);let largest=[];
 for(let pixel=0;pixel<w*h;pixel++){if(seen[pixel]||raw.data[pixel*4+3]<=48)continue;const component=[pixel];seen[pixel]=1;for(let j=0;j<component.length;j++){const q=component[j],x=q%w,y=Math.floor(q/w);for(const n of [x>0?q-1:-1,x<w-1?q+1:-1,y>0?q-w:-1,y<h-1?q+w:-1])if(n>=0&&!seen[n]&&raw.data[n*4+3]>48){seen[n]=1;component.push(n)}}if(component.length>largest.length)largest=component;}
 for(const q of largest){x0=Math.min(x0,q%w);x1=Math.max(x1,q%w);y0=Math.min(y0,Math.floor(q/w));y1=Math.max(y1,Math.floor(q/w))}
 x0=Math.max(0,x0-2);y0=Math.max(0,y0-2);x1=Math.min(w-1,x1+2);y1=Math.min(h-1,y1+2);
 const input=sharp(raw.data,{raw:raw.info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1});
 if(i<12){const buf=await input.resize(112,112,{fit:'inside'}).png().toBuffer(),m=await sharp(buf).metadata();layers.push({input:buf,left:i%4*128+Math.round((128-m.width)/2),top:Math.floor(i/4)*128+116-m.height});props.push({anchor:116/128,width:m.width/128,height:m.height/128});}
 else{const id=['ground-coin','ground-heal','ground-gem','ground-sun'][i-12];const buf=await input.resize(56,56,{fit:'inside'}).png().toBuffer(),m=await sharp(buf).metadata();await sharp({create:{width:64,height:64,channels:4,background:clear}}).composite([{input:buf,left:Math.round((64-m.width)/2),top:60-m.height}]).webp({quality:90,alphaQuality:100}).toFile(`${out}/${id}.webp`);}
}
await sharp({create:{width:512,height:384,channels:4,background:clear}}).composite(layers).webp({quality:90,alphaQuality:100}).toFile(`${out}/garden-props.webp`);
await fs.writeFile('src/game/prop-metadata.json',JSON.stringify(props,null,2)+'\n');
const t=await sharp(`${src}/terrain.png`).metadata();for(let i=0;i<3;i++){const left=Math.round(i*t.width/3),right=Math.round((i+1)*t.width/3);await sharp(`${src}/terrain.png`).extract({left,top:0,width:right-left,height:t.height}).resize(512,512).webp({quality:86}).toFile(`${out}/${['garden-grass','garden-night','garden-roof'][i]}.webp`)}
console.log('12 grounded props, 4 clean loot sprites, 3 quiet terrain tiles.');
