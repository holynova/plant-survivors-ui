import {readFile, writeFile} from 'node:fs/promises';
import sharp from 'sharp';

const folder = new URL('./', import.meta.url);
const concepts = [
  {id:'forge',family:'arcade',name:'1 · 爆芽工坊',desc:'钴蓝工作台和琥珀色行动按钮。主角在营地占据主视觉，侧边工具入口随手可达。配装把候选卡和六个出战槽分开。',palette:['#245BE1','#172448','#FFC539','#8FEA95']},
  {id:'trail',family:'arcade',name:'2 · 花垒远征',desc:'梅紫、金色和暖瓷白。出发入口是通往当前章节的温室大门，地图用纵向石径串起三座花园。植物配装用可扫读的条目排列。',palette:['#422350','#FFCC72','#FFF2D9','#227C83']},
  {id:'night',family:'arcade',name:'3 · 夜班基地',desc:'石墨黑和青柠绿。营地像夜班值守的任务桌，配装像装备托盘。暗底主要服务文字、植物状态和关键信息的对比。',palette:['#151C27','#B7F15B','#FFBB55','#73CAD1']},
  {id:'notebook',family:'garden',name:'4 · 后院种植簿',desc:'苔绿、木色和暖纸。营地把种植簿摊在工作台上，地图像写着目的地的明信片，图鉴和解锁沿用纸签及蜡封。',palette:['#4E6E42','#FFF1C8','#69432E','#D66546']},
  {id:'lab',family:'garden',name:'5 · 种子研究站',desc:'葡萄紫、玻璃青和明黄。营地展示当前植物，详情像观察标本，强化选项和 Lv.5 质变突出用法的变化。',palette:['#33243D','#5ED9BF','#FFD05B','#FCF0DB']},
  {id:'worlds',family:'garden',name:'6 · 三境花园',desc:'青绿、砂岩色、橘红。营地突出当前花园，三张地图用不同的景观、光线和路径区分，出战前可以先读懂场地。',palette:['#167C83','#F1CB83','#FF7B4E','#1D5450']},
];

const scenes = [
  ['loading','载入','用实际资源载入进度。加载失败时在同一页给出重试。'],
  ['camp','营地','从主按钮出发。已有存档时提供继续远征，图鉴、编队和成长是独立入口。'],
  ['map','选地图','显示白天、夜间、屋顶三个环境。锁定卡写明解锁条件。'],
  ['hero','选主角','并排看三位主角和特性。确认后进入植物配装。'],
  ['loadout','植物配装','起始植物、已选槽和候选分区。已拥有、选中、锁定状态均可辨识。'],
  ['unlock','解锁确认','同屏看到植物用途、花费与余额。取消后返回原位置，余额不足时显示缺口。'],
  ['battle','普通战斗','顶边金色经验，顶部一行等级、生命、已生存时间与暂停，六个冷却放底部。低血量时有血条和画面受伤反馈。'],
  ['boss','首领战','只加一行首领名与血条，地面仍可读。精英标识跟随场上敌人。'],
  ['upgrade','局内升级','三项选择写清变化。换一批显示剩余次数。触屏选中后继续当前局。'],
  ['evolve','Lv.5 质变','展示进化前后与技能变化，确认后回战场。'],
  ['pause','暂停','本局、植物、地图、设置四个标签。详细战况移入此处，继续按钮固定底部。'],
  ['settings','设置与音乐','独立设置音乐和音效、选择曲目，并可减少动态效果。'],
  ['run','本局花园','检查已装备植物、等级、冷却和本局贡献。返回战斗时保留本局状态。'],
  ['guide','图鉴','按植物、敌人、主角分类。已解锁和未知条目区分显示。'],
  ['detail','图鉴详情','说明用途、触发方式、解锁条件和 Lv.5 变化。'],
  ['shop','种子商店','查看金币与钻石余额、成本及拥有状态。解锁前进入确认页。'],
  ['growth','永久成长','同屏显示当前值、下一级和花费。已满级或余额不足时解释状态。'],
  ['result','结算','显示生存时间、死因或撤退、击败数量和到账奖励，再来一局或回营地。'],
].map(([id,label,note])=>({id,label,note}));

function dataUrl(bytes) {
  return 'data:image/webp;base64,' + bytes.toString('base64');
}

for (const concept of concepts) {
  const board = await readFile(new URL(concept.id+'.webp',folder));
  const {width,height} = await sharp(board).metadata();
  concept.board = dataUrl(board);
  concept.frames = [];
  for (let index=0; index<scenes.length; index++) {
    const column = index%6;
    const row = Math.floor(index/6);
    const xEdges = concept.id==='lab' ? [8,268,521,769,1021,1274,1528] : Array.from({length:7}, (_,i)=>Math.round(i*width/6));
    const yEdges = concept.id==='lab' ? [0,362,673,1024] : Array.from({length:4}, (_,i)=>Math.round(i*height/3));
    const left = xEdges[column]+4;
    const right = xEdges[column+1]-4;
    const top = yEdges[row]+4;
    const bottom = yEdges[row+1]-4;
    const panel = await sharp(board).extract({left,top,width:right-left,height:bottom-top}).webp({quality:90}).toBuffer();
    concept.frames.push(dataUrl(panel));
  }
}

const template = await readFile(new URL('catalog-template.html',folder),'utf8');
await writeFile(new URL('index.html',folder),template.replace('__DATA__',JSON.stringify({concepts,scenes})));
console.log(`${concepts.length} 套，${scenes.length} 个界面/套，${concepts.length*scenes.length} 个分镜。`);
