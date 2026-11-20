// Ground and actors use world units independent of screen density. One adult ≈ 78 visible units.
// Each texture contains many motifs; these are the spans of the whole image, not a single shingle.
export const terrainPatch = [[272,272],[224,208],[112,80]] as const;
export const heroFrameSize={dave:114,flora:100,rusty:104} as const;
// A sprite's transparent margins do not count toward its standing height.
export const enemyArt:Record<string,readonly [height:number,opaqueFraction:number]>={
 zombie:[72,.77],door:[73,.77],cone:[80,.78],bucket:[80,.77],newspaper:[70,.86],football:[83,.86],
 digger:[66,.86],dancer:[76,.86],wizard:[78,.86],imp:[37,.77],balloon:[91,.78],jetpack:[79,.86],
 'boss-trim':[122,.67],'boss-captain':[115,.78],'boss-marsh':[111,.78],'boss-mech':[129,.76]
};
export function enemyFrameSize(kind:string,elite=false,boss=false){const [height,fill]=enemyArt[kind]??enemyArt.zombie;return Math.round((elite&&!boss?height*1.39:height)/fill);}
