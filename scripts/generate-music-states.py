"""Original synthesized arrangements for game states; not the PvZ recording."""
from pathlib import Path
import math,random,wave,struct
sr=22050
out=Path('public/assets/game/audio')
for name,beat,roots,volume in [('camp-loop',.7,[48,45,41,43],.07),('elite-loop',.54,[45,41,48,43],.075),('boss-loop',.48,[45,44,41,40],.065)]:
 rng=random.Random(name);n=int(sr*beat*32);data=[0.]*n
 def note(start,midi,length,gain):
  f=440*2**((midi-69)/12)
  for j in range(int(sr*length)):
   t=j/sr;env=min(1,t/.008)*math.exp(-t*(5 if name=='camp-loop' else 9));data[(int(start*sr)+j)%n]+=gain*env*(math.sin(2*math.pi*f*t)+.18*math.sin(4*math.pi*f*t))
 for b in range(32):
  root=roots[(b//8)%4];note(b*beat,root,beat*1.5,volume)
  if b%2==0:note(b*beat,root+[12,19,15,22][(b//2)%4],beat*1.3,volume*.8)
  if name!='camp-loop':
   note((b+.5)*beat,root+24+[0,7,3,10][b%4],beat*.45,volume*.5)
   for j in range(int(sr*.13)):
    t=j/sr;k=(int(b*beat*sr)+j)%n;data[k]+=.10*math.exp(-t*35)*math.sin(2*math.pi*(65*t-90*t*t))+.014*rng.uniform(-1,1)*math.exp(-t*45)
  if name=='boss-loop' and b%4==2:note(b*beat,root-12,beat,.1)
 with wave.open(str(out/(name+'.wav')),'w') as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes(b''.join(struct.pack('<h',int(max(-.98,min(.98,v))*28000)) for v in data))
 print(name,round(n/sr,2),'seconds')
