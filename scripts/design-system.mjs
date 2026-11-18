import{readFileSync,writeFileSync}from'node:fs';
const t=JSON.parse(readFileSync('src/design/tokens.json','utf8'));
const css='/* Generated from tokens.json; run npm run design:tokens. */\n:root {\n'+Object.entries(t).flatMap(([group,values])=>Object.entries(values).map(([key,value])=>`  --${group==='colors'?'color':group}-${key}: ${value};`)).join('\n')+'\n}\n';
if(process.argv.includes('--check')){if(readFileSync('src/design/tokens.css','utf8')!==css)throw Error('Design tokens are stale');if(/#[\da-f]{3,8}\b|rgba?\(/i.test(['src/prototype.css','src/forge.css'].map(path=>readFileSync(path,'utf8')).join('\n')))throw Error('UI contains a literal color outside the design system');console.log('Design tokens and UI color contract passed');}else writeFileSync('src/design/tokens.css',css);
