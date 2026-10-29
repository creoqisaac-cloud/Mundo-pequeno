/* Mundo Pequeño · Continente + Bosque sin Fin
   Integración sobre el motor World y los HOOKS originales. Sin canvas/colisiones paralelos. */
(()=>{
'use strict';
if(!window.Game||!window.World||typeof World.makeExpanseSector!=='function')return;
const V=World,X=Game.X,H=X.HOOKS;
const S=save.expansionV1||(save.expansionV1={current:'home',last:{forest:false,x:16,y:16},visited:{},discoveries:{},work:{}});
S.visited=S.visited||{};S.discoveries=S.discoveries||{};S.work=S.work||{};
const SIZE=32,W=768,HH=704,MAX_CACHE=3,cache=new Map();
let moving=false,thresholdNotice=0;
const key=(forest,x,y)=>(forest?'f':'c')+':'+x+':'+y;
const inAtlas=(x,y)=>x>=0&&y>=0&&x<SIZE&&y<SIZE;
const current=()=>X.M();
const isExp=m=>!!(m&&typeof m.gridX==='number'&&typeof m.gridY==='number');
const season=()=>X.today();
function seen(m){
 const k=key(m.forest,m.gridX,m.gridY);
 if(!S.visited[k]){S.visited[k]=season();if(m.forest)S.forestVisits=(S.forestVisits||0)+1;Game.G.save()}
 S.current=k;S.last={forest:!!m.forest,x:m.gridX,y:m.gridY};
}
async function sector(x,y,forest){
 const k=key(forest,x,y);
 if(cache.has(k)){const m=cache.get(k);cache.delete(k);cache.set(k,m);return m}
 const m=await V.makeExpanseSector(x,y,forest);
 cache.set(k,m);
 while(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);
 return m;
}
async function moveTo(x,y,forest,px=384,py=352){
 if(moving||!forest&&!inAtlas(x,y))return;
 moving=true;X.st.busy=true;
 try{
  X.loading(true,forest?'Abriendo un sendero del bosque…':'Explorando los nuevos distritos…',20);
  const m=await sector(x,y,forest);
  await X.iris(()=>{
   V.use(m);X.st.scene='out';
   X.player.x=Math.max(27,Math.min(W-27,px));
   X.player.y=Math.max(27,Math.min(HH-27,py));
   X.player.path=null;X.player.pending=null;
   X.cam.x=X.player.x;X.cam.y=X.player.y;
   X.petE.x=X.player.x;X.petE.y=X.player.y+8;
   X.setNPCs();X.loading(false);
   seen(m);Game.G.save();
  });
  X.placeTag(m.name+' · '+(m.forest?'sendero '+x+', '+y:'sector '+(x+1)+'-'+(y+1)));
 }catch(e){X.loading(false);X.toast('No se pudo abrir este sector.');console.error('Expansión Walesa',e)}
 finally{moving=false;X.st.busy=false}
}
async function goHome(){
 if(moving)return;moving=true;X.st.busy=true;
 try{
  await V.prepare();
  await X.iris(()=>{
   V.use(V.MAIN);X.st.scene='out';X.player.x=2535;X.player.y=994;X.player.dir=0;
   X.player.path=null;X.player.pending=null;
   X.cam.x=X.player.x;X.cam.y=X.player.y;
   X.petE.x=X.player.x;X.petE.y=X.player.y+8;
   X.setNPCs();S.current='home';Game.G.save();
  });
  X.placeTag('Isla de Walesa');
 }finally{moving=false;X.st.busy=false}
}
function atlasZone(x,y){
 const n=V.vnoise((x+11)/5,(y+17)/5),center=Math.hypot(x-16,y-16);
 return center<3.5?'centro':n>.72?'comercial':n<.28?'agrícola':n>.55?'residencial':'regional';
}
const COLORS={centro:'#b6adba',comercial:'#d9aa8e','agrícola':'#a1c680',residencial:'#f4b9d5',regional:'#7daea1'};
function atlasSheet(){
 X.sheet('🗺️ Atlas del Gran Continente',box=>{
  const m=current(),n=Object.keys(S.visited).filter(k=>k.startsWith('c:')).length;
  box.innerHTML='<p class="shop-hi">La isla original sigue intacta. A su alrededor se extienden 1,024 distritos explorables, y en el sureste comienza un bosque sin fin.</p>'+
   '<div class="bal">📍 '+(isExp(m)?m.name+' ('+(m.gridX+1)+', '+(m.gridY+1)+')':'Isla de Walesa')+' · '+n+' distritos descubiertos</div>'+
   '<canvas id="wcAtlasExp" width="384" height="384" style="display:block;width:min(100%,384px);height:auto;margin:10px auto;border:3px solid #f7e3ea;border-radius:12px;image-rendering:pixelated;background:#e6eef0" aria-label="Atlas de 32 por 32 distritos"></canvas>'+
   '<p class="shop-hi">Verde: campos · Rosa: residencial · Terracota: comercio · Gris: centro · Turquesa: pueblos. Los sectores sin explorar permanecen velados.</p>'+
   '<button class="orow" id="wcAtlasClose">Cerrar atlas <span>›</span></button>';
  const cv=box.querySelector('#wcAtlasExp'),g=cv.getContext('2d'),unit=12;
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
   const zone=atlasZone(x,y),visited=!!S.visited[key(false,x,y)];
   g.fillStyle=COLORS[zone];g.fillRect(x*unit,y*unit,unit,unit);
   if(!visited){g.fillStyle='rgba(34,46,52,.78)';g.fillRect(x*unit,y*unit,unit,unit)}
   g.strokeStyle='rgba(255,255,255,.16)';g.strokeRect(x*unit+.5,y*unit+.5,unit-1,unit-1);
  }
  const mark=(x,y,c)=>{g.fillStyle=c;g.fillRect(x*unit+2,y*unit+2,unit-4,unit-4)};
  mark(16,16,'#fffaf6');mark(31,31,'#66d5bd');
  if(isExp(m)&&!m.forest)mark(m.gridX,m.gridY,'#ffdf55');
  box.querySelector('#wcAtlasClose').onclick=()=>X.closeMenu();
 });
}
function homeGates(m){
 if(m._expandedGates)return;
 m._expandedGates=true;
 for(const [x,y] of [[2550,952],[2450,1008]]){
  V.addObj(m,V.spr.sign,x,y,V.rectS(x-3,y-4,6,4),{expMarker:true});
 }
}
V.prepare().then(homeGates).catch(()=>{});
H.inter.push(l=>{
 if(X.st.scene!=='out'||X.st.mg)return;
 const m=current();if(!m)return;
 if(m===V.MAIN){
  l.push({type:'expGate',gate:'continent',x:2550,y:958,r:26,hy:28,label:'Explorar el Gran Continente'});
  l.push({type:'expGate',gate:'forestHome',x:2450,y:1014,r:26,hy:28,label:'Entrar al Bosque sin Fin'});
 }else if(isExp(m)){
  if(m.forest){
   if(m.gridX===0&&m.gridY===0)l.push({type:'expGate',gate:'forestExit',x:70,y:354,r:29,hy:24,label:'Regresar a la isla'});
   if((m.seed%3)===0)l.push({type:'expDiscovery',x:542,y:536,r:32,hy:26,label:'Examinar el claro del bosque'});
  }else{
   if(m.gridX===16&&m.gridY===16)l.push({type:'expGate',gate:'atlasExit',x:67,y:354,r:30,hy:24,label:'Regresar a Walesa'});
   if(m.gridX===31&&m.gridY===31)l.push({type:'expGate',gate:'forestAtlas',x:690,y:608,r:28,hy:26,label:'Sendero del bosque infinito'});
  }
 }
});
H.act.unshift(it=>{
 if(it.type==='expGate')return (async()=>{
  if(it.gate==='continent'){
   const r=await X.ask('🗺️ Gran Continente',['Explorar desde el Distrito Central','Continuar la última expedición','Seguir paseando']);
   if(r===0)await moveTo(16,16,false,70,352);
   if(r===1){const p=S.last||{forest:false,x:16,y:16};await moveTo(p.x,p.y,!!p.forest,384,352)}
  }else if(it.gate==='forestHome'){
   const r=await X.ask('🌲 Bosque sin Fin',['Entrar al primer claro','Por ahora no']);
   if(r===0)await moveTo(0,0,true,98,352);
  }else if(it.gate==='forestExit'||it.gate==='atlasExit')await goHome();
  else if(it.gate==='forestAtlas')await moveTo(0,0,true,98,352);
 })();
 if(it.type==='expDiscovery')return (async()=>{
  const m=current(),k=key(true,m.gridX,m.gridY),d=season();
  if(S.discoveries[k]===d){X.toast('🌿 Ya exploraste este claro hoy.');return}
  const gifts=['hongo','flor','fruta','baya'],item=gifts[m.seed%gifts.length];
  S.discoveries[k]=d;X.invAdd(item,1);
  X.addBells(30+(m.seed%5)*12,true);Game.G.save();
  await X.say('Claro escondido','Entre hojas y senderos encontraste '+(Talk.ITEMS[item]?.[0]||'un regalo')+'. El bosque cambia con cada expedición.');
 })();
 if(it.type==='job'&&it.b?.job==='expMarket')return market(it.b);
 if(it.type==='job'&&it.b?.job==='expOffice')return office(it.b);
 if(it.type==='job'&&it.b?.job==='expResidence')return residence(it.b);
 if(it.type==='job'&&it.b?.job==='expLodge')return lodge(it.b);
 return null;
});
async function market(b){
 const m=current(),factor=m.economy||1,
  ids=m.forest?['hongo','fruta','baya','postal']:m.zone==='agrícola'?['fruta','manzana','sopa','flores']:['pudin','sopa','sandwich','postal','manzana','paraguas32'],
  goods=ids.filter(k=>Talk.ITEMS[k]&&Number.isFinite(Talk.ITEMS[k][2])&&Talk.ITEMS[k][2]>0);
 if(!goods.length){X.toast('El mercado está reponiendo inventario.');return}
 const opts=goods.map(k=>{const a=Talk.ITEMS[k];return a[1]+' '+a[0]+' · '+Math.ceil(a[2]*factor)+' 🔔'}).concat('Vender productos del inventario','Salir');
 const r=await X.ask('🛍️ '+b.name+' · precios x'+factor.toFixed(2),opts);
 if(r<0||r>=goods.length+1)return;
 if(r===goods.length){
  const owned=goods.filter(k=>save.inv[k]>0);if(!owned.length){X.toast('No tienes productos de este mercado para vender.');return}
  const q=await X.ask('Venta local',owned.map(k=>Talk.ITEMS[k][1]+' '+Talk.ITEMS[k][0]+' · '+Math.floor(Talk.ITEMS[k][2]*factor*.48)+' 🔔').concat('Cancelar'));
  if(q<0||q>=owned.length)return;
  const id=owned[q],reward=Math.max(1,Math.floor(Talk.ITEMS[id][2]*factor*.48));
  X.invAdd(id,-1);X.addBells(reward);Game.G.save();X.toast('Venta realizada · +'+reward+' 🔔');return;
 }
 const id=goods[r],price=Math.ceil(Talk.ITEMS[id][2]*factor);
 if(!X.payOr(price))return;
 X.invAdd(id,1);if(save.dex?.i)save.dex.i[id]=1;
 Game.G.save();X.toast(Talk.ITEMS[id][1]+' ¡Comprado en '+m.name+'!');
}
async function office(b){
 const m=current(),k=key(false,m.gridX,m.gridY),reward=Math.round(105*(m.economy||1));
 const r=await X.ask('📜 '+b.name,['Trabajo comunitario · '+reward+' 🔔','Economía del distrito','Salir']);
 if(r===0){
  if(S.work[k]===season()){X.toast('El turno de hoy ya está completado.');return}
  S.work[k]=season();X.addBells(reward);Game.G.save();X.toast('✓ Trabajo completado · +'+reward+' 🔔');
 }else if(r===1)await X.say('Administración',m.name+': el costo de bienes y parcelas es aproximadamente '+Math.round((m.economy||1)*100)+'% del precio base. El comercio, los barrios y el campo tienen economías distintas.');
}
async function residence(b){
 const m=current();const r=await X.ask('🏠 '+b.name,['Conocer el vecindario','Mirar la fachada']);
 if(r===0)await X.say('Guía del barrio',m.name+' tiene sus propios caminos, parcelas y puestos. Los distritos vecinos se conectan por las cuatro avenidas.');
 else X.toast('🏡 Una vivienda construida con el arte original de Walesa.');
}
async function lodge(b){
 const r=await X.ask('🌲 '+b.name,['Descansar un poco','Orientarme','Salir']);
 if(r===0){if(window.Health32?.status)Health32.status.hunger=Math.min(100,Health32.status.hunger+18);Game.G.save();X.toast('☕ Recuperaste fuerzas para seguir el sendero.')}
 if(r===1)await X.say('Guardabosques','Cada claro conserva su forma al regresar. Camina hacia cualquier borde para continuar explorando. El portal de regreso está en el primer claro.');
}
H.update.push(()=>{
 const m=current();
 if(moving||!isExp(m)||X.st.mode!=='play'||X.st.scene!=='out'||X.st.menu||X.st.busy||X.st.trans)return;
 const p=X.player;let dx=0,dy=0,nx=p.x,ny=p.y;
 if(p.x<20){dx=-1;nx=W-38}
 else if(p.x>W-20){dx=1;nx=38}
 else if(p.y<20){dy=-1;ny=HH-38}
 else if(p.y>HH-20){dy=1;ny=38}
 if(!dx&&!dy)return;
 const x=m.gridX+dx,y=m.gridY+dy;
 if(!m.forest&&!inAtlas(x,y)){
  p.x=Math.max(32,Math.min(W-32,p.x));p.y=Math.max(32,Math.min(HH-32,p.y));
  if(X.st.t-thresholdNotice>4){thresholdNotice=X.st.t;X.toast('🌊 Llegaste al límite del continente. Busca otro camino.')}
  return;
 }
 moveTo(x,y,!!m.forest,nx,ny);
});
H.tab.push((tab,box)=>{
 if(tab!=='tasks')return;
 const node=document.createElement('div');
 const m=current(),v=Object.keys(S.visited).filter(k=>k.startsWith('c:')).length;
 node.innerHTML='<button class="orow" id="wcAtlasOpen">🗺️ Atlas del Gran Continente <span>›</span></button>'+
  '<small class="memtext">'+v+' de 1,024 distritos descubiertos · '+(S.forestVisits||0)+' claros del bosque explorados.</small>';
 box.appendChild(node);
 node.querySelector('button').onclick=()=>{X.closeMenu();atlasSheet()};
});
window.WalesaExpansion={version:1,dimensions:{columns:32,rows:32,sectorWidth:W,sectorHeight:HH},state:S,sector,go:moveTo,returnHome:goHome,atlas:atlasSheet};
})();
