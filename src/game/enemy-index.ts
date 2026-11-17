/** Reusable uniform grid. Queries retain the original enemy-array order so
 * penetration, knockback and seeded loot behave exactly like the linear scan. */
export class EnemyIndex {
 private readonly cells=new Map<number,number[]>();
 private readonly used:number[]=[];
 private readonly locations:number[]=[];
 private readonly matches:number[]=[];
 private key(x:number,y:number){return Math.floor(y/64)*65536+Math.floor(x/64);}
 private bucket(key:number){let bucket=this.cells.get(key);if(!bucket){bucket=[];this.cells.set(key,bucket);}if(!bucket.length)this.used.push(key);return bucket;}
 rebuild(enemies:readonly {x:number;y:number}[]){for(const key of this.used)this.cells.get(key)!.length=0;this.used.length=0;this.locations.length=enemies.length;for(let i=0;i<enemies.length;i++){const e=enemies[i],key=this.key(e.x,e.y);this.locations[i]=key;this.bucket(key).push(i);}}
 move(index:number,x:number,y:number){const key=this.key(x,y),old=this.locations[index];if(key===old)return;const from=this.cells.get(old)!;const at=from.indexOf(index);if(at>=0){from[at]=from[from.length-1];from.pop();}this.locations[index]=key;this.bucket(key).push(index);}
 query(x:number,y:number,radius:number){const out=this.matches;out.length=0;const left=Math.floor((x-radius)/64),right=Math.floor((x+radius)/64),top=Math.floor((y-radius)/64),bottom=Math.floor((y+radius)/64);for(let row=top;row<=bottom;row++)for(let col=left;col<=right;col++){const bucket=this.cells.get(row*65536+col);if(bucket)for(let i=0;i<bucket.length;i++)out.push(bucket[i]);}out.sort((a,b)=>a-b);return out;}
}
