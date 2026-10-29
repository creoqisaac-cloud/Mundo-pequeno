/* Isla de Walesa v31 · Picnic y teléfono. El paseo continúa con UN solo NPC. */
(()=>{
  'use strict';
  if(!window.Game || !window.World || !window.Talk) return;
  const X=Game.X, V=World, G=Game.G, H=X.HOOKS;
  const place=()=>V.MAIN?.spots?.picnic;
  const name=id=>Talk.P[id]?.name||id;
  const voice=id=>Talk.P[id]?.voice;
  const say=(id,t)=>X.say(id?name(id):'',t,id?voice(id):undefined);
  const guests=()=>window.WalesaMeet?.store?.().filter(q=>q.zone==='picnic'&&q.day===X.today())||[];
  const allAtBlanket=()=>{
    const s=place();if(!s)return[];
    const invited=new Set(guests().filter(q=>q.status==='llegó').map(q=>q.id));
    const arr=(X.NPCS||[]).filter(n=>n.id!=='isaac'&&Talk.P[n.id]&&(n.comp||invited.has(n.id)||!n.static&&Math.hypot(n.x-s.x,n.y-s.y)<110));
    return [...new Map(arr.map(n=>[n.id,n])).values()];
  };
  const nearBlanket=()=>X.st.scene==='out'&&X.M()===V.MAIN&&place()&&Math.hypot(X.player.x-place().x,X.player.y-place().y)<110;
  function finishInvite(id){
    const a=window.WalesaMeet?.store?.();if(!a)return;
    const i=a.findIndex(q=>q.id===id&&q.zone==='picnic'&&q.day===X.today());
    if(i!==-1){a.splice(i,1);G.save()}
  }
  async function eat(n){
    const foods=['galleta','fruta','cupcake','helado','pizza','dulce','algodon','cafe','te','tamarindo','galletasC','mermelada','brocheta','baya','malva'];
    const has=foods.filter(k=>(save.inv?.[k]||0)>0&&Talk.ITEMS[k]);
    if(!has.length){await say(n?.id||'',n?'No trajiste comida, pero podemos compartir las galletas que traje.':'No tienes comida en la mochila. Puedes comprar algo en la Tiendita.');return}
    const k=await X.ask(n?'¿Qué le compartes?':'¿Qué comes?',has.map(v=>Talk.ITEMS[v][1]+' '+Talk.ITEMS[v][0]+' ('+save.inv[v]+')').concat('Nada'));
    if(k>=has.length)return;const item=has[k];X.invAdd(item,-1);G.sfx.bite?.();
    if(!n){X.toast('😋 Comiste '+Talk.ITEMS[item][0]);return}
    const fav=Talk.P[n.id]?.likes?.includes(item);
    await say(n.id,fav?'¡Es mi favorito! Gracias por acordarte. ♡':'¡Qué rico! Todo sabe mejor compartido.');
    if(fav)window.Life?.bump?.(n.id,1);
  }
  const shapes=['un pudín con patitas','un corazón chueco','un gato estirándose','una tetera','una ballena sonriendo','un conejo con una oreja'];
  async function sitWith(party){
    if(!party.length || !place() || X.M()!==V.MAIN || X.st.scene!=='out')return;
    const hour=gameHour();if(hour>=22||hour<6){await say('', 'Ya es muy tarde para el picnic. Mejor mañana. 🌙');return}
    const s=place(),p=X.player,original={x:p.x,y:p.y,dir:p.dir};
    const seats=[[16,4],[-16,-12],[18,-14],[-24,10],[5,19]];
    const selected=party.slice(0,5);const prior=selected.map(n=>({n,x:n.x,y:n.y,static:n.static,sitF:n.sitF,sitDir:n.sitDir,dir:n.dir,comp:n.comp}));
    try{
      selected.forEach(n=>{n._picnic31=true;n.static=true;n.path=null;n._meetPath=null});
      await X.iris(()=>{
        p.x=s.x-16;p.y=s.y+4;p.dir=3;X.cam.x=s.x;X.cam.y=s.y;
        selected.forEach((n,i)=>{const [dx,dy]=seats[i];n.x=s.x+dx;n.y=s.y+dy;n.dir=2;n.sitF=true;n.sitDir=2;n.frame=14});
      });
      if(window.V5?.startPose){V5.startPose('sit',0);V5.pose.dir=3}
      for(;;){
        const group=selected.length>1;
        const options=['🍙 Compartir comida','💬 Platicar','☁️ Buscar figuras en las nubes','🎵 Cantar algo','👋 Terminar el picnic'];
        const k=await X.ask(group?'Picnic con '+selected.map(n=>name(n.id)).join(', '):'Picnic con '+name(selected[0].id),options);
        if(k===4)break;
        let n=selected[0];
        if(group&&(k===0||k===1||k===2)){
          const j=await X.ask('¿Con quién?',selected.map(v=>name(v.id)).concat('Volver'));
          if(j>=selected.length)continue;n=selected[j];
        }
        if(k===0)await eat(n);
        else if(k===1)await say(n.id,selected.length>1?'Qué bonito que coincidimos todos aquí. ¿Hacemos esto otro día?':'Qué bonito se está aquí. Me encanta compartir esta tarde contigo.');
        else if(k===2){const q=shapes[Math.floor(Math.random()*shapes.length)];await say(n.id,'Mira esa nube… a mí me parece '+q+'. ♡')}
        else if(k===3){G.sfx.note?.(72);for(const v of selected)X.bubble(v,'♪ ♡');await say(n.id,selected.length>1?'¡Cantamos todos! Cada quien en un tono distinto.':'Desafinamos los dos al mismo tiempo. Eso cuenta como armonía.');}
      }
      for(const n of selected){
        await say(n.id,'Gracias por invitarme al picnic. La próxima yo traigo el postre. ♡');
        const key=X.today()+':'+n.id;
        if(!save.picDays31)save.picDays31={};
        if(!save.picDays31[key]){save.picDays31[key]=1;window.Life?.bump?.(n.id,2);window.Life?.remember?.(n.id,'hicimos un picnic juntos')}
      }
      G.save();
    }finally{
      if(window.V5?.pose?.k){V5.pose.hop=null;V5.pose.dir=null;V5.endPose()}
      p.x=s.x-16;p.y=s.y+21;p.dir=original.dir;
      prior.forEach(({n,static:s0,sitF:sf,sitDir:sd,dir,comp},i)=>{
        finishInvite(n.id);
        n._picnic31=false;n.sitF=sf||false;n.sitDir=sd??null;n.dir=dir;
        n.x=s.x+24+i*14;n.y=s.y+22+Math.floor(i/3)*10;
        n.static=comp?true:!!Talk.P[n.id]?.static;
        n.hx=n.tx=n.x;n.hy=n.ty=n.y;n.wait=1;n._meetKey=null;n._meetArrived=false;n._meetPath=null;
      });
      G.save();
    }
  }
  async function picnic(){
    if(!place()||X.M()!==V.MAIN||X.st.scene!=='out')return;
    const a=allAtBlanket(),invited=new Set(guests().filter(q=>q.status==='llegó').map(q=>q.id));
    const everyone=a.filter(n=>n.comp||invited.has(n.id));
    const waiting=guests().filter(q=>q.status!=='llegó').length;
    const opts=['🧺 Invitar a alguien',...(everyone.length>1?['👥 Picnic con todos los invitados ('+Math.min(5,everyone.length)+')']:[]),'🍙 Comer algo aquí','👀 Mirar el picnic','Nada'];
    const choice=await X.ask('El picnic',opts);const val=opts[choice];
    if(val==='🍙 Comer algo aquí')return eat(null);
    if(val==='👀 Mirar el picnic')return X.say('Un picnic para dos','Una manta, tazas y galletas. El lugar perfecto para una tarde tranquila.');
    if(val?.startsWith('👥'))return sitWith(everyone);
    if(val!=='🧺 Invitar a alguien')return;
    if(!a.length){await say('',waiting?'Los invitados vienen en camino. Revisa el picnic cuando lleguen.':'No hay nadie cerca. Puedes llamar a alguien desde tu teléfono y citarlo aquí.');return}
    const order=[...a].sort((x,y)=>(y.comp?1:0)-(x.comp?1:0)||Number(invited.has(y.id))-Number(invited.has(x.id)));
    const names=order.map(n=>(n.comp?'🚶 ':invited.has(n.id)?'📞 ':'♡ ')+name(n.id));
    if(order.length>1)names.unshift('👥 Todos los presentes (máx. 5)');
    const k=await X.ask('¿A quién invitas?',names.concat('Mejor no'));
    if(k>=names.length)return;
    const selected=order.length>1&&k===0?order: [order[order.length>1?k-1:k]];
    await sitWith(selected);
  }
  H.act.unshift(it=>it.type==='note'&&it.id==='picnic'?picnic():null);
  H.talkOpts.push((n,opts,acts)=>{
    if(!n?.comp||n.id==='isaac')return;
    opts.splice(1,0,'🧺 ¿Hacemos un picnic?');
    acts.splice(1,0,async()=>{
      if(nearBlanket())return sitWith([n]);
      await say(n.id,'¡Sí! Vamos a la manta del picnic, junto a la plaza. Te sigo. ♡');
      X.toast('🧺 Acércate a la manta y toca el picnic');
    });
  });
  window.WalesaPicnic={open:picnic,start:ids=>sitWith((X.NPCS||[]).filter(n=>ids.includes(n.id))),guests:allAtBlanket};
})();