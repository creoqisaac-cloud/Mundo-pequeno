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
 cabin=document.createElement('div');cabin.className='w66-cabin';
 cabin.innerHTML='<header>✿ VAGÓN DE WALESA <button data-view>🌳 Exterior</button></header>'+
 '<div class="w66-viewport"><canvas width="320" height="180" class="w66-outside"></canvas>'+
 '<div class="w66-world3d"><div class="w66-car3d">'+
 '<div class="w66-ceiling"></div><div class="w66-floor"></div>'+
 '<div class="w66-back"><div class="w66-exit">✦ SIGUIENTE PARADA ✦</div></div>'+
 '<div class="w66-side w66-left"><div class="w66-window"></div><div class="w66-seat"></div></div>'+
 '<div class="w66-side w66-right"><div class="w66-window"></div><div class="w66-seat"></div></div>'+
 '<div class="w66-pole"></div></div></div></div>'+
 '<nav class="w66-look"><button data-turn="-55">◀ Ventana</button><button data-turn="0">Frente</button><button data-turn="55">Pasillo ▶</button></nav>'+
 '<nav class="w66-actions"><button data-phone>📱 Usar celular</button><button data-view>🚝 Ver recorrido</button></nav>'+
 '<small class="w66-note">El mundo continúa moviéndose mientras estás dentro ♡</small>';
 document.getElementById('game').appendChild(cabin);
 cabin.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView('exterior'));
 cabin.querySelectorAll('[data-turn]').forEach(b=>b.onclick=()=>{angle=+b.dataset.turn;cabin.style.setProperty('--look',angle+'deg')});
 cabin.querySelector('[data-phone]').onclick=()=>{window.Fon?.open();if(!document.querySelector('.fon.on'))X.toast('Teléfono no disponible')};
 cabin.style.setProperty('--look',angle+'deg');return true;
}
function rideDisplay({ride}){
 if(!ride){clearCabin();clearPanel();return}
 const tr=ride.tr,r=tr.route;
 if(!panel){panel=document.createElement('div');panel.className='w66-panel';document.getElementById('game').appendChild(panel)}
 const nx=r.ST.map(s=>({s,d:((s.s-tr.s)%r.L+r.L)%r.L})).filter(v=>v.d>2).sort((a,b)=>a.d-b.d)[0]?.s||r.ST[0];
 const id=r.id+nx.name+ride.dest.name;
 if(panel.dataset.id!==id){
  panel.dataset.id=id;panel.innerHTML='<i style="background:'+r.color+'"></i><div><b>'+esc(r.name)+'</b><small>Próxima: '+esc(nx.name)+' · Destino: '+esc(ride.dest.name)+'</small></div><button data-interior>🚝 Vista 3D</button>';
  panel.querySelector('button').onclick=()=>setView(mode==='interior'?'exterior':'interior');
 }
 if(mode==='interior'){
  setView('interior');
  copyFrames++;
  if(copyFrames%8===0){
   try{const c=cabin.querySelector('.w66-outside'),g=c.getContext('2d');g.drawImage(document.getElementById('cv'),0,0,320,180)}catch(e){}
  }
 }
}
function closeTransfer(){if(transferBox){transferBox.remove();transferBox=null}}
function transfer(next,station){
 clearCabin();clearPanel();closeTransfer();
 transferBox=document.createElement('div');transferBox.className='w66-transfer';
 transferBox.innerHTML='<b>🔁 Transbordo en '+esc(station.name)+'</b><p>Tu boleto incluye el cambio de línea. Camina al siguiente andén y espera otro tren.</p>'+
 '<strong style="color:'+next.route.color+'">● '+esc(next.route.name)+'</strong>'+
 '<nav><button data-next>🚇 Esperar siguiente tren</button><button data-exit>🚪 Salir</button></nav>';
 document.getElementById('game').appendChild(transferBox);
 transferBox.querySelector('[data-next]').onclick=()=>{closeTransfer();if(Metro.depart(next.from,next.to))X.toast('🚇 Esperando el tren de '+next.route.name);else X.toast('El andén no está disponible')};
 transferBox.querySelector('[data-exit]').onclick=()=>{closeTransfer();old.cancelJourney?.();X.toast('Saliste de la estación')};
 return true;
}
const segment=(g,a,b,width,color)=>{g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()};
function elevated(g,B,w2s){
 if(!window.Metro?.R||X.M()!==V.MAIN||X.st.scene!=='out')return;
 const px=X.player.x,py=X.player.y;
 g.save();g.lineCap='round';g.lineJoin='round';
 for(const line of Metro.R.lines){
  const pts=line.P;if(!pts?.length)continue;
  const stride=Math.max(1,Math.ceil(pts.length/1100));
  const close=[];
  for(let i=0;i<pts.length;i+=stride){const p=pts[i];if(Math.abs(p[0]-px)<530&&Math.abs(p[1]-py)<530)close.push({i,p})}
  if(!close.length)continue;
  // Viaducto: sombra en el pavimento, columnas, cara inferior, tablero y barandales.
  const pillarStep=Math.max(24,Math.floor(pts.length/42));
  for(let i=0;i<pts.length;i+=pillarStep){
   const p=pts[i];if(Math.abs(p[0]-px)>500||Math.abs(p[1]-py)>500)continue;
   const base=w2s(B,p[0],p[1]),top=w2s(B,p[0],p[1]-92);if(!base||!top)continue;
   g.fillStyle='rgba(50,66,80,.16)';g.beginPath();g.ellipse(base.x+4,base.y+4,13*base.s,5*base.s,0,0,Math.PI*2);g.fill();
   segment(g,base,top,7*base.s,'#919ca4');segment(g,{x:base.x-2,y:base.y},{x:top.x-2,y:top.y},4*base.s,'#eee5dc');
   g.fillStyle='#b4a2a6';g.fillRect(top.x-8*top.s,top.y-3*top.s,16*top.s,5*top.s);
  }
  for(const [w,col,yoff] of [[15,'#8e9da6',6],[12,'#e7dfd2',2],[7,'#cbd4d7',0],[2.5,line.color,-3]]){
   let prev=null,prior=-100;
   for(const z of close){
    const p=w2s(B,z.p[0],z.p[1]-92+yoff);
    if(prev&&p&&z.i-prior<stride*3)segment(g,prev,p,w*Math.max(.65,p.s),col);
    prev=p;prior=z.i;
   }
  }
  // Andenes bajo techos, cristales y escaleras reales desde el suelo.
  for(const st of line.ST){
   if(Math.abs(st.px-px)>510||Math.abs(st.py-py)>510)continue;
   const ground=w2s(B,st.px,st.py),top=w2s(B,st.px,st.py-92);if(!ground||!top)continue;
   const q=Math.max(.7,top.s),width=60*q;
   segment(g,ground,{x:top.x+18*q,y:top.y+7*q},5*q,'#b89e9c');
   for(let j=1;j<=7;j++){const u=j/8;const sx=ground.x+(top.x+18*q-ground.x)*u,sy=ground.y+(top.y+7*q-ground.y)*u;segment(g,{x:sx-8*q,y:sy},{x:sx+7*q,y:sy},1.3*q,'#fff0df')}
   g.fillStyle='#d0bfc0';g.fillRect(top.x-width/2,top.y-3*q,width,9*q);
   g.fillStyle='#f9eff4';g.fillRect(top.x-width/2,top.y-27*q,width,25*q);
   g.fillStyle='#a9d6e7';g.fillRect(top.x-width/2+5*q,top.y-23*q,width-10*q,17*q);
   g.fillStyle=line.color;g.fillRect(top.x-width/2-3*q,top.y-32*q,width+6*q,7*q);
   g.font='900 '+Math.max(8,8*q)+'px system-ui';g.textAlign='center';g.lineWidth=2.6;g.strokeStyle='#40546b';g.strokeText(st.name,top.x,top.y-37*q);g.fillStyle='#fff';g.fillText(st.name,top.x,top.y-37*q);
  }
  // Vagones exteriores con 3 cuerpos y ventanas.
  for(const tr of Metro.trains){
   if(tr.route!==line)continue;
   for(let c=2;c>=0;c--){const p=Metro.at(tr.s-c*27,line);
    if(Math.abs(p.x-px)>500||Math.abs(p.y-py)>500)continue;
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
'.w66-transfer{position:absolute;z-index:48;bottom:calc(env(safe-area-inset-bottom) + 72px);left:5%;width:90%;background:#fffbf3;border:3px solid #efbfd0;border-radius:17px;padding:13px;box-sizing:border-box;box-shadow:0 8px 28px #334a5677;color:#52657a;font:700 12px system-ui}.w66-transfer b{color:#b6799f}.w66-transfer p{font-size:11px}.w66-transfer nav{display:flex;gap:7px;margin-top:11px}.w66-transfer button{flex:1;padding:11px 5px;border:0;border-radius:10px;background:#f0cadb;color:#68445a;font-size:11px;font-weight:900}.w66-transfer [data-exit]{background:#e6e9ea;color:#657787}'
].join('');
document.head.appendChild(css);
old.rideDisplay=rideDisplay;old.removeCoach=()=>{clearCabin();clearPanel()};
window.WalesaMetro66={ELEV,rideDisplay,setView,transfer,closeTransfer,clearCabin,elevated:true,get mode(){return mode},get inside(){return !!cabin},get transferOpen(){return !!transferBox},renderElevated:elevated};
})();
