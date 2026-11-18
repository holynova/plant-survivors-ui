import {build} from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'docs/prototypes/hud');
await fs.mkdir(out,{recursive:true});
// Preview-only adapter: no production source edit; move minimap to pause.
const result=await build({entryPoints:['design/hud-prototypes/preview.ts'],bundle:true,format:'iife',target:'es2022',write:false,minify:true,plugins:[{name:'preview-no-minimap',setup(b){b.onLoad({filter:/game\/renderer\.ts$/},async args=>{let contents=await fs.readFile(args.path,'utf8');if(!contents.includes('navigation(c,s);'))throw Error('Renderer navigation signature changed');return {contents:contents.replace('navigation(c,s);','/* HUD study: navigation lives in pause */'),loader:'ts',resolveDir:path.dirname(args.path)};});}}]});
const manifest=JSON.parse(await fs.readFile('src/game/asset-manifest.json','utf8')),images={};
for(const item of manifest){const p=item.path,key=p.startsWith('animations/')?'anim-'+p.replace('animations/','').replace('.webp',''):p.replace('release/','').replace(/\.(png|webp)$/,'');images[key]='data:image/webp;base64,'+(await fs.readFile('public/assets/game/'+p)).toString('base64');}
const tokens=JSON.parse(await fs.readFile('src/design/tokens.json','utf8'));
const vars=Object.entries(tokens.colors).map(([k,v])=>`--${k}:${v}`).join(';');
let html=await fs.readFile('design/hud-prototypes/index.html','utf8');
html=html.replace('/* TOKENS */',`:root{${vars}}`).replace('/* STYLE */',await fs.readFile('design/hud-prototypes/style.css','utf8')).replace('/* DATA */',`window.HUD_ASSETS=${JSON.stringify(images)};`).replace('/* CODE */',result.outputFiles[0].text.replaceAll('</script','<\\/script'));
await fs.writeFile(path.join(out,'index.html'),html);
console.log(`Built standalone HUD prototypes (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MiB); production source unchanged.`);
