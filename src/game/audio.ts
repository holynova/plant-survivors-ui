import {audioWeights,audioBytes} from './audio-manifest.ts';
import type {CombatEvent} from './simulation';
const files=['pea','ice','boomerang','mushroom','hit','armor','hurt','death','step','slam','boss','click','pickup','level','evolution','victory','defeat','garden-loop','camp-loop','elite-loop','boss-loop'];
export class GameAudio {
 private context:AudioContext|null=null;
 private buffers=new Map<string,AudioBuffer>();
 private loading:Promise<void>|null=null;
 private music:AudioBufferSourceNode|null=null;
 private musicGain:GainNode|null=null;
 effectsVolume=.7;
 musicVolume=.7;
 warningVolume=.7;
 private musicOffset=0;
 private musicTrack='garden-loop';
 private musicStartedAt=0;
 private musicRate=1;
 private last=new Map<string,number>();
 private active=new Map<AudioScheduledSourceNode,{gain:GainNode;volume:number;priority:number}>();
 private lastHit=-10;
 private duckUntil=0;
 private hurtCount=0;
 private get voices(){return this.active.size;}
 private priority(name:string){return name==='defeat'?4:name==='hurt'?3:['boss','level','evolution','victory'].includes(name)?2:0;}
 private reserve(priority:number){if(this.voices<(priority?14:11))return true;if(!priority)return false;let candidate:AudioScheduledSourceNode|undefined,min=priority;for(const [source,voice] of this.active)if(voice.priority<min){candidate=source;min=voice.priority;}if(!candidate)return false;const voice=this.active.get(candidate)!;this.active.delete(candidate);candidate.stop();candidate.disconnect();voice.gain.disconnect();return true;}
 private attach(source:AudioScheduledSourceNode,gain:GainNode,volume:number,priority:number,premixed=false){const c=this.context!;if(!premixed){gain.gain.value*=priority?this.warningVolume:this.effectsVolume;volume*=priority?this.warningVolume:this.effectsVolume;}source.connect(gain);gain.connect(c.destination);if(this.captureNode)gain.connect(this.captureNode);this.active.set(source,{gain,volume,priority});source.onended=()=>{this.active.delete(source);source.disconnect();gain.disconnect();};}
 syncHit(hitAt:number){this.lastHit=hitAt;}
 playerHurt(hitAt:number){if(hitAt<0){this.lastHit=hitAt;return;}if(hitAt===this.lastHit)return;this.lastHit=hitAt;this.play('hurt',.7);}
 private captureNode:MediaStreamAudioDestinationNode|null=null;
 diagnostics(){return {ready:this.ready,state:this.context?.state,voices:this.voices,music:!!this.music,musicTrack:this.musicTrack,musicOffset:this.musicOffset,musicPosition:this.musicOffset+(this.music?(this.context!.currentTime-this.musicStartedAt)*this.musicRate:0),enabled:this.enabled,hurtPlayed:this.hurtCount};}
 capture(){if(!this.context)return null;this.captureNode ||= this.context.createMediaStreamDestination();this.musicGain?.connect(this.captureNode);return this.captureNode.stream;}
 enabled=true;
 musicEnabled=true;
 ready=false;
 async preload(base:string,onProgress?:(done:number,total:number)=>void){
  this.context ||= new AudioContext();let done=0;onProgress?.(0,audioBytes);
  this.loading ||= Promise.all(files.map(async name=>{if(!this.buffers.has(name)){const r=await fetch(`${base}assets/game/audio/${name}.wav`,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error(`Audio ${name}: ${r.status}`);this.buffers.set(name,await this.context!.decodeAudioData(await r.arrayBuffer()));}done+=audioWeights[name];onProgress?.(done,audioBytes);})).then(()=>{this.ready=true;}).catch(error=>{this.loading=null;throw error;});await this.loading;onProgress?.(audioBytes,audioBytes);
 }
 async unlock(base:string){this.context ||= new AudioContext();await this.context.resume();await this.preload(base);}
 play(name:string,volume=.35){const c=this.context,buffer=this.buffers.get(name);if(!this.enabled||!c||c.state!=='running'||!buffer)return;const now=c.currentTime,priority=this.priority(name);const delay=name==='step'?.24:name==='pickup'?.1:name==='hit'?.055:.08;if(now-(this.last.get(name)??-10)<delay||!this.reserve(priority))return;this.last.set(name,now);
 if(name==='hurt'){this.hurtCount++;this.duckUntil=now+.18;for(const v of this.active.values())if(!v.priority){v.gain.gain.cancelScheduledValues(now);v.gain.gain.setTargetAtTime(v.volume*.25,now,.012);}}
 const source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;gain.gain.value=volume*(!priority&&now<this.duckUntil?.25:1);this.attach(source,gain,volume,priority);source.start();}
 tone(kind:string){const c=this.context;if(!this.enabled||!c||c.state!=='running'||this.effectsVolume<=0)return;const now=c.currentTime;if(now-(this.last.get(kind)??-10)<.12||!this.reserve(0))return;this.last.set(kind,now);const o=c.createOscillator(),g=c.createGain();const gem=kind==='gem',coin=kind==='coin',electric=['lightning','laser','cabbagevolt'].includes(kind),fire=['jalapeno','snapdragon','torchwood'].includes(kind);o.type=electric?'sawtooth':fire?'triangle':'sine';const frequency=gem?1300:coin?880:electric?440:fire?180:kind==='bonk'?140:260;o.frequency.setValueAtTime(frequency,now);o.frequency.exponentialRampToValueAtTime(gem?2100:coin?1200:frequency*.35,now+.14);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime((now<this.duckUntil?.02:.08)*this.effectsVolume,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+.18);this.attach(o,g,.08*this.effectsVolume,0,true);o.start(now);o.stop(now+.2);}
 events(events:CombatEvent[]){for(const e of events)if(this.priority(e.type))this.play(e.type,e.type==='hurt'?.7:.4);for(const e of events){if(this.priority(e.type))continue;let name=e.type;if(name==='pickup'&&['coin','gem'].includes(e.kind)){this.tone(e.kind);continue;}if(name==='shoot'){name=e.kind;if(!files.includes(name)){this.tone(name);continue;}}if(name==='hit'){if(e.value<1)continue;name=e.kind==='ice'?'armor':'hit';}if(name==='swipe'){this.warning('enemy-impact');continue;}if(name==='heal')name='level';if(name==='upgrade')name='click';if(name==='burst')name='slam';if(name==='treasure')name='level';if(['enemyShot','windup','chargeWarning','summon'].includes(name)){this.warning(name);continue;}this.play(name,e.type==='shoot'?.2:.3);}}
 warning(kind:string){const c=this.context;if(!this.enabled||!c||c.state!=='running'||this.warningVolume<=0)return;const now=c.currentTime;if(now-(this.last.get('warning-'+kind)??-10)<.35||!this.reserve(2))return;this.last.set('warning-'+kind,now);const o=c.createOscillator(),g=c.createGain();o.type='triangle';const f=kind==='enemy-impact'?130:kind==='chargeWarning'?170:kind==='windup'?330:kind==='summon'?260:580;o.frequency.setValueAtTime(f,now);o.frequency.exponentialRampToValueAtTime(f*(kind==='enemy-impact'?.5:1.7),now+.11);o.frequency.setValueAtTime(f*.8,now+.13);g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(.13*this.warningVolume,now+.02);g.gain.exponentialRampToValueAtTime(.001,now+.3);this.attach(o,g,.13*this.warningVolume,2,true);o.start();o.stop(now+.32);}
 setMusic(active:boolean,theme='garden'){const c=this.context;if(!c)return;const rate=1,track=theme==='camp'?'camp-loop':theme==='elite'?'elite-loop':theme==='boss'?'boss-loop':'garden-loop';
 if(active&&this.musicEnabled&&this.music&&track!==this.musicTrack){const phase=((this.musicOffset+(c.currentTime-this.musicStartedAt)*this.musicRate)%this.buffers.get(this.musicTrack)!.duration)/this.buffers.get(this.musicTrack)!.duration;const old=this.music,oldGain=this.musicGain!;oldGain.gain.setTargetAtTime(0,c.currentTime,.1);old.stop(c.currentTime+.4);old.onended=()=>{old.disconnect();oldGain.disconnect()};this.music=null;this.musicGain=null;this.musicOffset=phase*(this.buffers.get(track)?.duration||1);}
 if(!this.music&&active)this.musicTrack=track;
 if(!active||!this.musicEnabled){if(this.music){this.musicOffset=(this.musicOffset+(c.currentTime-this.musicStartedAt)*this.musicRate)%this.buffers.get(this.musicTrack)!.duration;this.music.stop();this.music.disconnect();this.music=null;this.musicGain?.disconnect();this.musicGain=null;}return;}
 if(this.music){if(rate!==this.musicRate){this.musicOffset=(this.musicOffset+(c.currentTime-this.musicStartedAt)*this.musicRate)%this.buffers.get(this.musicTrack)!.duration;this.musicStartedAt=c.currentTime;this.musicRate=rate;this.music.playbackRate.setValueAtTime(rate,c.currentTime);}this.musicGain?.gain.setTargetAtTime(this.musicVolume*.42,c.currentTime,.12);return;}
 if(!this.buffers.has(this.musicTrack))return;const source=c.createBufferSource(),gain=c.createGain();source.buffer=this.buffers.get(this.musicTrack)!;source.loop=true;this.musicRate=rate;source.playbackRate.value=rate;gain.gain.value=0;gain.gain.setTargetAtTime(this.musicVolume*.42,c.currentTime,.12);source.connect(gain);gain.connect(c.destination);if(this.captureNode)gain.connect(this.captureNode);source.start(0,this.musicOffset%source.buffer.duration);this.musicStartedAt=c.currentTime;this.music=source;this.musicGain=gain;}
 dispose(){this.setMusic(false);for(const [source,voice] of this.active){source.stop();source.disconnect();voice.gain.disconnect();}this.active.clear();void this.context?.close();this.context=null;}
}
