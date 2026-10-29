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
    const k=(j*W+i)*4,noise=hash(x>>2,y>>2),small=hash(x,y),bk=biome(x,y),pal=PAL[bk]||PAL.town;
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
    ctx.strokeStyle=layer===0?(paved?'#c7b9a7':'#ab895e'):
      (paved?'#77717a':'#e8ce9c');
    ctx.lineWidth=layer===0?32:layer===1?24:0;
    ctx.stroke();
   }
  };
  strokes(0);strokes(1);
  // Adoquines, juntas y desgaste dentro del trazado existente, sin reemplazar caminos.
  for(const {a,b,paved} of visible){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
   ctx.save();ctx.beginPath();ctx.moveTo(a[0]-x0,a[1]-y0);ctx.lineTo(b[0]-x0,b[1]-y0);ctx.lineWidth=22;ctx.strokeStyle='#fff';ctx.stroke();ctx.clip();
   for(let t=0;t<len;t+=11){const xx=a[0]+dx*t/len-x0,yy=a[1]+dy*t/len-y0;ctx.strokeStyle=paved?'rgba(245,239,222,.18)':'rgba(126,88,52,.23)';ctx.lineWidth=.8;
    for(let j=-1;j<=1;j++){const q=j*8+(Math.floor(t/11)%2)*3;ctx.beginPath();ctx.moveTo(xx+nx*(q-4),yy+ny*(q-4));ctx.lineTo(xx+nx*(q+4),yy+ny*(q+4));ctx.stroke()}}
   ctx.restore();
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
 function building(id,name,x,y,type='home',job=null){
  const v=zone(x,y),urban=type==='city',wall=urban?'#e8e5df':'#f8e9d8',roof=urban?'#9aa3b7':'#c88670';
  const styles=[['#f8e9d8','#c88670'],['#e7eef8','#769cbd'],['#f4e2ef','#ad83a8'],['#e6f0dc','#87a16f'],['#fff0d5','#d5a16d'],['#e6e1f3','#8576b1'],['#f0e3d7','#8f9d9d']];const urbanStyles=[['#e8e5df','#9aa3b7'],['#e9e1f0','#9989b7'],['#e1edf0','#7c9fa9'],['#f2e7d7','#b9967e'],['#e6e9dd','#929c7a']];const palette=(urban?urbanStyles:styles)[Math.floor(hash(x>>4,y>>4)*(urban?urbanStyles.length:styles.length))];const b={id:'v3_'+id,name,x,y,job:job||undefined,city:urban?1:0,wall:palette[0],roof:palette[1],
    acc:urban?'#9eafbc':roof,icon:urban?'🏬':'🏠'};
  if(urban){b.acc=palette[1];b.icon=job==='shop'?'🛍️':job==='papers'?'📚':job==='delivery'?'📮':'🏠';b.day=V.cityBuilding(b.wall,b.acc,b.icon,false,b.name);b.night=V.cityBuilding(b.wall,b.acc,b.icon,true,b.name)}
  else{const opt={sign:job?'heart':null,noChim:!!job,awning:job?['#fff8e9',palette[1]]:undefined,flag:hash(x,y)>.68};b.day=V.houseSprite(b.wall,b.roof,false,opt);b.night=V.houseSprite(b.wall,b.roof,true,opt)}
  V.addObj(main,b.day,x,y,V.rectS(x-(urban?33:27),y-(urban?34:28),urban?70:54,urban?33:27),{house:b});
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
   const ctx=bg.getContext('2d');ctx.drawImage(base.bg,0,0);
   // Papel y piso con un matiz suave, muebles siempre pixel-art nativos.
   const tone=zone(b.x,b.y)==='forest'?'#46795c':b.city?'#a8b4c3':
     zone(b.x,b.y)==='montana'?'#c29b77':'#e9b5c8';
   ctx.fillStyle=tone;ctx.globalAlpha=.09;ctx.fillRect(8,8,240,38);
   ctx.globalAlpha=.045;ctx.fillRect(8,52,240,132);ctx.globalAlpha=1;
   const room={...base,bg,name:b.name,gift:false,
     objs:base.objs.slice(0,-1).map(o=>({...o})),
     solids:base.solids.slice(0,-1).map(o=>({...o})),
     flav:base.flav.map(f=>({...f}))};
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
  H.update.push(()=>{if(!main)return;moveToPreview();
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
 return{install,draw,coast,height,biome,zone,roadAt,nearbyRoad,landmarks:P,get original(){return main}};
})();
