import {mkdir, readFile, writeFile} from 'node:fs/promises';
import sharp from 'sharp';

const output='docs/reports/forge-precision';
const reference='docs/prototypes/full-ui/forge.webp';
const original='docs/reports/forge';
const profile='standard-390';
const scenes=[
  ['loading','载入'],['lobby','戴夫营地'],['map','地图'],['heroes','主角'],['prepare','配装'],['unlock','解锁'],
  ['battle','战斗'],['boss','首领'],['upgrade','升级'],['evolution','质变'],['pause','暂停'],['settings','设置'],
  ['build','本局花园'],['guide','图鉴'],['detail','图鉴详情'],['shop','种子商店'],['permanent','永久成长'],['result','结算'],
];
const swatch='#10223a';
const scale=image=>image.resize(390,844,{fit:'contain',background:swatch}).png().toBuffer();
await mkdir(output+'/comparisons',{recursive:true});
for(const [index,[key]] of scenes.entries()){
  const draft=sharp(reference).extract({left:index%6*209+5,top:Math.floor(index/6)*418+5,width:202,height:408});
  const before=key==='lobby'
    ? sharp(original+'/online-v012.webp')
    : key==='loading'
    ? sharp(original+'/comparisons/loading.webp').extract({left:400,top:0,width:390,height:844})
    : sharp(`${original}/${profile}/${profile}-${key}.webp`);
  const after=sharp(`${output}/${profile}/${profile}-${key}.png`);
  const layers=await Promise.all([draft,before,after].map(async(image,i)=>({input:await scale(image),left:i*398,top:0})));
  await sharp({create:{width:1186,height:844,channels:3,background:swatch}})
    .composite(layers).webp({quality:87}).toFile(`${output}/comparisons/${key}.webp`);
}
const [state]=JSON.parse(await readFile(`${output}/${profile}/results.json`,'utf8'));
const geometry=state.scenes.flatMap(scene=>(scene.geometry||[]).map(box=>({...box,scene:scene.scene})));
const rows=geometry.map(g=>`<tr><td>${scenes.find(([key])=>key===g.scene)?.[1]||g.scene}</td><td><code>${g.selector}</code></td><td>${g.target.map(v=>v?.toFixed(1)??'—').join(' / ')}</td><td>${g.actual?.map(v=>v.toFixed(1)).join(' / ')||'未找到'}</td><td>${g.maxError?.toFixed(2)??'—'}</td></tr>`).join('');
const maxError=Math.max(...geometry.map(g=>g.maxError||0));
const panels=scenes.map(([key,label])=>`<figure><figcaption>${label}</figcaption><a href="${key}.webp"><img src="${key}.webp" alt="${label}的原稿、已发布版、重做版三栏截图" loading="lazy"></a></figure>`).join('');
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>爆芽工坊 · 尺寸对照</title><style>body{background:#10223a;color:#f3f8ff;font:16px/1.6 system-ui;margin:0}main{max-width:1380px;margin:auto;padding:clamp(14px,4vw,44px)}a{color:#ffdf73}p{color:#b8d5f7}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(470px,100%),1fr));gap:22px}figure{margin:0}img{display:block;width:100%;height:auto;border:1px solid #355f9b;border-radius:8px}figcaption{font-weight:700;padding-bottom:7px}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;min-width:720px}th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #355f9b}th{background:#142b49}code{white-space:nowrap}</style><main><h1>爆芽工坊 · 逐屏尺寸对照</h1><p>每组三栏依次为方案一原稿、已发布的 v0.12.0、重做后的实际浏览器截图。共同视口 390×844 CSS px。原稿按 202×408 单屏等比缩放，点击可查看原图。</p><p><a href="../index.html">12 种视口的实跑截图</a> · <a href="https://xiaosang.cc/plant-survivors-ui/">已发布的 v0.12.0</a></p><div class="grid">${panels}</div><h2>实测定位与尺寸</h2><p>${geometry.length} 个控件在 390×844 的 DOM 实测。每个框按 x / y / 宽 / 高排列，最大偏差 ${maxError.toFixed(2)} CSS px。数值衡量控件外框，字形、原画和动态内容有各自差异。</p><div class="scroll"><table><thead><tr><th>场景</th><th>控件</th><th>原稿坐标换算</th><th>运行实测</th><th>最大偏差 px</th></tr></thead><tbody>${rows}</tbody></table></div></main></html>`;
await writeFile(output+'/comparisons/index.html',html);
console.log(`${scenes.length} comparisons, ${geometry.length} geometry checks, maximum ${maxError.toFixed(2)} CSS px`);
