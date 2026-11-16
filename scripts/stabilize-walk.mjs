// Register the unchanged cart/head landmarks, never scale individual frames.
import sharp from 'sharp';import fs from 'node:fs/promises';
const dir='public/assets/game/animations';const manifest=JSON.parse(await fs.readFile(`${dir}/manifest.json`));
for(const id of ['dave','flora','rusty']){
 const path=`${dir}/${id}.webp`,n=192;const tiles=[];for(let i=0;i<16;i++)tiles.push(await sharp(path).extract({left:i%4*n,top:Math.floor(i/4)*n,width:n,height:n}).ensureAlpha().raw().toBuffer());
 // Dave: cart axle and wheel; other heroes: fixed head and hat/goggles.
 const roi=id==='dave'?[96,105,169,155]:[65,20,127,72],base=tiles[0],shifts=[[0,0]];
 for(let i=1;i<4;i++){let best=Infinity,bx=0,by=0;for(let dy=-6;dy<=6;dy++)for(let dx=-10;dx<=10;dx++){let error=0,count=0;for(let y=roi[1];y<roi[3];y+=2)for(let x=roi[0];x<roi[2];x+=2){const a=(y*n+x)*4,b=((y+dy)*n+x+dx)*4;if(base[a+3]<100)continue;for(let c=0;c<4;c++)error+=(base[a+c]-tiles[i][b+c])**2;count++;}const score=error/Math.max(1,count);if(score<best){best=score;bx=dx;by=dy;}}shifts.push([-bx,-by]);}
 const layers=[];for(let i=0;i<16;i++){const [dx,dy]=shifts[i]||[0,0];const input=await sharp(tiles[i],{raw:{width:n,height:n,channels:4}}).extract({left:Math.max(0,-dx),top:Math.max(0,-dy),width:n-Math.abs(dx),height:n-Math.abs(dy)}).png().toBuffer();layers.push({input,left:i%4*n+Math.max(0,dx),top:Math.floor(i/4)*n+Math.max(0,dy)});}
 const output=await sharp({create:{width:768,height:768,channels:4,background:'#00000000'}}).composite(layers).webp({quality:94,alphaQuality:100}).toBuffer();await fs.writeFile(path,output);await sharp(output).extract({left:0,top:0,width:n,height:n}).webp().toFile(`${dir}/${id}-idle.webp`);manifest[id].walkRegistration=shifts;console.log(id,shifts);
}
await fs.writeFile(`${dir}/manifest.json`,JSON.stringify(manifest,null,2));
