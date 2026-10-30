/* Walesa Metro v61 · red ampliada y plano tactil para iPhone. Sin alterar guardados. */
window.WalesaMetro61=(()=>{
'use strict';
const old=window.WalesaOverworld60;
const sites={
A:[760,1100,'La Playa'],B:[1660,690,'Ciudad Corazón'],C:[2675,930,'Acceso Continental'],
D:[3000,1240,'Camino del Oeste'],E:[3170,1650,'Puente Continental'],F:[3480,880,'Cordillera'],
G:[3650,1830,'Valle de los Arroyos'],H:[4330,1680,'Valle Oriental'],
I:[4820,1620,'Bosque Alto'],J:[5310,1490,'Puerto de Meseta'],
K:[6100,1800,'Paseo del Faro'],L:[6100,2590,'Terminal del Faro'],
M:[5300,2290,'Meseta Oriental'],N:[4780,2340,'Mercado del Este'],
O:[3770,2310,'Pueblo de Walesa'],P:[3690,3100,'Puerta Sur'],
Q:[3600,3940,'Ciudad del Sur'],R:[5320,4040,'Jardín del Sur'],
S:[5840,3650,'Bosque Profundo'],T:[1880,3800,'Isla Luciérnaga'],
U:[750,2300,'Isla Azahar'],V:[1500,3320,'Paso Insular'],
W:[2460,3730,'Puerto Luciérnaga'],X:[750,1600,'Puente Azahar'],
Y:[4230,2360,'Avenida del Este'],Z:[5540,2660,'Jardines de Meseta']
};
const definitions=[
['norte60','Cordillera y Litoral','#4a91bf','CDEFGHIJKLMNO GD','CDEFGHJKLMO',155],
['este60','Distritos del Este','#d7805b','OYNMZLSRQPO','OYNMZLSRQP',155],
['sur60','Archipiélago','#9973c8','AXUVT WQPWT VUX','AXUVTWQP',150],
['anillo61','Gran Anillo Exterior','#3d9d86','ABCFHJKLSRQWTVUA','ABCFHJKLSRQWTU',185],
['bosque61','Bosques y Meseta','#89ab52','FGHIJKL SZMNYOGF','FGHIJKLSZMNYO',160],
['corazon61','Corazón al Sur','#d56899','BCDEGOPQWTVUXAB','BCDEGOPQWTVUA',168],
['valle61','Valle y Avenidas','#d2a546','CDEGHIJMN YOPQWQPOEDC','CDEGHIJ MNYOPQW',165]
];
const make=(def)=>{
 const [id,name,color,path,stops,speed]=def;
 const keys=path.replace(/\s/g,'').split(''),stopKeys=stops.replace(/\s/g,'').split('');
 return{id,name,color,speed,points:keys.map(k=>sites[k].slice(0,2)),
 stops:stopKeys.map(k=>[sites[k][2],sites[k][0],sites[k][1]])};
};
const routes=definitions.map(make);
if(old&&Array.isArray(old.lines))old.lines.splice(0,old.lines.length,...routes);
let selected='anillo61',selectedStop=-1;
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const km=n=>(n/1000).toFixed(1)+' km';
function render(o){
 const {scr,bar,hd,back,model,player}=o;
 const lines=model&&model.R&&model.R.lines||[];
 if(!lines.length){scr.innerHTML=bar()+hd('🚇 Metro')+'<div class="lst">El servicio se esta preparando…</div>';back();return}
 if(!lines.some(l=>l.id===selected))selected=lines[0].id;
 const route=lines.find(l=>l.id===selected),stations=route.ST;
 const xy=p=>[(10+p[0]*328/6800).toFixed(1),(12+p[1]*218/4630).toFixed(1)];
 const path=r=>{
  const n=Math.max(1,Math.ceil(r.P.length/145));
  const pts=r.P.filter((_,i)=>i%n===0);
  return pts.map((p,i)=>(i?'L':'M')+xy(p).join(' ')).join(' ')+' Z';
 };
 const colors=lines.map(r=>'<path d="'+path(r)+'" fill="none" stroke="'+r.color+
 '" stroke-width="'+(r===route?'3.5':'1.2')+'" opacity="'+(r===route?'.95':'.2')+
 '" stroke-linejoin="round" stroke-linecap="round"/>').join('');
 const dots=stations.map((s,i)=>{
  const p=xy([s.x,s.y]);
  return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3.4" fill="white" stroke="'+route.color+
  '" stroke-width="1.9"/><text x="'+(+p[0]+4)+'" y="'+(+p[1]-5)+
  '" fill="#254f50" font-size="5.7" font-weight="700">'+escapeHtml(s.name.slice(0,17))+'</text>';
 }).join('');
 const nearest=model.R.ST.slice().sort((a,b)=>Math.hypot(a.px-player.x,a.py-player.y)-
 Math.hypot(b.px-player.x,b.py-player.y))[0];
 let details='';
 if(selectedStop>=0&&stations[selectedStop]){
  const st=stations[selectedStop];
  const transfers=lines.filter(l=>l!==route&&l.ST.some(z=>Math.hypot(z.px-st.px,z.py-st.py)<225));
  details='<section style="border:1px solid '+route.color+
  ';background:#f7fcf9;border-radius:11px;padding:10px;margin:9px 0"><b>📍 '+escapeHtml(st.name)+
  '</b><p style="margin:4px 0">Próximo tren: '+model.eta(st)+' s. Acércate a su andén para abordar.</p>'+
  (transfers.length?'<small>Transbordos cercanos: '+transfers.map(l=>escapeHtml(l.name)).join(', ')+'</small>':'')+'</section>';
 }
 const chips=lines.map((r,i)=>'<button data-line="'+escapeHtml(r.id)+'" aria-pressed="'+(r===route)+
 '" style="flex:0 0 auto;border:2px solid '+(r===route?r.color:'#cadad4')+
 ';border-radius:12px;padding:7px 10px;min-width:38px;background:'+(r===route?'#fff':'#e9f1ef')+
 ';color:#234744;font-size:12px;font-weight:900"><span style="color:'+r.color+'">●</span> '+(i+1)+'</button>').join('');
 const stopButtons=stations.map((s,i)=>'<button data-stop="'+i+
 '" style="display:flex;align-items:center;width:100%;text-align:left;gap:8px;border:1px solid #d5e4df;'+
 'border-left:4px solid '+route.color+';background:'+(selectedStop===i?'#e5f3ef':'#fff')+
 ';color:#25494a;border-radius:10px;min-height:47px;margin:0 0 6px;padding:8px">'+
 '<b style="min-width:19px">'+(i+1)+'</b><span style="flex:1"><b style="display:block">'+escapeHtml(s.name)+
 '</b><small style="font-size:10px;color:#647d79">'+escapeHtml(route.name)+'</small></span>'+
 '<b>'+model.eta(s)+' s</b></button>').join('');
 scr.innerHTML=bar()+hd('🚇 Metro de Walesa')+
 '<div class="lst" style="display:block;overflow-y:auto;overscroll-behavior:contain;padding:8px 7px 20px;'+
 'color:#244746;font:600 11px/1.45 system-ui,sans-serif">'+
 '<section style="background:linear-gradient(115deg,#173d51,#2a7475);color:#fff;border-radius:14px;'+
 'padding:12px 14px;margin-bottom:10px"><div style="font-size:10px;letter-spacing:1px;opacity:.8">'+
 'RED DE TRANSPORTE</div><b style="display:block;font-size:19px">Tu isla, conectada.</b>'+
 '<small>'+lines.length+' líneas · '+model.R.ST.length+' andenes · trenes reales</small></section>'+
 '<b>Selecciona una línea</b><div style="display:flex;gap:5px;overflow-x:auto;padding:8px 0">'+chips+'</div>'+
 '<b style="display:block;font-size:14px;margin:2px 0">'+escapeHtml(route.name)+'</b>'+
 '<small style="color:#607d79">'+stations.length+' estaciones · '+km(route.L)+'</small>'+
 '<svg viewBox="0 0 350 240" role="img" aria-label="Plano de las líneas de metro y estaciones"'+
 ' style="display:block;width:100%;margin:7px 0;border-radius:12px;background:#e6f0ed;touch-action:pan-y">'+
 '<path d="M9 12H341V234H9Z" fill="#f4f8f6"/><path d="M9 68H341M9 126H341M9 190H341"'+
 'stroke="#deebe7" stroke-width=".7"/>'+colors+dots+
 '<text x="16" y="230" fill="#6b8780" font-size="8" font-weight="700">WALESA · MAPA DEL METRO</text></svg>'+
 '<div style="padding:7px 0;color:#52716d">📍 Cerca de ti: <b>'+escapeHtml(nearest.name)+
 '</b> · '+Math.round(Math.hypot(nearest.px-player.x,nearest.py-player.y))+' u</div>'+
 '<b style="display:block;margin:7px 0">Estaciones y llegada del próximo tren</b>'+
 stopButtons+details+
 '<p style="font-size:10px;color:#647f7b;margin:9px 0">Sube en el andén del mundo real y elige tu parada.'+
 ' Los transbordos se realizan caminando entre estaciones.</p></div>';
 back();
 for(const b of scr.querySelectorAll('[data-line]'))b.onclick=e=>{
  e.stopPropagation();selected=b.dataset.line;selectedStop=-1;render(o);
 };
 for(const b of scr.querySelectorAll('[data-stop]'))b.onclick=e=>{
  e.stopPropagation();selectedStop=Number(b.dataset.stop);render(o);
 };
}
return {routes,render};
})();