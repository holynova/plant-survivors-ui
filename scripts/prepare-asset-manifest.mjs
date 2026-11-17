import {bossIds} from '../src/game/bosses.ts';
import {readFile,writeFile,stat, mkdir,readdir} from 'node:fs/promises';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {plantIds} from '../src/game/plants.ts';
import {newEnemyIds} from '../src/game/enemies.ts';
const root=new URL('../public/assets/game/',import.meta.url);
async function writeGenerated(path,text){try{if(await readFile(path,'utf8')===text)return}catch{}await writeFile(path,text);}
// Explicit runtime dependency graph. Source artwork remains available to artists, not preloaded.
const animations=['dave','flora','rusty','zombie','cone','bucket',...bossIds,...newEnemyIds];
const characters=['dave','flora','rusty','zombie','cone','bucket',...bossIds,...newEnemyIds];
const css=await readFile(new URL('../src/prototype.css',import.meta.url),'utf8');
const cssIds=[...css.matchAll(/assets\/game\/(?:release\/)?([\w-]+)\.(?:png|webp)/g)].map(m=>m[1]);
const ids=[...new Set([...plantIds.filter(id=>id!=='bag'),'bag-v2','gatling','grass-tile','sun','logo-trim','map-day','map-night','map-roof','result-hero-v2','seed-v2','crystal-v2','chest-v2',...cssIds])];
await mkdir(new URL('release/',root),{recursive:true});
const manifest=[];
for(const id of ids){const source=new URL(id+(id==='grass-tile'?'.webp':'.png'),root),path=`release/${id}.webp`,target=new URL(path,root);let current=false;try{current=(await stat(target)).mtimeMs>=(await stat(source)).mtimeMs}catch{}if(!current)await sharp(fileURLToPath(source)).resize({width:['lobby-bg','battle-bg','result-hero-v2'].includes(id)?900: id==='grass-tile'?512:512,withoutEnlargement:true}).webp({quality:85,alphaQuality:95}).toFile(fileURLToPath(target));manifest.push({path,bytes:(await stat(target)).size});}
for(const id of animations){const path=`animations/${id}.webp`;manifest.push({path,bytes:(await stat(new URL(path,root))).size});}
for(const id of characters){const path=`animations/${id}-idle.webp`;manifest.push({path,bytes:(await stat(new URL(path,root))).size});}
for(const id of ['v10-effects','v10-munitions','v10-props','coin-v10','heal-v10','gem-v10','apple-v10','pond-tile','roof-tile']){const path=`release/${id}.webp`;manifest.push({path,bytes:(await stat(new URL(path,root))).size});}
// Keep loading costs reviewable when future content is added.
let decodedBytes=0;for(const item of manifest){const meta=await sharp(fileURLToPath(new URL(item.path,root))).metadata();decodedBytes+=meta.width*meta.height*4;if(item.bytes>512*1024)throw Error(`Runtime image exceeds 512 KiB budget: ${item.path}`);}
const compressedBytes=manifest.reduce((n,item)=>n+item.bytes,0);
if(compressedBytes>4.5*1048576||decodedBytes>64*1048576)throw Error(`Image budget exceeded: ${compressedBytes} compressed / ${decodedBytes} estimated RGBA bytes`);
await writeGenerated(new URL('../src/game/asset-manifest.json',import.meta.url),JSON.stringify(manifest.sort((a,b)=>a.path.localeCompare(b.path)),null,2)+'\n');
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));await writeGenerated(new URL('../src/game/version.ts',import.meta.url),`// Generated from package.json.\nexport const versionLabel=${JSON.stringify('v'+pkg.version)};\n`);
console.log(`Runtime images: ${manifest.length}, ${(manifest.reduce((n,m)=>n+m.bytes,0)/1048576).toFixed(2)} MiB`);

const audioWeights={};for(const f of await readdir(new URL('audio/',root)))if(f.endsWith('.wav'))audioWeights[f.replace('.wav','')]=(await stat(new URL('audio/'+f,root))).size;const audioBytes=Object.values(audioWeights).reduce((a,b)=>a+b,0);await writeGenerated(new URL('../src/game/audio-manifest.ts',import.meta.url),`// Generated from shipped audio.\nexport const audioWeights:Record<string,number>=${JSON.stringify(audioWeights)};\nexport const audioBytes=${audioBytes};\n`);
