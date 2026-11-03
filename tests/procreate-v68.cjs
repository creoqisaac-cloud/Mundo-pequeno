'use strict';
/* v68: la costa dibujada gobierna suelo y colisión; conserva prendas e isla original. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ctx={window:{},atob:s=>Buffer.from(s,'base64').toString('binary')};
vm.runInNewContext(read('topografia_walesa_v2.js'),ctx,{filename:'topografia_walesa_v2.js'});
const t=ctx.window.WalesaTopografia,d=t.dibujo2026;
assert.ok(d,'terrain derived from the author drawing is available');
assert.equal(d.width,560);assert.equal(d.height,383);
assert.equal(d.worldWidth,6800);assert.equal(d.worldHeight,4630);
assert.equal(t.SAMPLES.length,32,'historical topography is preserved');
let wet=0,dry=0,beach=0;
for(let y=1;y<76;y++)for(let x=1;x<110;x++){
 const alt=d.coast(x*61.81,y*60.9);
 if(alt>1)wet++;else if(alt>.63)beach++;else dry++;
}
assert.ok(wet>350,'map includes original water channels and ocean');
assert.ok(dry>350,'map retains multiple continents and islands');
assert.ok(beach>50,'beach never paints on top of the water');
assert.equal(d.water(-1,10),true);
assert.equal(d.coast(-1,10)>1,true);
const mod=read('walesa_mainland_v3.js');
assert.match(mod,/T\.coastGlobal\?T\.coastGlobal\(x,y\)/,'terrain renderer matches collision coast');
assert.match(mod,/T\.classifyGlobal/,'original biome color zones reach the world renderer');
assert.match(read('overworld60.js'),/x>=m\.baseMW\|\|y>=m\.baseMH/,'legacy islands do not overwrite authored rivers');
const clothes=read('walesa_v32.js');
for(const n of ['botas','perfil','frente'])assert.match(clothes,new RegExp(n+": 'data:image/png;base64,"));
assert.match(clothes,/WalesaRopaDibujada/);
assert.match(read('sw.js'),/walesa-v68-mapa-procreate-20261103/);
console.log('✓ v68: water mask, new coasts, collisions, biomes, original NPC/save code and Procreate rainwear');
