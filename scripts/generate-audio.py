"""Original procedural game audio. PCM files, no third-party recordings."""
from pathlib import Path
import math,wave,random,struct
out=Path('public/assets/game/audio');out.mkdir(exist_ok=True,parents=True)
sr=22050
rng=random.Random(220)
def save(name,samples):
 with wave.open(str(out/(name+'.wav')),'w') as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,x)) * 26000)) for x in samples))
def effect(name,dur,freq,end,noise=0,volume=.6):
 data=[]
 for i in range(int(sr*dur)):
  t=i/sr;u=t/dur;env=min(1,t/.006)*(1-u)**2
  phase=2*math.pi*(freq*t+(end-freq)*t*t/(2*dur))
  data.append(volume*env*((1-noise)*(math.sin(phase)+.2*math.sin(phase*2))+noise*rng.uniform(-1,1)))
 save(name,data)
for args in [('pea',.12,460,110,.18),('ice',.18,1200,420,.18),('boomerang',.3,300,600,.42),('mushroom',.34,160,65,.6),('hit',.12,180,55,.65),('armor',.18,1400,700,.2),('hurt',.28,160,48,.3),('death',.25,230,40,.5),('step',.055,100,60,.8),('slam',.55,95,22,.65),('boss',1.1,75,45,.2),('click',.06,650,400,.05)]:effect(*args)
def chime(name,notes,spacing=.11):
 data=[0.] * int(sr*(len(notes)*spacing+.55))
 for n,f in enumerate(notes):
  offset=int(n*spacing*sr)
  for j in range(int(sr*.5)):
   t=j/sr;data[offset+j]+=.3*math.exp(-t*9)*math.sin(2*math.pi*f*t)
 save(name,data)
chime('pickup',[880,1320],.045);chime('level',[523,659,784,1046]);chime('evolution',[392,523,659,784,1046,1568]);chime('victory',[523,659,784,1046,784,1046],.17);chime('defeat',[392,330,294,196],.23)
# Seamless 16-bar original garden loop, 100 BPM, plucked marimba/flute + brushed percussion.
dur=38.4;data=[0.]*int(sr*dur);melody=[64,67,69,67,62,64,67,71,69,67,64,62,60,64,67,62]
for beat in range(64):
 chord=[[48,52,55],[45,48,52],[41,45,48],[43,47,50]][(beat//4)%4]
 notes=[chord[beat%3],melody[(beat//2)%16]+12] if beat%2==0 else [chord[beat%3]]
 for midi in notes:
  f=440*2**((midi-69)/12);offset=int(beat*.6*sr)
  for j in range(int(sr*.9)):
   t=j/sr;env=math.exp(-t*5)*min(1,t/.012);data[(offset+j)%len(data)]+=.085*env*(math.sin(2*math.pi*f*t)+.2*math.sin(2*math.pi*f*2*t))
 for j in range(int(sr*.08)):
  data[(int(beat*.6*sr)+j)%len(data)]+=.018*rng.uniform(-1,1)*math.exp(-j/sr*55)
save('garden-loop',data)
print('Created',len(list(out.glob('*.wav'))),'original audio assets')
