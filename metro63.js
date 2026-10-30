/* Isla de Walesa · Metro v63: tren elevado, taquilla y abordaje real. */
(function(){
'use strict';
const old=window.WalesaMetro62,oldPhone=window.WalesaMetro61,X=Game.X,G=Game.G,V=World;
if(!old||!oldPhone||!X||!G||!V)return;
const COST=45,ELEV=66,MAX_NEAR=118;
let page='red',from='',to='',atStation=null,popup=null,hud=null,lastTicketState='';
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const all=()=>window.Metro?.R?.ST||[];
const hubs=()=>[...new Set(all().map(s=>s.name))];
const group=name=>all().filter(s=>s.name===name);
const closeBy=(s,r=MAX_NEAR)=>s&&Math.hypot(X.player.x-s.px,X.player.y-s.py)<r;
const nearest=()=>all().slice().sort((a,b)=>Math.hypot(a.px-X.player.x,a.py-X.player.y)-Math.hypot(b.px-X.player.x,b.py-X.player.y))[0];
const ticket=()=>save.metroPass63&&save.metroPass63.used!==true?save.metroPass63:null;
const route=()=>old.plan(from,to);
const locate=name=>{
 const st=group(name)[0];
 if(!st)return;
 if(window.WalesaMainland?.startGuide)WalesaMainland.startGuide({x:st.px,y:st.py+8,name:'🚉 Estación '+name});
 X.toast('🧭 Sigue la guía hasta '+name);
};
const persist=()=>{try{G.save()}catch(e){console.warn('Metro ticket save',e)}};
function buy(){
 const j=route();if(!j||!j.legs.length){X.toast('Elige un destino con conexión');return false}
 if(ticket()){X.toast('🎟 Ya tienes un boleto sin usar');return false}
 if((save.bells||0)<COST){X.toast('Faltan campanas para tu boleto: '+COST+' 🔔');return false}
 G.addBells(-COST,true);
 save.metroPass63={from,to,cost:COST,used:false,created:Date.now()};
 persist();X.toast('🎟 ¡Boleto listo! Ve a la estación '+from);return true;
}
function closeStation(){
 if(popup){popup.remove();popup=null}
 if(!document.querySelector('.fon.on'))X.st.menu=false;
}
function board(){
 const pass=ticket();if(!pass){X.toast('🎟 Primero necesitas comprar un boleto');return false}
 const origin=group(pass.from).find(s=>closeBy(s))||group(pass.from)[0];
 if(!closeBy(origin)){locate(pass.from);return false}
 const j=old.plan(pass.from,pass.to);if(!j)return false;
 // La ruta conserva sus transbordos; el motor espera al tren real del andén.
 closeStation();const ok=old.begin(j);
 if(ok){save.metroPass63.used=true;persist();X.toast('🎟 Boleto validado · espera el tren en el andén')}
 return ok;
}
function openStation(st){
 if(!st)return false;
 atStation=st.name;from=st.name;if(!to||to===from)to=hubs().find(x=>x!==from)||from;
 if(popup)closeStation();
 popup=document.createElement('div');popup.className='w63-overlay';
 popup.innerHTML='<section class="w63-station"><button type="button" data-close class="w63-x" aria-label="Cerrar estación">×</button><div class="w63-station-body"></div></section>';
 document.getElementById('game').appendChild(popup);X.resetInput();X.st.menu=true;
 popup.querySelector('[data-close]').onclick=closeStation;
 render({scr:popup.querySelector('.w63-station-body'),bar:()=>'',hd:()=>'',back:()=>{}},true);
 return true;
}
function render(o,inStation=false){
 const {scr,bar,hd,back}=o;
 if(!all().length){scr.innerHTML=bar()+hd('🚇 Metro')+'<div class="lst">Los trenes están llegando…</div>';back();return}
 const names=hubs(),near=nearest();if(!from||!names.includes(from))from=near.name;
 if(!to||!names.includes(to)||from===to)to=names.find(n=>n!==from)||from;
 const pass=ticket(),j=route(),lines=window.Metro.R.lines;
 const list=names.slice().sort((a,b)=>a.localeCompare(b,'es')).map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join('');
 const mapX=x=>Math.round(13+x/6800*290),mapY=y=>Math.round(11+y/4630*190);
 const selectedLines=lines.map(l=>{
  const coords=l.ST.map(s=>mapX(s.px)+','+mapY(s.py)).join(' ');
  return '<polyline points="'+coords+'" fill="none" stroke="'+l.color+'" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>';
 }).join('');
 const stationDots=all().filter((s,i,a)=>a.findIndex(b=>b.name===s.name)===i).map(s=>{
   const x=mapX(s.px),y=mapY(s.py),transfer=group(s.name).length>1;
   return '<g data-pick="'+safe(s.name)+'" role="button" tabindex="0" aria-label="Destino '+safe(s.name)+'"><circle cx="'+x+'" cy="'+y+'" r="'+(transfer?6:4.2)+'" stroke="#426173" stroke-width="1.5" fill="'+(s.name===to?'#ffcf84':'#fff')+'"/>'+
    (transfer?'<circle cx="'+x+'" cy="'+y+'" r="1.7" fill="#426173"/>':'')+'</g>';
 }).join('');
 const legs=j?j.legs.map((l,i)=>'<div class="w63-leg"><i style="background:'+l.route.color+'"></i><div><b>'+safe(l.from.name)+' <span>→</span> '+safe(l.to.name)+'</b><small>'+safe(l.route.name)+(i<j.legs.length-1?' · 🔁 Cambia aquí':' · salida final')+'</small></div></div>').join(''):'<p class="w63-hint">Elige origen y destino para ver el recorrido.</p>';
 const myPass=pass?'<div class="w63-pass"><div><small>🎟 TU BOLETO</small><strong>'+safe(pass.from)+' → '+safe(pass.to)+'</strong><span>Pagado · válido para un viaje con transbordos</span></div><span class="w63-ticket-hole">✿</span></div>':'';
 const atOrigin=pass&&group(pass.from).some(s=>closeBy(s));
 const header=inStation?'<div class="w63-kiosk"><span>🚉 ESTACIÓN ELEVADA</span><strong>'+safe(atStation||from)+'</strong><small>Taquilla y acceso al andén</small></div>':
 '<div class="w63-kiosk"><span>✿ WALESA · TRANSPORTE</span><strong>Metro de las Nubecitas</strong><small>Trenes elevados que atraviesan tu mundo ♡</small></div>';
 const current=pass?'<div class="w63-help">Tu boleto es de <b>'+safe(pass.from)+'</b> a <b>'+safe(pass.to)+'</b>. Puedes usarlo al llegar a su estación de origen.</div>':'';
 const action=pass?(atOrigin&&inStation?'<button data-board class="w63-primary">🚉 Pasar torniquete y esperar tren</button>':
 '<button data-guide class="w63-primary">🧭 Ir a mi estación de salida</button>'):
 '<button data-buy class="w63-primary">🎟 Comprar boleto · '+COST+' 🔔</button>';
 scr.innerHTML=bar()+hd(inStation?'Estación':'🚇 Metro de Walesa')+
 '<div class="w63-app">'+header+
 '<nav class="w63-tabs" aria-label="Menú del metro"><button data-tab="red" aria-pressed="'+(page==='red')+'">🗺 Plano</button><button data-tab="boleto" aria-pressed="'+(page==='boleto')+'">🎟 Boletos</button></nav>'+
 (page==='red'?'<section class="w63-paper"><div class="w63-section-title">✦ Líneas y estaciones</div><svg viewBox="0 0 318 211" aria-label="Plano del metro. Toca una estación para elegirla" role="img">'+
 '<rect x="2" y="2" width="314" height="207" rx="11" fill="#fefcf3"/>'+
 '<path d="M22 45H295M22 115H295M22 180H295" stroke="#dcebea" stroke-width=".8"/>'+selectedLines+stationDots+'</svg>'+
 '<div class="w63-map-hint">Toca un circulito para marcar destino ✦ Doble círculo: transbordo</div></section>'+
 '<div class="w63-lines">'+lines.map(l=>'<span><i style="background:'+l.color+'"></i>'+safe(l.name)+'</span>').join('')+'</div>':'')+
 '<section class="w63-choose"><label>🚉 Sales desde<select data-from '+(inStation?'disabled':'')+'>'+list+'</select></label><label>🌷 Quieres ir a<select data-to>'+list+'</select></label></section>'+
 '<section class="w63-journey"><div class="w63-section-title">✦ Tu recorrido <span>'+(j?j.legs.length+' tren(es) · '+j.transfers+' transbordo(s)':'Sin conexión')+'</span></div>'+legs+'</section>'+
 myPass+current+
 '<div class="w63-actions">'+action+'</div>'+
 '<div class="w63-bottom">💌 1 boleto cubre todo el viaje, incluidos los transbordos.<br>Los trenes se esperan y abordan desde las estaciones del mundo.</div>'+
 '</div>';
 scr.querySelector('[data-from]').value=from;scr.querySelector('[data-to]').value=to;
 const rf=()=>{if(inStation)from=atStation;else from=scr.querySelector('[data-from]').value;to=scr.querySelector('[data-to]').value;render(o,inStation)};
 scr.querySelector('[data-from]').onchange=rf;scr.querySelector('[data-to]').onchange=rf;
 scr.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{page=b.dataset.tab;render(o,inStation)});
 scr.querySelectorAll('[data-pick]').forEach(n=>{let click=()=>{to=n.dataset.pick;page='boleto';render(o,inStation)};n.onclick=click;n.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();click()}}});
 const purchase=scr.querySelector('[data-buy]');if(purchase)purchase.onclick=()=>{if(buy()){page='boleto';render(o,inStation)}};
 const guide=scr.querySelector('[data-guide]');if(guide)guide.onclick=()=>{locate(pass.from);if(inStation)closeStation()};
 const boarding=scr.querySelector('[data-board]');if(boarding)boarding.onclick=board;
 back();
}
function rideDisplay({ride}){
 if(!ride)return;
 if(!hud){hud=document.createElement('div');hud.className='w63-ride-hud';document.getElementById('game').appendChild(hud)}
 const tr=ride.tr,r=tr.route;
 const next=r.ST.map(s=>({s,d:((s.s-tr.s)%r.L+r.L)%r.L})).filter(a=>a.d>3).sort((a,b)=>a.d-b.d)[0]?.s||r.ST[0];
 const stamp=r.id+':'+next.name+':'+ride.dest.name;
 if(hud.dataset.stamp!==stamp){hud.dataset.stamp=stamp;hud.innerHTML='<div class="w63-hud-row"><span style="color:'+r.color+'">●</span><strong>'+safe(r.name)+'</strong><span>🚝</span></div>'+
 '<div><small>Próxima estación</small><b>'+safe(next.name)+'</b></div><div class="w63-hud-goal">Bajarás en '+safe(ride.dest.name)+'</div>'}
}
function removeHud(){if(hud){hud.remove();hud=null}}
const previousArrival=old.onArrival;
function arrived(st){removeHud();previousArrival(st);const pass=save.metroPass63;
 if(pass?.used&&(!old.active||old.active.index>=old.active.legs.length)){save.metroPass63=null;persist()}
}
function draw(){
 // Los rieles son decorativos: quedan a 66 unidades de altura; no cambian la colisión de las calles.
 const H=X.HOOKS;
 H.ground.push((g,ox,oy)=>{
  if(!window.Metro?.R||X.M()!==V.MAIN||X.st.scene!=='out')return;
  const x=X.player.x,y=X.player.y;
  g.save();g.lineCap='round';
  for(const l of Metro.R.lines){
   const pts=l.P,step=10;
   g.beginPath();let pen=false;
   for(let k=0;k<=pts.length;k+=step){
    const p=pts[k%pts.length];if(Math.abs(p[0]-x)>520||Math.abs(p[1]-y)>520){pen=false;continue}
    if(!pen){g.moveTo(p[0]-ox,p[1]-oy);pen=true}else g.lineTo(p[0]-ox,p[1]-oy)
   }
   g.strokeStyle='rgba(37,57,68,.08)';g.lineWidth=16;g.stroke();
  }g.restore();
 });
 H.bill.push((bill)=>{
  if(!window.Metro?.R||X.M()!==V.MAIN||X.st.scene!=='out')return;
  const unique=new Set();
  for(const st of Metro.R.ST){
   if(unique.has(st.name)||Math.hypot(st.px-X.player.x,st.py-X.player.y)>500)continue;
   unique.add(st.name);
   bill.push({x:st.px,y:st.py-3,draw:g=>{
    // Entrada peatonal con escalera y marco de estación; no bloquea el camino.
    g.save();g.translate(0,-6);
    g.fillStyle='#c8b5a6';g.fillRect(-18,-21,36,4);
    g.fillStyle='#fff6ee';g.fillRect(-15,-26,30,8);
    g.fillStyle='#da9db4';g.fillRect(-15,-28,30,3);
    g.fillStyle='#7b93a1';g.font='bold 6px system-ui';g.textAlign='center';g.fillText('🚉 METRO',0,-19);
    g.fillStyle='#eadccb';g.beginPath();g.moveTo(-7,-14);g.lineTo(7,-14);g.lineTo(12,4);g.lineTo(-12,4);g.closePath();g.fill();
    g.strokeStyle='#bfac9b';g.lineWidth=1;for(let n=0;n<6;n++){const yy=-10+n*2.7;g.beginPath();g.moveTo(-7-n*.7,yy);g.lineTo(7+n*.7,yy);g.stroke()}
    g.strokeStyle='#c68795';g.lineWidth=1.3;for(const x of[-10,10]){g.beginPath();g.moveTo(x,-13);g.lineTo(x*1.3,5);g.stroke()}
    g.restore();
   }});
  }
 });
 H.screen.push((g,B,w2s,t)=>{
  if(!window.Metro?.R||X.M()!==V.MAIN||X.st.scene!=='out')return;
  const xp=X.player.x,yp=X.player.y,lines=Metro.R.lines;
  g.save();g.lineCap='round';g.lineJoin='round';
  for(const l of lines){
   const pts=l.P,step=5,stops=l.ST;
   // Pilastras independientes cada cierto trecho, nunca actúan como obstáculos.
   for(let k=0;k<pts.length;k+=32){
    const a=pts[k];if(Math.abs(a[0]-xp)>550||Math.abs(a[1]-yp)>550)continue;
    const ground=w2s(B,a[0],a[1]),top=w2s(B,a[0],a[1]-ELEV);
    if(!ground||!top||ground.x< -100||ground.x>g.canvas.width+100||ground.y< -100||ground.y>g.canvas.height+100)continue;
    g.strokeStyle='rgba(43,65,75,.24)';g.lineWidth=6*ground.s;g.beginPath();g.moveTo(ground.x+2*ground.s,ground.y);g.lineTo(top.x+2*top.s,top.y);g.stroke();
    g.strokeStyle='#ddd9cb';g.lineWidth=4.8*top.s;g.beginPath();g.moveTo(ground.x,ground.y);g.lineTo(top.x,top.y);g.stroke();
    g.fillStyle='#f4e9de';g.fillRect(top.x-8*top.s,top.y-3*top.s,16*top.s,5*top.s);
   }
   // Viaducto angosto y continuo, con rieles gemelos y barandal del color de la línea.
   for(const [thick,color] of [[12,'#71858c'],[9,'#f0e6d9'],[5.5,'#718f96'],[2.5,l.color]]){
    g.beginPath();let pen=false;
    for(let k=0;k<=pts.length;k+=step){
     const a=pts[k%pts.length];
     if(Math.abs(a[0]-xp)>590||Math.abs(a[1]-yp)>590){pen=false;continue}
     const v=w2s(B,a[0],a[1]-ELEV);
     if(!v){pen=false;continue}
     if(!pen){g.moveTo(v.x,v.y);pen=true}else g.lineTo(v.x,v.y)
    }
    g.strokeStyle=color;g.lineWidth=thick;g.stroke();
   }
   for(const st of stops){
    if(Math.abs(st.px-xp)>560||Math.abs(st.py-yp)>560)continue;
    const top=w2s(B,st.x,st.y-ELEV),ground=w2s(B,st.px,st.py);
    if(!top||!ground)continue;
    const w=56*top.s,h=19*top.s;
    g.fillStyle='#cebda5';g.fillRect(top.x-w/2,top.y-h/2,w,h);
    g.fillStyle='#fff2e8';g.fillRect(top.x-w/2+3,top.y-h/2+1,w-6,h-4);
    g.fillStyle=l.color;g.fillRect(top.x-w/2+3,top.y-h/2,w-6,2.3*top.s);
    g.strokeStyle='#ece0d6';g.lineWidth=2*ground.s;g.beginPath();g.moveTo(ground.x+9*ground.s,ground.y);g.lineTo(top.x+18*top.s,top.y);g.stroke();
    g.fillStyle='#f7f0dc';g.font='bold '+Math.max(8,9*top.s)+'px system-ui';g.textAlign='center';
    g.strokeStyle='#355064';g.lineWidth=3;g.strokeText(st.name,top.x,top.y-12*top.s);g.fillText(st.name,top.x,top.y-12*top.s);
   }
   for(const tr of Metro.trains||[]){
    if(tr.route!==l)continue;
    for(let j=2;j>=0;j--){
     const p=Metro.at(tr.s-j*22,l);
     if(Math.abs(p.x-xp)>550||Math.abs(p.y-yp)>550)continue;
     const v=w2s(B,p.x,p.y-ELEV-5);if(!v)continue;
     g.save();g.translate(v.x,v.y);g.rotate(p.ang);
     const sc=Math.max(.65,Math.min(2,v.s));
     g.fillStyle='#4a5760';g.fillRect(-13*sc,-6*sc,26*sc,12*sc);
     g.fillStyle='#fff7ee';g.fillRect(-12*sc,-8*sc,24*sc,11*sc);
     g.fillStyle=l.color;g.fillRect(-12*sc,1*sc,24*sc,3*sc);
     g.fillStyle='#96d5e5';for(let x=-8;x<10;x+=6)g.fillRect(x*sc,-6*sc,4*sc,4*sc);
     if(j===0){g.fillStyle='#fff5a7';g.fillRect(10*sc,-4*sc,2*sc,3*sc)}
     g.restore();
    }
   }
  }
  g.restore();
 });
}
const css=document.createElement('style');css.textContent=
 '.w63-app{flex:1;min-height:0;overflow-y:auto;padding:8px 10px 22px;background:linear-gradient(#fffaf4,#f3f9f4);font:700 11px/1.45 system-ui;color:#496875;-webkit-overflow-scrolling:touch}'+
 '.w63-kiosk{display:flex;flex-direction:column;gap:3px;padding:15px;border-radius:16px;background:linear-gradient(110deg,#f9b9c8,#ffe2b4);color:#704d69;border:2px solid #fff;box-shadow:0 4px 0 #e4c5ba;margin-bottom:12px}.w63-kiosk span{letter-spacing:2px;font-size:9px}.w63-kiosk strong{font:900 19px/1.2 system-ui}.w63-kiosk small{font-size:10px}'+
 '.w63-tabs{display:flex;padding:4px;background:#ebf2ef;border-radius:15px;gap:5px;margin-bottom:11px}.w63-tabs button{flex:1;border:0;border-radius:11px;min-height:37px;background:transparent;color:#60817f;font:900 12px system-ui}.w63-tabs [aria-pressed=true]{background:#fff;box-shadow:0 2px 0 #d7e3dd;color:#d27d98}'+
 '.w63-paper{background:#fffefa;border:2px solid #e9dccb;border-radius:16px;overflow:hidden;box-shadow:0 4px 0 #eee6d8}.w63-paper svg{display:block;width:100%;height:auto;touch-action:manipulation}.w63-paper [data-pick]{cursor:pointer}.w63-section-title{padding:9px 10px 1px;color:#ab7184;font:900 12px system-ui;display:flex;justify-content:space-between}.w63-section-title span{font-size:9px;color:#7a9790}.w63-map-hint{padding:7px 9px;font-size:9px;color:#769496}'+
 '.w63-lines{display:flex;gap:5px;overflow-x:auto;padding:9px 0}.w63-lines span{display:flex;align-items:center;gap:5px;white-space:nowrap;background:#fff;border-radius:13px;padding:6px;font:800 9px system-ui}.w63-lines i{width:8px;height:8px;border-radius:50%}'+
 '.w63-choose{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.w63-choose label{font-size:10px;color:#ab7184;font-weight:900;min-width:0}.w63-choose select{display:block;width:100%;max-width:100%;padding:9px 5px;margin-top:4px;border:2px solid #e4d2d8;border-radius:11px;background:white;color:#496878;font:800 10px system-ui}'+
 '.w63-journey{background:#fff;border:1px solid #e4dfd1;border-radius:15px;padding:7px;margin-bottom:12px}.w63-leg{display:flex;align-items:center;gap:8px;border-top:1px dashed #e4e5dc;padding:9px 5px}.w63-leg>i{height:26px;width:6px;border-radius:7px;flex-shrink:0}.w63-leg b{display:block;color:#456479;font-size:11px}.w63-leg b span{color:#d6a6a2}.w63-leg small{font-size:9px;color:#7d9496}.w63-hint{padding:9px;color:#8da4a3}'+
 '.w63-pass{position:relative;padding:14px;background:#fef0b4;border:2px dashed #d9a768;border-radius:15px;color:#865e53;margin:10px 0;display:flex;justify-content:space-between}.w63-pass div{display:flex;flex-direction:column;gap:4px}.w63-pass small{letter-spacing:1px;font-size:9px}.w63-pass strong{font-size:12px}.w63-pass span{font-size:10px}.w63-ticket-hole{font-size:35px!important;color:#cc9a80}.w63-help{margin:9px 0;font-size:10px;color:#a07675}'+
 '.w63-primary{display:block;width:100%;border:0;border-radius:14px;background:#eab0c0;color:#6b4661;box-shadow:0 4px 0 #c88f9f;font:900 12px system-ui;padding:13px 8px;min-height:46px}.w63-bottom{text-align:center;font-size:10px;color:#88a09b;margin:13px 0}.w63-overlay{position:absolute;inset:0;z-index:88;background:#253f4bbd;display:grid;place-items:center;padding:15px}.w63-station{position:relative;max-height:94%;width:min(100%,380px);display:flex;flex-direction:column;border-radius:20px;border:4px solid #fae3d1;background:#fffaf4;box-shadow:0 16px 48px #0008;overflow:hidden}.w63-station-body{display:flex;flex-direction:column;overflow:auto;min-height:0}.w63-x{position:absolute;right:9px;top:9px;z-index:3;border:0;background:#fff;border-radius:50%;font:900 21px system-ui;color:#b07f91;width:32px;height:32px}'+
 '.w63-ride-hud{position:absolute;z-index:72;top:calc(env(safe-area-inset-top) + 50px);left:50%;transform:translateX(-50%);width:min(78vw,295px);pointer-events:none;padding:9px 12px;background:rgba(255,249,237,.93);border:2px solid #f0bbcb;border-radius:15px;box-shadow:0 4px 12px #283f4d55;text-align:center;color:#576e80;font:800 11px system-ui}.w63-hud-row{display:flex;align-items:center;gap:8px;justify-content:center;font-size:9px}.w63-ride-hud small{display:block;color:#a77b95}.w63-ride-hud b{display:block;font-size:14px}.w63-hud-goal{font-size:9px;color:#8e9aa1;margin-top:3px}';
document.head.appendChild(css);
// Sustituir los controles genéricos antiguos sin alterar rutas ni datos.
oldPhone.render=render;old.render=render;old.openStation=openStation;old.rideDisplay=rideDisplay;old.removeCoach=removeHud;
const baseArrival=old.onArrival;old.onArrival=arrived;
// El motor original consume estas funciones de la propiedad WalesaMetro62.
window.WalesaMetro63={render,openStation,buy,board,closeStation,rideDisplay,removeHud,arrived,COST,get ticket(){return ticket()},elevated:true};
draw();
})();
