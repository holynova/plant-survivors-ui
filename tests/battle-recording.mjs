import {writeFile} from 'node:fs/promises';
export async function startRecording(p,durationMs=10000){await p.evaluate(durationMs=>{
 const canvas=document.querySelector('canvas'),video=canvas.captureStream(20),audio=window.__gardenQA.captureAudio(),stream=new MediaStream([...video.getVideoTracks(),...(audio?.getAudioTracks()||[])]),chunks=[];
 const mimeType=MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')?'video/webm;codecs=vp8,opus':'video/webm';const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:1200000});window.__battleRecording=null;
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=async()=>{const blob=new Blob(chunks,{type:mimeType}),bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));window.__battleRecording={base64:btoa(binary),durationMs,mimeType,audio:!!audio,bytes:blob.size};video.getVideoTracks().forEach(t=>t.stop());};recorder.start();setTimeout(()=>recorder.stop(),durationMs);
 },durationMs)}
export async function saveRecording(p,path){const r=await p.evaluate(()=>window.__battleRecording);if(!r)throw Error('Recording pending');await writeFile(path,Buffer.from(r.base64,'base64'));delete r.base64;await p.evaluate(()=>{delete window.__battleRecording});return r;}
