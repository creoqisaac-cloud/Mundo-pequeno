/* WALESA · Overworld real v3.
 * No crea un mapa distinto. Extiende World.MAIN en coordenadas continuas.
 * Referencia de relieve y distribución: IMG_0512.procreate de la autora.
 * La isla y casas originales siguen en su sitio y comparten motor, cámara,
 * colisión, NPC, dinero, inventario, mapa y guardado con TODO el continente.
 */
window.WalesaMainland=(()=>{
 'use strict';
 const V=World,T=WalesaTopografia,SZ=352,ORX=2820,ORY=120,RW=3650,RH=4250,MW=6800,MH=4630;
 const P={village:{x:3770,y:2310},plateau:{x:5540,y:2200},town:{x:3600,y:3690},forest:{x:5840,y:3650},
  west:{x:2675,y:930},bridge:{x:3170,y:1650}};
 const seg=[
 [[2570,940],[2675,930]],[[2675,930],[2810,1000]],[[2810,1000],[3000,1240]],[[3000,1240],[3170,1650]],
 [[3170,1650],[3440,2020]],[[3440,2020],[3770,2310]],
 [[3770,2310],[3650,1830]],[[3650,1830],[3560,1390]],[[3560,1390],[3480,880]],
 [[3650,1830],[4330,1680]],[[4330,1680],[4820,1620]],[[4820,1620],[5310,1490]],
 [[3770,2310],[4230,2360]],[[4230,2360],[4780,2340]],[[4780,2340],[5300,2290]],
 [[5300,2290],[5810,2330]],[[5810,2330],[6100,2590]],
 [[3770,2310],[3760,2730]],[[3760,2730],[3690,3100]],[[3690,3100],[3600,3450]],
 [[3600,3450],[3600,3940]],[[3350,3490],[4080,3490]],[[3350,3760],[4080,3760]],
 [[3350,4020],[4080,4020]],[[3390,3360],[3390,4130]],[[3830,3360],[3830,4130]],
 [[5300,2290],[5540,2660]],[[5540,2660],[5700,3020]],[[5700,3020],[5840,3650]],
 [[5410,1800],[6100,1800]],[[5410,2080],[6100,2080]],[[5410,2440],[6100,2440]],
 [[5460,1620],[5460,2620]],[[5790,1620],[5790,2620]],[[6100,1630],[6100,2600]],
 [[5840,3650],[6060,3760]],[[5840,3650],[5550,3890]],[[5550,3890],[5320,4040]]
 ];
 const hash=(x,y)=>V.hash(x|0,y|0),clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 // La zona de llegada conserva sus diez casas y comercios, pero el centro es
 // una sola plaza circular transitable, sin cruces de senderos bajo el kiosco.
 const PLAZA={x:P.village.x,y:P.village.y,r:186,edge:198};
 const circleRoads=[];
 const kioskAt={x:P.village.x,y:P.village.y-107};
 const picnicAt={x:P.village.x+107,y:P.village.y+98};
 const mailAt={x:P.village.x-106,y:P.village.y+102};
 const plazaDistance=(x,y)=>Math.hypot(x-PLAZA.x,y-PLAZA.y);
 function plazaBrick(x,y){
  if(Math.abs(x-PLAZA.x)>PLAZA.edge||Math.abs(y-PLAZA.y)>PLAZA.edge)return null;
  const d=plazaDistance(x,y);if(d>PLAZA.edge)return null;
  const angle=Math.atan2(y-PLAZA.y,x-PLAZA.x),ring=Math.floor(d/8),
    walk=d*angle,brick=Math.floor((walk+(ring%2)*8)/16),
    joint=((walk+(ring%2)*8)%16+16)%16;
  // Aparejo concéntrico: cada hilada gira con la curva y evita que los
  // ladrillos queden horizontales sobre senderos diagonales.
  const seams=d%8<1||joint<.9;
  const palette=[[200,142,120],[212,158,130],[223,175,146],[189,130,111],[229,186,156]];
  let c=seams?[243,217,187]:palette[Math.floor(hash(ring,brick)*palette.length)].slice();
  const light=(1-clamp(d/PLAZA.r,0,1))*13;
  c=c.map(v=>v+light);
  // Cintas de caliza, medallón de mosaico y pétalos de terracota incrustados.
  // Son parte del mismo suelo y no añaden colisiones ni mueven los objetos.
  if(Math.abs(d-71)<2.1||Math.abs(d-145)<2.3)c=[247,219,176];
  if(d<60){
   const spoke=Math.sin(angle*8),petal=Math.abs(spoke)<.13,ringArt=Math.abs(d-51)<2.3;
   if(ringArt)c=[255,227,187];
   else if(d>25&&d<49&&petal)c=[120,171,153];
   else if(d>27&&d<48&&Math.sin(angle*8+Math.PI/2)>.95)c=[242,201,158];
   else if(d<19&&d>12)c=[239,204,155];
   else if(d<10)c=[171,202,173];
  }
  if(d>86&&d<137){
   const wheel=Math.sin(angle*12),petal=Math.abs(wheel)<.042;
   if(petal&&d>97&&d<123)c=[244,216,181];
  }
  if(Math.abs(d-184)<1.6)c=[253,228,190];
  if(d>PLAZA.r-4){const border=(d-PLAZA.r+4)/16;
   if(border<.5)c=c.map(v=>v*.77);
  }
  return {c,alpha:clamp((PLAZA.edge-d)/12,0,1)};
 }
 function normalizePlazaRoads(){
  if(circleRoads.length)return;
  const ringNodes=[],kept=[];
  const crossing=(a,b)=>{
   const dx=b[0]-a[0],dy=b[1]-a[1],cx=a[0]-PLAZA.x,cy=a[1]-PLAZA.y;
   const aa=dx*dx+dy*dy,bb=2*(cx*dx+cy*dy),
    cc=cx*cx+cy*cy-PLAZA.r*PLAZA.r,disc=bb*bb-4*aa*cc;
   if(disc<0)return null;
   return [-bb-Math.sqrt(disc),-bb+Math.sqrt(disc)].map(q=>q/(2*aa)).filter(t=>t>=0&&t<=1);
  };
  for(const [a,b] of seg){
   const ia=plazaDistance(a[0],a[1])<PLAZA.r,ib=plazaDistance(b[0],b[1])<PLAZA.r;
   if(ia&&ib)continue;
   const xs=crossing(a,b);
   if(ia!==ib&&xs?.length){
    const t=xs[0],p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
    ringNodes.push(p);kept.push(ia?[p,b]:[a,p]);
   }else if(!ia&&!ib&&xs?.length===2){
    const q=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
    const p=q(xs[0]),r=q(xs[1]);ringNodes.push(p,r);
    kept.push([a,p],[r,b]);
   }else kept.push([a,b]);
  }
  seg.splice(0,seg.length,...kept);
  for(let i=0;i<48;i++){
   const a=i/48*2*Math.PI;
   ringNodes.push([PLAZA.x+Math.cos(a)*PLAZA.r,PLAZA.y+Math.sin(a)*PLAZA.r]);
  }
  ringNodes.sort((a,b)=>Math.atan2(a[1]-PLAZA.y,a[0]-PLAZA.x)-
   Math.atan2(b[1]-PLAZA.y,b[0]-PLAZA.x));
  for(let i=0;i<ringNodes.length;i++)circleRoads.push([ringNodes[i],ringNodes[(i+1)%ringNodes.length]]);
 }
 const distSegment=(x,y,a,b)=>{
  const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy),0,1);
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
 };
 const roadAt=(x,y)=>{if(plazaDistance(x,y)<PLAZA.r)return true;for(const [a,b] of seg)if(distSegment(x,y,a,b)<12)return true;return false};
 const nearbyRoad=(x,y,r=20)=>{if(plazaDistance(x,y)<PLAZA.r+r)return true;for(const [a,b] of seg)if(distSegment(x,y,a,b)<r)return true;return false};
 const pos=(x,y)=>[(x-ORX)/RW,(y-ORY)/RH];
 const zone=(x,y)=>{const [u,v]=pos(x,y);return T.district(u,v)};
 function coast(x,y){
  if(x<2680&&y<1380)return 1.15; // Fuera de la isla heredada, nunca deja pasillos invisibles.
  // Puente natural de acceso a la costa occidental y al pueblo, sin pantallas.
  if(nearbyRoad(x,y,35)&&x>2550&&x<3900&&y<2400)return .08;
  const [u,v]=pos(x,y);if(u<0||v<0||u>1||v>1)return 1.22;
  // Silueta geográfica fiel a los bordes de color azul del boceto.
  return T.coast(u,v);
 }
 function height(x,y){
  if(x<2700&&y<1320)return 0;
  const [u,v]=pos(x,y);
  if(u<0||u>1||v<0||v>1)return 0;
  return T.height(u,v);
 }
 function biome(x,y){
  const [u,v]=pos(x,y);
  if(u<0||u>1||v<0||v>1)return 'town';
  // Distorsión continua en coordenadas mundiales. Ni una sola celda usa
  // bordes cuadrados del atlas de 32x32 de Procreate.
  const bendX=(V.vnoise(x/150,y/150)-.5)*125+
   (V.vnoise((x+690)/57,(y-320)/57)-.5)*37;
  const bendY=(V.vnoise((x-380)/174,(y+610)/174)-.5)*96+
   (V.vnoise((x+113)/49,(y+900)/49)-.5)*32;
  return T.classify(clamp((x+bendX-ORX)/RW,0,1),clamp((y+bendY-ORY)/RH,0,1));
 }
 // Misma biblioteca cromática del suelo original, no una segunda paleta artificial.
 const COL={town:V.BIO.town.g,chile:V.BIO.chile.g,city:V.BIO.city.g,
   shroom:V.BIO.shroom.g,candy:V.BIO.candy.g,beach:V.BIO.beach.g};
 const SEA=[95,172,193],SAND=[232,219,188],W=SZ,H=SZ;
 const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]};
 const PAL={};for(const [k,v] of Object.entries(COL))PAL[k]=v.map(rgb);
 // Las veredas heredan las cuatro tintas del mismo bioma del motor base.
 const PATH={};for(const [k,v] of Object.entries(V.BIO))PATH[k]=(v.path||['#e6d3ad','#d7c194','#f1e4c4','#c5ae82']);

 // Mezcla orgánica MATERIAL por MATERIAL (no gradiente cúbico universal).
 // La arena difumina polvo sobre el pasto, el dulce deja confeti, el asfalto
 // se desvanece en adoquines y el valle de tamarindo aporta tierra rojiza.
 const MAT=['town','chile','city','shroom','candy','beach'];
 const TRANS={
  'beach|town':{hue:[240,217,175],grain:'tuft',edge:.13},
  'beach|candy':{hue:[245,224,194],grain:'sugar',edge:.20},
  'beach|chile':{hue:[225,173,119],grain:'clay',edge:.12},
  'candy|town':{hue:[230,207,177],grain:'petal',edge:.21},
  'candy|city':{hue:[227,211,211],grain:'tile',edge:.16},
  'candy|chile':{hue:[210,161,128],grain:'sugar',edge:.17},
  'chile|city':{hue:[202,164,137],grain:'clay',edge:.12},
  'chile|town':{hue:[166,159,109],grain:'tuft',edge:.15},
  'chile|shroom':{hue:[145,129,114],grain:'spore',edge:.11},
  'city|town':{hue:[195,202,176],grain:'tile',edge:.15},
  'city|shroom':{hue:[166,184,176],grain:'spore',edge:.16},
  'shroom|town':{hue:[137,171,139],grain:'spore',edge:.19},
  'candy|shroom':{hue:[203,173,199],grain:'petal',edge:.17},
  'beach|city':{hue:[224,206,187],grain:'tile',edge:.12}
 };
 const materialPair=(a,b)=>TRANS[[a,b].sort().join('|')]||
  {hue:[190,181,151],grain:'tuft',edge:.12};
 function organicNodes(x0,y0){
  const step=20,n=Math.ceil(SZ/step)+2,weights=new Float32Array(n*n*MAT.length);
  const stamps=[[0,0,3],[-35,0,1.3],[35,0,1.3],[0,-35,1.3],[0,35,1.3],
    [-29,-29,.68],[29,-29,.68],[-29,29,.68],[29,29,.68],
    [-57,0,.42],[57,0,.42],[0,-57,.42],[0,57,.42]];
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
   const x=x0+i*step,y=y0+j*step,off=(j*n+i)*MAT.length;
   let total=0;
   for(const [dx,dy,w] of stamps){
    const k=MAT.indexOf(biome(x+dx,y+dy));
    if(k>=0){weights[off+k]+=w;total+=w}
   }
   for(let k=0;k<MAT.length;k++)weights[off+k]/=total||1;
  }
  return {weights,n,step};
 }
 const biomeMix=(nodes,x,y)=>{
  const {weights,n,step}=nodes,
    u=clamp(x/step,0,n-1.0001),v=clamp(y/step,0,n-1.0001),
    i=Math.floor(u),j=Math.floor(v),tx=u-i,ty=v-j,dom=[];
  let first=0,second=1,w1=-1,w2=-1;
  for(let k=0;k<MAT.length;k++){
   const p=(j*n+i)*MAT.length+k,
     q=p+MAT.length,r=p+n*MAT.length,
     w=((weights[p]*(1-tx)+weights[q]*tx)*(1-ty)+
       (weights[r]*(1-tx)+weights[r+MAT.length]*tx)*ty);
   if(w>w1){second=first;w2=w1;first=k;w1=w}
   else if(w>w2){second=k;w2=w}
  }
  return {a:MAT[first],b:MAT[second],wa:w1,wb:Math.max(0,w2)};
 };
 const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
 function tintTransition(col,pair,dominance,small){
  const at=smooth(clamp((.55-dominance)/.35,0,1));
  if(at<=0)return col;
  const h=pair.hue,w=at*pair.edge;
  return [col[0]*(1-w)+h[0]*w+small*1.8,
    col[1]*(1-w)+h[1]*w+small*1.5,
    col[2]*(1-w)+h[2]*w+small*1.1];
 }

 const surfaceCache=new Map();
 function roadPattern(ctx,kind,paved){
  const key=(paved?'paved:':'stone:')+kind;let src=surfaceCache.get(key);
  if(!src){
   src=document.createElement('canvas');src.width=16;src.height=8;
   const g=src.getContext('2d');
   if(paved){g.fillStyle='#706b79';g.fillRect(0,0,16,8);
    for(let j=0;j<8;j++)for(let i=0;i<16;i++)if(hash(i,j)>.74){
     g.fillStyle=hash(i+13,j+11)>.5?'#77737f':'#67636f';g.fillRect(i,j,1,1)}
   }else{
    const tones=PATH[kind]||PATH.town;
    for(let j=0;j<8;j++)for(let i=0;i<16;i++){
     const row=j>>2,bx=(i+(row%2)*4)>>3;
     const mortar=j%4===0||(i+(row%2)*4)%8===0;
     g.fillStyle=mortar?tones[3]:tones[hash(bx,row)>.73?1:hash(bx,row)<.16?2:0];
     g.fillRect(i,j,1,1);
    }
   }
   surfaceCache.set(key,src);
  }
  return ctx.createPattern(src,'repeat');
 }
 const rock=([r,g,b],a)=>[r*.55+119*a,g*.45+87*a,b*.48+66*a];
 let main=null,baseD=null,origBiome=null,oldW=2700,oldH=1320;
 const cache=new Map();
 function tile(tx,ty){
  const key=tx+','+ty;if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);return v}
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d'),im=ctx.createImageData(W,H),arr=im.data;
  const x0=tx*SZ,y0=ty*SZ,materials=organicNodes(tx*SZ,ty*SZ);
  // Calculamos la altitud una vez por celda, para evitar millones de ruidos por fotograma.
  const step=8,N=W/step+2,E=new Float32Array(N*N),SEA_MASK=new Float32Array(N*N),F=new Float32Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=x0+i*step,y=y0+j*step,k=j*N+i;E[k]=height(x,y);SEA_MASK[k]=coast(x,y);F[k]=clamp(V.vnoise(x/52,y/52)*.67+V.vnoise((x+83)/19,(y-55)/19)*.33,0,1)}
  for(let j=0;j<H;j++){
   const y=y0+j,iy=j>>3,tj=(j&7)/8;
   for(let i=0;i<W;i++){
    const x=x0+i,ix=i>>3,ti=(i&7)/8,p=iy*N+ix;
    const elev=(E[p]*(1-ti)+E[p+1]*ti)*(1-tj)+(E[p+N]*(1-ti)+E[p+N+1]*ti)*tj;
    const sea=(SEA_MASK[p]*(1-ti)+SEA_MASK[p+1]*ti)*(1-tj)+(SEA_MASK[p+N]*(1-ti)+SEA_MASK[p+N+1]*ti)*tj;
    const k=(j*W+i)*4,noise=hash(x>>2,y>>2),small=hash(x,y),
      // El bioma se lee a través de una frontera irregular de microparcelas.
      // Mantiene los colores nativos y elimina el corte geométrico por regiones.
      mix=biomeMix(materials,i,j),bk=mix.a,pal=PAL[bk]||PAL.town;
    let col;
    // Lo que se ve como agua tiene EXACTAMENTE el umbral de colisión del motor (.95).
    if(sea>.95)col=[SEA[0]+noise*13,SEA[1]+noise*15,SEA[2]+noise*13];
    else{
     // Transiciones cromáticas suaves, sin ruido de "parches cuadrados".
     // Se interpola la paleta del motor base, con grano mínimo de pixel-art.
     const surface=clamp((F[p]*(1-ti)+F[p+1]*ti)*(1-tj)+
       (F[p+N]*(1-ti)+F[p+N+1]*ti)*tj+(small-.5)*.12,0,.999)*3;
     const lo=surface|0,weight=surface-lo;
     col=[
      pal[lo][0]*(1-weight)+pal[Math.min(3,lo+1)][0]*weight,
      pal[lo][1]*(1-weight)+pal[Math.min(3,lo+1)][1]*weight,
      pal[lo][2]*(1-weight)+pal[Math.min(3,lo+1)][2]*weight
     ];
     const bp=PAL[mix.b]||PAL.town,
      other=[bp[lo][0]*(1-weight)+bp[Math.min(3,lo+1)][0]*weight,
       bp[lo][1]*(1-weight)+bp[Math.min(3,lo+1)][1]*weight,
       bp[lo][2]*(1-weight)+bp[Math.min(3,lo+1)][2]*weight];
     // Frontera curvada: ruido de baja frecuencia + granulado del material.
     const pair=materialPair(mix.a,mix.b),
      jitter=(V.vnoise((x+390)/38,(y-156)/38)-.5)*.095+
        (noise-.5)*.029,
      blend=smooth(clamp(mix.wb/(mix.wa+mix.wb+.0001)+jitter,0,.54));
     col=[
      col[0]*(1-blend)+other[0]*blend,
      col[1]*(1-blend)+other[1]*blend,
      col[2]*(1-blend)+other[2]*blend
     ];
     col=tintTransition(col,pair,mix.wa-mix.wb,small);
     // Barrancos y estratos de altura: tonos de la paleta existente.
     if(elev>.36){
      const t=clamp((elev-.3)*1.3,0,.84);
      col=[col[0]*(1-t)+164*t,col[1]*(1-t)+118*t,col[2]*(1-t)+75*t];
     }
     const a=E[p],b=E[p+1],c=E[p+N],slope=(a-b)*8+(a-c)*4;
     const shade=clamp(slope*240,-36,29);
     col[0]+=shade;col[1]+=shade;col[2]+=shade;
     if(elev>.31&&(Math.floor(elev*13)!==Math.floor((elev+(c-a)*(1-ti)/8)*13))){
      col=[99+noise*28,72+noise*20,57+noise*18];
     }
    }
    // Orilla de arena a pasto, caramelo, ciudad o tamarindo, con anchura
    // distinta según el material y frontera rizada, no una línea de píxeles.
    if(sea<=.95&&sea>.63){
     const pair=materialPair('beach',bk),surf=[SAND[0]-small*13,SAND[1]-small*14,SAND[2]-small*11],
      wave=(V.vnoise((x+51)/71,(y-39)/71)-.5)*.07,
      shore=smooth((sea-.65+wave)/.255),tone=pair.grain==='clay'?[222,190,143]:
        pair.grain==='sugar'?[248,225,191]:pair.grain==='tile'?[226,209,185]:surf;
     col=[col[0]*(1-shore)+tone[0]*shore,
       col[1]*(1-shore)+tone[1]*shore,col[2]*(1-shore)+tone[2]*shore];
    }
    // El suelo de ladrillo es parte del tile y de la colisión existente:
    // no es un objeto superpuesto ni una textura estirada.
    if(sea<.95){
     const plaza=plazaBrick(x,y);
     if(plaza&&plaza.alpha>0){
      const a=plaza.alpha;col=[col[0]*(1-a)+plaza.c[0]*a,
       col[1]*(1-a)+plaza.c[1]*a,col[2]*(1-a)+plaza.c[2]*a];
     }
    }
    arr[k]=clamp(col[0],0,255)|0;arr[k+1]=clamp(col[1],0,255)|0;arr[k+2]=clamp(col[2],0,255)|0;arr[k+3]=255;
   }
  }
  ctx.putImageData(im,0,0);
  // El pavimento se fusiona POR CAPAS: las uniones en T y en cruz ya no
  // quedan atravesadas por el contorno de la última calle pintada.
  const visible=seg.filter(([a,b])=>!(Math.max(a[0],b[0])<x0-34||
    Math.min(a[0],b[0])>x0+SZ+34||Math.max(a[1],b[1])<y0-34||
    Math.min(a[1],b[1])>y0+SZ+34)).map(([a,b])=>({
      a,b,paved:['administrativo','meseta'].includes(zone((a[0]+b[0])/2,(a[1]+b[1])/2))
    }));
  const strokes=(layer)=>{
   ctx.lineJoin='round';ctx.lineCap='round';
   for(const {a,b,paved} of visible){
    const tone=PATH[biome((a[0]+b[0])/2,(a[1]+b[1])/2)]||PATH.town;
    const width=layer===0?35:24;
    ctx.save();
    ctx.translate(a[0]-x0,a[1]-y0);
    const angle=Math.atan2(b[1]-a[1],b[0]-a[0]),len=Math.hypot(b[0]-a[0],b[1]-a[1]);
    ctx.rotate(angle);
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);
    ctx.strokeStyle=layer===0?(paved?'#d5c6b6':tone[3]):
      roadPattern(ctx,biome((a[0]+b[0])/2,(a[1]+b[1])/2),paved);
    ctx.lineWidth=width;ctx.stroke();
    ctx.restore();
   }
  };
  strokes(0);strokes(1);
  // Piedra, adoquín y asfalto del juego base: textura longitudinal real.
  // No usar clip() sobre líneas abiertas, porque deja una región vacía.
  for(const {a,b,paved} of visible){
   const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
   const tone=PATH[biome((a[0]+b[0])/2,(a[1]+b[1])/2)]||PATH.town;
   ctx.strokeStyle=paved?'rgba(244,232,210,.18)':'rgba(114,80,57,.25)';
   ctx.lineWidth=.85;ctx.lineCap='butt';
   for(let d=6;d<len;d+=10){
    const px=a[0]+dx*d/len-x0,py=a[1]+dy*d/len-y0,shift=(Math.floor(d/10)%2)*2;
    for(const off of [-7+shift,1+shift,8+shift]){
     ctx.beginPath();ctx.moveTo(px+nx*(off-2),py+ny*(off-2));
     ctx.lineTo(px+nx*(off+2),py+ny*(off+2));ctx.stroke();
    }
   }
   if(!paved){
    ctx.strokeStyle=tone[2];ctx.globalAlpha=.38;ctx.lineWidth=1.2;
    for(const off of [-9,9]){
     ctx.beginPath();ctx.moveTo(a[0]+nx*off-x0,a[1]+ny*off-y0);
     ctx.lineTo(b[0]+nx*off-x0,b[1]+ny*off-y0);ctx.stroke();
    }
    ctx.globalAlpha=1;
   }
  }
  // Bordes de acera, desagües y marcas viales siguiendo el mismo trazado.
  for(const {a,b,paved} of visible)if(paved){
   ctx.save();ctx.beginPath();ctx.moveTo(a[0]-x0,a[1]-y0);
   ctx.lineTo(b[0]-x0,b[1]-y0);ctx.strokeStyle='rgba(244,230,193,.56)';
   ctx.lineWidth=1.2;ctx.setLineDash([6,17]);ctx.stroke();ctx.restore();
  }
  // Jardineras y pequeñas flores a la vera de los caminos. Patrón de terreno,
  // independiente de la cámara y sin sprites repetidos en cada tile.
  for(const {a,b,paved} of visible){
   const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,
    nx=-dy/len,ny=dx/len;
   for(let t=21;t<len;t+=29){
    const phase=Math.floor(t/29),h=hash((a[0]+dx*t/len)>>3,(a[1]+dy*t/len)>>3);
    if(h<.43)continue;
    for(const side of [-1,1]){
     if(hash(phase+31,Math.floor(a[1]+side*47))<.55)continue;
     const x=a[0]+dx*t/len+nx*side*(paved?26:23),
       y=a[1]+dy*t/len+ny*side*(paved?26:23);
     const px=Math.round(x-x0),py=Math.round(y-y0);
     if(px<5||py<5||px>SZ-5||py>SZ-5||coast(x,y)>.79||
      plazaDistance(x,y)<PLAZA.edge+10)continue;
     ctx.fillStyle=paved?'#8da894':'#6b996d';
     ctx.fillRect(px-3,py,6,2);ctx.fillRect(px-1,py-2,3,4);
     ctx.fillStyle=h>.81?'#f4c6cc':h>.62?'#fff1ad':'#d6e7bc';
     ctx.fillRect(px,py-3,2,2);ctx.fillRect(px-3,py,2,1);
    }
   }
  }
  // Detalle superficial determinista en coordenadas globales, con textura
  // coherente entre tiles: flores, hierbas, piedritas y sombras de senderos.
  for(let yy=0;yy<SZ;yy+=12)for(let xx=0;xx<SZ;xx+=12){
   const gx=x0+xx,gy=y0+yy,h=hash(gx>>2,gy>>2);
   if(h<.44||coast(gx,gy)>.92||nearbyRoad(gx,gy,19))continue;
   const blend=biomeMix(materials,xx,yy),bi=blend.a,e=height(gx,gy),
    pair=materialPair(blend.a,blend.b),
    boundary=blend.wb>.17&&blend.wa<.74;
   const px=xx+Math.floor(hash(gx+71,gy)*9),py=yy+Math.floor(hash(gx,gy+93)*9);
   if(boundary&&h>.64){
    const hue=pair.hue,ink='rgba('+hue.map(Math.round).join(',')+',.88)';
    ctx.fillStyle=ink;
    if(pair.grain==='sugar'||pair.grain==='petal'){
     ctx.fillRect(px,py,3,2);ctx.fillRect(px+5,py-2,2,2);
     ctx.fillStyle='rgba(255,239,225,.82)';ctx.fillRect(px+2,py-2,1,1);
    }else if(pair.grain==='tile'){ctx.fillRect(px,py,5,3);
     ctx.fillStyle='rgba(255,255,237,.72)';ctx.fillRect(px+1,py+1,3,1);
    }else if(pair.grain==='clay'){
     ctx.fillRect(px,py,4,2);ctx.fillRect(px+7,py+3,2,1);
    }else if(pair.grain==='spore'){
     ctx.fillRect(px,py,2,2);ctx.fillRect(px+4,py-3,1,1);
    }else{ctx.fillRect(px,py,1,5);ctx.fillRect(px+3,py-2,2,4)}
   }else if(bi==='city'){
    ctx.fillStyle=h>.91?'rgba(106,91,76,.20)':'rgba(248,238,219,.20)';
    ctx.fillRect(px,py,2+(h>.94?2:0),1);
   }else if(e>.53){
    ctx.fillStyle=h>.85?'rgba(249,227,185,.42)':'rgba(72,54,44,.28)';
    ctx.fillRect(px,py,3,2);
   }else{
    ctx.fillStyle=h>.90?'#f8e8c0':h>.77?'rgba(33,96,47,.42)':'rgba(239,247,179,.28)';
    ctx.fillRect(px,py,1+(h>.97?1:0),h>.91?2:1);
    if(h>.83){ctx.fillStyle='rgba(49,105,55,.52)';ctx.fillRect(px+3,py-2,1,3)}
   }
  }
  // Sombreado de montaña vectorial: crea bordes/terrazas en el mismo suelo.
  if(x0>ORX&&y0<1570){
    ctx.lineWidth=1;
    for(let ly=0;ly<SZ;ly+=18)for(let lx=0;lx<SZ;lx+=18){
     const x=x0+lx,y=y0+ly,zz=height(x,y);
     if(zz>.50&&coast(x,y)<.91&&hash(x>>4,y>>4)>.65){
      ctx.strokeStyle='rgba(77,51,43,.38)';ctx.beginPath();ctx.moveTo(lx,ly+7);ctx.lineTo(lx+5,ly+3);ctx.lineTo(lx+13,ly+6);ctx.stroke();
     }
    }
  }
  cache.set(key,cv);while(cache.size>32)cache.delete(cache.keys().next().value);return cv;
 }
 function draw(ctx,ox,oy,sw,sh,t){
  // 1. Suelo heredado (sin ampliarlo ni modificar la partida original).
  const ix=Math.max(0,ox),iy=Math.max(0,oy),
        iw=Math.min(oldW,ox+sw)-ix,ih=Math.min(oldH,oy+sh)-iy;
  if(iw>0&&ih>0){
   ctx.drawImage(main.ground,ix,iy,iw,ih,ix-ox,iy-oy,iw,ih);
   ctx.globalAlpha=.82;
   ctx.drawImage(main.foam[Math.floor(t*1.4)%2],ix/2,iy/2,iw/2,ih/2,ix-ox,iy-oy,iw,ih);
   ctx.globalAlpha=1;
  }
  // 2. Nuevo terreno: tiles dentro del MISMO World.MAIN y cámara, sin iris.
  const xa=Math.max(0,Math.floor(ox/SZ)),xb=Math.min(Math.ceil(MW/SZ)-1,Math.floor((ox+sw)/SZ));
  const ya=Math.max(0,Math.floor(oy/SZ)),yb=Math.min(Math.ceil(MH/SZ)-1,Math.floor((oy+sh)/SZ));
  for(let y=ya;y<=yb;y++)for(let x=xa;x<=xb;x++){
   if(x*SZ<oldW&&y*SZ<oldH){
    // El origen ya dibujó su textura. Sólo pintamos la región exterior.
    const xx=x*SZ,yy=y*SZ,rx=Math.max(xx,xx<oldW?oldW:xx),
          ry=Math.max(yy,yy<oldH?oldH:yy);
    if(xx<oldW&&yy<oldH){
      // Franja derecha por debajo del borde antiguo y banda inferior completa.
      if(xx+SZ>oldW){const width=xx+SZ-oldW;ctx.drawImage(tile(x,y),SZ-width,0,width,SZ,oldW-ox,yy-oy,width,SZ)}
      if(yy+SZ>oldH){const yy0=Math.max(oldH,yy),hh=yy+SZ-yy0,ww=Math.min(SZ,Math.max(0,oldW-xx));if(hh>0&&ww>0)ctx.drawImage(tile(x,y),0,yy0-yy,ww,hh,xx-ox,yy0-oy,ww,hh)}
      continue;
    }
   }
   ctx.drawImage(tile(x,y),x*SZ-ox,y*SZ-oy);
  }
 }
 const houses=[];
 // Conserva el sprite original y añade detalles arquitectónicos deterministas
 // por inmueble. No introduce una librería de edificios ajena al juego.
 function facade(sprite,b,night){
  const c=document.createElement('canvas');c.width=sprite.c.width;c.height=sprite.c.height;
  const g=c.getContext('2d');g.drawImage(sprite.c,0,0);
  const v=b.facade,urban=!!b.city,front=urban?58:43;
  const accent=b.roof,light=night?'#ffe4a2':'#f8f4e5';
  // Luz rasante sobre las pinturas nativas; source-atop conserva todas
  // las siluetas, ventanas, chimeneas y la transparencia del pixel-art.
  g.save();g.globalCompositeOperation='source-atop';
  const grd=g.createLinearGradient(5,5,c.width-5,c.height);
  grd.addColorStop(0,night?'rgba(248,224,174,.075)':'rgba(255,250,221,.15)');
  grd.addColorStop(.53,'rgba(255,255,255,0)');
  grd.addColorStop(1,night?'rgba(33,33,67,.13)':'rgba(66,58,76,.115)');
  g.fillStyle=grd;g.fillRect(0,0,c.width,c.height);
  g.restore();
  g.lineWidth=1;g.strokeStyle='#765e60';g.fillStyle=accent;
  if(v===0||v===3){ // ático y tragaluz
   g.fillRect(urban?29:24,urban?4:19,urban?21:19,urban?10:9);
   g.fillStyle=light;g.fillRect(urban?32:27,urban?6:21,urban?15:13,4);
   g.strokeRect(urban?29.5:24.5,urban?4.5:19.5,urban?20:18,urban?9:8);
  }else if(v===1||v===4){ // celosías y balcones
   g.fillStyle=accent;g.fillRect(urban?8:10,front,urban?57:49,3);
   for(let x=urban?11:13;x<(urban?64:58);x+=7)g.fillRect(x,front-7,2,9);
   g.fillStyle=light;g.fillRect(urban?14:16,urban?53:56,urban?12:10,2);
  }else if(v===2||v===5){ // macetas y marquesinas
   for(const x of (urban?[12,31,52]:[15,45])){
    g.fillStyle='#956f55';g.fillRect(x,front+4,10,3);
    g.fillStyle='#518c56';g.fillRect(x+2,front,6,5);
    g.fillStyle='#f6adbf';g.fillRect(x+3,front,2,2);
   }
   g.fillStyle=accent;g.fillRect(urban?42:26,urban?57:58,urban?22:16,3);
  }else if(v===6){ // persianas pintadas y marco de fachada
   g.fillStyle=accent;
   for(const x of (urban?[12,32,52]:[13,44]))for(const dx of [-3,12]){
    g.fillRect(x+dx,urban?22:44,2,urban?13:9);
   }
   g.fillStyle=light;g.fillRect(urban?13:29,urban?12:38,urban?48:10,2);
  }else if(v===7){ // baldosas florales y guirnalda
   g.strokeStyle=accent;g.lineWidth=2;g.beginPath();
   g.moveTo(urban?8:10,urban?18:39);g.quadraticCurveTo(40,urban?25:45,urban?69:60,urban?18:39);g.stroke();
   for(let i=0;i<7;i++){const x=(urban?9:11)+i*8,y=(urban?19:41)+Math.sin(i*.8)*2;
    g.fillStyle=i%2?'#fae3a4':'#ef9bad';g.fillRect(x,y,3,2);
   }
  }else if(v===8){ // ático con molduras y zócalo
   g.fillStyle=accent;g.fillRect(urban?22:25,urban?2:20,urban?36:21,urban?7:7);
   g.fillStyle=light;g.fillRect(urban?26:28,urban?4:22,urban?28:15,2);
   g.strokeStyle=accent;g.lineWidth=2;g.strokeRect(urban?6:8,urban?61:55,urban?65:51,urban?24:7);
  }else{ // fachada con celosías y jardineras
   g.fillStyle=accent;
   for(const x of (urban?[12,32,52]:[13,44])){
    g.fillRect(x,urban?38:54,12,3);
    g.fillStyle='#5a986c';g.fillRect(x+2,urban?36:52,8,2);
    g.fillStyle='#f4cad0';g.fillRect(x+4,urban?35:51,2,2);
    g.fillStyle=accent;
   }
   g.fillRect(urban?8:9,urban?14:38,urban?58:51,2);
  }
  // Detalles que siguen la misma escala de 76x68 y 84x94 del artista base.
  if(urban){
   g.fillStyle=accent;g.globalAlpha=.8;g.fillRect(7,89,68,2);
   g.fillStyle=light;g.fillRect(8,12,60,1);
   if(v%3===1){g.strokeStyle='#eadcc8';g.lineWidth=1;
    for(const x of [9,70]){g.beginPath();g.moveTo(x,17);g.lineTo(x,76);g.stroke()}}
  }else{
   if(v%3===0){
    g.strokeStyle=accent;g.globalAlpha=.65;
    for(let i=0;i<5;i++){g.beginPath();g.moveTo(16+i*8,24);
     g.lineTo(23+i*8,28);g.stroke()}
   }
   if(v%4===1){
    g.fillStyle='#6c9f7a';g.fillRect(11,55,9,2);
    g.fillStyle='#ecb2bf';g.fillRect(13,54,2,2);
   }
  }
  g.globalAlpha=1;
  return {...sprite,c};
 }

 // Urbanismo real: ocupar parcelas junto a calles, nunca sobre el asfalto.
 // Solamente recoloca edificaciones V3 y conserva intacta la isla heredada.
 const buildClaims=[];
 function roadClearance(x,y,urban){
  const hw=urban?37:30,top=urban?41:32,bottom=urban?1:1;
  let closest=Infinity;
  for(const [a,b] of seg){
   const paved=['administrativo','meseta'].includes(zone((a[0]+b[0])/2,(a[1]+b[1])/2));
   const margin=paved?19:18;
   for(const xx of [x-hw,x,x+hw])for(const yy of [y-top,y-(top+bottom)/2,y-bottom]){
    const d=distSegment(xx,yy,a,b);closest=Math.min(closest,d);
    if(d<margin)return {valid:false,closest:d};
   }
  }
  return {valid:true,closest};
 }
 function freePlot(x,y,urban){
  const sz=urban?82:66;
  if(x<ORX+45||x>MW-45||y<ORY+65||y>MH-60)return false;
  if(coast(x,y)>.73||coast(x-35,y-40)>.81||coast(x+35,y-40)>.81)return false;
  if(plazaDistance(x,y)<PLAZA.edge+47)return false;
  if(!roadClearance(x,y,urban).valid)return false;
  for(const h of buildClaims){
   if(Math.abs(h.x-x)<(h.sz+sz)*.5+8&&
      Math.abs(h.y-y)<(h.sz+sz)*.47+8)return false;
  }
  return true;
 }
 function findPlot(x,y,urban){
  if(freePlot(x,y,urban)){buildClaims.push({x,y,sz:urban?82:66});return{x,y}}
  let best=null,score=Infinity;
  // Se preserva el barrio de procedencia y se buscan solares ordenados
  // en los dos lados de la calle, no coordenadas aleatorias mar adentro.
  for(const radius of [28,45,65,85,112,145,185,230,280,335]){
   for(let i=0;i<32;i++){
    const angle=i/32*Math.PI*2,radiusNoise=radius+(hash(i,Math.round(x+y))-.5)*13,
     cx=Math.round(x+Math.cos(angle)*radiusNoise),
     cy=Math.round(y+Math.sin(angle)*radiusNoise);
    if(!freePlot(cx,cy,urban))continue;
    const d=Math.hypot(cx-x,cy-y),
      road=roadClearance(cx,cy,urban).closest,
      penalty=d+Math.abs(road-35)*.12;
    if(penalty<score){score=penalty;best={x:cx,y:cy}}
   }
   if(best)break;
  }
  const choice=best||{x,y};
  buildClaims.push({...choice,sz:urban?82:66});
  return choice;
 }
 function addDoorPaths(){
  // Corta en la red de caminos sólo para conectar cada puerta desde la acera.
  // El acceso sale por debajo del edificio, jamás por el tejado.
  const base=seg.slice();
  for(const b of houses){
   const exit=[b.x,b.y+19],urban=!!b.city;
   if(nearbyRoad(exit[0],exit[1],27))continue;
   let chosen=null,best=140;
   for(const [a,c] of base){
    const dx=c[0]-a[0],dy=c[1]-a[1],dt=dx*dx+dy*dy;
    if(dt<1)continue;
    const t=clamp(((exit[0]-a[0])*dx+(exit[1]-a[1])*dy)/dt,0,1);
    const px=a[0]+t*dx,py=a[1]+t*dy,d=Math.hypot(px-exit[0],py-exit[1]);
    if(d>=best||d<24)continue;
    let clear=true;
    for(const h of houses){
     if(h===b)continue;
     if(distSegment(h.x,h.y-18,exit,[px,py])<(h.city?48:41)){clear=false;break}
    }
    if(clear){best=d;chosen=[px,py]}
   }
   if(chosen)seg.push([chosen,exit]);
  }
 }

 function building(id,name,x,y,type='home',job=null){
  const v=zone(x,y),urban=type==='city'&&(!!job||hash(x+417,y-251)<.64);
  // La ciudad combina edificios de varias plantas con casas bajas originales.
  // Cada tipología conserva las colisiones, puertas y sprites del motor.
  const districtHome=type==='city'&&!urban;
  ({x,y}=findPlot(x,y,urban));
  const styles=[
   ['#f8e9d8','#c88670'],['#e7eef8','#769cbd'],['#f4e2ef','#ad83a8'],['#e6f0dc','#87a16f'],
   ['#fff0d5','#d5a16d'],['#e6e1f3','#8576b1'],['#f0e3d7','#8f9d9d'],
   ['#f6e4d9','#bb7f83'],['#e0f1e9','#6eaca0'],['#f8eecf','#bc9c6e'],
   ['#e1e9f6','#738dbe'],['#f6dfe5','#be8aa3'],['#f2eee6','#9f9fbe'],
   ['#e6edda','#8d9b64'],['#fbe8d2','#d58c79'],['#dae8e8','#769aa4']];
  const urbanStyles=[
   ['#e8e5df','#9aa3b7'],['#e9e1f0','#9989b7'],['#e1edf0','#7c9fa9'],
   ['#f2e7d7','#b9967e'],['#e6e9dd','#929c7a'],['#f1e1d8','#b87979'],
   ['#e3e8f0','#889bb6'],['#ebe1d2','#af9876'],['#e4ebe7','#769e98'],
   ['#f0e1e8','#af819c']];const palette=(urban?urbanStyles:styles)[Math.floor(hash(x>>4,y>>4)*(urban?urbanStyles.length:styles.length))];const b={id:'v3_'+id,name,x,y,job:job||undefined,city:urban?1:0,districtHome,wall:palette[0],roof:palette[1],
    acc:urban?'#9eafbc':palette[1],icon:urban?'🏬':'🏠'};
  const variant=Math.floor(hash(x+137,y-211)*10);b.facade=variant;
  if(urban){b.acc=palette[1];b.icon=({shop:'🛍️',papers:'📚',delivery:'📮',arcade:'🕹️',pasteles:'🧁',moda:'👗',mascotas:'🐾',salon:'✂️'})[job]||'🏠';
   b.day=facade(V.cityBuilding(b.wall,b.acc,b.icon,false),b,false);
   b.night=facade(V.cityBuilding(b.wall,b.acc,b.icon,true),b,true);
  }else{
   const opt={sign:job?(job==='delivery'?'mail':job==='papers'?'scroll':job==='shop'?'bow':'heart'):null,
    noChim:!!job,awning:job||variant===2?['#fff8e9',palette[1]]:undefined,flag:variant===4};
   b.day=facade(V.houseSprite(b.wall,b.roof,false,opt),b,false);
   b.night=facade(V.houseSprite(b.wall,b.roof,true,opt),b,true);
  }
  V.addObj(main,b.day,x,y,V.rectS(x-(urban?33:27),y-(urban?34:28),urban?70:54,urban?33:27),{house:b});
  // Parcelas reconocibles usando vegetación, mobiliario y vallas del juego.
  const spr=V.spr,seed=Math.floor(hash(x,y)*5),side=x+(seed%2?-46:46),yGarden=y+9;
  if(!urban&&!job){
   if(spr.fence){V.addObj(main,spr.fence,x-40,yGarden,V.rectS(x-49,yGarden-4,18,4));
    V.addObj(main,spr.fence,x+40,yGarden,V.rectS(x+31,yGarden-4,18,4))}
   if(seed%2===0&&spr.bush?.[seed%3])V.addObj(main,spr.bush[seed%3],side,yGarden,null);
   if(seed%3===0&&spr.bench)V.addObj(main,spr.bench,x+58,y+7,null);
   if(spr.pot){
    if(seed%3!==1)V.addObj(main,spr.pot[seed%2],x-32,y+6,null);
    if(seed%3===0)V.addObj(main,spr.pot[(seed+1)%2],x+32,y+6,null);
   }
  }else if(urban&&seed%2===0&&spr.lamp){
   V.addObj(main,spr.lamp,x+52,y+5,null);main.glows.push([x+52,y-19]);
  }
  main.glows.push([x-14,y-(urban?55:16)]);main.build.push(b);houses.push(b);return b;
 }
 function adorn(){
  const a=V.spr,rg=V.rng(514721);
  const clearNear=(x,y,rad)=>houses.some(b=>Math.hypot(b.x-x,b.y-y)<rad)||nearbyRoad(x,y,27)||Math.hypot(x-P.village.x,y-P.village.y)<115;
  for(let k=0;k<4050;k++){
   const x=ORX+50+rg()*(RW-90),y=ORY+60+rg()*(RH-110);
   const u=(x-ORX)/RW,v=(y-ORY)/RH,z=height(x,y),b=biome(x,y),p=rg();
   if(coast(x,y)>.84||clearNear(x,y,28))continue;
   if((b==='city'||zone(x,y)==='administrativo'||zone(x,y)==='meseta')&&p<.86)continue;
   if(b==='chile'){
    const r=a.rock[p>.48?0:1];
    V.addObj(main,r,x,y,V.circS(x,y-3,10));
   }else if(z>.55){
    const r=a.rock[p>.48?0:1];V.addObj(main,r,x,y,V.circS(x,y-3,10));
   }else if(b==='shroom'){
    const v=p>.17?a.tree.green:a.tree.autumn;
    V.addObj(main,v,x,y,V.circS(x,y-5,9));
   }else if(p>.37){
    V.addObj(main,a.tree[p>.88?'pink':'green'],x,y,V.circS(x,y-5,9));
   }else if(p>.18){
    V.addObj(main,a.bush[Math.floor(hash(x+31,y+23)*a.bush.length)],x,y,null);
   }else if(p>.12&&a.pot&&['pueblo','valle','meseta'].includes(zone(x,y))){
    V.addObj(main,a.pot[Math.floor(hash(x,y+53)*a.pot.length)],x,y,null);
   }
  }
  // Hitos propios de la región, pero con sprites exclusivos del juego.
  V.addObj(main,a.fount[0],P.village.x,P.village.y+11,V.circS(P.village.x,P.village.y,15),{fount:true});
  // Kiosco jugable con el sprite y el minijuego musical ORIGINALES.
  V.addObj(main,a.gazebo,kioskAt.x,kioskAt.y,V.circS(kioskAt.x,kioskAt.y-12,21),{landmark:'walesa-kiosk'});
  V.addObj(main,a.basket,picnicAt.x,picnicAt.y,null,{landmark:'walesa-picnic'});
  V.addObj(main,a.mail,mailAt.x,mailAt.y,V.rectS(mailAt.x-6,mailAt.y-7,12,12),{landmark:'walesa-mail'});
  for(const [x,y] of [[P.village.x-52,P.village.y-52],[P.village.x+52,P.village.y-52],
                      [P.village.x-52,P.village.y+52],[P.village.x+52,P.village.y+52],
                      [P.plateau.x-35,P.plateau.y-20],[P.town.x+100,P.town.y-20]]){
   V.addObj(main,a.lamp,x,y,V.rectS(x-2,y-3,4,3));main.glows.push([x,y-24]);
  }
 }
 function decoratePlaza(){
  const a=V.spr,nearHouse=(x,y)=>houses.some(b=>Math.hypot(b.x-x,b.y-y)<53);
  // Arriates, faroles y rincones de lectura bordean el pavimento circular.
  // Se utilizan objetos nativos, con espacios de paso despejados para puertas.
  for(let i=0;i<24;i++){
   const angle=i/24*Math.PI*2-.2,r=i%3===0?162:174;
   const x=Math.round(PLAZA.x+Math.cos(angle)*r),
    y=Math.round(PLAZA.y+Math.sin(angle)*r);
   if(nearHouse(x,y))continue;
   if(i%6===0&&a.lamp){
    V.addObj(main,a.lamp,x,y,V.rectS(x-2,y-3,4,3));main.glows.push([x,y-24]);
   }else if(i%4===0&&a.pot){
    V.addObj(main,a.pot[i%2],x,y,null);
   }else if(a.bush){
    V.addObj(main,a.bush[i%3],x,y,null);
   }
  }
  for(let i=0;i<8;i++){
   const angle=i/8*Math.PI*2+.21,x=Math.round(PLAZA.x+Math.cos(angle)*119),
    y=Math.round(PLAZA.y+Math.sin(angle)*119);
   if(!nearHouse(x,y)&&a.bench)V.addObj(main,a.bench,x,y,null);
  }
 }
 function structures(){
  normalizePlazaRoads();
  // Poblado radial: casas alrededor de la plaza, como el dibujo de Procreate.
  const colors=['Cinna','Melody','Purin','Rosa','Nube','Hiedra','Clavel','Estrella','Olivo','Amapola'];
  for(let i=0;i<10;i++){
   const a=(i/10)*Math.PI*2-Math.PI/2,r=i%2?265:225,
     x=Math.round(P.village.x+Math.cos(a)*r),y=Math.round(P.village.y+Math.sin(a)*r);
   building('radial'+i,'Casa '+colors[i],x,y,'home',null);
   // La ruta de acceso real se calcula al terminar el parcelario.
  }
  building('plaza-market','Mercado del Pueblo',P.village.x-100,P.village.y+140,'home','shop');
  building('town-hall','Oficina de Walesa',P.village.x+115,P.village.y+145,'home','papers');
  building('alto-market','Comercio del Altiplano',5500,1885,'city','shop');
  building('alto-admin','Administración del Altiplano',5775,1885,'city','papers');
  building('alto-home','Casas de la Meseta',5490,2200,'city');
  building('alto-clinic','Clínica del Altiplano',5940,2210,'city');
  building('alto-delivery','Correo de la Meseta',5670,2440,'city','delivery');
  for(let row=0;row<4;row++)for(let col=0;col<5;col++){
   const x=3410+col*137,y=3440+row*170;
   building('urb'+row+'_'+col,
    ['Taller','Edificio','Papelería','Vivienda','Comercio'][col]+' del Sur',x,y,'city',
    col===1&&row===0?'papers':col===4&&row===1?'shop':null);
  }
  // Parcelas adicionales para activar los bloques desocupados con comercios
  // funcionales del sistema nativo, parques pequeños y casas habitadas.
  const civic=[
   ['cafe-estacion','Cafetería Alameda',3550,4180,'pasteles'],
   ['juegos-sur','Salón Recreativo del Sur',3990,3610,'arcade'],
   ['moda-sur','Tienda de Moda del Sur',4050,3930,'moda'],
   ['mascotas-sur','Refugio de Mascotas',3220,3810,'mascotas'],
   ['salon-sur','Peluquería del Centro',3220,4070,'salon'],
   ['viviendas-sur-a','Residencias Jacaranda',3920,4160,null],
   ['viviendas-sur-b','Condominio del Prado',3520,3260,null],
   ['viviendas-sur-c','Casas del Bulevar',4110,3260,null],
   ['centro-candy','Tienda de Caramelos',4780,1770,'shop'],
   ['alto-postres','Dulcería de la Meseta',6160,1980,'pasteles'],
   ['alto-juegos','Recreativos del Altiplano',6200,2250,'arcade'],
   ['alto-vivienda','Jardines del Altiplano',6170,2470,null],
   ['alto-atelier','Atelier de las Nubes',5250,1880,'moda']
  ];
  for(const [id,name,x,y,job] of civic)building(id,name,x,y,'city',job);
  building('forest-lodge','Refugio del Bosque',5760,3575,'home');
  building('forest-camp','Casa del Guardabosques',6040,3860,'home');
  building('ridge-lodge','Mirador de la Cordillera',3510,910,'home');
  building('ridge-post','Puesto del Paso Alto',5260,1120,'home');
  addDoorPaths();
  adorn();decoratePlaza();
 }

 // Un mobiliario urbano distinto en cada distrito, sin inventar nuevas
 // colisiones ni reemplazar las estructuras ya construidas.
 const districtDetails=[];
 function decorateDistricts(){
  const spr=V.spr;
  const spots=[
   {name:'Paseo de los Jacarandás',x:3770,y:2670,k:'pueblo',icon:'🌸'},
   {name:'Jardines del Altiplano',x:5555,y:2520,k:'meseta',icon:'🌿'},
   {name:'Alameda del Sur',x:3980,y:3845,k:'administrativo',icon:'🌳'},
   {name:'Sendero de los Helechos',x:5600,y:3810,k:'forest',icon:'🍃'},
   {name:'Descanso de la Cordillera',x:3485,y:1130,k:'montana',icon:'⛰️'}
  ];
  for(const area of spots){
   let anchor=null;
   for(let radius=0;radius<=220&&!anchor;radius+=20){
    for(let k=0;k<20&&!anchor;k++){
     const ang=k*Math.PI/10,
      x=Math.round(area.x+radius*Math.cos(ang)),
      y=Math.round(area.y+radius*Math.sin(ang));
     if(x<=ORX+20||x>=MW-55||y<=ORY+20||y>=MH-55||
      coast(x,y)>.8||plazaDistance(x,y)<PLAZA.edge+65||
      houses.some(h=>Math.hypot(h.x-x,h.y-y)<82)||
      nearbyRoad(x,y,35))continue;
     anchor={x,y,name:area.name,icon:area.icon};
    }
   }
   if(!anchor)continue;
   districtDetails.push(anchor);
   const {x,y}=anchor;const forest=area.k==='forest',mountain=area.k==='montana',
     urban=area.k==='administrativo';
   if(spr.sign)V.addObj(main,spr.sign,x+24,y-11,null);
   if(spr.bench&&!mountain){
    V.addObj(main,spr.bench,x-34,y+11,null);
    V.addObj(main,spr.bench,x+36,y+10,null);
   }
   if(spr.bush){
    for(let k=0;k<5;k++){
     const ang=k*2.4+.4,x0=x+Math.cos(ang)*(forest?49:37),
      y0=y+Math.sin(ang)*(forest?39:28);
     V.addObj(main,spr.bush[(k+Math.floor(hash(x,y)*3))%spr.bush.length],
       x0,y0,null);
    }
   }
   if(urban&&spr.pot){
    V.addObj(main,spr.pot[0],x-16,y-35,null);
    V.addObj(main,spr.pot[1],x+20,y-35,null);
   }else if(mountain&&spr.rock){
    V.addObj(main,spr.rock[0],x-24,y+23,null);
    V.addObj(main,spr.rock[1],x+18,y+24,null);
   }else if(forest&&spr.tree){
    for(const dx of [-65,65])V.addObj(main,spr.tree.green,x+dx,y-23,null);
   }
   if(spr.lamp){
    V.addObj(main,spr.lamp,x+53,y+17,null);
    main.glows.push([x+53,y-7]);
   }
  }
 }

 const scenic=[];
 // Infraestructura de plazas, jardines y descansos con sprites de World.spr:
 // se añaden a los barrios nuevos SIN mover las actividades ni los spots antiguos.
 function nativePlaces(){
  const a=V.spr;
  const definitions=[
   ['Parque del Pueblo',P.village.x+120,P.village.y-145,'gazebo','🌷'],
   ['Mirador de la Meseta',P.plateau.x+110,P.plateau.y-135,'sign','⛰️'],
   ['Plaza del Sur',P.town.x+215,P.town.y+160,'fount','⛲'],
   ['Jardín del Bosque',P.forest.x+90,P.forest.y-130,'basket','🧺']
  ];
  for(const [name,tx,ty,kind,icon] of definitions){
   let chosen=null;
   for(let radius=0;radius<=150&&!chosen;radius+=25){
    for(let step=0;step<12&&!chosen;step++){
     const a0=step*Math.PI/6,x=Math.round(tx+Math.cos(a0)*radius),
       y=Math.round(ty+Math.sin(a0)*radius);
     if(x<ORX+10||x>MW-40||y<ORY+10||y>MH-40||coast(x,y)>.84||
      nearbyRoad(x,y,36)||houses.some(b=>Math.hypot(b.x-x,b.y-y)<90))continue;
     chosen={name,x,y,kind,icon};
    }
   }
   if(!chosen)continue;
   scenic.push(chosen);const {x,y}=chosen;
   if(kind==='fount'&&a.fount?.[0])V.addObj(main,a.fount[0],x,y,V.circS(x,y-2,15),{fount:true});
   else if(a[kind])V.addObj(main,a[kind],x,y,kind==='gazebo'?V.circS(x,y-6,24):null);
   for(const dx of [-31,31])if(a.bench)V.addObj(main,a.bench,x+dx,y+32,null);
   if(a.bush?.[0])for(const dx of [-53,53])V.addObj(main,a.bush[0],x+dx,y-10,null);
   if(a.lamp){V.addObj(main,a.lamp,x+49,y+21,null);main.glows.push([x+49,y-3])}
  }
 }

 // Cada vivienda usa el MISMO sistema de interiores/colisión del motor.
 // Las plantillas originales se copian sin alterar sus sprites, regalos ni partidas.
 function furnishRooms(){
  const rooms=V.rooms;
  if(!Array.isArray(rooms)||rooms.length<4)throw Error('No están listas las habitaciones originales');
  let i=0;
  for(const b of houses){
   if(b.job)continue;
   const base=rooms[(i+++(b.city?3:0))%4];
   const bg=document.createElement('canvas');bg.width=256;bg.height=192;
   const ctx=bg.getContext('2d');const flip=hash(b.x,b.y)>.55;
   if(flip){ctx.translate(256,0);ctx.scale(-1,1)}
   ctx.drawImage(base.bg,0,0);ctx.setTransform(1,0,0,1,0,0);
   // Papel y piso con un matiz suave, muebles siempre pixel-art nativos.
   const tone=zone(b.x,b.y)==='forest'?'#46795c':b.city?'#a8b4c3':
     zone(b.x,b.y)==='montana'?'#c29b77':'#e9b5c8';
   ctx.fillStyle=tone;ctx.globalAlpha=.09;ctx.fillRect(8,8,240,38);
   ctx.globalAlpha=.045;ctx.fillRect(8,52,240,132);ctx.globalAlpha=1;
   // Alfombras, zócalos, retratos y distribución espejo, sin alterar puertas.
   const n=Math.floor(hash(b.x+78,b.y+96)*7),rugs=['#eeb3be','#a1cee3','#c6db9e','#c6b1d9','#edcf8e','#a2d8c3','#dfb6a2'];
   ctx.fillStyle=rugs[n];ctx.globalAlpha=.65;
   ctx.beginPath();ctx.ellipse(128,122,25+n*2,12+n,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
   ctx.fillStyle=rugs[(n+2)%7];ctx.fillRect(110,10,36,22);
   ctx.strokeStyle='#ac866c';ctx.lineWidth=3;ctx.strokeRect(110,10,36,22);
   ctx.fillStyle='#f8f2df';ctx.fillRect(115+n%4,15,12+n%5,10);
   for(let q=0;q<5;q++){ctx.fillStyle=q%2?'#699a75':'#f0b5c7';ctx.fillRect(40+q*33+(n%3)*2,42,3,4)}
   const room={...base,bg,name:b.name,gift:false,
     objs:base.objs.slice(0,-1).map(o=>({...o,x:flip?256-o.x:o.x})),
     solids:base.solids.slice(0,-1).map(o=>({...o,x:flip?256-o.x-o.w:o.x})),
     flav:base.flav.map(f=>({...f,x:flip?256-f.x:f.x}))};
   b.room=rooms.length;rooms.push(room);
  }
 }
 let overview=null;
 function sampleMap(ctx,ox,oy,k){
  if(!overview){const tc=document.createElement('canvas');tc.width=380;tc.height=290;
   const img=tc.getContext('2d').createImageData(tc.width,tc.height),D=img.data;
  for(let j=0;j<290;j++)for(let i=0;i<380;i++){
   const x=i/380*MW,y=j/290*MH,l=(j*380+i)*4;
   const inOld=x<oldW&&y<oldH,cc=inOld?baseD(x,y):coast(x,y);
   const bi=inOld?origBiome(x,y,main):biome(x,y),
     e=inOld?0:height(x,y),v=PAL[bi]||PAL.town,n=v[e>.5?0:e>.25?1:2];
   const out=cc>.98?[69,151,189]:cc>.91?[232,219,188]:n;
   D[l]=out[0];D[l+1]=out[1];D[l+2]=out[2];D[l+3]=255;
  }
   tc.getContext('2d').putImageData(img,0,0);overview=tc;
  }
  ctx.drawImage(overview,ox,oy,MW*k,MH*k);
  // Capa cartográfica adicional: red viaria, barrios y destinos, sin alterar el mundo jugable.
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  for(const [a,b] of seg){ctx.beginPath();ctx.moveTo(ox+a[0]*k,oy+a[1]*k);ctx.lineTo(ox+b[0]*k,oy+b[1]*k);ctx.strokeStyle='#fff6de';ctx.lineWidth=2.7;ctx.stroke();ctx.strokeStyle='#ad956f';ctx.lineWidth=.8;ctx.stroke()}
  // La rotonda se muestra también en el mapa de navegación.
  const px=ox+PLAZA.x*k,py=oy+PLAZA.y*k;
  ctx.beginPath();ctx.arc(px,py,PLAZA.r*k,0,Math.PI*2);
  ctx.fillStyle='#dca58c';ctx.fill();ctx.strokeStyle='#f8e2bf';
  ctx.lineWidth=Math.max(1,4*k);ctx.stroke();
  ctx.beginPath();ctx.arc(px,py,65*k,0,Math.PI*2);
  ctx.strokeStyle='#f5d4a6';ctx.lineWidth=Math.max(.8,2*k);ctx.stroke();
  const labels=[['PUEBLO DE WALESA',P.village.x,P.village.y],['MESETA ORIENTAL',P.plateau.x,P.plateau.y],['DISTRITO DEL SUR',P.town.x,P.town.y],['BOSQUE PROFUNDO',P.forest.x,P.forest.y],['CORDILLERA',3480,880],['CIUDAD CORAZÓN',1400,720]];
  ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  for(const [label,x,y] of labels){const px=ox+x*k,py=oy+y*k;ctx.lineWidth=2.6;ctx.strokeStyle='rgba(255,251,238,.94)';ctx.strokeText(label,px,py-7);ctx.fillStyle='#344e55';ctx.fillText(label,px,py-7);ctx.beginPath();ctx.arc(px,py,2.5,0,Math.PI*2);ctx.fillStyle='#e77972';ctx.fill()}
  ctx.restore();
 }

 // ═══════════ NAVEGACIÓN DEL CONTINENTE, DENTRO DEL MAPA NATIVO ═══════════
 // Reutiliza World.MAIN.paths y los caminos ampliados. Nunca crea una segunda isla.
 let streetGraph=null,guide=null,lastGuideTick=0,guideBar=null;
 function streets(){
  const previous=(main?.paths||[]).filter(p=>Array.isArray(p)&&p.length>=4&&p.every(Number.isFinite))
   .map(p=>[[p[0],p[1]],[p[2],p[3]]]);
  return [...previous,...seg,...circleRoads];
 }
 function graph(){
  if(streetGraph)return streetGraph;
  const lines=streets(),cuts=lines.map(([,])=>[0,1]);
  for(let i=0;i<lines.length;i++){
   const [a,b]=lines[i],rx=b[0]-a[0],ry=b[1]-a[1];
   for(let j=i+1;j<lines.length;j++){
    const [c,d]=lines[j],sx=d[0]-c[0],sy=d[1]-c[1],
     den=rx*sy-ry*sx;if(Math.abs(den)<1e-6)continue;
    const qx=c[0]-a[0],qy=c[1]-a[1],
     t=(qx*sy-qy*sx)/den,u=(qx*ry-qy*rx)/den;
    // Una entrada se une a la calle por su EXTREMO (u=0 o u=1).
    // Excluir extremos aislaba los accesos y rompía el GPS del teléfono.
    if(t>=-1e-7&&t<=1+1e-7&&u>=-1e-7&&u<=1+1e-7){
     cuts[i].push(clamp(t,0,1));cuts[j].push(clamp(u,0,1));
    }
   }
  }
  const nodes=[],adj=[],lookup=new Map();
  const node=(x,y)=>{
   const key=Math.round(x*10)+','+Math.round(y*10);
   if(lookup.has(key))return lookup.get(key);
   const n=nodes.length;nodes.push([x,y]);adj.push([]);lookup.set(key,n);return n;
  };
  lines.forEach(([a,b],i)=>{
   const cx=b[0]-a[0],cy=b[1]-a[1],ts=[...new Set(cuts[i])].sort((a,b)=>a-b);
   for(let j=1;j<ts.length;j++){
    const p=node(a[0]+cx*ts[j-1],a[1]+cy*ts[j-1]),
      q=node(a[0]+cx*ts[j],a[1]+cy*ts[j]),d=Math.hypot(cx,cy)*(ts[j]-ts[j-1]);
    if(d>.05&&p!==q){adj[p].push([q,d]);adj[q].push([p,d])}
   }
  });
  return streetGraph={nodes,adj,lines};
 }
 function roadRoute(from,to){
  const G=graph(),{nodes,adj}=G;
  const near=p=>{let k=-1,d=Infinity;for(let i=0;i<nodes.length;i++){
   const v=Math.hypot(nodes[i][0]-p.x,nodes[i][1]-p.y);
   if(v<d){d=v;k=i}
  }return {k,d}};
  const a=near(from),b=near(to);
  if(a.k<0||b.k<0||a.d>800||b.d>800)return {points:[[from.x,from.y],[to.x,to.y]],connected:false};
  const N=nodes.length,dist=new Float64Array(N).fill(Infinity),prev=new Int32Array(N).fill(-1),
    used=new Uint8Array(N);dist[a.k]=0;
  for(let turn=0;turn<N;turn++){
   let u=-1,best=Infinity;
   for(let j=0;j<N;j++)if(!used[j]&&dist[j]<best){u=j;best=dist[j]}
   if(u<0||u===b.k)break;used[u]=1;
   for(const [v,w] of adj[u])if(dist[u]+w<dist[v]){dist[v]=dist[u]+w;prev[v]=u}
  }
  if(!Number.isFinite(dist[b.k]))return {points:[[from.x,from.y],[to.x,to.y]],connected:false};
  const chain=[];for(let v=b.k;v!==-1;v=prev[v]){chain.push(nodes[v]);if(v===a.k)break}
  chain.reverse();
  const points=[[from.x,from.y],...chain,[to.x,to.y]].filter((p,i,ar)=>i===0||Math.hypot(p[0]-ar[i-1][0],p[1]-ar[i-1][1])>1);
  return {points,connected:true};
 }
 function destinations(){
  if(!main)return[];
  const landmarks=[
   ['Plaza de Walesa',P.village.x,P.village.y,'⛲'],
   ['Kiosco musical',kioskAt.x,kioskAt.y,'🎵'],
   ['Picnic del Pueblo',picnicAt.x,picnicAt.y,'🧺'],
   ['Cordilleras del Norte',3500,900,'⛰️'],
   ['Altiplano Dorado',P.plateau.x,P.plateau.y,'🏔️'],
   ['Ciudad del Sur',P.town.x,P.town.y,'🏙️'],
   ['Bosque Profundo',P.forest.x,P.forest.y,'🌲'],
   ['Ciudad Corazón',870,878,'🏠']
  ].map(([name,x,y,icon],i)=>({name,x,y,icon,category:i===5?'homes':'parks'}));
  const jobs=main.build.filter(b=>b.job).map(b=>({name:b.name,x:b.x,y:b.y+18,
   icon:b.icon||'🏪',category:'shops'}));
  const homes=main.build.filter(b=>!b.job).map(b=>({name:b.name,x:b.x,y:b.y+18,
   icon:'🏡',category:'homes'}));
  return [...landmarks,...scenic.map(p=>({...p,category:'parks'})),
    ...districtDetails.map(p=>({...p,category:'parks'})),...jobs,...homes];
 }
 function ensureGuideBar(){
  if(guideBar)return guideBar;
  const div=document.createElement('div');div.id='walesa-route-hud';
  Object.assign(div.style,{position:'fixed',top:'calc(env(safe-area-inset-top) + 57px)',left:'50%',
   transform:'translateX(-50%)',maxWidth:'calc(100vw - 24px)',minWidth:'220px',
   background:'rgba(255,250,241,.95)',border:'2px solid #7da17d',borderRadius:'13px',
   color:'#314f41',font:'bold 11px/1.4 system-ui,sans-serif',padding:'8px 11px',zIndex:'65',
   boxShadow:'0 3px 14px #0004',display:'none',pointerEvents:'auto'});
  const label=document.createElement('span'),stop=document.createElement('button');
  stop.textContent='✕';stop.title='Cancelar guía';stop.setAttribute('aria-label','Cancelar guía');
  Object.assign(stop.style,{float:'right',marginLeft:'8px',background:'#e8e1d5',borderRadius:'6px',
   color:'#514b43',padding:'3px 7px',cursor:'pointer'});
  stop.onclick=()=>{guide=null;div.style.display='none'};
  div.append(label,stop);div._label=label;document.body.append(div);guideBar=div;return div;
 }
 function updateGuide(){
  const X=Game?.X;if(!X||!guide)return;
  const hud=ensureGuideBar();
  if(X.M()!==main||X.st.scene!=='out'||X.st.mode!=='play'){hud.style.display='none';return}
  const now=Date.now();if(now-lastGuideTick<250)return;lastGuideTick=now;
  const p=X.player;
  // Recálculo automático cuando el jugador se separa de la calle marcada.
  // En el mapa anterior la flecha seguía señalando un giro ya perdido.
  if(guide.connected&&now-(guide.lastReroute||0)>1800){
   let closest=Infinity;
   for(let i=1;i<guide.points.length;i++){
    const a=guide.points[i-1],b=guide.points[i];
    closest=Math.min(closest,distSegment(p.x,p.y,a,b));
   }
   if(closest>120){
    const r=roadRoute({x:p.x,y:p.y},guide.dest);
    guide.points=r.points;guide.connected=r.connected;
    guide.step=1;guide.lastReroute=now;
   }
  }
  const pts=guide.points;
  if(Math.hypot(p.x-guide.dest.x,p.y-guide.dest.y)<35){
   X.toast('📍 Llegaste a '+guide.name);guide=null;hud.style.display='none';return;
  }
  let k=guide.step||1;
  while(k<pts.length-1&&Math.hypot(p.x-pts[k][0],p.y-pts[k][1])<70)k++;
  guide.step=k;
  const q=pts[k]||[guide.dest.x,guide.dest.y],d=Math.hypot(q[0]-p.x,q[1]-p.y),
    all=Math.hypot(guide.dest.x-p.x,guide.dest.y-p.y),a=Math.atan2(q[1]-p.y,q[0]-p.x),
    compass=['→','↘','↓','↙','←','↖','↑','↗'],
    arrow=compass[(Math.round(a/ (Math.PI/4))+8)%8];
  hud._label.textContent=arrow+' '+guide.name+' · '+Math.round(all)+
   ' u · '+(guide.connected?'siguiente punto ':'rumbo orientativo ')+Math.round(d)+' u';
  hud.style.display=X.st.menu?'none':'block';
 }
 function startGuide(target){
  if(!main||!Game?.X)return null;
  const p=Game.X.player;
  const route=roadRoute({x:p.x,y:p.y},target);
  guide={points:route.points,connected:route.connected,dest:target,
   name:target.name||'Destino',step:1,lastReroute:Date.now()};
  lastGuideTick=0;updateGuide();
  return guide;
 }
 function navigationTab(tab,box){
  if(tab!=='map'||!main)return;
  renderNavigator(box,false);
 }
 function mountPhone(box,closePhone){
  if(!box||!main)return false;
  renderNavigator(box,true,closePhone);return true;
 }
 function renderNavigator(box,phone=false,closePhone=null){
  const X=Game.X,m=main,all=destinations();
  const wrap=document.createElement('section');wrap.className='walesa-map-live';
  wrap.style.cssText='color:#354b42;font:700 12px/1.4 system-ui,sans-serif;'+
    'width:100%;min-width:0;box-sizing:border-box;padding:'+(phone?'4px 1px 18px':'6px 3px 12px');
  wrap.innerHTML='<div style="padding:6px 8px 8px;border-radius:12px;background:#fcf9f1;box-shadow:0 2px 8px #26473815">'+
   '<div style="font-weight:900;color:#426b5b;font-size:13px">🗺 Walesa Maps <span style="font-size:10px;font-weight:600">· rutas de la isla</span></div>'+
   '<input type="search" aria-label="Buscar destino" placeholder="🔎 Buscar plaza, tienda, casa…" style="display:block;box-sizing:border-box;width:100%;margin-top:7px;'+
    'padding:10px;border:1px solid #afcbb7;border-radius:9px;background:#fff;color:#375344;font:700 12px system-ui" />'+
   '<div data-nav="search-results" style="display:none;max-height:110px;overflow:auto;margin-top:4px"></div></div>'+
   '<div style="display:flex;gap:5px;margin:7px 0;align-items:center;flex-wrap:wrap">'+
   '<button data-nav="minus" aria-label="Alejar mapa">−</button><button data-nav="plus" aria-label="Acercar mapa">＋</button>'+
   '<button data-nav="me">📍 Mi ubicación</button><button data-nav="all">🌍 Isla completa</button>'+
   '<button data-nav="tour" aria-label="Revivir recorrido de llegada">🧳 Llegada</button>'+
   '<button data-nav="style" aria-label="Cambiar estilo del mapa">🌿 Relieve</button>'+
   '</div><div data-nav="filters" role="group" aria-label="Categorías de lugares" style="display:flex;gap:5px;overflow-x:auto;'+
   'padding:3px 1px 6px;scrollbar-width:thin">'+
   '<button data-filter="all" aria-pressed="true">✦ Todos</button>'+
   '<button data-filter="parks" aria-pressed="false">🌿 Parques</button>'+
   '<button data-filter="shops" aria-pressed="false">🏬 Servicios</button>'+
   '<button data-filter="homes" aria-pressed="false">🏠 Casas</button></div>'+
   '<canvas id="walesa-streets-map" width="560" height="435" style="display:block;box-sizing:border-box;width:100%;height:auto;'+
   'border:2px solid #bfd2c2;border-radius:12px;touch-action:none;background:#d6ebed" aria-label="Mapa de calles de Walesa, arrastra para explorar"></canvas>'+
   '<div style="margin-top:5px;font-size:10px;color:#62786b">Arrastra, pellizca o usa + / −. Toca un punto para elegir destino.</div>'+
   '<div style="display:flex;gap:6px;margin-top:8px;align-items:stretch"><select aria-label="Elegir destino" style="min-width:0;flex:1;padding:8px;'+
   'border:1px solid #b3c9b5;border-radius:8px;background:#fffaf1;color:#365344;font:700 11px system-ui"></select>'+
   '<button data-nav="route">🧭 Ir</button></div>'+
   '<p data-nav="status" role="status" style="margin:7px 0 2px;min-height:32px;color:#4f6557">Elige un lugar o toca el mapa para marcarlo.</p>';
  box.replaceChildren(wrap);
  for(const b of wrap.querySelectorAll('button:not([data-result])')){
   b.style.cssText='padding:9px 10px;border:1px solid #b7d0b8;border-radius:9px;'+
    'background:#e5f0dd;color:#3b604b;font:800 12px system-ui;cursor:pointer;touch-action:manipulation';
  }
  const cv=wrap.querySelector('canvas'),ctx=cv.getContext('2d'),sel=wrap.querySelector('select'),
    status=wrap.querySelector('[data-nav="status"]'),search=wrap.querySelector('input[type="search"]'),
    results=wrap.querySelector('[data-nav="search-results"]'),CW=cv.width,CH=cv.height;
  let category='all',terrainMode=false,terrainPreview=null;
  function refreshList(){
   const previous=sel.value;sel.replaceChildren();
   const opt=document.createElement('option');opt.textContent='Elegir lugar…';opt.value='';
   sel.append(opt);
   all.forEach((p,i)=>{
    if(category!=='all'&&p.category!==category)return;
    const o=document.createElement('option');o.value=String(i);o.textContent=p.icon+' '+p.name;
    sel.append(o);
   });
   if([...sel.options].some(o=>o.value===previous))sel.value=previous;
  }
  refreshList();
  for(const b of wrap.querySelectorAll('[data-filter]')){
   b.style.cssText='white-space:nowrap;flex:0 0 auto;padding:7px 10px;border-radius:18px;'+
    'border:1px solid #bdd7c4;background:#f0f5eb;color:#4c6958;font:800 11px system-ui;cursor:pointer';
   b.onclick=()=>{
    category=b.dataset.filter;
    for(const node of wrap.querySelectorAll('[data-filter]')){
     const active=node.dataset.filter===category;
     node.setAttribute('aria-pressed',String(active));
     node.style.background=active?'#3f745d':'#f0f5eb';
     node.style.color=active?'#fffef8':'#4c6958';
    }
    refreshList();repaint();
   };
  }
  wrap.querySelector('[data-filter="all"]').style.background='#3f745d';
  wrap.querySelector('[data-filter="all"]').style.color='#fffef8';
  let zoom=phone?3.2:2.5,center={x:X.player.x,y:X.player.y},target=null,preview=null,down=null,raf=0;
  const pointers=new Map();let pinch=null,suppressTap=false;
  const clampCenter=()=>{
   center.x=clamp(center.x,0,m.MW);center.y=clamp(center.y,0,m.MH);
  };
  const view=()=>{
   const k=Math.min(CW/m.MW,CH/m.MH)*zoom;
   return {k,ox:CW/2-center.x*k,oy:CH/2-center.y*k};
  };
  // Zoom alrededor del dedo (no salta al centro al pellizcar).
  function zoomAt(factor,p={x:CW/2,y:CH/2}){
   const anchor=world(p.x,p.y);
   zoom=clamp(zoom*factor,1,16);
   const k=view().k;
   center.x=anchor.x-(p.x-CW/2)/k;
   center.y=anchor.y-(p.y-CH/2)/k;
   clampCenter();repaint();
  }
  function repaint(){
   if(raf||!cv.isConnected)return;
   raf=requestAnimationFrame(()=>{raf=0;if(cv.isConnected)draw()});
  }
  const screen=p=>{const v=view();return {x:v.ox+p.x*v.k,y:v.oy+p.y*v.k}};
  const world=(x,y)=>{const v=view();return {x:clamp((x-v.ox)/v.k,0,m.MW),y:clamp((y-v.oy)/v.k,0,m.MH)}};
  function draw(){
   ctx.clearRect(0,0,CW,CH);ctx.fillStyle='#a6d8e6';ctx.fillRect(0,0,CW,CH);
   const v=view();m.mainland.sampleMap(ctx,v.ox,v.oy,v.k);
   // El mapa de calles queda limpio, sin la imagen antigua cuadrada encima.
   // "Relieve" es opcional y usa una copia reducida hasta el zoom cercano.
   if(terrainMode){
    if(!terrainPreview){
     terrainPreview=document.createElement('canvas');
     terrainPreview.width=900;terrainPreview.height=440;
     terrainPreview.getContext('2d').drawImage(m.ground,0,0,900,440);
    }
    ctx.globalAlpha=.84;
    ctx.drawImage(zoom>8?m.ground:terrainPreview,
      v.ox,v.oy,m.baseMW*v.k,m.baseMH*v.k);
    ctx.globalAlpha=1;
   }
   // Filtro de destinos y detalle progresivo: los rótulos no se enciman.
   const candidates=all.filter((p,i)=>category!=='all'?p.category===category:
     zoom>=6||i<11||p.icon!=='🏡');
   for(const p of candidates){
    const s=screen(p);if(s.x<-35||s.x>CW+35||s.y<-25||s.y>CH+25)continue;
    const selected=target===p;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font=(selected?'24':'20')+'px sans-serif';
    ctx.fillText(p.icon,s.x,s.y-13);
    if(selected||zoom>5&&p.icon!=='🏡'){
     ctx.font='bold 15px system-ui';ctx.lineWidth=3;ctx.strokeStyle='rgba(255,254,248,.96)';
     ctx.strokeText(p.name,s.x,s.y+10);ctx.fillStyle='#365449';ctx.fillText(p.name,s.x,s.y+10);
    }
   }
   if(preview){
    ctx.save();ctx.lineWidth=5;ctx.lineJoin='round';ctx.lineCap='round';
    ctx.beginPath();preview.points.forEach((p,i)=>{const q=screen({x:p[0],y:p[1]});i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});
    ctx.strokeStyle='rgba(255,255,255,.94)';ctx.stroke();ctx.lineWidth=2.6;
    ctx.strokeStyle=preview.connected?'#267fc6':'#b0785a';
    if(!preview.connected)ctx.setLineDash([7,5]);ctx.stroke();ctx.restore();
   }
   if(target){const q=screen(target);ctx.beginPath();ctx.arc(q.x,q.y,8,0,Math.PI*2);ctx.fillStyle='#e27e68';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.stroke()}
   const p=screen(X.player);
   ctx.beginPath();ctx.arc(p.x,p.y,13,0,Math.PI*2);ctx.fillStyle='rgba(54,124,221,.15)';ctx.fill();
   ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);ctx.fillStyle='#367cdd';ctx.fill();
   ctx.lineWidth=2.5;ctx.strokeStyle='#fff';ctx.stroke();
   // Brújula y escala del mundo (unidades del juego, no metros inventados).
   ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillStyle='rgba(255,254,247,.92)';
   ctx.beginPath();ctx.arc(CW-28,31,19,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#3d695a';ctx.font='900 15px system-ui';ctx.fillText('N',CW-28,26);
   ctx.beginPath();ctx.moveTo(CW-28,29);ctx.lineTo(CW-33,39);ctx.lineTo(CW-23,39);
   ctx.closePath();ctx.fillStyle='#df8b74';ctx.fill();
   const units=[50,100,250,500,1000,2000].filter(q=>q*v.k<=130);
   const measure=units.length?units[units.length-1]:50,px=measure*v.k;
   ctx.fillStyle='rgba(255,254,247,.87)';ctx.fillRect(11,CH-32,Math.max(93,px+20),26);
   ctx.strokeStyle='#3d695a';ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(21,CH-16);ctx.lineTo(21+px,CH-16);ctx.stroke();
   ctx.lineWidth=1;for(const x of [21,21+px]){
    ctx.beginPath();ctx.moveTo(x,CH-21);ctx.lineTo(x,CH-12);ctx.stroke();
   }
   ctx.fillStyle='#385b4e';ctx.font='bold 12px system-ui';
   ctx.fillText(measure+' u',21+px/2,CH-24);ctx.restore();
   if(preview&&!preview.connected){
    ctx.fillStyle='rgba(255,249,240,.93)';ctx.fillRect(7,CH-64,CW-14,27);
    ctx.fillStyle='#875a47';ctx.textAlign='center';ctx.font='bold 13px system-ui';
    ctx.fillText('Ruta orientativa: no hay un camino continuo',CW/2,CH-50);
   }
  }
  function choose(p){
   target=p;preview=roadRoute({x:X.player.x,y:X.player.y},target);
   status.textContent='📍 '+p.name+' · '+Math.round(Math.hypot(X.player.x-p.x,X.player.y-p.y))+
    ' unidades · '+(preview.connected?'ruta por caminos':'guía directa, sin conexión vial verificada');
   draw();
  }
  const controls=k=>wrap.querySelector('[data-nav="'+k+'"]');
  controls('plus').onclick=()=>zoomAt(1.5);
  controls('minus').onclick=()=>zoomAt(1/1.5);
  controls('me').onclick=()=>{center={x:X.player.x,y:X.player.y};zoom=4;repaint()};
  controls('all').onclick=()=>{center={x:m.MW/2,y:m.MH/2};zoom=1;repaint()};
  controls('tour').onclick=()=>{
   if(phone&&closePhone)closePhone();else X.closeMenu();
   requestAnimationFrame(()=>replayArrival());
  };
  controls('style').onclick=()=>{
   terrainMode=!terrainMode;
   controls('style').textContent=terrainMode?'🗺️ Plano':'🌿 Relieve';
   controls('style').setAttribute('aria-pressed',String(terrainMode));
   repaint();
  };
  controls('route').onclick=()=>{if(!target){status.textContent='Elige primero un destino.';return}
    if(X.M()!==main||X.st.scene!=='out'){
     status.textContent='La ruta se puede activar al salir al exterior del continente.';return;
    }
    startGuide(target);
    if(phone&&closePhone)closePhone();
    else X.closeMenu();
    X.toast('🧭 Ruta activada. Sigue las indicaciones superiores.');
  };
  sel.onchange=()=>{const id=Number(sel.value);if(sel.value!==''){
   const p=all[id];center={x:p.x,y:p.y};clampCenter();choose(p);
  }};
  function selectTarget(i){
   if(!all[i])return;sel.value=String(i);
   center={x:all[i].x,y:all[i].y};zoom=Math.max(zoom,3.8);clampCenter();
   choose(all[i]);search.value=all[i].name;results.style.display='none';
  }
  search.addEventListener('input',()=>{
   const q=search.value.trim().toLocaleLowerCase('es-MX');
   results.replaceChildren();
   const matches=q?all.map((p,i)=>({...p,i})).filter(p=>p.name.toLocaleLowerCase('es-MX').includes(q)).slice(0,7):[];
   results.style.display=matches.length?'block':'none';
   for(const p of matches){
    const item=document.createElement('button');item.type='button';
    item.setAttribute('data-result',p.name);
    item.textContent=p.icon+' '+p.name;
    item.style.cssText='display:block;text-align:left;width:100%;font:700 11px system-ui;'+
     'background:#fff;color:#355844;border:0;border-bottom:1px solid #dae8d6;padding:8px';
    item.onclick=()=>selectTarget(p.i);results.append(item);
   }
  });
  const point=e=>{const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*CW/r.width,y:(e.clientY-r.top)*CH/r.height}};
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  cv.addEventListener('pointerdown',e=>{
   e.preventDefault();const p=point(e);
   pointers.set(e.pointerId,p);cv.setPointerCapture?.(e.pointerId);
   if(pointers.size===1){
    down={...p,cx:center.x,cy:center.y};
    suppressTap=false;
   }else if(pointers.size===2){
    const [a,b]=[...pointers.values()],mid=midpoint(a,b);
    pinch={distance:Math.max(dist(a,b),1),zoom,mid,anchor:world(mid.x,mid.y)};
    down=null;suppressTap=true;
   }
  });
  cv.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId))return;
   const p=point(e);pointers.set(e.pointerId,p);
   if(pinch&&pointers.size===2){
    const [a,b]=[...pointers.values()],mid=midpoint(a,b);
    zoom=clamp(pinch.zoom*dist(a,b)/pinch.distance,1,16);
    const k=view().k;
    center.x=pinch.anchor.x-(mid.x-CW/2)/k;
    center.y=pinch.anchor.y-(mid.y-CH/2)/k;
    clampCenter();repaint();return;
   }
   if(!down||pointers.size!==1)return;
   const v=view();center.x=down.cx-(p.x-down.x)/v.k;
   center.y=down.cy-(p.y-down.y)/v.k;
   if(dist(p,down)>8)suppressTap=true;
   clampCenter();repaint();
  });
  cv.addEventListener('pointerup',e=>{
   if(!pointers.has(e.pointerId))return;
   const p=point(e),wasSingle=pointers.size===1;
   pointers.delete(e.pointerId);const tapped=wasSingle&&down&&dist(p,down)<9&&!suppressTap;
   down=null;pinch=null;
   if(!tapped){if(pointers.size===1)suppressTap=true;return}
   const pos=world(p.x,p.y);
   let best=null,bd=29;
   for(const a of all){const q=screen(a),d=dist(q,p);if(d<bd){bd=d;best=a}}
   choose(best||{...pos,name:'Punto marcado'});
  });
  cv.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);down=null;pinch=null});
  cv.addEventListener('wheel',e=>{
   e.preventDefault();
   zoomAt(e.deltaY<0?1.18:1/1.18,point(e));
  },{passive:false});

  draw();
 }

 function install(m){
  if(m.mainland)return m;
  main=m;oldW=m.MW;oldH=m.MH;baseD=m.islandD;origBiome=m.biome;
  m.baseMW=oldW;m.baseMH=oldH;m.MW=MW;m.MH=MH;
  m.islandD=(x,y)=>x>=0&&y>=0&&x<oldW&&y<oldH?baseD(x,y):coast(x,y);
  m.biome=(x,y,mm)=>x>=0&&y>=0&&x<oldW&&y<oldH?origBiome(x,y,mm):biome(x,y);
  m.elevation=height;
  m.mainland={draw,coast,height,biome,zone,roadAt,nearbyRoad,sampleMap,original:{width:oldW,height:oldH},extent:{width:MW,height:MH},landmarks:P};
  structures();decorateDistricts();nativePlaces();furnishRooms();
  return m;
 }

 // Llegada jugable de la expansión: mismo personaje, cámara y recorrido.
 // El viaje en barco y su repetición en el teléfono original se CONSERVAN.
 let arrivalRunning=false,arrivalCancel=false,arrivalSkip=null;
 async function arrivalTour(replay=false){
  if(arrivalRunning||!main||!Game?.X)return false;
  const X=Game.X;
  if(X.M()!==main||X.st.scene!=='out'||X.st.mg||X.st.mode!=='play')return false;
  if(X.st.busy&&!replay)return false;
  if(X.st.busy&&replay)return false;
  if(!replay){
   save.mainlandV3Welcome=1;
   save.walesaArrivalV59=1;
   Game.G.save();
  }
  arrivalRunning=true;arrivalCancel=false;
  const p=X.player,st=X.st;
  const button=document.createElement('button');
  button.id='walesa-tour-skip';
  button.type='button';button.textContent='Saltar recorrido ✕';
  Object.assign(button.style,{
   position:'absolute',right:'12px',top:'56px',zIndex:'96',
   background:'rgba(255,247,230,.94)',border:'2px solid #b99681',
   borderRadius:'12px',padding:'7px 10px',color:'#765a51',
   font:'bold 12px system-ui',cursor:'pointer',touchAction:'manipulation'
  });
  button.onclick=()=>{arrivalCancel=true};
  arrivalSkip=button;
  document.querySelector('#game')?.append(button);
  st.busy=true;X.st.focus={x:3440,y:2015};
  p.x=3440;p.y=2015;p.dir=3;
  X.cam.x=p.x;X.cam.y=p.y;
  X.toast('🧳 Llegando a Walesa… sigue el camino hacia el pueblo');
  const stops=[
   [3440,2015],[3505,2070],[3580,2130],
   [3655,2195],[3730,2250],[PLAZA.x,PLAZA.y+92]
  ];
  try{
   // Recorrido por carretera con vista de las montañas, las casas y la plaza.
   // La secuencia puede omitirse en cualquier momento, sin perder la partida.
   for(let i=1;i<stops.length&&!arrivalCancel;i++){
    const [ax,ay]=stops[i-1],[bx,by]=stops[i],steps=22;
    for(let k=1;k<=steps&&!arrivalCancel;k++){
     const t=k/steps,soft=t*t*(3-2*t),prevX=p.x,prevY=p.y;
     p.x=ax+(bx-ax)*soft;p.y=ay+(by-ay)*soft;
     p.dir=Math.abs(bx-ax)>Math.abs(by-ay)?(bx>ax?3:2):(by>ay?1:0);
     p.frame=1+Math.floor(k/5)%2;
     X.st.focus={x:p.x,y:p.y-18};
     // Mantiene el movimiento físico original, sin teletransportes entre tomas.
     if(!Number.isFinite(p.x)||!Number.isFinite(p.y)){
      p.x=prevX;p.y=prevY;break;
     }
     await new Promise(resolve=>requestAnimationFrame(resolve));
    }
   }
   p.x=PLAZA.x;p.y=PLAZA.y+92;p.dir=0;p.frame=0;
   X.cam.x=p.x;X.cam.y=p.y;
   X.toast('🎵 Bienvenida a la plaza. El kiosco, el picnic y los vecinos te esperan.');
  }finally{
   button.remove();arrivalSkip=null;arrivalCancel=false;
   X.st.focus=null;st.busy=false;arrivalRunning=false;
  }
  return true;
 }
 function moveToPreview(){
  if(!main||!Game?.X||!save||arrivalRunning)return false;
  const X=Game.X;
  if(X.st.mode!=='play'||X.st.scene!=='out'||X.M()!==main||X.st.busy||X.st.mg)return false;
  const first=!save.mainlandV3Welcome;
  const nearVillage=Math.hypot(X.player.x-PLAZA.x,X.player.y-PLAZA.y)<325;
  if(!first&&(save.walesaArrivalV59||!nearVillage))return false;
  if(!first&&save.walesaArrivalV59)return false;
  // La animación vuelve para partidas antiguas que ya llegaron a la plaza,
  // pero no interrumpe a quienes exploran muy lejos de ella.
  arrivalTour(false);
  return true;
 }
 function replayArrival(){
  return arrivalTour(true);
 }
 // Residentes propios de la expansión, construidos con sprites y la
 // conversación, amistad, encargos y movimiento del MOTOR ORIGINAL.
 // No se mueven ni se borran los NPC originales de Ciudad Corazón.
 const residents=[
  {id:'walesa_iris',name:'Iris',base:'melody',x:3685,y:2205,fur:'#fff9ed',wear:'#bb8eb8',voice:526,
   first:'¡Bienvenida al pueblo! El kiosco vuelve a tener música, y puedes venir a bailar cuando quieras.',
   lines:['Pintamos las macetas para que cada calle tenga personalidad.','La fuente está rodeada de mosaicos hechos por los vecinos.'],
   gossip:'siempre deja una flor junto al camino'},
  {id:'walesa_nico',name:'Nico',base:'pochacco',x:3870,y:2240,fur:'#f8f5e8',wear:'#729fc8',voice:445,
   first:'Estoy cuidando los caminos. En Walesa las carreteras tienen su sitio y las casas el suyo.',
   lines:['Si te pierdes, el mapa del celular tiene un buscador de lugares.','Me gusta caminar junto al parque cuando cae la tarde.'],
   gossip:'conoce cada vuelta de la carretera'},
  {id:'walesa_luma',name:'Luma',base:'cinna',x:3825,y:2410,fur:'#f0f5fa',wear:'#acbddd',voice:552,
   first:'¡Aquí nos juntamos para el picnic! Puedes invitar a los vecinos y compartir un bocadillo.',
   lines:['Hay jardines que florecen todo el año.','El kiosco está precioso cuando empiezan a encenderse las farolas.'],
   gossip:'sabe hacer tartas de colores'},
  {id:'walesa_fede',name:'Fede',base:'keroppi',x:3560,y:3655,fur:'#83cc8c',wear:'#c8926f',voice:390,
   first:'¡Bienvenido a la Ciudad del Sur! Tenemos tiendas, talleres y jardines para pasear.',
   lines:['La Alameda del Sur es un buen sitio para descansar.','Trabajo cerca de las oficinas y siempre me escapo a ver los escaparates.'],
   gossip:'organiza paseos por la alameda'},
  {id:'walesa_mara',name:'Mara',base:'melody',x:3870,y:3875,fur:'#fff2e9',wear:'#d8a2c0',voice:485,
   first:'Las calles del sur están llenas de negocios. También hay zonas de vivienda, no sólo edificios.',
   lines:['En el mercado hay algo distinto cada día.','Las calles se ven de otro color después de la lluvia.'],
   gossip:'siempre lleva un cuaderno de dibujos'},
  {id:'walesa_timo',name:'Timo',base:'badtz',x:3990,y:4020,fur:'#514b5d',wear:'#d1a2a5',voice:367,
   first:'¿Ya viste el salón recreativo? Pásate a jugar cuando termines tu paseo.',
   lines:['Dicen que me sé todos los atajos. Tal vez.','A veces me siento en la plaza a escuchar la música.'],
   gossip:'no deja de hablar de sus videojuegos'},
  {id:'walesa_cira',name:'Cira',base:'tuxedo',x:5530,y:2150,fur:'#6178a4',wear:'#e6c78f',voice:410,
   first:'La Meseta Oriental tiene comercios, casas, miradores y un montón de caminos.',
   lines:['Las nubes pasan bajito por el mirador.','En el mapa puedes activar el relieve para orientarte.'],
   gossip:'le encanta coleccionar postales'},
  {id:'walesa_oli',name:'Oli',base:'pom',x:5970,y:2410,fur:'#e4d4a1',wear:'#aad39d',voice:510,
   first:'Trabajo en los jardines del altiplano. ¿Has visto nuestras flores?',
   lines:['El viento de la meseta huele a tierra húmeda.','Quisiera plantar un árbol en cada esquina.'],
   gossip:'le pone nombre a todas las plantas'},
  {id:'walesa_bimba',name:'Bimba',base:'chococat',x:5730,y:3500,fur:'#45424d',wear:'#8baa74',voice:398,
   first:'Yo cuido los senderos del bosque. Busca las luciérnagas cuando anochezca.',
   lines:['El bosque se vuelve azulito cuando cae la tarde.','La naturaleza siempre encuentra un huequito para crecer.'],
   gossip:'conoce el nombre de cada hongo'},
  {id:'walesa_tara',name:'Tara',base:'kuromi',x:5960,y:3820,fur:'#665977',wear:'#d9a2b9',voice:445,
   first:'Hay nuevos senderos por el Bosque Profundo. Mira bien entre los helechos.',
   lines:['Me encantan las sombras violetas de los árboles.','Nunca salgas del sendero sin mirar el mapa.'],
   gossip:'colecciona piedras con formas raras'},
  {id:'walesa_roco',name:'Roco',base:'hangyo',x:3490,y:1120,fur:'#79b6bb',wear:'#b9937b',voice:355,
   first:'La cordillera tiene cuestas de verdad. Camina por la ruta marcada.',
   lines:['Arriba sopla viento, pero el paisaje merece la subida.','Los barrancos tienen sombras distintas cada mañana.'],
   gossip:'siempre vuelve de las montañas con una historia'}
 ];
 function enableResidents(){
  for(const r of residents){
   if(!Talk.P[r.id]){
    Talk.P[r.id]={
     name:r.name,voice:r.voice,home:[r.x,r.y],map:'main',static:false,
     where:'paseando por Walesa',likes:['flor','fruta','galleta','dulce'],
     first:r.first,hi:['¡Qué alegría verte!','¡Buenas!','¡Qué bonito día!'],
     lines:r.lines,ask:['¿Dónde paseamos hoy?',
       ['Al kiosco','Al parque','Por los caminos'],
       ['¡Vamos a oír música!','Me encantan los jardines.','Hay mucho que descubrir.']],
     gossip:r.gossip,chat:['¡Buenas!','♡','¿Vamos a pasear?']
    };
    const base=V.NPCDEF[r.base];
    V.NPCDEF[r.id]={...base,fur:r.fur,oColor:r.wear,aColor:r.wear};
   }
  }
 }
 function neighborSpot(x,y){
  for(const r of [0,14,28,42,56,75,95]){
   for(let k=0;k<16;k++){
    const theta=k*Math.PI/8,tx=Math.round(x+Math.cos(theta)*r),
      ty=Math.round(y+Math.sin(theta)*r);
    if(coast(tx,ty)<.75&&!V.blockedOut(tx,ty,9)&&
     !houses.some(b=>Math.hypot(b.x-tx,b.y-ty)<38))return[tx,ty];
   }
  }
  return [x,y];
 }

 function register(){
  if(typeof Game==='undefined'||!Game.X?.HOOKS)return;
  const X=Game.X,H=X.HOOKS;let seen='';
  enableResidents();
  H.npcs.push((list,m)=>{
   if(m!==main)return;
   for(const r of residents){
    if(list.some(n=>n.id===r.id))continue;
    const at=neighborSpot(r.x,r.y),n=X.mkNPC(r.id,at[0],at[1]);
    Talk.P[r.id].home=[at[0],at[1]];n.hx=at[0];n.hy=at[1];
    list.push(n);
   }
  });
  H.tab.push(navigationTab);
  H.ground.push((g,ox,oy,t)=>{
   if(!main||X.M()!==main||X.st.scene!=='out')return;
   const p=X.player,regional=zone(p.x,p.y),atPark=plazaDistance(p.x,p.y)<300;
   if(!atPark&&!['forest','pueblo','valle'].includes(regional))return;
   const evening=X.night(),count=evening?24:19,baseX=Math.floor(p.x/150)*150,baseY=Math.floor(p.y/150)*150;
   g.save();
   for(let i=0;i<count;i++){
    const gx=baseX+(i%6-2)*75+hash(i,31)*55,
      gy=baseY+(Math.floor(i/6)-1)*90+hash(i,51)*60;
    if(coast(gx,gy)>.85||nearbyRoad(gx,gy,11)&&!atPark)continue;
    const phase=i*2.37+hash(i,71)*6.28,
     x=gx+Math.sin(t*.7+phase)*12-ox,
     y=gy+Math.cos(t*.43+phase)*9-oy;
    if(evening){
     const a=.28+.27*(.5+.5*Math.sin(t*2.3+phase));
     g.globalAlpha=a;g.fillStyle='#fff1a4';
     g.beginPath();g.arc(x,y-6,1.3,0,Math.PI*2);g.fill();
     g.globalAlpha=a*.21;g.beginPath();g.arc(x,y-6,6,0,Math.PI*2);g.fill();
    }else{
     g.globalAlpha=.24+.12*Math.sin(t+phase);
     g.fillStyle=i%4===0?'#f5d3a3':i%3===0?'#e9bdd2':'#f5ead5';
     g.fillRect(x,y,2+(i%3===0),1.3);
    }
   }
   // Reflejos suaves del agua y halos cálidos alrededor de las farolas.
   // Sólo se dibujan elementos cercanos para no sacrificar FPS en móvil.
   if(atPark){
    for(const r of [22,32,42]){
     g.strokeStyle='rgba(169,220,229,'+(.22+.11*Math.sin(t*2+r)) +')';
     g.lineWidth=1.1;g.beginPath();
     g.ellipse(PLAZA.x-ox,PLAZA.y+12-oy,r,r*.36,0,0,Math.PI*2);
     g.stroke();
    }
    if(evening)for(let i=0;i<12;i++){
     const ang=i*Math.PI/6-.2,
      x=PLAZA.x+Math.cos(ang)*170-ox,y=PLAZA.y+Math.sin(ang)*170-oy;
     if(Math.hypot(x-(p.x-ox),y-(p.y-oy))>460)continue;
     const lg=g.createRadialGradient(x,y,2,x,y,56);
     lg.addColorStop(0,'rgba(255,229,159,.18)');
     lg.addColorStop(1,'rgba(255,229,159,0)');
     g.fillStyle=lg;g.fillRect(x-56,y-56,112,112);
    }
   }
   if(regional==='costa'||regional==='forest'){
    for(let i=0;i<22;i++){
     const x=Math.floor(p.x/110)*110+(i%6-2)*95+hash(i+13,17)*73,
      y=Math.floor(p.y/110)*110+(Math.floor(i/6)-1)*112+hash(i+4,65)*74,
      cc=coast(x,y);
     if(cc<.94||cc>1.06)continue;
     const sx=x-ox+Math.sin(t+i)*5,sy=y-oy;
     g.globalAlpha=.25+.12*Math.sin(t*1.4+i*2);
     g.strokeStyle='#effcff';g.lineWidth=1;
     g.beginPath();g.moveTo(sx-5,sy);g.lineTo(sx+5,sy);g.stroke();
    }
   }
   g.globalAlpha=1;
   g.restore();
  });
  H.inter.push(list=>{if(Game.X.M()!==main||Game.X.st.scene!=='out')return;
   list.push({type:'note',id:'gazebo',x:kioskAt.x,y:kioskAt.y+8,r:34,hy:70,label:'🎵 Subir al kiosco y tocar música'});
   list.push({type:'note',id:'picnic',x:picnicAt.x,y:picnicAt.y+4,r:26,hy:28,label:'🧺 Hacer un picnic'});
   list.push({type:'note',id:'mail',x:mailAt.x,y:mailAt.y+7,r:20,hy:32,label:'💌 Abrir el buzón'});
   for(const p of [...scenic,...districtDetails])list.push({type:'v3Scenic',p,x:p.x,y:p.y,r:24,hy:30,label:'Conocer '+p.name})});
  H.act.unshift(o=>{if(o.type==='v3Scenic')return X.say(o.p.name,'Un rincón para descansar y conocer los paisajes de Walesa. Mira los jardines y sigue explorando los senderos cercanos.')});
  H.update.push(()=>{if(!main)return;updateGuide();moveToPreview();
   const m=X.M();if(m!==main||X.st.scene!=='out')return;
   const n=zone(X.player.x,X.player.y);
   if(seen!==n&&X.player.x>2700){seen=n;X.toast(({montana:'⛰ Cordilleras del Norte',meseta:'🏔 Meseta Oriental',
     administrativo:'🏙 Distrito Urbano del Sur',pueblo:'🏘 Pueblo de Walesa',valle:'🌿 Valle Central',
     forest:'🌲 Bosque Profundo',costa:'🌊 Litoral'})[n]||'Explorando Walesa')}
  });
  H.inter.push(list=>{const m=X.M();if(m!==main||X.st.scene!=='out')return;
   const p=X.player;
   if(Math.hypot(p.x-P.village.x,p.y-P.village.y)<130)
    list.push({type:'v3Wel',x:P.village.x,y:P.village.y+25,r:30,hy:22,label:'Conocer el Pueblo de Walesa'});
  });
  H.act.unshift(o=>{if(o.type==='v3Wel')return X.say('Pueblo de Walesa',
    'Estás dentro del mapa principal. Camina al norte para subir a la cordillera, al este para la meseta, al sur para la ciudad y al sureste para el bosque. El camino al noroeste regresa a Ciudad Corazón.')});
 }
 document.addEventListener('DOMContentLoaded',register,{once:true});
 if(document.readyState!=='loading')register();
 return{install,draw,coast,height,biome,zone,roadAt,nearbyRoad,roadRoute,
   destinations,startGuide,mountPhone,replayArrival,roadClearance,
   get streetSegments(){return seg},get roadGraph(){return graph()},get townResidents(){return residents.map(r=>r.id)},
   get arrivalRunning(){return arrivalRunning},
   kioskAt,picnicAt,mailAt,plaza:PLAZA,landmarks:P,get original(){return main}};
})();
