/* Isla v47: interacciones y actividades sobre el MISMO overworld, sin warps. */
(()=>{'use strict';
const E=Expansion46,{X,G,V,P,H,S}=E,W=window.WalesaMainworld;
if(!W)return;
E.mainworld=W;
const sp=()=>W.regions.sand;
const at=()=>V.map===V.MAIN&&X.st.scene==='out'?W.at(X.player.x,X.player.y):null;
const picked=S.regions.picked47||(S.regions.picked47={});
const goodies=[];
let prepared=false,lastRegion=null,tagCooldown=0;
function setup(){if(prepared||!V.MAIN.objs)return;prepared=true;
 if(!S.sand.migratedMain47){
  for(const b of S.sand.builds||[])if(b.x<850&&b.y<850){b.x+=sp().x-500;b.y+=sp().y-470}
  if(S.sand.rebar&&S.sand.rebar.x<850&&S.sand.rebar.y<850){S.sand.rebar.x+=sp().x-500;S.sand.rebar.y+=sp().y-470}
  S.sand.migratedMain47=true;G.save();
 }
 for(const [key,r] of Object.entries(W.regions))for(let i=0;i<16;i++){
  const a=2.39996*i,rad=72+Math.sqrt(i)*54;
  const p=E.free(V.MAIN,r.x+Math.cos(a)*rad,r.y+Math.sin(a)*rad);
  goodies.push({key,id:i,x:p.x,y:p.y,k:key==='sand'?'wood':key==='coast'?'concha':i%3?'baya':'estrella',got:!!picked[key+':'+i]});
 }
}
H.update.push(dt=>{setup();if(V.map!==V.MAIN||X.st.scene!=='out')return;
 tagCooldown-=dt;const r=at();if(r!==lastRegion&&tagCooldown<=0){lastRegion=r;tagCooldown=2.1;if(r)X.placeTag(W.regions[r].name)}
});
// Eliminar puntos de teletransporte anteriores para impedir volver a mapas duplicados.
H.inter.push(list=>{if(V.map!==V.MAIN||X.st.scene!=='out')return;
 for(let i=list.length-1;i>=0;i--){const q=list[i];if((q.type==='exp46'&&['sand','travel','road46'].includes(q.key))||(q.type==='parque'&&q.k==='sand'))list.splice(i,1)}
 const key=at();if(!key)return;const r=W.regions[key];
 if(key==='sand'){
  if(Math.hypot(X.player.x-(r.x-100),X.player.y-(r.y+45))>38)
   E.addPoint(list,'sandTools',X.player.x,X.player.y,'🪣 Construir aquí',12);
  E.addPoint(list,'water',r.x+105,r.y+225,'💧 Llenar cubeta en la orilla');
  E.addPoint(list,'sandShop',r.x-100,r.y+45,'🏖️ Taller de Pochacco');
  E.addPoint(list,'waves',r.x+142,r.y+35,'🌊 Probar resistencia');
  E.addPoint(list,'beachGames',r.x-140,r.y-90,'🏐 Juegos de playa');
 }else{
  E.addPoint(list,'forestTask',r.x-55,r.y+45,key==='forest'?'🏮 Encargos de las luciérnagas':'🌿 Encargos del sendero');
  if(key==='coast')E.addPoint(list,'beachGames',r.x+90,r.y+50,'🪁 Desafíos costeros');
 }
 for(const q of goodies)if(!q.got&&Math.hypot(q.x-X.player.x,q.y-X.player.y)<110)
  list.push({type:'exp46',key:'collect',x:q.x,y:q.y,r:18,hy:12,label:q.k==='wood'?'🪵 Buscar ramas':'🌿 Recolectar',q});
});
H.bill.push((bb,t)=>{if(V.map!==V.MAIN||X.st.scene!=='out'||!prepared)return;
 const p=X.player,key=at();
 // Sólo dibujamos lo próximo para evitar costes en un mundo más grande.
 for(const q of goodies){if(q.got||Math.hypot(p.x-q.x,p.y-q.y)>250)continue;
  bb.push({x:q.x,y:q.y,draw:g=>{if(q.k==='wood'){P.ln(g,[[-7,-1],[5,-5]],'#8e6d50',2);P.ln(g,[[0,-4],[-2,-9]],'#8e6d50',1)}else E.text(g,q.k==='baya'?'🍓':q.k==='concha'?'🐚':'✨',0,-5,10)}})
 }
 if(key==='sand'){
  for(const b of S.sand.builds||[])if(Math.hypot(p.x-b.x,p.y-b.y)<260)bb.push({x:b.x,y:b.y,draw:g=>E.regions.castle(g,b)});
  if(S.sand.rebar)bb.push({x:S.sand.rebar.x,y:S.sand.rebar.y,draw:g=>P.ln(g,[[0,0],[0,-S.sand.rebar.grade*14]],'#8d7058',2)});
  bb.push({x:sp().x-100,y:sp().y+45,draw:g=>{P.wc(g,P.E(0,-35,22,8),'#e9a5bf',{lw:.6});P.ln(g,[[0,-35],[0,0]],'#9a795b',1.6);E.char(g,{...V.NPCDEF.pochacco,outfit:'camiseta',oColor:'#9cd9dd',acc:'none'},0,0)}});
  for(const [dx,dy,ic] of[[105,225,'💧'],[142,35,'🏆'],[-140,-90,'🏐']])bb.push({x:sp().x+dx,y:sp().y+dy,draw:g=>E.marker(g,0,0,ic)});
 }
});
// NPC originales de la expansión, ahora distribuidos en la propia isla.
H.npcs.push((list,map)=>{if(map!==V.MAIN||!prepared)return;
 for(const [key,id] of[['forest','luma46'],['meadow','miga46'],['coast','brisa46']]){
  if(!Talk.P[id]||list.some(n=>n.id===id))continue;
  const r=W.regions[key],p=E.free(map,r.x+65,r.y-55);list.push(X.mkNPC(id,p.x,p.y));
 }
});
// La recolección permanece guardada al cambiar de área y al reabrir el navegador.
const collect=E.actions.collect;
E.actions.collect=async it=>{await collect(it);if(it?.q&&V.map===V.MAIN&&it.q.got){picked[it.q.key+':'+it.q.id]=true;G.save()}};
// Evitar usar un mapa aislado cuando una actividad antigua pide ir a la bahía.
E.actions.sand=()=>X.toast('🏖️ Sigue el camino al sur del muelle: la bahía está en la misma isla.');
E.actions.travel=()=>X.toast('🌲 Recorre los caminos hacia el este para descubrir las cuatro regiones.');
})();