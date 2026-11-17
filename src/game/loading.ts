import {prewarmRenderCache} from './render-cache.ts';
import manifest from './asset-manifest.json';
import type {Images} from './renderer';
export type LoadingProgress={done:number;total:number;label:string};
const cache:Images={};const loaded=new Set<string>();
export async function preloadImages(base:string,progress:(p:LoadingProgress)=>void){let cursor=0,done=0;const total=manifest.length;progress({done,total,label:'整理花园素材'});async function worker(){while(cursor<manifest.length){const path=manifest[cursor++],key=path.startsWith('animations/')?'anim-'+path.replace('animations/','').replace('.webp',''):path.replace(/\.(png|webp)$/,'');if(!loaded.has(path)){await new Promise<void>((resolve,reject)=>{const im=new Image();im.dataset.asset=key;const timer=setTimeout(()=>reject(new Error(`素材加载超时：${path}`)),20000);im.onload=()=>{im.decode().then(()=>{clearTimeout(timer);cache[key]=im;loaded.add(path);resolve();},()=>{clearTimeout(timer);reject(new Error(`素材解码失败：${path}`));});};im.onerror=()=>{clearTimeout(timer);reject(new Error(`素材加载失败：${path}`));};im.src=`${base}assets/game/${path}`;});}done++;progress({done,total,label:'加载角色、植物与场景'});}}await Promise.all(Array.from({length:6},worker));prewarmRenderCache();return cache;}
export const imageCount=manifest.length;
