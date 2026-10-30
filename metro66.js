/* Metro Walesa v66: elevado, cabina tridimensional, teléfono y transbordos. */
(function(){
'use strict';
const X=Game.X,V=World,old=window.WalesaMetro62,previous=window.WalesaMetro63;
if(!old||!previous)return;
const ELEV=92;
let mode='exterior',cabin=null,panel=null,transferBox=null,angle=0,copyFrames=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const riding=()=>!!window.Metro?.ride;
function clearCabin(){if(cabin){cabin.remove();cabin=null}mode='exterior'}
function clearPanel(){if(panel){panel.remove();panel=null}}
function setView(next){
 if(next!=='interior'&&next!=='exterior')return false;
 if(next==='exterior'){clearCabin();return true}
 if(!riding()){X.toast('🚝 Primero sube a un tren');return false}
 mode='interior';if(cabin)return true;
 angle=0;
 cabin=document.createElement('div');cabin.className='w66-cabin';cabin.setAttribute('role','region');
 cabin.setAttribute('aria-label','Interior del tren de Walesa');
 cabin.innerHTML='<div class="w66-shell">'+
 '<header class="w66-topbar"><div class="w66-topbrand"><span class="w66-flower">✿</span><div><small>METRO DE WALESA</small><strong>Un viaje entre nubes</strong></div></div>'+
 '<button type="button" data-view aria-label="Volver al recorrido exterior">✕ <span>Exterior</span></button></header>'+
 '<div class="w66-car-status"><span class="w66-pulse"></span><div><small>VIAJANDO EN TREN</small><strong data-next-stop>Próxima estación</strong></div><span class="w66-car-tag">EN RUTA</span></div>'+
 '<div class="w66-viewport" aria-label="Ventana con el mundo del juego en movimiento">'+
 '<canvas width="320" height="180" class="w66-outside"></canvas>'+
 '<div class="w66-world3d"><div class="w66-car3d">'+
 '<div class="w66-ceiling"><span>✿ <i></i> ✿</span></div>'+
 '<div class="w66-floor"></div>'+
 '<div class="w66-back"><div class="w66-exit"><span>✿</span><small>PRÓXIMA ESTACIÓN</small></div></div>'+
 '<div class="w66-side w66-left"><div class="w66-window"></div><div class="w66-seat"></div></div>'+
 '<div class="w66-side w66-right"><div class="w66-window"></div><div class="w66-seat"></div></div>'+
 '<div class="w66-pole"></div></div></div><div class="w66-window-label">El paisaje continúa mientras viajas ♡</div></div>'+
 '<div class="w66-scenetitle">¿Hacia dónde quieres mirar?</div>'+
 '<nav class="w66-look" aria-label="Dirección de mirada"><button type="button" data-turn="-55">↶ Ventana</button><button type="button" data-turn="0" aria-pressed="true">Al frente</button><button type="button" data-turn="55">Pasillo ↷</button></nav>'+
 '<nav class="w66-actions"><button type="button" data-view>🌿 Ver el recorrido</button><button type="button" data-phone>📱 Usar celular</button></nav>'+
 '<p class="w66-note">Puedes volver afuera sin bajarte del tren. El viaje sigue en tiempo real.</p></div>';
 document.getElementById('game').appendChild(cabin);
 cabin.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView('exterior'));
 cabin.querySelectorAll('[data-turn]').forEach(b=>b.onclick=()=>{
  angle=+b.dataset.turn;cabin.style.setProperty('--look',angle+'deg');
  cabin.querySelectorAll('[data-turn]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));
 });
 cabin.querySelector('[data-phone]').onclick=()=>{
  window.Fon?.open();if(!document.querySelector('.fon.on'))X.toast('Teléfono no disponible');
 };
 cabin.style.setProperty('--look',angle+'deg');
 return true;
}
function rideDisplay({ride}){
 if(!ride){clearCabin();clearPanel();return}
 const tr=ride.tr,r=tr.route;
 if(!panel){panel=document.createElement('div');panel.className='w66-panel';document.getElementById('game').appendChild(panel)}
 const nx=r.ST.map(s=>({s,d:((s.s-tr.s)%r.L+r.L)%r.L})).filter(v=>v.d>2).sort((a,b)=>a.d-b.d)[0]?.s||r.ST[0];
 const id=r.id+nx.name+ride.dest.name;
 if(panel.dataset.id!==id){
  panel.dataset.id=id;
  panel.innerHTML='<span class="w66-line-dot" style="background:'+r.color+'"></span><div><small>PRÓXIMA ESTACIÓN</small><b>'+esc(nx.name)+'</b><small>'+esc(r.name)+' · Hasta '+esc(ride.dest.name)+'</small></div><button type="button" data-interior>🚝 Interior</button>';
  panel.querySelector('button').onclick=()=>setView(mode==='interior'?'exterior':'interior');
 }
 if(mode==='interior'&&cabin){
  const nextName=cabin.querySelector('[data-next-stop]');
  if(nextName&&nextName.textContent!==nx.name)nextName.textContent=nx.name;
  cabin.style.setProperty('--line-color',r.color);
  copyFrames++;
  if(copyFrames%4===0){
   try{
    const c=cabin.querySelector('.w66-outside'),g=c.getContext('2d');
    g.drawImage(document.getElementById('cv'),0,0,320,180);
   }catch(e){/* El paisaje se recupera en el siguiente fotograma. */}
  }
 }
}
function closeTransfer(){if(transferBox){transferBox.remove();transferBox=null}}
function transfer(next,station){
 clearCabin();clearPanel();closeTransfer();
 transferBox=document.createElement('div');transferBox.className='w66-transfer';
 transferBox.setAttribute('role','dialog');transferBox.setAttribute('aria-label','Transbordo de línea');
 transferBox.innerHTML='<div class="w66-transfer-flowers">✿　✧　✿</div>'+
 '<div class="w66-transfer-eyebrow">CAMBIO DE LÍNEA</div><h3>'+esc(station.name)+'</h3>'+
 '<p>Has llegado al transbordo. Conservas tu boleto: no necesitas pagar otra vez.</p>'+
 '<div class="w66-transfer-line"><i style="background:'+next.route.color+'"></i><span><small>SIGUIENTE TREN</small><b>'+esc(next.route.name)+'</b></span></div>'+
 '<p class="w66-transfer-instruction">Ve al siguiente andén para continuar hacia <b>'+esc(next.to.name)+'</b>.</p>'+
 '<div class="w66-transfer-status" aria-live="polite">Cuando estés listo, espera el siguiente tren.</div>'+
 '<nav><button type="button" data-next>🚝 Esperar y continuar</button><button type="button" data-exit>Salir del metro</button></nav>';
 document.getElementById('game').appendChild(transferBox);
 transferBox.querySelector('[data-next]').onclick=()=>{
  const button=transferBox?.querySelector('[data-next]');
  if(!button)return;
  if(Metro.depart(next.from,next.to)){
   closeTransfer();X.toast('🚝 Esperando el tren de '+next.route.name);
  }else{
   transferBox.querySelector('.w66-transfer-status').textContent='El tren aún no está listo. Puedes volver a intentarlo.';
   X.toast('El andén aún no está disponible');
  }
 };
 transferBox.querySelector('[data-exit]').onclick=()=>{
  closeTransfer();old.cancelJourney?.();
  if(save.metroPass63?.used){save.metroPass63=null;try{Game.G.save()}catch(e){}}
  X.toast('Saliste de la estación');
 };
 return true;
}
const segment=(g,a,b,width,color)=>{g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()};

/* Viaducto de concreto y acero. Cada par de muestras conserva su unión:
   no se pierden tramos cuando una muestra cae fuera del radio de dibujo. */
function elevated(g,B,w2s){
 if(!window.Metro?.R||X.M()!==V.MAIN||X.st.scene!=='out')return;
 const px=X.player.x,py=X.player.y,range=1040;
 g.save();g.lineCap='round';g.lineJoin='round';
 const stationSeen=new Set();
 const inRange=(x,y)=>Math.abs(x-px)<range&&Math.abs(y-py)<range;
 function drawPolyline(points,off,height,width,color){
  g.strokeStyle=color;g.lineWidth=width;g.beginPath();
  let started=false,prior=null;
  for(let i=0;i<points.length;i++){
   const p=points[i],prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];
   const dx=next[0]-prev[0],dy=next[1]-prev[1],len=Math.hypot(dx,dy)||1;
   const v=w2s(B,p[0]-dy/len*off,p[1]+dx/len*off-ELEV+height);
   if(!v){started=false;continue}
   if(!started||!prior){g.moveTo(v.x,v.y);started=true}else g.lineTo(v.x,v.y);
   prior=v;
  }
  g.stroke();
 }
 function routeSpans(pts){
  const stride=Math.max(1,Math.ceil(pts.length/2400)),spans=[],n=pts.length;
  let piece=[],last=-1;
  const add=(i)=>{if(last!==i){piece.push(pts[i]);last=i}};
  for(let i=stride;i<n;i+=stride){
   const a=Math.max(0,i-stride),b=i;
   const p=pts[a],q=pts[b];
   if(Math.min(p[0],q[0])<=px+range&&Math.max(p[0],q[0])>=px-range&&
      Math.min(p[1],q[1])<=py+range&&Math.max(p[1],q[1])>=py-range){
    if(!piece.length)add(a);add(b);
   }else if(piece.length){spans.push(piece);piece=[];last=-1}
  }
  const lastI=Math.ceil((n-1)/stride)*stride;
  if(lastI!==n-1&&n>1){
   const a=Math.max(0,Math.floor((n-1)/stride)*stride),p=pts[a],q=pts[n-1];
   if(Math.min(p[0],q[0])<=px+range&&Math.max(p[0],q[0])>=px-range&&
      Math.min(p[1],q[1])<=py+range&&Math.max(p[1],q[1])>=py-range){
    if(!piece.length)add(a);add(n-1);
   }
  }
  if(piece.length)spans.push(piece);
  return spans;
 }
 for(const line of Metro.R.lines){
  // Velocidad de servicio urbano: contemplar el paisaje, no cruzarlo a toda velocidad.
  const pts=line.P;if(!pts?.length)continue;
  const spans=routeSpans(pts);
  if(!spans.length&&!line.ST.some(st=>inRange(st.px,st.py)))continue;
  // Pilas de concreto cada distancia regular, con zapata, alma y ménsula real.
  const pillarStep=Math.max(16,Math.round(190*pts.length/Math.max(1,line.L)));
  for(let i=0;i<pts.length;i+=pillarStep){
   const p=pts[i];if(!inRange(p[0],p[1]))continue;
   const foot=w2s(B,p[0],p[1]),head=w2s(B,p[0],p[1]-ELEV+8);
   if(!foot||!head)continue;
   const q=Math.max(.6,Math.min(2.5,head.s));
   g.fillStyle='rgba(49,61,66,.17)';g.beginPath();
   g.ellipse(foot.x+7*q,foot.y+3*q,14*q,5*q,0,0,2*Math.PI);g.fill();
   g.fillStyle='#b9b1aa';g.beginPath();
   g.moveTo(foot.x-5*q,foot.y);g.lineTo(foot.x+6*q,foot.y);
   g.lineTo(head.x+4*q,head.y);g.lineTo(head.x-4*q,head.y);g.closePath();g.fill();
   g.fillStyle='#e7e0d5';g.beginPath();
   g.moveTo(foot.x-5*q,foot.y);g.lineTo(foot.x-1*q,foot.y);
   g.lineTo(head.x,head.y);g.lineTo(head.x-4*q,head.y);g.closePath();g.fill();
   g.fillStyle='#7b898f';g.fillRect(head.x-15*q,head.y-2*q,30*q,5*q);
   g.fillStyle='#d4c9bd';g.fillRect(head.x-14*q,head.y-5*q,28*q,4*q);
   g.fillStyle='#fff7e8';g.fillRect(foot.x-7*q,foot.y-3*q,14*q,3*q);
  }
  // Cada tramo incluye ambos extremos visibles: sin huecos por el culling de distancia.
  for(const span of spans){
   if(span.length<2)continue;
   const avg=w2s(B,span[Math.floor(span.length/2)][0],span[Math.floor(span.length/2)][1]-ELEV);
   const q=Math.max(.68,Math.min(2.2,avg?.s||1));
   drawPolyline(span,0,9,32*q,'#67757a');       // viga inferior de hormigón
   drawPolyline(span,0,4,29*q,'#b2b0a7');      // canto del tablero
   drawPolyline(span,0,0,25*q,'#e7dfd2');      // losa de rodamiento
   drawPolyline(span,-8,-3,2.6*q,'#576772');   // riel metálico izquierdo
   drawPolyline(span,8,-3,2.6*q,'#576772');    // riel metálico derecho
   drawPolyline(span,-12,-4,1.9*q,'#c9d3d3');  // pretil
   drawPolyline(span,12,-4,1.9*q,'#c9d3d3');
  }
  // Una marquesina por estación, aunque dos líneas compartan el mismo lugar.
  for(const st of line.ST){
   if(stationSeen.has(st.name)||!inRange(st.px,st.py))continue;
   stationSeen.add(st.name);
   const foot=w2s(B,st.px,st.py),top=w2s(B,st.px,st.py-ELEV);
   if(!foot||!top)continue;
   const q=Math.max(.7,Math.min(2,top.s)),w=94*q;
   // Planta baja: taquilla a pie de calle, identificable desde el overworld.
   g.fillStyle='#a0a6aa';g.fillRect(foot.x-21*q,foot.y-10*q,42*q,12*q);
   g.fillStyle='#fff5e9';g.fillRect(foot.x-19*q,foot.y-30*q,38*q,21*q);
   g.fillStyle='#b4d5d0';g.fillRect(foot.x-15*q,foot.y-26*q,17*q,14*q);
   g.fillStyle='#d4a2b9';g.fillRect(foot.x+4*q,foot.y-26*q,11*q,14*q);
   g.fillStyle='#879398';g.font='800 '+Math.max(8,8*q)+'px system-ui';g.textAlign='center';
   g.fillText('BOLETOS',foot.x,foot.y-33*q);
   // Escaleras eléctricas inclinadas, entre calle y mezzanine con pasamanos.
   const left={x:foot.x+17*q,y:foot.y-5*q},upper={x:top.x+29*q,y:top.y+15*q};
   segment(g,left,upper,13*q,'#b9b6ae');
   segment(g,{x:left.x-5*q,y:left.y},{x:upper.x-5*q,y:upper.y},3*q,'#f5e5d4');
   segment(g,{x:left.x+6*q,y:left.y},{x:upper.x+6*q,y:upper.y},3*q,'#cb9eb2');
   for(let j=1;j<11;j++){
    const u=j/11;
    const sx=left.x+(upper.x-left.x)*u,sy=left.y+(upper.y-left.y)*u;
    segment(g,{x:sx-4*q,y:sy},{x:sx+5*q,y:sy},1.5*q,'#f8f3e7');
   }
   // Andén ancho, fachada acristalada, cubierta y letrero completo.
   g.fillStyle='#818c94';g.fillRect(top.x-w/2-4*q,top.y+14*q,w+8*q,8*q);
   g.fillStyle='#e6dcd0';g.fillRect(top.x-w/2,top.y+7*q,w,9*q);
   g.fillStyle='#a6c4bf';g.fillRect(top.x-w/2+8*q,top.y-18*q,w-16*q,25*q);
   for(let j=-2;j<=2;j++){
    g.fillStyle='#f8f4eb';g.fillRect(top.x+j*13*q-2*q,top.y-19*q,3*q,26*q);
   }
   g.fillStyle='#f7f0e6';g.fillRect(top.x-w/2-8*q,top.y-29*q,w+16*q,12*q);
   g.fillStyle=line.color;g.fillRect(top.x-w/2-8*q,top.y-30*q,w+16*q,3.5*q);
   g.fillStyle='#c19eb1';g.fillRect(top.x-w/2+5*q,top.y+7*q,w-10*q,2*q);
   g.font='800 '+Math.max(9,9*q)+'px system-ui';g.textAlign='center';
   const label=st.name.length>22?st.name.slice(0,21)+'…':st.name;
   g.strokeStyle='#526570';g.lineWidth=3.5*q;g.strokeText(label,top.x,top.y-37*q);
   g.fillStyle='#fffaf1';g.fillText(label,top.x,top.y-37*q);
  }
  // Los vagones exteriores conservan exactamente su diseño v66 por ahora.
  for(const tr of Metro.trains||[]){
   if(tr.route!==line)continue;
   for(let c=2;c>=0;c--){
    const p=Metro.at(tr.s-c*27,line);
    if(!inRange(p.x,p.y))continue;
    const v=w2s(B,p.x,p.y-98);if(!v)continue;
    const q=Math.max(.7,v.s);g.save();g.translate(v.x,v.y);g.rotate(p.ang);
    g.fillStyle='#5e6c78';g.fillRect(-13*q,-5*q,26*q,12*q);
    g.fillStyle='#fffaf0';g.fillRect(-12*q,-10*q,24*q,11*q);
    g.fillStyle=line.color;g.fillRect(-12*q,0,24*q,3*q);
    g.fillStyle='#8cc7d5';for(let n=-8;n<10;n+=6)g.fillRect(n*q,-8*q,4*q,5*q);
    g.restore();
   }
  }
 }
 g.restore();
}
X.HOOKS.screen.push(elevated);
const css=document.createElement('style');
css.textContent=[
'.w66-panel{position:absolute;z-index:46;top:calc(env(safe-area-inset-top) + 56px);left:50%;transform:translateX(-50%);width:min(92vw,370px);display:flex;gap:8px;align-items:center;padding:9px;background:#fff9eeeF;border:2px solid #edbfd0;border-radius:15px;color:#5b7180;box-shadow:0 5px 18px #293f4a44;font:700 11px system-ui}',
'.w66-panel i{width:7px;height:26px;border-radius:4px;flex:none}.w66-panel div{flex:1;min-width:0}.w66-panel b,.w66-panel small{display:block}.w66-panel small{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:9px}.w66-panel button{border:0;background:#edc0d1;border-radius:9px;padding:9px;color:#673f58;font-weight:900}',
'.w66-cabin{position:absolute;inset:0;z-index:49;display:flex;flex-direction:column;background:linear-gradient(#dceaf0,#fff3e8);font:900 11px system-ui;color:#536c7a}.w66-cabin header{padding:calc(env(safe-area-inset-top) + 12px) 11px 10px;display:flex;justify-content:space-between;align-items:center}.w66-cabin button{border:0;border-radius:11px;background:#fff8ed;box-shadow:0 3px #d4b6bf;padding:11px;color:#657382;font-weight:900}',
'.w66-viewport{position:relative;flex:1;min-height:150px;overflow:hidden;background:#9dc4d4}.w66-outside{position:absolute;width:100%;height:100%;object-fit:cover;opacity:.72}.w66-world3d{position:absolute;inset:0;perspective:470px;perspective-origin:50% 52%;overflow:hidden}.w66-car3d{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateY(var(--look,0deg));transition:transform .36s}',
'.w66-floor{position:absolute;top:65%;left:-80%;width:260%;height:120%;background:repeating-linear-gradient(90deg,#d7ccd0 0 5px,#f3e4d4 5px 44px);transform:rotateX(73deg) translateZ(-24px);border-top:8px solid #c9b0b8}.w66-ceiling{position:absolute;top:-55%;left:-80%;width:260%;height:70%;background:#edf2f0;transform:rotateX(-78deg) translateZ(45px);border-bottom:9px solid #ddc7c6}',
'.w66-back{position:absolute;inset:8% 19% 22%;background:linear-gradient(90deg,#d2e4e9,#fff8ee,#d2e4e9);transform:translateZ(-108px);border:8px solid #edd6d0}.w66-exit{text-align:center;margin:18% auto 0;width:46%;height:80%;background:#d1e2e6;border:6px solid #b6c9c9;box-sizing:border-box;font-size:9px;padding-top:20px}',
'.w66-side{position:absolute;top:-30%;height:160%;width:60%;background:#f0e3d9;border:9px solid #c3c8d0;box-sizing:border-box}.w66-left{left:-48%;transform:rotateY(73deg) translateZ(100px)}.w66-right{right:-48%;transform:rotateY(-73deg) translateZ(100px)}.w66-window{height:37%;width:86%;margin:32% auto 0;border:7px solid #e9c7b7;border-radius:14px;background:#86bccc7e}.w66-seat{position:absolute;bottom:12%;height:16%;width:90%;left:5%;background:#cb98b4;border-radius:20px 20px 7px 7px;box-shadow:0 10px 0 #957b96}.w66-pole{position:absolute;top:0;bottom:0;left:48%;border-left:4px solid #dcc4a9;transform:translateZ(55px)}',
'.w66-look,.w66-actions{display:flex;gap:7px;padding:9px}.w66-look button,.w66-actions button{flex:1;font-size:11px}.w66-look button:active{background:#f2c9d8}.w66-note{text-align:center;padding:8px 4px calc(env(safe-area-inset-bottom) + 13px);color:#84969e;font-size:10px}',
'#game.fon-on .w66-cabin,#game.fon-on .w66-panel{display:none!important}#game.fon-on .fon{z-index:150!important}',
'#game.fon-on > #wcWallpaperButton51{z-index:151!important;pointer-events:auto!important}',
'.w66-transfer{position:absolute;z-index:48;bottom:calc(env(safe-area-inset-bottom) + 72px);left:5%;width:90%;background:#fffbf3;border:3px solid #efbfd0;border-radius:17px;padding:13px;box-sizing:border-box;box-shadow:0 8px 28px #334a5677;color:#52657a;font:700 12px system-ui}.w66-transfer b{color:#b6799f}.w66-transfer p{font-size:11px}.w66-transfer nav{display:flex;gap:7px;margin-top:11px}.w66-transfer button{flex:1;padding:11px 5px;border:0;border-radius:10px;background:#f0cadb;color:#68445a;font-size:11px;font-weight:900}.w66-transfer [data-exit]{background:#e6e9ea;color:#657787}'
].join('');
document.head.appendChild(css);

/* Una identidad visual para el metro completo: juego acogedor, no una web superpuesta. */
const charm=document.createElement('style');
charm.textContent=`
.w66-cabin{z-index:79!important;inset:0;background:linear-gradient(160deg,#e0efef,#fef6f3 60%,#f4e7ec);font:750 12px/1.4 system-ui;color:#5b6974;padding:0;box-sizing:border-box}
.w66-shell{width:100%;height:100%;max-width:620px;margin:auto;min-height:0;box-sizing:border-box;display:flex;flex-direction:column;gap:0;padding:calc(env(safe-area-inset-top) + 8px) 12px calc(env(safe-area-inset-bottom) + 9px)}
.w66-topbar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 2px 12px!important;flex:none}
.w66-topbrand{display:flex;align-items:center;gap:10px;min-width:0}
.w66-topbrand .w66-flower{display:grid;place-items:center;width:43px;height:43px;border-radius:17px;background:#fff8f0;color:#df9dbb;font-size:28px;box-shadow:0 3px 0 #d7d9d1;flex:none}
.w66-topbrand div{min-width:0}.w66-topbrand small{display:block;font-size:9px;letter-spacing:1.1px;color:#a37a8f}
.w66-topbrand strong{display:block;font-size:14px;letter-spacing:-.2px;color:#63767b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.w66-topbar button{display:flex;align-items:center;gap:5px;min-height:44px;white-space:nowrap;background:#fffdf8;border:1px solid #eddfe1;box-shadow:0 3px 0 #dedbd6;padding:9px 12px;border-radius:14px;color:#816b7a;font-size:12px}
.w66-car-status{display:flex;align-items:center;gap:10px;flex:none;background:#fffdf9;border:1px solid #efe2e2;border-radius:18px;padding:12px 13px;margin:0 0 12px;box-shadow:0 3px 0 #e5dcdb}
.w66-pulse{width:10px;height:10px;background:var(--line-color,#78b6ae);border:3px solid #f2f7ee;border-radius:50%;box-shadow:0 0 0 2px var(--line-color,#78b6ae);flex:none}
.w66-car-status>div{flex:1;min-width:0}.w66-car-status small{display:block;font:850 9px/1.4 system-ui;letter-spacing:.7px;color:#b08399}.w66-car-status strong{font-size:16px;color:#536e76;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.w66-car-tag{border-radius:9px;background:#e9f3f0;color:#67978b;padding:6px 7px;font-size:9px;flex:none}
.w66-viewport{flex:1;min-height:150px;max-height:56vh;margin:0 0 12px;border:8px solid #fff9f4;border-radius:24px;box-shadow:0 6px 0 #d5cbd0,0 10px 23px #9a939430;overflow:hidden;position:relative;background:#bcd6d2}
.w66-outside{width:100%;height:100%;opacity:.98;filter:saturate(.92);image-rendering:auto}
.w66-world3d{position:absolute;inset:0;perspective:680px;perspective-origin:50% 55%;overflow:hidden;pointer-events:none}
.w66-car3d{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateY(var(--look,0deg));transition:transform .35s ease}
.w66-ceiling{position:absolute;top:-2%;left:0;right:0;height:16%;background:linear-gradient(#e4dde1,#fff8ef);border-bottom:6px solid #d2adb8;transform:perspective(300px) rotateX(-14deg);box-shadow:0 5px 9px #56667025}
.w66-ceiling span{display:flex;justify-content:center;gap:12px;color:#c894af;font-size:18px;opacity:.8}.w66-ceiling i{display:block;background:#fdfcf6;border-radius:8px;width:68px;height:7px;margin-top:8px}
.w66-floor{position:absolute;top:auto;bottom:-25%;left:-30%;width:160%;height:50%;background:repeating-linear-gradient(90deg,#e7d6d9 0 28px,#f7e8e4 28px 31px);border-top:8px solid #be9db0;transform:perspective(340px) rotateX(50deg);box-shadow:0 -10px 13px #4b647a23}
.w66-back{position:absolute;inset:15% 27% 15%;border:9px solid #f7ede8;border-radius:55px 55px 18px 18px;background:linear-gradient(110deg,#b6dadc42,#e8f5ed22,#a6c9d348);box-shadow:0 0 0 4px #c2b3b8,0 5px 16px #516b766b;transform:translateZ(-45px)}
.w66-exit{display:grid;place-content:center;gap:5px;text-align:center;background:#f9f7f2d9;border:1px solid #d1d3ce;border-radius:9px;width:72%;padding:9px 2px;margin:18% auto}.w66-exit span{font-size:22px;color:#c694a9}.w66-exit small{font-size:8px;letter-spacing:.5px;color:#748686}
.w66-side{top:14%;bottom:0;height:auto;width:30%;border:0;border-radius:15px;background:linear-gradient(90deg,#f9f2eb,#e9dae0);box-shadow:inset 0 0 0 6px #e1bfc9}
.w66-left{left:-17%;transform:perspective(350px) rotateY(35deg) translateZ(32px)}.w66-right{right:-17%;transform:perspective(350px) rotateY(-35deg) translateZ(32px)}
.w66-window{width:82%;height:40%;margin:12% auto 0;background:#acdade38;border:6px solid #d3aeb7;border-radius:24px 24px 10px 10px}
.w66-seat{left:8%;bottom:7%;height:20%;width:84%;background:linear-gradient(#e0aec5,#c693b2);border-radius:19px 19px 11px 11px;box-shadow:0 7px 0 #927d9f}
.w66-pole{top:14%;bottom:10%;left:50%;border-left:4px solid #e0c6aa;opacity:.55;transform:translateZ(50px)}
.w66-window-label{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:max-content;max-width:90%;padding:5px 11px;border-radius:13px;background:#fff9f0df;color:#817988;text-align:center;font-size:10px;box-shadow:0 2px 7px #53626c22}
.w66-scenetitle{text-align:center;font:900 11px system-ui;color:#b07c93;margin:4px 0 8px}
.w66-look{display:flex;gap:7px;padding:0 0 12px;flex:none}.w66-look button{flex:1;min-width:0;min-height:43px;font-size:11px;color:#73858b;background:#fff9f1;border:1px solid #e7d8da;box-shadow:0 3px 0 #e0d4d5;border-radius:13px;padding:8px 3px}
.w66-look button[aria-pressed=true]{background:#ffe6ee;color:#a97091;border-color:#d99db6}
.w66-actions{display:flex;gap:9px;padding:0;flex:none}.w66-actions button{flex:1;min-width:0;min-height:49px;font-size:12px;color:#fffdf8;background:#88b6ac;border:2px solid #e6f5ee;border-radius:16px;box-shadow:0 4px 0 #65958e}.w66-actions [data-phone]{background:#e8b1c5;box-shadow:0 4px 0 #b7859d;border-color:#fff3f2;color:#734d65}
.w66-note{margin:11px 0 1px;padding:0;text-align:center;color:#9f9d9f;font-size:10px;line-height:1.4}
.w66-panel{top:calc(env(safe-area-inset-top) + 58px);max-width:350px;width:calc(100% - 25px);min-height:53px;box-sizing:border-box;border:2px solid #fff9f1;border-radius:17px;background:#fffaf2f5;padding:8px 10px;box-shadow:0 4px 12px #5b68773b;gap:10px}
.w66-line-dot{width:9px;height:32px;border-radius:7px;flex:none}.w66-panel div{min-width:0;flex:1}.w66-panel small{display:block;color:#9a8994;font-size:9px;line-height:1.35}.w66-panel b{font-size:13px;color:#557278}.w66-panel button{min-height:41px;padding:7px 9px;border-radius:11px;background:#efd2df;color:#865c73;font-size:11px}
.w66-transfer{display:flex;flex-direction:column;gap:9px;z-index:96;bottom:calc(env(safe-area-inset-bottom) + 25px);left:50%;transform:translateX(-50%);width:min(92vw,350px);border:3px solid #fff4e4;border-radius:25px;background:#fffaf6;padding:18px 16px 16px;box-shadow:0 15px 40px #263d4659;color:#62747d;font-size:12px}
.w66-transfer-flowers{text-align:center;font-size:18px;color:#d7a1b6}.w66-transfer-eyebrow{text-align:center;letter-spacing:1.7px;color:#b6809c;font-size:10px}.w66-transfer h3{text-align:center;font-size:19px;margin:0;color:#606e76}.w66-transfer p{font-size:11px;margin:0;line-height:1.5;color:#768687}
.w66-transfer-line{display:flex;gap:10px;align-items:center;border:1px solid #e7e4de;border-radius:14px;background:#f8fbf8;padding:12px}
.w66-transfer-line i{width:7px;height:37px;border-radius:7px}.w66-transfer-line small{font-size:9px;color:#a77e91;display:block}.w66-transfer-line b{font-size:13px;color:#55727a}
.w66-transfer-instruction{padding:4px 0}.w66-transfer-status{border-radius:11px;padding:9px 10px;background:#fff1e8;color:#9b7e74;font-size:10px}
.w66-transfer nav{display:flex;flex-direction:column;gap:7px;margin:1px 0 0}
.w66-transfer button{min-height:45px;font-size:12px;border-radius:13px;background:#dfabc2;color:#fffaf8;box-shadow:0 3px 0 #b8849b}.w66-transfer [data-exit]{background:#f0eeeb;color:#778a8d;box-shadow:0 2px 0 #d9d7d4}
@media(max-height:630px){.w66-topbar{padding:1px 2px 6px!important}.w66-car-status{padding:7px 10px;margin-bottom:8px}.w66-look{padding-bottom:8px}.w66-note{display:none}.w66-viewport{margin-bottom:7px;min-height:100px}}
`;
document.head.appendChild(charm);
old.rideDisplay=rideDisplay;old.removeCoach=()=>{clearCabin();clearPanel()};
function onExit(){clearCabin();clearPanel()}
window.WalesaMetro66={ELEV,rideDisplay,setView,transfer,closeTransfer,clearCabin,onExit,elevated:true,get mode(){return mode},get inside(){return !!cabin},get transferOpen(){return !!transferBox},renderElevated:elevated};
})();
