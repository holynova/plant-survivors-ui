import type {CombatEvent} from './simulation';
const files=['pea','ice','boomerang','mushroom','hit','armor','hurt','death','step','slam','boss','click','pickup','level','evolution','victory','defeat','garden-loop'];
export class GameAudio {
 private context:AudioContext|null=null;
 private buffers=new Map<string,AudioBuffer>();
 private loading:Promise<void>|null=null;
 private music:AudioBufferSourceNode|null=null;
 private musicGain:GainNode|null=null;
 private last=new Map<string,number>();
 private voices=0;
 private captureNode:MediaStreamAudioDestinationNode|null=null;
 diagnostics(){return {ready:this.ready,state:this.context?.state,voices:this.voices,music:!!this.music,enabled:this.enabled};}
 capture(){if(!this.context)return null;this.captureNode ||= this.context.createMediaStreamDestination();this.musicGain?.connect(this.captureNode);return this.captureNode.stream;}
 enabled=true;
 musicEnabled=true;
 ready=false;
 async preload(base:string,onProgress?:(done:number,total:number)=>void){
  this.context ||= new AudioContext();let done=0;onProgress?.(0,files.length);
  this.loading ||= Promise.all(files.map(async name=>{if(!this.buffers.has(name)){const r=await fetch(`${base}assets/game/audio/${name}.wav`,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error(`Audio ${name}: ${r.status}`);this.buffers.set(name,await this.context!.decodeAudioData(await r.arrayBuffer()));}onProgress?.(++done,files.length);})).then(()=>{this.ready=true;}).catch(error=>{this.loading=null;throw error;});await this.loading;onProgress?.(files.length,files.length);
 }
 async unlock(base:string){this.context ||= new AudioContext();await this.context.resume();await this.preload(base);}
 play(name:string,volume=.35){const c=this.context,buffer=this.buffers.get(name);if(!this.enabled||!c||c.state!=='running'||!buffer||this.voices>=14)return;const now=c.currentTime;const delay=name==='step'?.24:name==='pickup'?.1:name==='hit'?.055:.08;if(now-(this.last.get(name)??-10)<delay)return;this.last.set(name,now);const source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;gain.gain.value=volume;source.connect(gain);gain.connect(c.destination);if(this.captureNode)gain.connect(this.captureNode);this.voices++;source.onended=()=>{source.disconnect();gain.disconnect();this.voices--};source.start();}
 tone(kind:string){const c=this.context;if(!this.enabled||!c||c.state!=='running'||this.voices>=14)return;const now=c.currentTime;if(now-(this.last.get(kind)??-10)<.12)return;this.last.set(kind,now);const o=c.createOscillator(),g=c.createGain();const gem=kind==='gem',coin=kind==='coin',electric=['lightning','laser','cabbagevolt'].includes(kind),fire=['jalapeno','snapdragon','torchwood'].includes(kind);o.type=electric?'sawtooth':fire?'triangle':'sine';const frequency=gem?1300:coin?880:electric?440:fire?180:kind==='bonk'?140:260;o.frequency.setValueAtTime(frequency,now);o.frequency.exponentialRampToValueAtTime(gem?2100:coin?1200:frequency*.35,now+.14);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.08,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+.18);o.connect(g);g.connect(c.destination);if(this.captureNode)g.connect(this.captureNode);this.voices++;o.onended=()=>{o.disconnect();g.disconnect();this.voices--};o.start(now);o.stop(now+.2);}
 events(events:CombatEvent[]){for(const e of events){let name=e.type;if(name==='pickup'&&['coin','gem'].includes(e.kind)){this.tone(e.kind);continue;}if(name==='shoot'){name=e.kind;if(!files.includes(name)){this.tone(name);continue;}}if(name==='hit'){if(e.value<1)continue;name=e.kind==='ice'?'armor':'hit';}if(name==='swipe')name='boomerang';if(name==='upgrade')name='click';if(name==='burst')name='slam';if(name==='treasure')name='level';if(name==='enemyShot')name='ice';this.play(name,e.type==='shoot'?.2:.3);}}
 setMusic(active:boolean){const c=this.context;if(!c)return;if(!active||!this.musicEnabled){if(this.music){this.music.stop();this.music.disconnect();this.music=null;this.musicGain?.disconnect();}return;}if(this.music||!this.buffers.has('garden-loop'))return;const source=c.createBufferSource(),gain=c.createGain();source.buffer=this.buffers.get('garden-loop')!;source.loop=true;gain.gain.value=.42;source.connect(gain);gain.connect(c.destination);if(this.captureNode)gain.connect(this.captureNode);source.start();this.music=source;this.musicGain=gain;}
 dispose(){this.setMusic(false);void this.context?.close();this.context=null;}
}
