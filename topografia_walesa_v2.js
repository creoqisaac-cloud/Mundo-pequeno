/* Isla de Walesa: terreno extraído de la geometría del boceto IMG_0512.procreate.
 * Las 32 × 32 muestras cromáticas conservan la organización original:
 * cordilleras septentrionales, pueblo radial centro-occidental, meseta oriental,
 * cuadrícula administrativa sur-occidental y gran bosque sureste.
 * Todos los valores se evalúan en coordenadas GLOBALES, sin juntas entre sectores.
 * El terreno no es una capa gráfica. El generador nativo consume altura y costa.
 */
window.WalesaTopografia=(()=>{
'use strict';
const PALETTE=[
 [107,139,106],[225,215,201],[233,116,77],[22,53,28],
 [151,204,127],[233,190,74],[182,130,20],[77,153,194],
 [164,165,153],[216,176,56],[227,179,112],[175,61,20]
];
const SAMPLES=[
'11111111111111111111111111111111',
'77787781118811111881888886066601',
'778A5A1AAA8AAAAAAAA88666666666B7',
'777A52559222222295AA996666666660',
'778922592222222595AA996B666BB660',
'778522992255555595AA99BB666B6660',
'778A92552555555A5AAA99BB666B6660',
'7778A555555222AAAAAA99BB666B6667',
'77771A5252222A1AAAAA996BB66B6667',
'77781A5222225A1AAAA59666BB6B6660',
'7781185522AAA11AAAA5999966666960',
'788811A555A1111AAAA9959999555558',
'78008144A448AAAAAA59555555555551',
'7800040444444AAAAA59955959999551',
'7000444844444AAAA595555555555558',
'8000444884044AAA55995555555555A8',
'8000444484000A2A55595555555555A8',
'8000044488440AAA5995555959995558',
'1800044444444AAA4499955959555558',
'7800444444444AAA4495555555555558',
'7804444444444AA444995555555555A8',
'78814444044444444449999999999647',
'77811444444444444444443333366307',
'78811111444444444444403333333307',
'78111118888888888888443333333307',
'71111888118818888811403333333307',
'71111118888888888111433333333337',
'71111888888888888111433333333337',
'71111888111111111111433333333337',
'81111181111111111111433333333307',
'71888888888888888888400000030077',
'11118111118111888118188888888881'
];
if(SAMPLES.length!==32||SAMPLES.some(s=>s.length!==32))throw Error('Muestra Procreate incompleta');
const symbol=s=>parseInt(s,12),cap=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=t=>t*t*(3-2*t);
const heightBy=['.17','.09','.82','.16','.17','.42','.84','-.23','.10','.49','.24','.94'].map(Number);
function sampleAt(ix,iy){return symbol(SAMPLES[Math.max(0,Math.min(31,iy|0))][Math.max(0,Math.min(31,ix|0))])}
function interp(u,v,fn){
 const x=cap(u)*31,y=cap(v)*31,ix=Math.floor(x),iy=Math.floor(y),tx=smooth(x-ix),ty=smooth(y-iy);
 const a=fn(sampleAt(ix,iy),ix,iy)*(1-tx)+fn(sampleAt(ix+1,iy),ix+1,iy)*tx;
 const b=fn(sampleAt(ix,iy+1),ix,iy+1)*(1-tx)+fn(sampleAt(ix+1,iy+1),ix+1,iy+1)*tx;
 return a+(b-a)*ty;
}
const eBase=s=>heightBy[s];
function ridge(u,v,ax,ay,bx,by,width,intensity){
 const vx=bx-ax,vy=by-ay,t=cap(((u-ax)*vx+(v-ay)*vy)/(vx*vx+vy*vy));
 const d=Math.hypot(u-ax-vx*t,v-ay-vy*t)/width;
 return intensity*Math.exp(-d*d*1.25);
}
function height(u,v,forest=false){
 if(forest){
  const n=Math.sin(u*6.31+v*4.11)*.045+Math.sin(u*23.2-v*7.3)*.022;
  return cap(.18+n+ridge(u%7,v%7,1,2,6,6,2,.15),.02,.58);
 }
 const v0=interp(u,v,eBase),N=
  ridge(u,v,.16,.11,.18,.055,.036,.22)+
  ridge(u,v,.30,.16,.48,.13,.034,.18)+
  ridge(u,v,.22,.31,.43,.26,.03,.19)+
  ridge(u,v,.72,.10,.77,.31,.045,.26)+
  ridge(u,v,.87,.10,.88,.29,.031,.19);
 const plateau=u>.63&&v>.35&&v<.70 ? .04:0;
 // El valle entre el barrio central y las montañas baja de forma continua.
 const valley=.11*Math.exp(-((u-.53)/.07)**2-((v-.53)/.23)**2);
 return cap(v0*.83+N+plateau-valley,.0,1);
}
function coast(u,v){
 if(u<0||u>1||v<0||v>1)return 1.3;
 const sea=interp(u,v,(s,x,y)=>s===7?1.3:(s===1&&(y===0||y===31)?1.17:.17));
 const border=Math.min(u,1-u,v,1-v);
 return Math.max(sea,border<.009?1.1:0);
}
function classify(u,v,forest=false){
 if(forest)return 'shroom';
 const s=sampleAt(Math.floor(cap(u)*31),Math.floor(cap(v)*31));
 if(u>.65&&v>.69&&v<.974)return'shroom';
 if(v>.76&&u<.65)return'city';
 if(v<.35&&(s===2||s===6||s===11||s===9))return'chile';
 if(u>.63&&v>.35&&v<.70)return 'city';
 if(s===3||s===0)return'shroom';
 if(s===2||s===6||s===11)return'chile';
 if(s===5||s===9||s===10)return'town';
 if(s===8||s===1)return'city';
 return'town';
}
function district(u,v){
 if(u>.65&&v>.68&&v<.99)return 'forest';
 if(v<.35&&(u<.54||u>.66))return 'montana';
 if(u>.63&&v>.35&&v<.72)return 'meseta';
 if(v>.76&&u<.65)return 'administrativo';
 if(u>.11&&u<.44&&v>.37&&v<.74)return 'pueblo';
 if(u<.66&&v>.36&&v<.76)return 'valle';
 return'costa';
}
const names={montana:'Cordilleras del Norte',meseta:'Altiplano Dorado',
 administrativo:'Ciudad del Sur',pueblo:'Pueblo de Walesa',valle:'Valle de los Arroyos',
 forest:'Bosque Profundo',costa:'Litoral de Walesa'};
function sector(gx,gy,w=768,h=704,forest=false){
 const GRID=8,gw=Math.ceil(w/GRID)+1,gh=Math.ceil(h/GRID)+1,H=new Float32Array(gw*gh);
 const uv=(x,y)=>[(gx+x/w)/32,(gy+y/h)/32];
 const altitude=(x,y)=>{const [u,v]=uv(x,y);return height(u,v,forest)};
 for(let y=0;y<gh;y++)for(let x=0;x<gw;x++)H[y*gw+x]=altitude(x*GRID,y*GRID);
 const sample=(x,y)=>{
  const nx=cap(x/GRID,0,gw-1),ny=cap(y/GRID,0,gh-1);
  const ix=Math.floor(nx),iy=Math.floor(ny),tx=nx-ix,ty=ny-iy;
  const a=H[iy*gw+ix],b=H[iy*gw+Math.min(gw-1,ix+1)];
  const c=H[Math.min(gh-1,iy+1)*gw+ix],d=H[Math.min(gh-1,iy+1)*gw+Math.min(gw-1,ix+1)];
  return (a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty;
 };
 return {
  sample,uv,
  coast:(x,y)=>{const [u,v]=uv(x,y);return forest?0:coast(u,v)},
  biome:(x,y)=>{const [u,v]=uv(x,y);return classify(u,v,forest)},
  zone:district((gx+.5)/32,(gy+.5)/32),
  name:forest?'Bosque sin Fin':names[district((gx+.5)/32,(gy+.5)/32)],
  elevationMeters:(x,y)=>Math.round(sample(x,y)*880),
  source:SAMPLES
 };
}
return {PALETTE,SAMPLES,height,coast,classify,district,sector,sourceName:'IMG_0512.procreate'};
})();
