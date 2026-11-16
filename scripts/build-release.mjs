import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join,extname} from 'node:path';
execFileSync('npm',['run','build'],{stdio:'inherit'});
const prefix='/plant-survivors-ui';
function visit(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())visit(p);else if(['.js','.css','.html'].includes(extname(p))){let text=readFileSync(p,'utf8');text=text.replaceAll('/assets/',`${prefix}/assets/`);writeFileSync(p,text);}}}
visit('dist/client');
writeFileSync('dist/client/release.json',JSON.stringify({version:JSON.parse(readFileSync('package.json')).version,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()},null,2));
