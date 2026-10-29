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
 // La bahía es transitable, pero todo el taller de castillos se abre al
 // hablar con Pochacco en su puestito. No hay botones de construir en el suelo.
 if(key==='forest'||key==='meadow')
  E.addPoint(list,'forestTask',r.x-55,r.y+45,'🌿 Encargos del sendero');
 if(key==='coast')E.addPoint(list,'beachGames',r.x+90,r.y+50,'🪁 Desafíos costeros');
 for(const q of goodies)if(!q.got&&Math.hypot(q.x-X.player.x,q.y-X.player.y)<110)
  list.push({type:'exp46',key:'collect',x:q.x,y:q.y,r:18,hy:12,label:q.k==='wood'?'🪵 Buscar ramas':'🌿 Recolectar',q});
});
H.bill.push((bb,t)=>{if(V.map!==V.MAIN||X.st.scene!=='out'||!prepared)return;
 const p=X.player,key=at();
 // Sólo dibujamos lo próximo para evitar costes en un mundo más grande.
 for(const q of goodies){if(q.got||Math.hypot(p.x-q.x,p.y-q.y)>250)continue;
  bb.push({x:q.x,y:q.y,draw:g=>{if(q.k==='wood'){P.ln(g,[[-7,-1],[5,-5]],'#8e6d50',2);P.ln(g,[[0,-4],[-2,-9]],'#8e6d50',1)}else E.text(g,q.k==='baya'?'🍓':q.k==='concha'?'🐚':'✨',0,-5,10)}})
 }
 // Los objetos del taller no se dibujan en el overworld: habitan su
 // propio escenario, abierto únicamente desde el puesto físico de la playa.
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
// El puesto se dibuja con World.HOOK.stand, se integra en colisiones,
// y abre el verdadero taller de castillos con una transición de iris nativa.
H.act.unshift(it=>it.type==='job'&&it.b?.id==='castillos48'?(async()=>{
 const i=await X.ask('🏖️ Puestito de castillos · Pochacco',[
  '🪣 Entrar al taller de castillos','🐚 Ver la playa','Seguir explorando'
 ]);
 if(i===0)await E.actions.sand();
 else if(i===1)await X.say('Pochacco','¡La arena ideal está junto a la costa! En el taller tendrás espacio para construir y experimentar con las olas.');
})():null);
const neighbor={
 farolitos47:['Refugio de los Farolitos','Los faroles iluminan los senderos cuando cae la noche. ¡Busca luciérnagas en el bosque!'],
 mermelada47:['Casita de Mermelada','Aquí hacemos mermelada de las bayas del prado. Recoge fresas y pasea entre las flores.'],
 cometas47:['Taller de Cometas','La brisa del mar está perfecta. En la Costa de las Cometas puedes participar en los juegos de playa.']
};
H.act.unshift(it=>it.type==='job'&&it.b&&neighbor[it.b.id]?(async()=>{
 const [name,msg]=neighbor[it.b.id];await X.say(name,msg);
})():null);
// Los edificios conservan sombra, colisiones, escena y sprites propios.
// Paisajismo con los mismos recursos de acuarela del motor, sin emojis flotantes.
const decor=[
 [1812,620,'lamp',-42,6],[1812,620,'lamp',42,6],[1812,620,'fern',-55,-1],[1812,620,'shroom',52,8],
 [1960,620,'pot',-38,4],[1960,620,'pot',38,4],[1960,620,'fence',-56,15],[1960,620,'fence',56,15],
 [2220,620,'pot',-38,5],[2220,620,'lamp',41,5],[2220,620,'fence',-56,15],[2220,620,'fence',56,15],
 [897,1375,'pot',-34,-1],[897,1375,'pot',34,-1],[897,1375,'lamp',-40,7]
];
let decorated=false;
H.update.push(()=>{if(decorated||!V.MAIN.objs)return;decorated=true;for(const [x,y,k,dx,dy] of decor){
 const spr=k==='pot'?V.spr.pot[0]:k==='shroom'?V.spr.shroom[0]:V.spr[k];
 if(spr)V.addObj(V.MAIN,spr,x+dx,y+dy,null);
 }});
E.actions.travel=()=>X.toast('🌲 Recorre los caminos hacia el este para descubrir las regiones.');
})();