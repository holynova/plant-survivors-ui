import type {CombatEvent} from './simulation';
const files=['pea','ice','boomerang','mushroom','hit','armor','hurt','death','step','slam','boss','click','pickup','level','evolution','victory','defeat','garden-loop'];
export class GameAudio {
 private context:AudioContext|null=null;
 private buffers=new Map<string,AudioBuffer>();
 private loading:Promise<void>|null=null;
 private music:AudioBufferSourceNode|null=null;
 private musicGain:GainNode|null=null;
 private last=new Map<string,number>();
 private active=new Map<AudioScheduledSourceNode,{gain:GainNode;volume:number;priority:number}>();
 private lastHit=-10;
 private duckUntil=0;
 private hurtCount=0;
 private get voices(){return this.active.size;}
 private priority(name:string){return name==='defeat'?4:name==='hurt'?3:['boss','level','evolution','victory'].includes(name)?2:0;}
 private reserve(priority:number){if(this.voices<(priority?14:11))return true;if(!priority)return false;let candidate:AudioScheduledSourceNode|undefined,min=priority;for(const [source,voice] of this.active)if(voice.priority<min){candidate=source;min=voice.priority;}if(!candidate)return false;const voice=this.active.get(candidate)!;this.active.delete(candidate);candidate.stop();candidate.disconnect();voice.gain.disconnect();return true;}
 private attach(source:AudioScheduledSourceNode,gain:GainNode,volume:number,priority:number){const c=this.context!;source.connect(gain);gain.connect(c.destination);if(this.captureNode)gain.connect(this.captureNode);this.active.set(source,{gain,volume,priority});source.onended=()=>{this.active.delete(source);source.disconnect();gain.disconnect();};}
 playerHurt(hitAt:number){if(hitAt<0){this.lastHit=hitAt;return;}if(hitAt===this.lastHit)return;this.lastHit=hitAt;this.play('hurt',.7);}
 private captureNode:MediaStreamAudioDestinationNode|null=null;
 diagnostics(){return {ready:this.ready,state:this.context?.state,voices:this.voices,music:!!this.music,enabled:this.enabled,hurtPlayed:this.hurtCount};}
 capture(){if(!this.context)return null;this.captureNode ||= this.context.createMediaStreamDestination();this.musicGain?.connect(this.captureNode);return this.captureNode.stream;}
 enabled=true;
 musicEnabled=true;
 ready=false;
 async preload(base:string,onProgress?:(done:number,total:number)=>void){
  this.context ||= new AudioContext();let done=0;onProgress?.(0,files.length);
  this.loading ||= Promise.all(files.map(async name=>{if(!this.buffers.has(name)){const r=await fetch(`${base}assets/game/audio/${name}.wav`,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error(`Audio ${name}: ${r.status}`);this.buffers.set(name,await this.context!.decodeAudioData(await r.arrayBuffer()));}onProgress?.(++done,files.length);})).then(()=>{this.ready=true;}).catch(error=>{this.loading=null;throw error;});await this.loading;onProgress?.(files.length,files.length);
 }
 async unlock(base:string){this.context ||= new AudioContext();await this.context.resume();await this.preload(base);}
 play(name:string,volume=.35){const c=this.context,buffer=this.buffers.get(name);if(!this.enabled||!c||c.state!=='running'||!buffer)return;const now=c.currentTime,priority=this.priority(name);const delay=name==='step'?.24:name==='pickup'?.1:name==='hit'?.055:.08;if(now-(this.last.get(name)??-10)<delay||!this.reserve(priority))return;this.last.set(name,now);
 if(name==='hurt'){this.hurtCount++;this.duckUntil=now+.18;for(const v of this.active.values())if(!v.priority){v.gain.gain.cancelScheduledValues(now);v.gain.gain.setTargetAtTime(v.volume*.25,now,.012);}}
 const source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;gain.gain.value=volume*(!priority&&now<this.duckUntil?.25:1);this.attach(source,gain,volume,priority);source.start();}
 tone(kind:string){const c=this.context;if(!this.enabled||!c||c.state!=='running')return;const now=c.currentTime;if(now-(this.last.get(kind)??-10)<.12||!this.reserve(0))return;this.last.set(kind,now);const o=c.createOscillator(),g=c.createGain();const gem=kind==='gem',coin=kind==='coin',electric=['lightning','laser','cabbagevolt'].includes(kind),fire=['jalapeno','snapdragon','torchwood'].includes(kind);o.type=electric?'sawtooth':fire?'triangle':'sine';const frequency=gem?1300:coin?880:electric?440:fire?180:kind==='bonk'?140:260;o.frequency.setValueAtTime(frequency,now);o.frequency.exponentialRampToValueAtTime(gem?2100:coin?1200:frequency*.35,now+.14);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(now<this.duckUntil?.02:.08,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+.18);this.attach(o,g,.08,0);o.start(now);o.stop(now+.2);}
 events(events:CombatEvent[]){for(const e of events)if(this.priority(e.type))this.play(e.type,e.type==='hurt'?.7:.4);for(const e of events){if(this.priority(e.type))continue;let name=e.type;if(name==='pickup'&&['coin','gem'].includes(e.kind)){this.tone(e.kind);continue;}if(name==='shoot'){name=e.kind;if(!files.includes(name)){this.tone(name);continue;}}if(name==='hit'){if(e.value<1)continue;name=e.kind==='ice'?'armor':'hit';}if(name==='swipe')name='boomerang';if(name==='upgrade')name='click';if(name==='burst')name='slam';if(name==='treasure')name='level';if(name==='enemyShot')name='ice';this.play(name,e.type==='shoot'?.2:.3);}}
 setMusic(active:boolean){const c=this.context;if(!c)return;if(!active||!this.musicEnabled){if(this.music){this.music.stop();this.music.disconnect();this.music=null;this.musicGain?.disconnect();}return;}if(this.music||!this.buffers.has('garden-loop'))return;const source=c.createBufferSource(),gain=c.createGain();source.buffer=this.buffers.get('garden-loop')!;source.loop=true;gain.gain.value=.42;source.connect(gain);gain.connect(c.destination);if(this.captureNode)gain.connect(this.captureNode);source.start();this.music=source;this.musicGain=gain;}
 dispose(){this.setMusic(false);for(const [source,voice] of this.active){source.stop();source.disconnect();voice.gain.disconnect();}this.active.clear();void this.context?.close();this.context=null;}
}
