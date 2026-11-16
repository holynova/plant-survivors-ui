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
 async unlock(base:string){
  this.context ||= new AudioContext();
  await this.context.resume();
  this.loading ||= Promise.all(files.map(async name=>{const r=await fetch(`${base}assets/game/audio/${name}.wav`);if(!r.ok)throw new Error(`Audio ${name}: ${r.status}`);this.buffers.set(name,await this.context!.decodeAudioData(await r.arrayBuffer()));})).then(()=>{this.ready=true;});
  await this.loading;
 }
 play(name:string,volume=.35){const c=this.context,buffer=this.buffers.get(name);if(!this.enabled||!c||c.state!=='running'||!buffer||this.voices>=14)return;const now=c.currentTime;const delay=name==='step'?.24:name==='pickup'?.1:name==='hit'?.055:.08;if(now-(this.last.get(name)??-10)<delay)return;this.last.set(name,now);const source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;gain.gain.value=volume;source.connect(gain);gain.connect(c.destination);if(this.captureNode)gain.connect(this.captureNode);this.voices++;source.onended=()=>{source.disconnect();gain.disconnect();this.voices--};source.start();}
 events(events:CombatEvent[]){for(const e of events){let name=e.type;if(name==='shoot')name=e.kind;if(name==='hit')name=e.kind==='ice'?'armor':'hit';if(name==='swipe')name='boomerang';if(name==='upgrade')name='click';this.play(name,name==='shoot'?.2:.3);}}
 setMusic(active:boolean){const c=this.context;if(!c)return;if(!active||!this.musicEnabled){if(this.music){this.music.stop();this.music.disconnect();this.music=null;this.musicGain?.disconnect();}return;}if(this.music||!this.buffers.has('garden-loop'))return;const source=c.createBufferSource(),gain=c.createGain();source.buffer=this.buffers.get('garden-loop')!;source.loop=true;gain.gain.value=.42;source.connect(gain);gain.connect(c.destination);if(this.captureNode)gain.connect(this.captureNode);source.start();this.music=source;this.musicGain=gain;}
 dispose(){this.setMusic(false);void this.context?.close();this.context=null;}
}
