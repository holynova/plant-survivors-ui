import sharp from 'sharp';
const source='/Users/sym/code/plant-survivors-design/concepts/01-classic-garden.png';
const regions={
 'lobby-hero':[26,69,310,322],
 'prep-hero':[687,99,312,121],
 'result-hero':[687,1080,312,193],
 'evolution-hero':[689,596,308,246],
 'map-day':[369,118,191,75],
 'map-night':[369,198,191,76],
 'map-roof':[369,281,191,77],
 'bag':[381,819,56,61],
 'crystal':[815,871,50,55],
 'chest':[926,863,57,67],
 'seed':[251,73,26,25],
 'paper':[728,1357,180,30],
 'wood':[180,510,42,29]
};
for(const [name,[left,top,width,height]] of Object.entries(regions)) await sharp(source).extract({left,top,width,height}).png().toFile(`public/assets/game/${name}.png`);
// Exact visual source screen crops used only for QA, never as page backgrounds.
const coords=[[23,67],[359,67],[684,67],[23,591],[359,591],[684,591],[23,1075],[359,1075],[684,1075]];
for(let i=0;i<9;i++){const [left,top]=coords[i]; await sharp(source).extract({left,top,width:316,height:i<3?486:i<6?450:449}).png().toFile(`.artifacts/reference-${i+1}.png`)}
