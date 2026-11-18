// Find transparent gutters on the painted source, not the nominal 4x4 grid.
// Repad each frame with a transparent border; use a common scale to preserve burst growth.
import sharp from 'sharp';
export async function packCombatArt(file,dest){
 const {data,info:{width:w,height:h}}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const alpha=(x,y)=>data[4*(y*w+x)+3];
 function gutters(n,score){return [0,...[1,2,3].map(i=>{const mid=n*i/4;let best=Infinity,cut=Math.round(mid);for(let k=Math.ceil(mid-n*.084);k<mid+n*.064;k++){const cost=score(k)+Math.abs(k-mid)*.005;if(cost<best){best=cost;cut=k}}return cut}),n]}
 const ys=gutters(h,y=>{let v=0;for(let x=0;x<w;x++)v+=Math.max(0,alpha(x,y)-12);return v});
 const boxes=[];for(let r=0;r<4;r++){
  const xs=gutters(w,x=>{let v=0;for(let y=ys[r];y<ys[r+1];y++)v+=Math.max(0,alpha(x,y)-12);return v});
  for(let c=0;c<4;c++){let l=xs[c+1],t=ys[r+1],b=0,right=0;
   for(let y=ys[r];y<ys[r+1];y++)for(let x=xs[c];x<xs[c+1];x++)if(alpha(x,y)>24){l=Math.min(l,x);t=Math.min(t,y);right=Math.max(right,x);b=Math.max(b,y)}
   boxes.push({left:l,top:t,width:right-l+1,height:b-t+1});}}
 const scale=116/Math.max(...boxes.flatMap(b=>[b.width,b.height]));
 const layers=await Promise.all(boxes.map(async (b,i)=>{const cw=Math.max(1,Math.round(b.width*scale)),ch=Math.max(1,Math.round(b.height*scale));return {input:await sharp(file).extract(b).resize(cw,ch,{fit:'fill'}).png().toBuffer(),left:(i%4)*128+Math.floor((128-cw)/2),top:Math.floor(i/4)*128+Math.floor((128-ch)/2)}}));
 await sharp({create:{width:512,height:512,channels:4,background:'#00000000'}}).composite(layers).webp({quality:90,alphaQuality:100}).toFile(dest);
}
