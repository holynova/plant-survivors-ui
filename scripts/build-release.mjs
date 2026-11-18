import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync,cpSync,existsSync,rmSync} from 'node:fs';
import {join,extname} from 'node:path';
execFileSync('npm',['run','build'],{stdio:'inherit'});
const prefix='/plant-survivors-ui',appVersion=JSON.parse(readFileSync('package.json')).version;
function visit(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())visit(p);else if(['.js','.css','.html'].includes(extname(p))){let text=readFileSync(p,'utf8');text=text.replace(/<link rel="icon"[^>]*sunflower\.png[^>]*>/,'<link rel="icon" type="image/webp" href="/assets/game/release/sunflower.webp" />').replace(/(<meta name="application-version" content=")[^"]*(")/,(_,before,after)=>before+'v'+appVersion+after).replaceAll('/assets/',`${prefix}/assets/`);writeFileSync(p,text);}}}
// Only ship runtime assets; keep source sheets in the repository.
for(const e of readdirSync('dist/client/assets/game'))if(!['release','animations','audio'].includes(e))rmSync(join('dist/client/assets/game',e),{recursive:true,force:true});
const runtimePaths=new Set(JSON.parse(readFileSync('src/game/asset-manifest.json')).map(item=>item.path));
for(const dir of ['release','animations'])for(const f of readdirSync('dist/client/assets/game/'+dir))if(!runtimePaths.has(dir+'/'+f))rmSync(join('dist/client/assets/game',dir,f));
// Legacy simulator art is kept in source for its fixtures, but the real phone game never mounts it.
for(const dir of ['android','iphone','status'])rmSync(join('dist/client/assets',dir),{recursive:true,force:true});
visit('dist/client');
writeFileSync('dist/client/release.json',JSON.stringify({version:JSON.parse(readFileSync('package.json')).version,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()},null,2));

if(!existsSync('docs/reports/mobile/index.html'))throw Error('Run npm run test:mobile before publishing the QA report');
cpSync('docs/reports/mobile','dist/client/qa',{recursive:true,filter:path=>!path.endsWith('.png')&&!/\/(partial|results|first-pass)\.json$/.test(path)&&!(/\/performance\/(?:v08-fresh|v09|v10-(?:baseline|current))\/r[01]-/.test(path)&&path.endsWith('.json'))});

if(existsSync('docs/reports/v09/index.html'))cpSync('docs/reports/v09','dist/client/qa/v09',{recursive:true,filter:path=>!path.endsWith('.png')});

if(existsSync('docs/reports/v10/index.html'))cpSync('docs/reports/v10','dist/client/qa/v10',{recursive:true,filter:path=>!path.endsWith('.png')});

if(existsSync('docs/reports/v11/index.html')){
  cpSync('docs/reports/v11/index.html','dist/client/qa/v11.html');
}

const precisionReport='docs/reports/forge-precision/comparisons';
if(existsSync(join(precisionReport,'index.html'))){
  // Keep the complete comparison in one static asset on the shared Worker.
  const html=readFileSync(join(precisionReport,'index.html'),'utf8')
    .replace('href="../index.html">12 种视口的实跑截图','href="https://github.com/holynova/plant-survivors-ui/tree/main/docs/reports/forge-precision">12 种视口的实跑截图')
    .replace('点击可查看原图。','点击可下载三栏原图。')
    .replace(/<a href="([\w-]+\.webp)"><img src="\1"/g,(_,image)=>{
      const data='data:image/webp;base64,'+readFileSync(join(precisionReport,image)).toString('base64');
      return `<a href="${data}" download="${image}"><img src="${data}"`;
    });
  writeFileSync('dist/client/qa/precision.html',html);
}

// Bundle the camp QA evidence into one report to fit the shared Worker's asset limit.
const campReport='docs/reports/camp-refinement';
const evidence=readFileSync(join(campReport,'index.html'),'utf8')
  .replace('href="devices.json"','href="camp-devices.json"')
  .replace(/<a href="([\w/-]+\.webp)" target="_blank"><img loading="lazy" src="\1"/g,(_,file)=>{
    const image='data:image/webp;base64,'+readFileSync(join(campReport,file)).toString('base64');
    return `<a href="#" download="${file.split('/').pop()}" onclick="this.href=this.firstElementChild.src"><img loading="lazy" src="${image}"`;
  });
writeFileSync('dist/client/qa/camp.html',evidence);
cpSync(join(campReport,'devices.json'),'dist/client/qa/camp-devices.json');

const bleedDir='docs/reports/full-bleed';
const bleedHtml=readFileSync(join(bleedDir,'index.html'),'utf8').replace(
  /<a href="([\w-]+\.webp)"><img loading="lazy" src="\1"/g,
  (_,file)=>`<a href="#" download="${file}" onclick="this.href=this.firstElementChild.src"><img loading="lazy" src="data:image/webp;base64,${readFileSync(join(bleedDir,file)).toString('base64')}"`
);
writeFileSync('dist/client/qa/full-bleed.html',bleedHtml);

// Historical intermediate profiler traces remain in Git; final reports do not reference them.
for(const trace of ['performance/index-only','performance/render-cache','performance/baseline/v07-1x.json','performance/baseline/v07-4x.json','fixes.json','v09/battle-recording.json','v09/paused-render.json','v09/resources.json'])rmSync(join('dist/client/qa',trace),{recursive:true,force:true});

execFileSync(process.execPath,['scripts/check-release-assets.mjs'],{stdio:'inherit'});
