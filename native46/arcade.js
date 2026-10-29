(()=>{'use strict';const E=Expansion46,{X,G,V,P,H,MG}=E;
const inArc=()=>X.st.scene==='in'&&V.rooms[X.st.room]?._th==='arcade';
E.arcadeVisitors=()=>{const pool=X.night()?['badtz','kuromi','keroppi']:['badtz','pochacco','pom','melody'];const day=Math.floor(X.dayHash('arcade46')*1000);return pool.filter((id,i)=>V.NPCDEF[id]&&(i===0||(day+i)%3!==0))};
H.room.push((bb,R,t,dt,g,ox,oy)=>{if(!Array.isArray(bb)||!inArc())return;E.arcadeVisitors().filter(id=>id!=='badtz').forEach((id,i)=>{const x=88+i*38,y=145+Math.sin(t*.4+i)*5;bb.push({x,y,draw:(g,ox,oy)=>E.char(g,id,x-ox,y-oy,Math.abs(Math.cos(t*.4+i))>.6?1:0)})});bb.push({x:128,y:90,draw:(g,ox,oy)=>{P.wc(g,P.RR(111-ox,50-oy,34,40,3),'#b4a2d1',{lw:.8});E.text(g,'♫ DANCE',128-ox,63-oy,6);for(let i=0;i<4;i++)E.box(g,113+i*8-ox,79-oy,6,6,['#e88da8','#e6cd83','#90c9c6','#b3a4d7'][i])}})});
H.inter.push(l=>{if(inArc())E.addPoint(l,'dance46',128,106,'🎶 Pista de baile');const r=V.rooms[X.st.room];if(X.st.scene==='in'&&r&&['music','musica'].includes(r._th))E.addPoint(l,'music46',120,135,'🎵 Círculos musicales');});
E.actions.dance46=()=>X.startMG('baile46');E.actions.music46=async()=>{const i=await X.ask('Sala de música',['🎯 Círculos musicales','🎹 Piano de melodías','🎸 Concierto con notas largas','Volver']);if(i<3)X.startMG(['circulos46','piano46','rhythm'][i])};
// Keep the paid round, prize persistence and duplicate-reward guards of the original claw.
const m=MG.garra,ui=m.ui,start=m.start,grab=m.grab,end=m.end,down=m.down;
m.start=function(){E.motion.stop();this.grip46=0;this.lastGrip46=0;start.call(this)};
m.squeeze46=function(){const now=performance.now();if(!['down','close','up','carry'].includes(this.st)||now-this.lastGrip46<100)return;this.lastGrip46=now;this.grip46=Math.min(1,this.grip46+.07);if(this.held&&this.slipAt>=0&&this.grip46>=.7)this.slipAt=-1;G.hint('Agarre '+Math.round(this.grip46*100)+'% · sigue pulsando')};
m.ui=function(){ui.call(this);const d=document.querySelector('#mgDom');if(!d)return;const row=document.createElement('div');row.className='e46-row';if(this.st==='aim'){row.innerHTML='<button>📱 Inclinar celular</button>';row.firstChild.onclick=()=>E.motion.enable(this,v=>{if(this.st==='aim')this.tx=E.clamp(120+v*70,34,170)},()=>this.squeeze46())}else if(['down','close','up','carry'].includes(this.st)){row.innerHTML='<button>✊ Pulsa rápido para sujetar</button>';row.firstChild.onclick=()=>this.squeeze46()}d.appendChild(row)};
m.down=function(x,y){if(['down','close','up','carry'].includes(this.st))this.squeeze46();else down.call(this,x,y)};
m.grab=function(){grab.call(this);if(this.held&&this.slipAt>=0&&Math.random()<this.grip46*.75)this.slipAt=-1};
m.end=function(){E.motion.stop();end?.call(this)};
})();