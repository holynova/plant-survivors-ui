import fs from 'node:fs/promises';
import sharp from 'sharp';
import { enemyArt, enemyFrameSize, heroFrameSize, terrainPatch } from '../src/game/art-scale.ts';

const dir = 'docs/reports/scale-art';
const read = async path => JSON.parse(await fs.readFile(path, 'utf8'));
const manifest = await read('src/game/asset-manifest.json');
const inventory = [];
for (const item of manifest) {
  const { width, height } = await sharp('public/assets/game/' + item.path).metadata();
  inventory.push({ ...item, width, height });
}
const before = await read(dir + '/before/ui.json');
const after = await read(dir + '/after/ui.json');
const total = inventory.reduce((n, m) => n + m.bytes, 0);
const estimatedRGBA = inventory.reduce((n, m) => n + m.width * m.height * 4, 0);
const enemyFrameSizes = Object.fromEntries(Object.keys(enemyArt).map(k => [k, enemyFrameSize(k)]));
await fs.writeFile(dir + '/inventory.json', JSON.stringify({ terrainPatch, heroFrameSize, enemyFrameSizes, total, estimatedRGBA, inventory }, null, 2));

const scenes = {
  'biome-2': '屋顶瓦片与僵尸', 'biome-0': '白天草坪', 'biome-1': '夜晚花园',
  loading: '加载页', 'standard-390-lobby': '营地', 'standard-390-map': '地图卡',
  'standard-390-heroes': '角色选择', 'standard-390-detail': '图鉴详情', 'standard-390-result': '结算'
};
const phases = ['before', 'after'];
const labels = ['修改前', '修改后'];
const pairs = Object.entries(scenes).map(([key, name]) =>
  '<h2>' + name + '</h2><section>' + phases.map((phase, index) =>
    '<figure><img loading="lazy" alt="' + name + labels[index] + '" src="' + phase + '/' + key + '.webp"><figcaption>' +
    labels[index] + '</figcaption></figure>').join('') + '</section>'
).join('');
const standard = samples => samples.filter(s => s.name.startsWith('standard-390-') || s.name === 'loading');
const largest = scene => scene?.imgs.reduce((best, i) => !best || i.physicalUpscale > best.physicalUpscale ? i : best, null);
const format = image => image ? image.physicalUpscale.toFixed(2) + '×' : '—';
const rows = standard(after).map(scene => {
  const original = largest(before.find(s => s.name === scene.name));
  const current = largest(scene);
  return '<tr><td>' + scene.name.replace('standard-390-', '') + '</td><td>' + format(original) +
    '</td><td>' + format(current) + '</td><td>' + (current?.id || '无位图') + '</td></tr>';
}).join('');
const guideCount = after.filter(s => s.name.startsWith('entry-')).length;
const html = `<!doctype html><html lang="zh-CN"><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>尺度与清晰度 · 修改前后</title><style>
body{max-width:920px;margin:auto;padding:18px;background:#102337;color:#fff;font:16px/1.55 system-ui}
section{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0}img{width:100%;max-height:490px;object-fit:contain}
figcaption{text-align:center}details{margin:20px 0;overflow:auto}td,th{padding:4px;text-align:left}tr:nth-child(odd){background:#20394e}a{color:#a5def9}
</style><h1>尺度与清晰度 · 修改前后</h1>
<p>以下是同一 390 × 844 视口的实际运行截图，三张战场沿用同一组角色。布局复测覆盖 12 种视口配置，每种 21 个场景。另外采集了首次加载、三张地图和 ${guideCount} 个图鉴详情。测试设备像素比均为 3。</p>
<p>运行清单共有 ${inventory.length} 张位图，压缩后共 ${(total/1048576).toFixed(2)} MiB。按 RGBA 估算，全部解码约 ${(estimatedRGBA/1048576).toFixed(1)} MiB。</p>
${pairs}<details><summary>各界面放大倍率最高的图片（390 × 844）</summary>
<p>倍率按图片绘制所需的物理像素与源图像素计算。高于 1 表示存在放大。此表采集页面图片元素，文字、矢量图和战斗画布另行检查。</p>
<table><tr><th>场景</th><th>原最高</th><th>现最高</th><th>当前素材</th></tr>${rows}</table></details>
<details><summary>全部运行位图的原生分辨率</summary><table>${inventory.map(i => '<tr><td>' + i.path + '</td><td>' + i.width + ' × ' + i.height + '</td></tr>').join('')}</table></details>
<p><a href="after/ui.json">全部视口与图鉴采样数据</a> · <a href="inventory.json">运行资源清单</a></p></html>`;
await fs.writeFile(dir + '/index.html', html);
const panels = await Promise.all(phases.map(phase => sharp(dir + '/' + phase + '/biome-2.webp').resize({width: 300}).png().toBuffer()));
const metadata = await sharp(panels[0]).metadata();
await sharp({create:{width:608,height:metadata.height,channels:3,background:'#25392b'}})
  .composite(panels.map((input, i) => ({input, left: i * 308, top: 0})))
  .webp({quality:92}).toFile(dir + '/roof-comparison.webp');
