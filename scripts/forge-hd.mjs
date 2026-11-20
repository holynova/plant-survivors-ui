import sharp from 'sharp';
const src='assets/source-forge/',dst='public/assets/game/release/';
async function save(pipe,id){await pipe.webp({quality:85,alphaQuality:100}).toFile(dst+id+'.webp');}
await save(sharp(src+'workshop.png').resize(768,1536,{fit:'cover'}),'forge-workshop');
await save(sharp(src+'loading.png').resize({width:780}),'forge-loading');
await save(sharp(src+'dave.png').trim({threshold:15}).resize({height:900}),'forge-dave-standing');
const cropped=await sharp(src+'dave.png').extract({left:20,top:0,width:850,height:805}).png().toBuffer();
await save(sharp(cropped).resize({height:510}),'portrait-dave');
for(const [i,id] of ['flora','rusty'].entries()){const b=await sharp(src+'portraits.png').extract({left:i*887,top:0,width:887,height:887}).png().toBuffer();await save(sharp(b).trim({threshold:15}).resize({height:510}),'portrait-'+id);}
for(const [i,id] of ['day','night','roof'].entries()){const top=Math.round(i*1448/3),end=Math.round((i+1)*1448/3);await save(sharp(src+'maps.png').extract({left:0,top,width:1086,height:end-top}).resize(890,405,{fit:'cover'}),'forge-map-'+id);}
await save(sharp('public/assets/game/logo-trim.png').resize({width:930}),'logo-trim');
