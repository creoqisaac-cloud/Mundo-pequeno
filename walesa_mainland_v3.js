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
 const distSegment=(x,y,a,b)=>{
  const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy),0,1);
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
 };
 const roadAt=(x,y)=>{for(const [a,b] of seg)if(distSegment(x,y,a,b)<12)return true;return false};
 const nearbyRoad=(x,y,r=20)=>{for(const [a,b] of seg)if(distSegment(x,y,a,b)<r)return true;return false};
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
  return T.classify(u,v);
 }
 // Misma biblioteca cromática del suelo original, no una segunda paleta artificial.
 const COL={town:V.BIO.town.g,chile:V.BIO.chile.g,city:V.BIO.city.g,
   shroom:V.BIO.shroom.g,candy:V.BIO.candy.g};
 const SEA=[95,172,193],SAND=[232,219,188],W=SZ,H=SZ;
 const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]};
 const PAL={};for(const [k,v] of Object.entries(COL))PAL[k]=v.map(rgb);
 // Las veredas heredan las cuatro tintas del mismo bioma del motor base.
 const PATH={};for(const [k,v] of Object.entries(V.BIO))PATH[k]=(v.path||V.BIO.town.path||['#f4e1bc','#dec49c','#fff3d4','#b7a084']);
 const rock=([r,g,b],a)=>[r*.55+119*a,g*.45+87*a,b*.48+66*a];
 let main=null,baseD=null,origBiome=null,oldW=2700,oldH=1320;
 const cache=new Map();
 function tile(tx,ty){
  const key=tx+','+ty;if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);return v}
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d'),im=ctx.createImageData(W,H),arr=im.data;
  const x0=tx*SZ,y0=ty*SZ;
  // Calculamos la altitud una vez por celda, para evitar millones de ruidos por fotograma.
  const step=8,N=W/step+2,E=new Float32Array(N*N),SEA_MASK=new Float32Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=x0+i*step,y=y0+j*step,k=j*N+i;E[k]=height(x,y);SEA_MASK[k]=coast(x,y)}
  for(let j=0;j<H;j++){
   const y=y0+j,iy=j>>3,tj=(j&7)/8;
   for(let i=0;i<W;i++){
    const x=x0+i,ix=i>>3,ti=(i&7)/8,p=iy*N+ix;
    const elev=(E[p]*(1-ti)+E[p+1]*ti)*(1-tj)+(E[p+N]*(1-ti)+E[p+N+1]*ti)*tj;
    const sea=(SEA_MASK[p]*(1-ti)+SEA_MASK[p+1]*ti)*(1-tj)+(SEA_MASK[p+N]*(1-ti)+SEA_MASK[p+N+1]*ti)*tj;
    const k=(j*W+i)*4,noise=hash(x>>2,y>>2),small=hash(x,y),
      // El bioma se lee a través de una frontera irregular de microparcelas.
      // Mantiene los colores nativos y elimina el corte geométrico por regiones.
      drift=hash(x>>3,y>>3),bk=biome(x+(drift-.5)*48,y+(hash((x>>3)+93,(y>>3)-61)-.5)*48),
      pal=PAL[bk]||PAL.town;
    let col;
    // Lo que se ve como agua tiene EXACTAMENTE el umbral de colisión del motor (.95).
    if(sea>.95)col=[SEA[0]+noise*13,SEA[1]+noise*15,SEA[2]+noise*13];
    else if(sea>.84)col=[SAND[0]-small*13,SAND[1]-small*14,SAND[2]-small*11];
    else{
     const f=clamp(((noise*.60+hash(x>>4,y>>4)*.4)*3.8)|0,0,3);
     col=pal[f].slice();
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
    ctx.beginPath();ctx.moveTo(a[0]-x0,a[1]-y0);ctx.lineTo(b[0]-x0,b[1]-y0);
    const tone=PATH[biome((a[0]+b[0])/2,(a[1]+b[1])/2)]||PATH.town;
    ctx.strokeStyle=layer===0?(paved?'#d5c6b6':tone[3]):
      (paved?'#86818b':tone[0]);
    ctx.lineWidth=layer===0?32:layer===1?24:0;
    ctx.stroke();
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
  // Detalle superficial determinista en coordenadas globales, con textura
  // coherente entre tiles: flores, hierbas, piedritas y sombras de senderos.
  for(let yy=0;yy<SZ;yy+=12)for(let xx=0;xx<SZ;xx+=12){
   const gx=x0+xx,gy=y0+yy,h=hash(gx>>2,gy>>2);
   if(h<.44||coast(gx,gy)>.84||nearbyRoad(gx,gy,19))continue;
   const bi=biome(gx,gy),e=height(gx,gy);
   const px=xx+Math.floor(hash(gx+71,gy)*9),py=yy+Math.floor(hash(gx,gy+93)*9);
   if(bi==='city'){
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
  const v=b.facade,urban=!!b.city,base=urban?12:8,front=urban?58:43;
  const accent=b.roof,light=night?'#ffe4a2':'#f8f4e5';
  g.lineWidth=1;g.strokeStyle='#765e60';g.fillStyle=accent;
  if(v===0||v===3){ // ático y tragaluz
   g.fillRect(urban?29:24,urban?4:19,urban?21:19,urban?10:9);
   g.fillStyle=light;g.fillRect(urban?32:27,urban?6:21,urban?15:13,4);
   g.strokeRect(urban?29.5:24.5,urban?4.5:19.5,urban?20:18,urban?9:8);
  }else if(v===1||v===4){ // celosías y balcones
   g.fillStyle=accent;g.fillRect(urban?8:10,front,urban?57:49,3);
   for(let x=urban?11:13;x<(urban?64:58);x+=7)g.fillRect(x,front-7,2,9);
   g.fillStyle=light;g.fillRect(urban?14:16,urban?53:56,urban?12:10,2);
  }else{ // macetas y marquesinas
   for(const x of (urban?[12,31,52]:[15,45])){
    g.fillStyle='#956f55';g.fillRect(x,front+4,10,3);
    g.fillStyle='#518c56';g.fillRect(x+2,front,6,5);
    g.fillStyle='#f6adbf';g.fillRect(x+3,front,2,2);
   }
   g.fillStyle=accent;g.fillRect(urban?42:26,urban?57:58,urban?22:16,3);
  }
  return {...sprite,c};
 }
 function building(id,name,x,y,type='home',job=null){
  const v=zone(x,y),urban=type==='city'&&(!!job||hash(x+417,y-251)<.64);
  // La ciudad combina edificios de varias plantas con casas bajas originales.
  // Cada tipología conserva las colisiones, puertas y sprites del motor.
  const districtHome=type==='city'&&!urban;
  const styles=[['#f8e9d8','#c88670'],['#e7eef8','#769cbd'],['#f4e2ef','#ad83a8'],['#e6f0dc','#87a16f'],['#fff0d5','#d5a16d'],['#e6e1f3','#8576b1'],['#f0e3d7','#8f9d9d']];const urbanStyles=[['#e8e5df','#9aa3b7'],['#e9e1f0','#9989b7'],['#e1edf0','#7c9fa9'],['#f2e7d7','#b9967e'],['#e6e9dd','#929c7a']];const palette=(urban?urbanStyles:styles)[Math.floor(hash(x>>4,y>>4)*(urban?urbanStyles.length:styles.length))];const b={id:'v3_'+id,name,x,y,job:job||undefined,city:urban?1:0,districtHome,wall:palette[0],roof:palette[1],
    acc:urban?'#9eafbc':palette[1],icon:urban?'🏬':'🏠'};
  const variant=Math.floor(hash(x+137,y-211)*6);b.facade=variant;
  if(urban){b.acc=palette[1];b.icon=job==='shop'?'🛍️':job==='papers'?'📚':job==='delivery'?'📮':'🏠';
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
   if(seed%2===0&&spr.bush?.[0])V.addObj(main,spr.bush[0],side,yGarden,null);
   if(seed%3===0&&spr.bench)V.addObj(main,spr.bench,x+58,y+7,null);
  }else if(urban&&seed%2===0&&spr.lamp){
   V.addObj(main,spr.lamp,x+52,y+5,null);main.glows.push([x+52,y-19]);
  }
  main.glows.push([x-14,y-(urban?55:16)]);main.build.push(b);houses.push(b);return b;
 }
 function adorn(){
  const a=V.spr,rg=V.rng(514721);
  const clearNear=(x,y,rad)=>houses.some(b=>Math.hypot(b.x-x,b.y-y)<rad)||nearbyRoad(x,y,27)||Math.hypot(x-P.village.x,y-P.village.y)<115;
  for(let k=0;k<3300;k++){
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
    V.addObj(main,a.bush[0],x,y,null);
   }
  }
  // Hitos propios de la región, pero con sprites exclusivos del juego.
  V.addObj(main,a.fount[0],P.village.x,P.village.y+11,V.circS(P.village.x,P.village.y,15),{fount:true});
  for(const [x,y] of [[P.village.x-52,P.village.y-52],[P.village.x+52,P.village.y-52],
                      [P.village.x-52,P.village.y+52],[P.village.x+52,P.village.y+52],
                      [P.plateau.x-35,P.plateau.y-20],[P.town.x+100,P.town.y-20]]){
   V.addObj(main,a.lamp,x,y,V.rectS(x-2,y-3,4,3));main.glows.push([x,y-24]);
  }
 }
 function structures(){
  // Poblado radial: casas alrededor de la plaza, como el dibujo de Procreate.
  const colors=['Cinna','Melody','Purin','Rosa','Nube','Hiedra','Clavel','Estrella','Olivo','Amapola'];
  for(let i=0;i<10;i++){
   const a=(i/10)*Math.PI*2-Math.PI/2,r=i%2?265:225,
     x=Math.round(P.village.x+Math.cos(a)*r),y=Math.round(P.village.y+Math.sin(a)*r);
   building('radial'+i,'Casa '+colors[i],x,y,'home',null);
   seg.push([[P.village.x,P.village.y],[x,y+16]]);
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
  building('forest-lodge','Refugio del Bosque',5760,3575,'home');
  building('forest-camp','Casa del Guardabosques',6040,3860,'home');
  building('ridge-lodge','Mirador de la Cordillera',3510,910,'home');
  building('ridge-post','Puesto del Paso Alto',5260,1120,'home');
  adorn();
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
 function sampleMap(ctx,ox,oy,k){
  const img=ctx.createImageData(190,145),D=img.data;
  for(let j=0;j<145;j++)for(let i=0;i<190;i++){
   const x=i/190*MW,y=j/145*MH,l=(j*190+i)*4;
   const inOld=x<oldW&&y<oldH,cc=inOld?baseD(x,y):coast(x,y);
   const bi=inOld?origBiome(x,y,main):biome(x,y),
     e=inOld?0:height(x,y),v=PAL[bi]||PAL.town,n=v[e>.5?0:e>.25?1:2];
   const out=cc>.98?[69,151,189]:cc>.91?[232,219,188]:n;
   D[l]=out[0];D[l+1]=out[1];D[l+2]=out[2];D[l+3]=255;
  }
  const tc=document.createElement('canvas');tc.width=190;tc.height=145;tc.getContext('2d').putImageData(img,0,0);
  ctx.drawImage(tc,ox,oy,MW*k,MH*k);
  // Capa cartográfica adicional: red viaria, barrios y destinos, sin alterar el mundo jugable.
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  for(const [a,b] of seg){ctx.beginPath();ctx.moveTo(ox+a[0]*k,oy+a[1]*k);ctx.lineTo(ox+b[0]*k,oy+b[1]*k);ctx.strokeStyle='#fff6de';ctx.lineWidth=2.7;ctx.stroke();ctx.strokeStyle='#ad956f';ctx.lineWidth=.8;ctx.stroke()}
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
  return [...previous,...seg];
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
    if(t>0&&t<1&&u>0&&u<1){cuts[i].push(t);cuts[j].push(u)}
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
   ['Cordilleras del Norte',3500,900,'⛰️'],
   ['Altiplano Dorado',P.plateau.x,P.plateau.y,'🏔️'],
   ['Ciudad del Sur',P.town.x,P.town.y,'🏙️'],
   ['Bosque Profundo',P.forest.x,P.forest.y,'🌲'],
   ['Ciudad Corazón',870,878,'🏠']
  ].map(([name,x,y,icon])=>({name,x,y,icon}));
  const jobs=main.build.filter(b=>b.job).map(b=>({name:b.name,x:b.x,y:b.y+18,icon:b.icon||'🏪'}));
  const homes=main.build.filter(b=>!b.job).map(b=>({name:b.name,x:b.x,y:b.y+18,icon:'🏡'}));
  return [...landmarks,...jobs,...homes];
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
  if(Date.now()-lastGuideTick<250)return;lastGuideTick=Date.now();
  const p=X.player,pts=guide.points;
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
  hud._label.textContent=arrow+' '+guide.name+' · '+Math.round(all)+' u · próximo giro '+Math.round(d)+' u';
  hud.style.display=X.st.menu?'none':'block';
 }
 function startGuide(target){
  if(!main||!Game?.X)return null;
  const p=Game.X.player;
  const route=roadRoute({x:p.x,y:p.y},target);
  guide={points:route.points,connected:route.connected,dest:target,name:target.name||'Destino',step:1};
  lastGuideTick=0;updateGuide();
  return guide;
 }
 function navigationTab(tab,box){
  if(tab!=='map'||Game?.X?.M()!==main)return;
  const X=Game.X,m=main,all=destinations();
  const wrap=document.createElement('section');wrap.style.cssText='color:#354b42;font:700 12px/1.4 system-ui,sans-serif';
  wrap.innerHTML='<div style="display:flex;gap:5px;margin:0 0 8px;align-items:center;flex-wrap:wrap">'+
   '<button data-nav="plus" aria-label="Acercar mapa">＋</button><button data-nav="minus" aria-label="Alejar mapa">－</button>'+
   '<button data-nav="me">📍 Aquí</button><button data-nav="all">🌍 Completo</button>'+
   '<span style="font-size:10px">Arrastra para explorar · toca para elegir</span></div>'+
   '<canvas id="walesa-streets-map" width="560" height="395" style="display:block;width:100%;height:auto;'+
   'max-height:45vh;object-fit:contain;border:2px solid #bfd2c2;border-radius:11px;touch-action:none;background:#d6ebed"></canvas>'+
   '<div style="display:flex;gap:6px;margin-top:8px"><select aria-label="Elegir destino" style="min-width:0;flex:1;padding:7px;'+
   'border:1px solid #b3c9b5;border-radius:8px;background:#fffaf1;color:#365344"></select>'+
   '<button data-nav="route">🧭 Seguir ruta</button></div>'+
   '<p data-nav="status" role="status" style="margin:7px 0 2px;min-height:32px">Elige un destino o toca una calle.</p>';
  box.replaceChildren(wrap);
  for(const b of wrap.querySelectorAll('button')){
   b.style.cssText='padding:8px 10px;border-radius:8px;background:#e5f0dd;color:#3b604b;font:800 12px system-ui;cursor:pointer';
  }
  const cv=wrap.querySelector('canvas'),ctx=cv.getContext('2d'),sel=wrap.querySelector('select'),
    status=wrap.querySelector('[data-nav="status"]'),CW=cv.width,CH=cv.height;
  const opt=document.createElement('option');opt.textContent='Elegir lugar…';opt.value='';sel.append(opt);
  all.forEach((p,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=p.icon+' '+p.name;sel.append(o)});
  let zoom=2.5,center={x:X.player.x,y:X.player.y},target=null,preview=null,down=null;
  const clampCenter=()=>{
   center.x=clamp(center.x,0,m.MW);center.y=clamp(center.y,0,m.MH);
  };
  const view=()=>{
   const k=Math.min(CW/m.MW,CH/m.MH)*zoom;
   return {k,ox:CW/2-center.x*k,oy:CH/2-center.y*k};
  };
  const screen=p=>{const v=view();return {x:v.ox+p.x*v.k,y:v.oy+p.y*v.k}};
  const world=(x,y)=>{const v=view();return {x:clamp((x-v.ox)/v.k,0,m.MW),y:clamp((y-v.oy)/v.k,0,m.MH)}};
  function draw(){
   ctx.clearRect(0,0,CW,CH);ctx.fillStyle='#a6d8e6';ctx.fillRect(0,0,CW,CH);
   const v=view();m.mainland.sampleMap(ctx,v.ox,v.oy,v.k);
   ctx.drawImage(m.ground,v.ox,v.oy,m.baseMW*v.k,m.baseMH*v.k);
   // El mapa general no dibuja 50 casas superpuestas: prioriza establecimientos.
   for(const p of all.filter((p,i)=>i<6||p.icon!=='🏡')){
    const s=screen(p);if(s.x<-15||s.x>CW+15||s.y<-15||s.y>CH+15)continue;
    ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText(p.icon,s.x,s.y-7);
   }
   if(preview){
    ctx.save();ctx.lineWidth=5;ctx.lineJoin='round';ctx.lineCap='round';
    ctx.beginPath();preview.points.forEach((p,i)=>{const q=screen({x:p[0],y:p[1]});i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});
    ctx.strokeStyle='rgba(255,255,255,.94)';ctx.stroke();ctx.lineWidth=2.6;
    ctx.strokeStyle=preview.connected?'#267fc6':'#b0785a';
    if(!preview.connected)ctx.setLineDash([7,5]);ctx.stroke();ctx.restore();
   }
   if(target){const q=screen(target);ctx.beginPath();ctx.arc(q.x,q.y,8,0,Math.PI*2);ctx.fillStyle='#e27e68';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.stroke()}
   const p=screen(X.player);ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);ctx.fillStyle='#367cdd';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.stroke();
  }
  function choose(p){
   target=p;preview=roadRoute({x:X.player.x,y:X.player.y},target);
   status.textContent='📍 '+p.name+' · '+Math.round(Math.hypot(X.player.x-p.x,X.player.y-p.y))+
    ' unidades · '+(preview.connected?'ruta por caminos':'guía directa, sin conexión vial verificada');
   draw();
  }
  const controls=k=>wrap.querySelector('[data-nav="'+k+'"]');
  controls('plus').onclick=()=>{zoom=clamp(zoom*1.5,1,12);draw()};
  controls('minus').onclick=()=>{zoom=clamp(zoom/1.5,1,12);draw()};
  controls('me').onclick=()=>{center={x:X.player.x,y:X.player.y};zoom=3;draw()};
  controls('all').onclick=()=>{center={x:m.MW/2,y:m.MH/2};zoom=1;draw()};
  controls('route').onclick=()=>{if(!target){status.textContent='Elige primero un destino.';return}
    startGuide(target);X.closeMenu();X.toast('🧭 Ruta activada. Sigue la indicación superior.')};
  sel.onchange=()=>{const id=Number(sel.value);if(sel.value!==''){
   const p=all[id];center={x:p.x,y:p.y};clampCenter();choose(p)
  }};
  const point=e=>{const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*CW/r.width,y:(e.clientY-r.top)*CH/r.height}};
  cv.addEventListener('pointerdown',e=>{const p=point(e);down={...p,cx:center.x,cy:center.y};cv.setPointerCapture?.(e.pointerId)});
  cv.addEventListener('pointermove',e=>{if(!down)return;
   const p=point(e),v=view();center.x=down.cx-(p.x-down.x)/v.k;center.y=down.cy-(p.y-down.y)/v.k;
   clampCenter();draw()});
  cv.addEventListener('pointerup',e=>{if(!down)return;const p=point(e),travel=Math.hypot(p.x-down.x,p.y-down.y);down=null;
   if(travel>10)return;
   const pos=world(p.x,p.y);
   let best=null,bd=22;
   for(const a of all){const q=screen(a),d=Math.hypot(q.x-p.x,q.y-p.y);if(d<bd){bd=d;best=a}}
   choose(best||{...pos,name:zone(pos.x,pos.y).replace(/^./,c=>c.toUpperCase())});
  });
  cv.addEventListener('pointercancel',()=>down=null);
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
  structures();furnishRooms();
  return m;
 }
 function moveToPreview(){
  if(!main||!Game?.X||!save||save.mainlandV3Welcome)return false;
  const X=Game.X;
  if(X.st.mode!=='play'||X.st.scene!=='out'||X.M()!==main||X.st.busy||X.st.mg)return false;
  // La primera visita abre EN EL OVERWORLD EXPANDIDO: no en una tabla ni un menú.
  X.player.x=P.village.x;X.player.y=P.village.y+85;X.player.dir=0;
  X.cam.x=X.player.x;X.cam.y=X.player.y;
  save.mainlandV3Welcome=1;
  Game.G.save();
  X.toast('🏞 ¡Estás dentro del nuevo overworld! Camina hacia montañas, ciudad o bosque.');
  return true;
 }
 function register(){
  if(typeof Game==='undefined'||!Game.X?.HOOKS)return;
  const X=Game.X,H=X.HOOKS;let seen='';
  H.tab.push(navigationTab);
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
 return{install,draw,coast,height,biome,zone,roadAt,nearbyRoad,roadRoute,destinations,startGuide,landmarks:P,get original(){return main}};
})();
