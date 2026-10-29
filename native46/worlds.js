(()=>{'use strict';
const E=Expansion46,{X,G,V,P,H,S,clamp}=E,sand=S.sand;
const cache={},portal={},seed=462601;let wave=null,cleared=new Set();
function def(kind,id,w,h){return{id,MW:w,MH:h,cx:w/2,cy:h/2,rx:w*.45,ry:h*.43,seed,main:false,kind,name:'',biome:()=>kind,build:[],stands:[],spots:{},paths:[[w/2,h/2,w/2,h*.88]],pier:{x:w/2-10,y:h*.86,w:20,h:70},boat:{x:w/2+26,y:h*.86+64}}}
async function region(key){if(cache[key])return cache[key];let d;
 if(key==='sand'){d=def('beach','sand46',1000,940);d.name='Bahía de los Castillos';d.exp46='sand';d.paths=[]}
 else{const bi={forest:'shroom',meadow:'candy',coast:'beach'}[key];d=def(bi,key+'46',1200,1120);d.name={forest:'Bosque de los Farolitos',meadow:'Praderas de Mermelada',coast:'Costa de las Cometas'}[key];d.exp46=key;d.seed=key==='forest'?seed+(S.regions.forestSeed||0):seed;d.paths=[[600,220,600,930],[220,560,980,560],[360,360,840,760]]}
 if(key!=='sand'){const palettes={forest:['shroom','star','town'],meadow:['candy','town','chile'],coast:['beach','town','snow']}[key];d.biome=(x,y)=>palettes[x<430?0:x>770?2:1];d.roads=[[220,560,980,560],[600,220,600,930]]}
 const m=await V.makeRegion(d);cache[key]=m;
 if(key==='sand'){
  m.objs=m.objs.filter(o=>Math.hypot(o.x-m.cx,o.y-m.cy)>300);m.solids=m.solids.filter(q=>Math.hypot(q.x-m.cx,q.y-m.cy)>310);m.sg={};for(const q of m.solids){const x0=q.x-(q.r||0),y0=q.y-(q.r||0),w=q.w||q.r*2,h=q.h||q.r*2;for(let y=Math.floor((y0-8)/64);y<=Math.floor((y0+h+8)/64);y++)for(let x=Math.floor((x0-8)/64);x<=Math.floor((x0+w+8)/64);x++)(m.sg[x+','+y]||(m.sg[x+','+y]=[])).push(q)}
  const g=m.ground.getContext('2d'),gr=g.createRadialGradient(m.cx-90,m.cy-100,20,m.cx,m.cy,310);gr.addColorStop(0,'#f5e7bf');gr.addColorStop(1,'#e8cf9e');g.fillStyle=gr;g.beginPath();g.ellipse(m.cx,m.cy,300,275,0,0,7);g.fill();g.save();g.globalAlpha=.16;g.fillStyle=P.grain(g);g.fill();g.restore();
 }
 m.collect46=Array.from({length:24},(_,i)=>({id:i,x:m.cx+Math.cos(i*2.4)*(90+i*11),y:m.cy+Math.sin(i*2.4)*(90+i*9),k:key==='sand'?'wood':i%3?'baya':'estrella',got:false}));
 return m;
}
function beachAt(){const m=V.MAIN,p=m.pier;return E.free(m,p.x+65,p.y-70)}
H.update.push(()=>{if(window.WalesaMainworld||!V.MAIN.objs||V.map!==V.MAIN||portal.sand)return;portal.sand=beachAt();portal.travel=E.free(V.MAIN,V.MAIN.spots.plaza.x-85,V.MAIN.spots.plaza.y+100)});
H.inter.push(list=>{const m=V.map;if(X.st.scene!=='out')return;
 if(m===V.MAIN&&!window.WalesaMainworld){if(portal.sand)E.addPoint(list,'sand',portal.sand.x,portal.sand.y,'🏖️ Bahía de los Castillos');if(portal.travel)E.addPoint(list,'travel',portal.travel.x,portal.travel.y,'🧭 Caminos de la isla');for(let i=list.length-1;i>=0;i--)if(list[i].type==='parque'&&list[i].k==='sand')list.splice(i,1)}
 if(!m.exp46)return;
 for(let i=list.length-1;i>=0;i--)if(list[i].type==='boat')list.splice(i,1);
 E.addPoint(list,'home',m.cx,m.cy+285,'🏝️ Regresar a la isla');
 if(m.exp46==='sand'){
  if(!list.some(q=>q.type==='exp46'&&q.key!=='sandTools'&&Math.hypot(q.x-X.player.x,q.y-X.player.y)<28)&&(m.collect46||[]).every(q=>q.got||Math.hypot(q.x-X.player.x,q.y-X.player.y)>24)&&Math.hypot(X.player.x-(m.cx-100),X.player.y-(m.cy+45))>32)E.addPoint(list,'sandTools',X.player.x,X.player.y,'🪣 Construir con arena',12);
  E.addPoint(list,'water',m.cx+95,m.cy+270,'💧 Traer agua de la costa');E.addPoint(list,'sandShop',m.cx-100,m.cy+45,'🏝️ Hablar con Pochacco');E.addPoint(list,'waves',m.cx+135,m.cy+55,'🌊 Concurso de resistencia');E.addPoint(list,'beachGames',m.cx-140,m.cy-95,'🏐 Juegos de la playa');
 }else{E.addPoint(list,'forestTask',m.cx-50,m.cy+35,m.exp46==='forest'?'🏮 Senderos perdidos':'🌸 Encargos del camino');E.addPoint(list,'beachGames',m.cx+80,m.cy+50,'🪁 Desafíos al aire libre')}
 for(const q of m.collect46||[]){if(q.got||Math.hypot(q.x-X.player.x,q.y-X.player.y)>110)continue;list.push({type:'exp46',key:'collect',x:q.x,y:q.y,r:18,hy:16,label:q.k==='wood'?'🪵 Recoger ramas':'🌿 Recolectar',q})}
});
E.actions.sand=async()=>{const m=await region('sand');await E.enter(m,m.cx,m.cy+180);if(!sand.intro){sand.intro=1;G.save();await X.say('','La bahía es tu taller: trae agua de la costa y haz tu primer castillo con las manos. Pochacco te enseñará lo demás.')}};
E.actions.travel=async()=>{const names=['🌲 Bosque de los Farolitos','🌸 Praderas de Mermelada','🪁 Costa de las Cometas','Volver'];const i=await X.ask('¿Qué camino recorremos?',names);if(i<3){const m=await region(['forest','meadow','coast'][i]);await E.enter(m,m.cx,m.cy+230)}};
E.actions.home=()=>E.home();
E.actions.water=async()=>{sand.water=Math.min(20,sand.water+5);G.save();X.toast('💧 Agua: '+sand.water+' / 20')};
E.actions.collect=async it=>{if(it.q.got)return;it.q.got=true;const m=V.map;if(m.exp46==='sand'||m===V.MAIN&&window.WalesaMainworld&&it.q.k==='wood'){const grade=it.q.id%11===0?2:it.q.id%4===0?1:0;sand.wood[grade]++;X.toast('🪵 Rama '+['corta','mediana','larga'][grade]+' · '+sand.wood[grade])}else{X.invAdd(it.q.k,1);G.progress('pick6');X.toast('🌿 Encontraste '+(Talk.ITEMS[it.q.k]?.[0]||it.q.k));S.regions.gathered=(S.regions.gathered||0)+1}G.save()};
const tools=[['bucket','Cubeta redonda',100],['square','Cubeta cuadrada',180],['tower','Molde de torre',360],['gate','Molde de entrada',420],['palace','Molde de palacio',800]];
E.actions.sandShop=async()=>{if(!sand.builds.length){await X.say('Pochacco','¡Hola! Primero haz un castillito con agua y tus manos. Yo te espero aquí.');return}
 if(!sand.tier){sand.tier=1;sand.tools.push('bucket','shovel');sand.wood[0]+=3;G.save();await X.say('Pochacco','¡Te quedó bonito! Toma una pala, una cubeta y tres palitos. Pon los palitos antes de levantar las torres: así aguantan mejor las olas.');return}
 const i=await X.ask('Pochacco · Taller de playa',tools.map(([k,n,p])=>n+(sand.tools.includes(k)?' ✓':k!=='bucket'&&k!=='square'&&!sand.wins?' · gana el concurso':' · '+p+' 🔔')).concat(['Una rama larga · 180 🔔','Volver']));
 if(i===tools.length){if(X.payOr(180)){sand.wood[2]++;G.save()}return}const t=tools[i];if(!t||sand.tools.includes(t[0]))return;if(!sand.wins&&!['bucket','square'].includes(t[0])){X.toast('Gana primero un concurso de resistencia.');return}if(X.payOr(t[2])){sand.tools.push(t[0]);G.save();X.toast('🪣 Ya puedes usar '+t[1])}
};
E.actions.sandTools=async()=>{if(wave){X.toast('Espera a que pase la ola.');return}const opts=['✋ Castillo a mano',...(sand.tier?['🪣 Castillo de cubetas','🪵 Poner refuerzo']:[]),...(sand.wins?['🏰 Construir con un molde']:[]),'🔧 Reparar el castillo más cercano','Volver'];const i=await X.ask('Arena '+sand.water+' 💧 · ramas '+sand.wood.join('/'),opts),a=opts[i];if(!a||a==='Volver')return;
 const x=Math.round(X.player.x/22)*22,y=Math.round((X.player.y-28)/22)*22;
 if(a.includes('Reparar')){const b=sand.builds.filter(b=>Math.hypot(b.x-X.player.x,b.y-X.player.y)<65).sort((a,b)=>a.hp-b.hp)[0];if(!b||sand.water<1){X.toast('Acércate a un castillo y trae agua.');return}sand.water--;b.hp=b.max;G.save();return}
 if(a.includes('refuerzo')){const j=await X.ask('El refuerzo va ANTES de las cubetas',['Rama corta · 1 altura','Rama mediana · 2 alturas','Rama larga · 4 alturas','Volver']);if(j>2)return;if(!sand.wood[j]){X.toast('Busca ramas por la bahía.');return}sand.wood[j]--;sand.rebar={x,y,grade:j+1};G.save();X.toast('🪵 Refuerzo colocado. Construye aquí encima.');return}
 let height=a.includes('mano')?1:2,shape='tower',cost=1;
 if(a.includes('molde')){const owned=tools.filter(t=>sand.tools.includes(t[0])&&!['bucket','square'].includes(t[0]));if(!owned.length){X.toast('Compra tu primer molde con Pochacco.');return}const j=await X.ask('Elige un molde',owned.map(t=>t[1]).concat(['Volver']));if(!owned[j])return;shape=owned[j][0];height=shape==='palace'?5:4;cost=3}
 if(sand.water<cost){X.toast('Trae agua de la costa para humedecer la arena.');return}if(sand.builds.length>=80){X.toast('Tu bahía está llena; repara lo que ya construiste.');return}
 if(V.blockedOut(x,y,12)||sand.builds.some(b=>Math.hypot(b.x-x,b.y-y)<22)){X.toast('Busca un terreno libre para construir.');return}
 const re=sand.rebar&&Math.hypot(sand.rebar.x-x,sand.rebar.y-y)<24?sand.rebar.grade:0;const max=32+height*18+re*55;sand.builds.push({x,y,height,shape,re,hp:max,max});sand.water-=cost;if(re)sand.rebar=null;G.save();G.sfx.get();if(sand.builds.length===1)await X.say('Pochacco','¡Ese es tu primer castillo! Ven a mi sombrilla, tengo algo para ayudarte.');
};
E.actions.waves=async()=>{if(wave)return;if(!sand.builds.some(b=>b.hp>0)){X.toast('Construye al menos un castillo antes.');return}const i=await X.ask('Prueba de resistencia',['🌊 Ola suave','🌊🌊 Marejada','🌊🌊🌊 Tsunami de juguete','🏆 Concurso: tres olas','Volver']);if(i>3)return;wave={t:0,level:i===3?0:i,contest:i===3,round:0,seen:new Set()};X.toast('¡La ola viene desde la costa!')};
H.update.push(dt=>{if(!wave||!(V.map.exp46==='sand'||V.map===V.MAIN&&window.WalesaMainworld))return;const m=V.map,center=m===V.MAIN&&window.WalesaMainworld?WalesaMainworld.sand:m;wave.t+=Math.min(.05,dt);const front=center.y+300-wave.t*(85+wave.level*30);for(const b of sand.builds)if(!wave.seen.has(b)&&b.y>front){wave.seen.add(b);b.hp=Math.max(0,b.hp-(35+wave.level*48)*(b.height>1?1.15:1));}
 if(front<center.y-320){const alive=sand.builds.filter(b=>b.hp>0).length;if(wave.contest&&alive&&wave.round<2){wave.round++;wave.level++;wave.t=0;wave.seen.clear()}else{const won=wave.contest&&alive>0;if(won){sand.wins++;sand.tier=2;G.addBells(400,true);X.invAdd('concha',3);X.toast('🏆 ¡Ganaste! Moldes grandes desbloqueados.')}else X.toast(alive?'🏰 Resistieron '+alive+' castillos.':'🌊 La arena volvió a la playa. Puedes reparar tus castillos.');wave=null;G.save()}}
});
function castle(g,b){const k=b.height,colors=['#e8c98f','#f7dda5','#d9b878'];if(b.hp<=0){E.ellipse(g,0,-1,13+k*2,4,'#d9bd89');return}const size=9+k*3,h=9+k*9;P.wc(g,P.RR(-size/2,-h,size,h,1),colors[0],{lw:.5});P.wc(g,P.RR(-size/2+2,-h+3,size*.5,h-4,1),colors[1],{ink:0});for(let i=0;i<3;i++)P.wc(g,P.RR(-size/2+i*size/3,-h-4,size/4,6,.4),colors[0],{lw:.4});P.wc(g,P.RR(-2,-8,4,8,2),'#a9865e',{lw:.3});if(k>3)for(const dx of[-size,size]){P.wc(g,P.RR(dx-5,-h*.8,10,h*.8,2),colors[0],{lw:.4});P.wc(g,P.E(dx,-h*.8,6,2.5),colors[1],{lw:.3})}if(b.hp<b.max){g.strokeStyle='#b49161';g.lineWidth=.7;g.beginPath();g.moveTo(0,-h*.8);g.lineTo(-2,-h*.5);g.lineTo(2,-h*.3);g.stroke()}}
H.bill.push((bb,t)=>{const m=V.map;if(X.st.scene!=='out')return;if(m===V.MAIN&&!window.WalesaMainworld){for(const [key,a] of Object.entries(portal))bb.push({x:a.x,y:a.y,draw:g=>E.marker(g,0,0,key==='sand'?'🪣':'🧭')});return}if(!m.exp46)return;
 bb.push({x:m.cx,y:m.cy+285,draw:g=>E.marker(g,0,0,'🏝️')});
 for(const q of m.collect46||[])if(!q.got)bb.push({x:q.x,y:q.y,draw:g=>{if(q.k==='wood'){P.ln(g,[[-6,0],[5,-6]],'#94775a',2);P.ln(g,[[0,-3],[-2,-7]],'#94775a',1)}else E.text(g,q.k==='baya'?'🍓':'✨',0,-4,10)}});
 if(m.exp46==='sand'){for(const b of sand.builds)bb.push({x:b.x,y:b.y,draw:g=>castle(g,b)});if(sand.rebar)bb.push({x:sand.rebar.x,y:sand.rebar.y,draw:g=>P.ln(g,[[0,0],[0,-sand.rebar.grade*14]],'#8d7058',2)});
  bb.push({x:m.cx-100,y:m.cy+45,draw:g=>{P.wc(g,P.E(0,-35,22,8),'#e9a5bf',{lw:.6});P.ln(g,[[0,-35],[0,0]],'#9a795b',1.6);E.char(g,{...V.NPCDEF.pochacco,outfit:'camiseta',oColor:'#9cd9dd',acc:'none'},0,0)}});
  for(const [x,y,ic] of[[95,270,'💧'],[135,55,'🏆'],[-140,-95,'🏐']])bb.push({x:m.cx+x,y:m.cy+y,draw:g=>E.marker(g,0,0,ic)})
 }else bb.push({x:m.cx-50,y:m.cy+35,draw:g=>E.char(g,m.exp46==='forest'?'keroppi':'melody',0,0)})
});
H.ground.push((g,ox,oy)=>{if(!wave||!(V.map.exp46==='sand'||V.map===V.MAIN&&window.WalesaMainworld))return;const m=V.map,c=m===V.MAIN&&window.WalesaMainworld?WalesaMainworld.sand:m,y=c.y+300-wave.t*(85+wave.level*30);g.save();const gr=g.createLinearGradient(0,y-oy-8,0,y-oy+70);gr.addColorStop(0,'rgba(248,255,255,.8)');gr.addColorStop(.15,'rgba(117,198,211,.55)');gr.addColorStop(1,'rgba(117,198,211,0)');g.fillStyle=gr;g.fillRect((m===V.MAIN&&window.WalesaMainworld?WalesaMainworld.sand.x:m.cx)-300-ox,y-oy,600,80);g.restore()});
E.actions.forestTask=async()=>{const m=V.map,done=S.regions.gathered||0;if(done<9){await X.say(m.exp46==='forest'?'Keroppi':'My Melody','Recorre los senderos y reúne nueve hallazgos. Las luciérnagas te prestarán su luz para abrir caminos entre sueños. Llevas '+done+'/9.');return}if(!S.regions.reward){S.regions.reward=1;S.dream.seals++;G.save();await X.say('Keroppi','¡Encontraste el camino! Este sello de luciérnaga puede acompañar a una mascota entre los dos mundos.')}else if(m.exp46==='forest'){const i=await X.ask('El bosque cambia de senderos',['Explorar un bosque nuevo','Quedarme']);if(i===0){S.regions.forestSeed=(S.regions.forestSeed||0)+1;delete cache.forest;const next=await region('forest');await E.home();await E.enter(next,next.cx,next.cy+230);G.save()}}};
E.actions.beachGames=async()=>{const i=await X.ask('Desafíos de la costa',['🏐 Lanzamientos a la diana','🏁 Carrera entre banderines','Volver']);if(i<2)X.startMG(i===0?'lanzamiento46':'carrera46')};
E.regions={region,cache,portal,castle};
})();