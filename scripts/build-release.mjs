import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync,cpSync,existsSync,rmSync} from 'node:fs';
import {join,extname} from 'node:path';
execFileSync('npm',['run','build'],{stdio:'inherit'});
const prefix='/plant-survivors-ui';
function visit(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())visit(p);else if(['.js','.css','.html'].includes(extname(p))){let text=readFileSync(p,'utf8');text=text.replaceAll('/assets/',`${prefix}/assets/`);writeFileSync(p,text);}}}
// Only ship runtime assets; keep source sheets in the repository.
for(const e of readdirSync('dist/client/assets/game'))if(!['release','animations','audio'].includes(e))rmSync(join('dist/client/assets/game',e),{recursive:true,force:true});
visit('dist/client');
writeFileSync('dist/client/release.json',JSON.stringify({version:JSON.parse(readFileSync('package.json')).version,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()},null,2));

if(!existsSync('docs/reports/mobile/index.html'))throw Error('Run npm run test:mobile before publishing the QA report');
cpSync('docs/reports/mobile','dist/client/qa',{recursive:true,filter:path=>!path.endsWith('.png')&&!/\/(partial|results|first-pass)\.json$/.test(path)});

if(existsSync('docs/reports/v09/index.html'))cpSync('docs/reports/v09','dist/client/qa/v09',{recursive:true,filter:path=>!path.endsWith('.png')});
