/* Metro v62: red expresa subterranea, itinerarios con transbordo y mapa interactivo. */
(function(){
'use strict';
const places={
 A:[760,1100,'La Playa'],B:[1660,690,'Ciudad Corazón'],C:[2675,930,'Acceso Continental'],
 F:[3480,880,'Cordillera'],O:[3770,2310,'Pueblo de Walesa'],Q:[3600,3940,'Ciudad del Sur'],
 R:[5320,4040,'Jardín del Sur'],S:[5840,3650,'Bosque Profundo'],I:[4820,1620,'Bosque Alto'],
 J:[5310,1490,'Puerto de Meseta'],L:[6100,2590,'Terminal del Faro'],M:[5300,2290,'Meseta Oriental'],
 U:[750,2300,'Isla Azahar'],T:[1880,3800,'Isla Luciérnaga'],P:[3690,3100,'Puerta Sur']
};
const defs=[
 ['costera62','Costera Azul','#3385c7','ABCOML',240],
 ['sierra62','Sierra Verde','#399b75','CFILSQ',240],
 ['sur62','Expreso del Sur','#ec9145','OQRLM',235],
 ['islas62','Archipiélago','#9864c4','AUTQOB',245],
 ['circular62','Diagonal Dorada','#d5a53a','BFJL RPO'.replace(/ /g,''),240]
];
const routes=defs.map(([id,name,color,keys,speed])=>({id,name,color,speed,
 points:[...keys].map(k=>places[k].slice(0,2)),stops:[...keys].map(k=>[places[k][2],places[k][0],places[k][1]])}));
if(window.WalesaOverworld60&&window.WalesaMetro61){
 window.WalesaOverworld60.lines.splice(0,window.WalesaOverworld60.lines.length,...routes);
 window.WalesaMetro61.routes.splice(0,window.WalesaMetro61.routes.length,...routes);
}
let tab='mapa',selected='costera62',fromHub='',toHub='Pueblo de Walesa',active=null,overlay=null,coach=null;
let entrances=new Set();
function unifyStations(lines){const seen=new Map();for(const r of lines)for(const s of r.ST){const p=seen.get(s.name);if(p){s.px=p.px;s.py=p.py}else seen.set(s.name,{px:s.px,py:s.py})}entrances=new Set([...seen.keys()]);}
function surfaceStop(st){return stations().find(s=>s.name===st.name)===st;}
const clean=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dist=(a,b)=>Math.hypot(a.px-b.px,a.py-b.py);
const stations=()=>window.Metro?.R?.ST||[];
const hub=s=>s.name;
const hubs=()=>[...new Map(stations().map(s=>[hub(s),s])).keys()];
const group=name=>stations().filter(s=>hub(s)===name);
const nearest=()=>stations().slice().sort((a,b)=>Math.hypot(a.px-Game.X.player.x,a.py-Game.X.player.y)-Math.hypot(b.px-Game.X.player.x,b.py-Game.X.player.y))[0];
function plan(from,to){
 const all=stations().filter(s=>s.route);if(!all.length||!from||!to||from===to)return null;
 const dt=new Map(),prior=new Map(),unused=new Set(all);
 for(const s of all)dt.set(s,hub(s)===from?0:Infinity);
 while(unused.size){
  let u=null;for(const s of unused)if(!u||dt.get(s)<dt.get(u))u=s;
  if(!u||!isFinite(dt.get(u)))break;
  unused.delete(u);if(hub(u)===to)break;
  const ordered=u.route.ST.slice().sort((a,b)=>a.s-b.s),i=ordered.indexOf(u),v=ordered[(i+1)%ordered.length];
  const arc=((v.s-u.s+u.route.L)%u.route.L)||u.route.L;
  const neighbors=[{v,weight:arc/u.route.speed+5.5,type:'ride'}];
  for(const x of group(hub(u)))if(x!==u&&x.route!==u.route)neighbors.push({v:x,weight:16,type:'transfer'});
  for(const e of neighbors)if(unused.has(e.v)&&dt.get(u)+e.weight<dt.get(e.v)){
   dt.set(e.v,dt.get(u)+e.weight);prior.set(e.v,{from:u,type:e.type});
  }
 }
 const end=all.filter(s=>hub(s)===to).sort((a,b)=>dt.get(a)-dt.get(b))[0];
 if(!end||!isFinite(dt.get(end)))return null;
 const seq=[];let cur=end;
 while(prior.has(cur)){const e=prior.get(cur);seq.push({from:e.from,to:cur,type:e.type});cur=e.from;}
 seq.reverse();const legs=[];
 for(const e of seq)if(e.type==='ride'){
  const last=legs[legs.length-1];if(last&&last.route===e.from.route&&last.to===e.from)last.to=e.to;
  else legs.push({from:e.from,to:e.to,route:e.from.route});
 }
 return legs.length?{legs,seconds:Math.ceil(dt.get(end)),from,to,transfers:Math.max(0,legs.length-1)}:null;
}
function begin(j){
 if(!j?.legs?.length)return false;
 const p=Game.X.player,close=group(j.from).some(s=>Math.hypot(s.px-p.x,s.py-p.y)<110);
 if(!close){
  const st=group(j.from)[0];if(st&&window.WalesaMainland?.startGuide)WalesaMainland.startGuide({x:st.px,y:st.py+8,name:'Metro · '+st.name});
  Game.X.toast('🚇 Sigue la guía hasta el acceso de '+j.from);return false;
 }
 active={legs:j.legs,index:0};
 const first=active.legs[0];
 const ok=window.Metro?.depart?.(first.from,first.to);
 if(!ok){active=null;Game.X.toast('El servicio está preparando los trenes');return false}
 Game.X.toast('🎫 Viaje iniciado · '+j.legs.length+' tramo(s) · '+j.transfers+' transbordo(s)');
 return true;
}
function onArrival(st){
 if(coach){coach.remove();coach=null}
 if(!active)return;
 const current=active.legs[active.index];
 if(!current||current.to!==st){active=null;return}
 if(++active.index>=active.legs.length){Game.X.toast('🚇 ¡Llegaste a '+hub(st)+'!');active=null;return}
 const next=active.legs[active.index];
 if(hub(st)!==hub(next.from)){active=null;Game.X.toast('Transbordo no disponible');return}
 Game.X.toast('🔁 Transbordo directo: '+next.route.name);
 if(window.WalesaMetro66?.transfer){window.WalesaMetro66.transfer(next,st);return}
 if(!window.Metro?.depart?.(next.from,next.to))active=null;
}
function rideDisplay(o){
 const ride=o.ride;if(!ride)return;
 if(!coach){coach=document.createElement('div');coach.className='wm62-coach';document.getElementById('game').appendChild(coach)}
 const route=ride.tr.route,nxt=ride.tr.stop>0&&ride.tr.at?ride.tr.at:(()=>{const f=route.ST.map(s=>({s,d:((s.s-ride.tr.s)%route.L+route.L)%route.L})).filter(x=>x.d>1).sort((a,b)=>a.d-b.d)[0];return f?.s||route.ST[0]})();
 const key=[route.id,nxt.name,ride.dest.name,active?.index||0].join('|');
 if(coach.dataset.key===key)return;coach.dataset.key=key;
 const stops=route.ST.slice().sort((a,b)=>a.s-b.s);
 coach.innerHTML='<div class="wm62-car"><div class="wm62-car-top">🚇 WALESA METRO <span>EN VIAJE</span></div>'+
 '<div class="wm62-car-window"><div class="wm62-motion">✦　✳　✦　✳　✦　✳</div><div class="wm62-train">▣ ▣ ▣ ▣</div></div>'+
 '<small style="color:'+route.color+'">● '+clean(route.name)+'</small><h3>Próxima: '+clean(nxt.name)+'</h3>'+
 '<p>Destino de este tramo: <b>'+clean(ride.dest.name)+'</b></p>'+
 '<div class="wm62-train-stops">'+stops.map(s=>'<span style="border-color:'+route.color+'">'+clean(s.name)+'</span>').join('')+'</div>'+
 (active&&active.index<active.legs.length-1?'<p>🔁 Transbordo automático en '+clean(ride.dest.name)+'</p>':'')+
 '<p class="wm62-car-foot">El metro viaja bajo las calles y senderos de Walesa.</p></div>';
}
function removeCoach(){if(coach){coach.remove();coach=null}}
function view(o){
 const {scr,bar,hd,back}=o,all=stations();
 if(!all.length){scr.innerHTML=bar()+hd('🚇 Metro')+'<div class="lst">Preparando la red…</div>';back();return}
 if(!fromHub||!hubs().includes(fromHub))fromHub=hub(nearest());
 if(!hubs().includes(toHub)||toHub===fromHub)toHub=hubs().find(h=>h!==fromHub)||fromHub;
 const ls=window.Metro.R.lines,j=plan(fromHub,toHub);
 const xy=s=>[Math.round(13+s.px/6800*295),Math.round(12+s.py/4630*191)];
 const metroLines=ls.map(r=>{
  const pts=r.ST.map(s=>xy(s).join(',')).join(' ');return '<polyline points="'+pts+'" fill="none" stroke="'+r.color+'" stroke-width="'+(selected===r.id?4.7:2.4)+'" opacity="'+(selected===r.id?1:.38)+'" stroke-linecap="round" stroke-linejoin="round"/>';
 }).join('');
 const labels=all.filter((s,i)=>all.findIndex(q=>q.name===s.name)===i).map(s=>{
  const [x,y]=xy(s),multiple=group(hub(s)).length>1;
  return '<g data-hub="'+clean(s.name)+'" tabindex="0" role="button" aria-label="Elegir '+clean(s.name)+'"><circle cx="'+x+'" cy="'+y+'" r="'+(multiple?6:4.5)+'" fill="'+(toHub===s.name?'#ffe08a':'white')+'" stroke="#275562" stroke-width="1.7"/>'+
  (multiple?'<circle cx="'+x+'" cy="'+y+'" r="2" fill="#275562"/>':'')+'</g>';
 }).join('');
 const options=hubs().sort().map(n=>'<option value="'+clean(n)+'">'+clean(n)+'</option>').join('');
 const lineChips=ls.map(r=>'<button type="button" class="wm62-chip" data-line="'+clean(r.id)+'" aria-pressed="'+(selected===r.id)+'" style="--lc:'+r.color+'">'+clean(r.name)+'</button>').join('');
 const plans=j?j.legs.map((l,i)=>'<div class="wm62-leg"><b style="color:'+l.route.color+'">● '+clean(l.route.name)+'</b><strong>'+clean(l.from.name)+' → '+clean(l.to.name)+'</strong>'+
 (i<j.legs.length-1?'<small>🔁 Transbordo en '+clean(l.to.name)+' · sin salir a la calle</small>':'<small>🚇 Bajada final</small>')+'</div>').join(''):'<div class="wm62-leg">Selecciona dos estaciones diferentes.</div>';
 const closest=nearest(),distance=Math.round(Math.hypot(closest.px-Game.X.player.x,closest.py-Game.X.player.y));
 scr.innerHTML=bar()+hd('🚇 Metro de Walesa')+
 '<div class="wm62"><div class="wm62-hero"><small>RED SUBTERRÁNEA · EXPRESS</small><b>Viaja lejos. Camina menos.</b><span>'+ls.length+' líneas · '+hubs().length+' estaciones · transbordos directos</span></div>'+
 '<div class="wm62-tabs"><button data-tab="mapa" aria-pressed="'+(tab==='mapa')+'">🗺 Plano</button><button data-tab="viaje" aria-pressed="'+(tab==='viaje')+'">🎫 Viajar</button></div>'+
 (tab==='mapa'?'<div class="wm62-map"><svg viewBox="0 0 320 214" role="img" aria-label="Mapa interactivo de rutas y estaciones"><path d="M4 4H316V210H4Z" fill="#f2f7f5"/>'+metroLines+labels+'</svg><div class="wm62-map-help">Toca una estación para elegir destino · círculos dobles = transbordo</div></div><div class="wm62-chips">'+lineChips+'</div>':'')+
 '<div class="wm62-search"><label>Origen<select data-from>'+options+'</select></label><label>Destino<select data-to>'+options+'</select></label></div>'+
 '<div class="wm62-result"><div><strong>'+(j?Math.ceil(j.seconds/60)+' min aprox.':'Elige destino')+'</strong><small>'+(j?j.transfers+' transbordo(s) · '+j.legs.length+' tramo(s)':'')+'</small></div>'+
 plans+'</div>'+
 '<div class="wm62-near">📍 Acceso más cercano: <b>'+clean(closest.name)+'</b> · '+distance+' u</div>'+
 '<button class="wm62-go" data-start>'+(group(fromHub).some(s=>Math.hypot(s.px-Game.X.player.x,s.py-Game.X.player.y)<110)?'🎫 Iniciar viaje':'🧭 Guiarme al acceso')+'</button>'+
 '<p class="wm62-note">Los trenes pasan por túneles propios, no sobre las calles. Puedes transbordar dentro de una estación.</p></div>';
 scr.querySelector('[data-from]').value=fromHub;scr.querySelector('[data-to]').value=toHub;
 const sel1=scr.querySelector('[data-from]'),sel2=scr.querySelector('[data-to]');
 sel1.onchange=()=>{fromHub=sel1.value;view(o)};
 sel2.onchange=()=>{toHub=sel2.value;tab='viaje';view(o)};
 scr.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;view(o)});
 scr.querySelectorAll('[data-line]').forEach(b=>b.onclick=()=>{selected=b.dataset.line;view(o)});
 scr.querySelectorAll('[data-hub]').forEach(b=>{const click=()=>{toHub=b.dataset.hub;tab='viaje';view(o)};b.onclick=click;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();click()}}});
 scr.querySelector('[data-start]').onclick=()=>{if(j&&begin(j)&&overlay)closeStation()};
 back();
}
function closeStation(){
 if(overlay){overlay.remove();overlay=null}
 if(!document.querySelector('.fon.on'))Game.X.st.menu=false;
}
function openStation(st){
 if(!st)return false;
 fromHub=hub(st);if(toHub===fromHub)toHub=hubs().find(h=>h!==fromHub)||fromHub;tab='viaje';
 if(overlay)closeStation();
 overlay=document.createElement('div');overlay.className='wm62-overlay';overlay.innerHTML='<div class="wm62-popup"><button class="wm62-x" aria-label="Cerrar metro">×</button><div class="wm62-content"></div></div>';document.getElementById('game').appendChild(overlay);
 Game.X.resetInput();Game.X.st.menu=true;
 overlay.querySelector('.wm62-x').onclick=closeStation;
 const scr=overlay.querySelector('.wm62-content');
 view({scr,bar:()=>'',hd:t=>'<h2>'+clean(t)+'</h2>',back:()=>{}});
 return true;
}
const css=document.createElement('style');css.textContent=
 '.wm62{padding:6px 9px 22px;overflow-y:auto;flex:1;min-height:0;color:#24475a;background:linear-gradient(#eff6fb,#fff8ef);font:600 12px/1.4 system-ui,sans-serif;-webkit-overflow-scrolling:touch}'+
 '.wm62 button,.wm62 select{touch-action:manipulation;font-family:inherit}.wm62-hero{background:linear-gradient(118deg,#173752,#276b7a);color:white;border-radius:15px;padding:13px;display:grid;gap:5px;margin-bottom:9px}.wm62-hero b{font-size:17px}.wm62-hero small{opacity:.74;font-size:9px;letter-spacing:1.2px}.wm62-hero span{font-size:10px;opacity:.88}'+
 '.wm62-tabs{display:flex;gap:7px;margin-bottom:10px}.wm62-tabs button{flex:1;padding:9px;border-radius:10px;border:1px solid #aec6ca;background:#e9f0f0;color:#2f5960;font-weight:800}.wm62-tabs [aria-pressed=true]{background:#244b6c;color:white}'+
 '.wm62-map{border-radius:13px;overflow:hidden;border:1px solid #b8d2d6;background:white}.wm62-map svg{width:100%;height:auto;display:block;touch-action:manipulation}.wm62-map [data-hub]{cursor:pointer}.wm62-map [data-hub]:focus circle{stroke:#de8f39;stroke-width:3}.wm62-map-help{padding:4px 9px 8px;color:#627f8a;font-size:9px}'+
 '.wm62-chips{display:flex;gap:5px;overflow-x:auto;padding:9px 0}.wm62-chip{flex-shrink:0;min-height:34px;border-radius:12px;border:1.8px solid var(--lc);background:white;color:#244b60;padding:6px 9px;font-size:10px;font-weight:800}.wm62-chip[aria-pressed=true]{background:var(--lc);color:white}'+
 '.wm62-search{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0}.wm62-search label{font-size:10px;color:#57747b;font-weight:800;min-width:0}.wm62-search select{width:100%;min-width:0;padding:10px 4px;border:1px solid #b8d4d2;border-radius:10px;background:white;color:#21445a;font-size:11px}'+
 '.wm62-result{background:white;border:1px solid #d4e4e3;border-radius:14px;padding:10px}.wm62-result>div:first-child{display:flex;justify-content:space-between;align-items:center}.wm62-result strong{font-size:15px;color:#18465d}.wm62-result small{color:#6f8790;font-size:10px}.wm62-leg{display:grid;gap:2px;padding:8px 2px;border-bottom:1px dashed #d1dcdd}.wm62-leg:last-child{border-bottom:0}.wm62-leg b{font-size:11px}.wm62-leg strong{font-size:12px}.wm62-near{margin:10px 0;color:#607f82}.wm62-go{width:100%;background:#f6b866;border:0;border-radius:12px;padding:13px;font-weight:900;color:#2d4053;box-shadow:0 3px 0 #bd8e53}.wm62-note{font-size:10px;color:#73858a;margin:12px 0 0}'+
 '.wm62-overlay{position:absolute;inset:0;z-index:88;background:#102936c7;display:flex;justify-content:center;align-items:center;padding:15px}.wm62-popup{width:min(100%,400px);max-height:94%;display:flex;flex-direction:column;position:relative;border:5px solid #ebd2a3;border-radius:23px;background:#f7faf9;overflow:hidden;box-shadow:0 20px 45px #0007}.wm62-content{overflow:auto;display:flex;flex-direction:column;min-height:0}.wm62-content>h2{margin:0;padding:13px;background:#fff6eb;font:900 17px system-ui;color:#25485a}.wm62-x{position:absolute;z-index:1;right:8px;top:6px;border:0;border-radius:50%;background:#fff;color:#374858;font:900 22px system-ui;width:34px;height:34px}'+
 '.wm62-coach{position:absolute;z-index:78;inset:0;background:linear-gradient(145deg,#112b44,#285066);display:grid;place-items:center;padding:20px;color:white}.wm62-car{max-width:420px;width:100%;border:3px solid #f6d8a1;border-radius:20px;overflow:hidden;background:#fff8eb;color:#17394e;text-align:center;padding-bottom:14px;box-shadow:0 14px 36px #0009}.wm62-car-top{background:#22546a;color:white;padding:12px;font:900 13px system-ui;display:flex;justify-content:space-between}.wm62-car-top span{opacity:.7;font-size:10px}.wm62-car-window{height:114px;background:linear-gradient(100deg,#174057,#5b8995,#20495a);position:relative;overflow:hidden}.wm62-motion{white-space:nowrap;font:34px system-ui;letter-spacing:19px;position:absolute;top:21px;color:#e2f4ee99;animation:wm62rail 6s linear infinite}.wm62-train{position:absolute;bottom:4px;left:0;right:0;color:#fff6dd;font:32px system-ui;letter-spacing:8px}@keyframes wm62rail{from{transform:translateX(15%)}to{transform:translateX(-70%)}}.wm62-car>small{display:block;margin:15px 0 5px;font-weight:900}.wm62-car h3{margin:4px 8px;font:900 20px system-ui}.wm62-car p{font:650 12px system-ui;margin:10px}.wm62-train-stops{display:flex;overflow-x:auto;gap:5px;padding:8px}.wm62-train-stops span{border-bottom:4px solid;white-space:nowrap;padding:8px 5px;font-size:9px}.wm62-car-foot{opacity:.6}';
document.head.appendChild(css);
if(window.WalesaMetro61)window.WalesaMetro61.render=view;
window.WalesaMetro62={routes,plan,begin,view,openStation,onArrival,rideDisplay,removeCoach,unifyStations,surfaceStop,underground:true,cancelJourney(){active=null},get active(){return active}};
})();