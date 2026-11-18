import {writeFile} from 'node:fs/promises';
// Desktop Chromium network emulation: 12 Mbps down, 6 Mbps up, 60 ms latency.
export async function coldLoad(page,url){
 await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});await page.cdp('Network.emulateNetworkConditions',{offline:false,latency:60,downloadThroughput:1500000,uploadThroughput:750000,connectionType:'cellular4g'});
 try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:50000});await page.waitForFunction(()=>!!document.querySelector('.camp-actions .gold')&&!document.querySelector('.loading-screen'),undefined,{timeout:50000});return await page.evaluate(()=>({url:location.href,elapsedMs:performance.now(),resources:performance.getEntriesByType('resource').map(r=>({name:r.name.split(location.origin)[1],duration:r.duration,bytes:r.transferSize,body:r.encodedBodySize,initiator:r.initiatorType})),images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),ready:document.querySelector('.camp-actions .gold').textContent,network:{downBytes:1500000,upBytes:750000,latencyMs:60}}));}
 finally{await page.cdp('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});await page.cdp('Network.setCacheDisabled',{cacheDisabled:false});}
}
export async function saveColdLoading(path,runs){await writeFile(path,JSON.stringify({runs,limitation:'Same desktop Chromium and server, simulated 12 Mbps / 60 ms; not physical mobile cold launch or memory measurement.'},null,2));}
