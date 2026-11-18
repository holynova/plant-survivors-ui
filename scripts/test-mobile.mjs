import{spawn,execFileSync}from'node:child_process';
import{mkdir,writeFile,readFile}from'node:fs/promises';
import{resolve}from'node:path';
import{phoneCases}from'../tests/responsive-check.mjs';
const root=process.cwd(),dir=resolve(process.env.GARDEN_QA_REPORT||'docs/reports/mobile'),url=process.env.GARDEN_QA_URL||'http://127.0.0.1:5204/';await mkdir(dir,{recursive:true});
let server;try{await fetch(url,{signal:AbortSignal.timeout(2000)})}catch{server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5204'],{stdio:'ignore'});let ready=false;for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,300));try{if((await fetch(url,{signal:AbortSignal.timeout(800)})).ok){ready=true;break}}catch{}}if(!ready){server.kill();throw Error('Preview unavailable after bounded startup; no tests marked passed');}}
const ego=code=>execFileSync('ego-browser',['nodejs'],{input:code,encoding:'utf8',timeout:110000,maxBuffer:2e6});
let space=Number(process.env.GARDEN_QA_SPACE);const owned=!space;
if(owned){const out=ego(`const t=await taskSpace('Garden mobile regression');console.log('SPACE_ID='+t.spaceId);`);space=Number(out.match(/SPACE_ID=(\d+)/)?.[1]);if(!space)throw Error(out);}
const results=[];let failed=false;
try{for(const cfg of phoneCases){const output=resolve(dir,cfg.name);await mkdir(output,{recursive:true});try{console.log(ego(`const p=(await taskSpace(${space})).page('p1');const {checkPhones}=await import(${JSON.stringify(resolve(root,'tests/responsive-check.mjs'))});await checkPhones(p,[${JSON.stringify({...cfg,url})}],${JSON.stringify(output)});`));const data=JSON.parse(await readFile(resolve(output,'results.json'),'utf8'))[0];results.push(data);if(data.scenes.some(s=>!s.pass))failed=true;}catch(e){failed=true;let partial;try{partial=JSON.parse(await readFile(resolve(output,'partial.json'),'utf8'))}catch{}results.push({...cfg,...partial,error:String(e.message).slice(-1200)});console.error(cfg.name,'FAILED');}await writeFile(resolve(dir,'devices.json'),JSON.stringify(results,null,2));}
 console.log(ego(`const p=(await taskSpace(${space})).page('p1');await p.cdp('Emulation.clearDeviceMetricsOverride');`));
}finally{if(owned)ego(`await (await taskSpace(${space})).finish({keep:[]});`);server?.kill();}
execFileSync(process.execPath,['scripts/mobile-report.mjs'],{stdio:'inherit'});process.exitCode=failed?1:0;
