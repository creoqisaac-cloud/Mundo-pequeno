/* Native expansion: shares the existing engine, artwork, save and input lifecycle. */
(()=>{'use strict';
const X=Game.X,G=Game.G,V=World,P=Paint,H=X.HOOKS,MG=Game.MG;
const S=save.exp46||(save.exp46={});
for(const [k,v] of Object.entries({sand:{tier:0,water:0,wood:[0,0,0],tools:[],builds:[],wins:0},regions:{},dream:{seals:0},scores:{},garage:[]}))if(!S[k])S[k]=v;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a);
const E=window.Expansion46={X,G,V,P,H,MG,S,clamp,rand};
E.text=(g,t,x,y,size=8,c='#674755',align='center')=>{g.font='800 '+size+'px Nunito,sans-serif';g.fillStyle=c;g.textAlign=align;g.textBaseline='middle';g.fillText(String(t),x,y)};
E.ellipse=(g,x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()};
E.box=(g,x,y,w,h,c,r=4)=>{g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill()};
E.char=(g,id,x,y,frame=0,dir=0,k=1)=>{const s=V.charSprite(typeof id==='string'?V.NPCDEF[id]:id,dir,frame);g.drawImage(s.c,x-s.ax*k,y-s.ay*k,s.c.width*k,s.c.height*k)};
E.background=(g,key,top='#e8dfea',bottom='#d9e6d1')=>{const night=X.night();MGFX.bgc('exp46'+key+night,g,G.W,G.H,(c,w,h)=>{const gr=c.createLinearGradient(0,0,w,h);gr.addColorStop(0,top);gr.addColorStop(1,bottom);c.fillStyle=gr;c.fillRect(0,0,w,h);for(let i=0;i<26;i++){c.fillStyle='rgba(255,250,240,.22)';c.beginPath();c.ellipse(V.hash(i,7)*w,V.hash(i,9)*h,7+V.hash(i,2)*24,4+V.hash(i,3)*12,0,0,7);c.fill()}if(night){c.fillStyle='#25274435';c.fillRect(0,0,w,h);for(let i=0;i<12;i++){c.fillStyle='#fff4c5';c.fillRect(V.hash(i,19)*w,18+V.hash(i,23)*h*.12,1,1)}}});};
E.ui=(m,buttons,caption='')=>{const d=G.dom('<div class="e46-panel"><div class="e46-caption">'+caption+'</div><div class="e46-row">'+buttons.map(([id,label])=>'<button data-e46="'+id+'">'+label+'</button>').join('')+'</div></div>');d.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();if(Game.st.mg===m&&!m.over)m.action?.(b.dataset.e46)});return d};
E.finish=(m,title,text,coins=0)=>{if(m.over)return;m.over=true;m.input=null;E.motion.stop();G.dom('');G.hint('');const old=save.bells;if(coins)G.addBells(coins,true);const received=save.bells-old;G.save();G.result({icon:m.icon||'🌟',title,text:text+(received?'<br>Ganaste '+received+' 🔔':''),again:()=>m.start(m.args),againLabel:'Otra partida'})};
E.motion={owner:null,fn:null,async enable(owner,onTilt,onShake){this.stop();try{if(!isSecureContext||!window.DeviceOrientationEvent)throw Error('unsupported');const req=DeviceOrientationEvent.requestPermission;const granted=req?await req.call(DeviceOrientationEvent):'granted';if(granted!=='granted'||Game.st.mg!==owner)return false;this.owner=owner;let baseline=null,last=0,old=0;this.fn=e=>{if(this.owner!==owner||Game.st.mg!==owner)return this.stop();if(!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;const a=(screen.orientation?.angle||0)*Math.PI/180,v=e.gamma*Math.cos(a)+e.beta*Math.sin(a);if(baseline===null)baseline=v;const now=performance.now();onTilt?.(clamp((v-baseline)/25,-1,1));if(now-last>140&&Math.abs(v-old)>16){onShake?.();last=now}old=v};addEventListener('deviceorientation',this.fn);return true}catch(_){X.toast('Puedes usar los controles táctiles.');return false}},stop(){if(this.fn)removeEventListener('deviceorientation',this.fn);this.owner=null;this.fn=null}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)E.motion.stop()});
H.update.push(()=>{if(E.motion.owner&&Game.st.mg!==E.motion.owner)E.motion.stop()});
E.free=(m,x,y,r=7)=>{if(V.map===m&&!V.blockedOut(x,y,r))return{x,y};for(let d=12;d<180;d+=12)for(let i=0;i<24;i++){const xx=x+Math.cos(i/24*Math.PI*2)*d,yy=y+Math.sin(i/24*Math.PI*2)*d;if(V.map===m&&!V.blockedOut(xx,yy,r))return{x:xx,y:yy}}return{x:m.cx,y:m.cy}};
let origin=null,travelling=false;
E.enter=async(m,x=m.cx,y=m.cy)=>{if(travelling)return;travelling=true;X.st.busy=true;try{if(!V.map?.exp46||!origin)origin={map:V.map,x:X.player.x,y:X.player.y,scene:X.st.scene,room:X.st.room};await X.iris(()=>{V.use(m);X.st.scene='out';X.resetInput();const p=E.free(m,x,y);Object.assign(X.player,p);Object.assign(X.cam,p);X.setNPCs();X.petE.x=p.x+14;X.petE.y=p.y+8});X.placeTag(m.name)}finally{X.st.busy=false;travelling=false}};
E.home=async()=>{if(!origin||travelling)return;travelling=true;X.st.busy=true;const o=origin;try{await X.iris(()=>{V.use(o.map);X.st.scene=o.scene;X.st.room=o.room;X.resetInput();X.player.x=o.x;X.player.y=o.y+10;X.cam.x=o.x;X.cam.y=o.y;X.setNPCs()});origin=null}finally{travelling=false;X.st.busy=false}};
// Physical scenery in the original paint vocabulary, never a floating UI box.
E.marker=(g,x,y,icon)=>{g.save();g.translate(x,y);
 E.ellipse(g,0,0,12,3,'rgba(70,40,55,.13)');
 if(icon==='💧'){P.wc(g,P.E(0,-2,12,4.2),'#ecd0a3',{lw:.35});P.wc(g,P.E(0,-4,9,2.5),'#93cbd5',{lw:.3,gloss:.5});P.wc(g,P.RR(-2.4,-10,4.8,5,1),'#b1d7db',{lw:.3});}
 else if(icon==='🏆'){P.wc(g,P.RR(-1,-21,2,19,.5),'#a78567',{lw:.35});P.wc(g,P.RR(-10,-25,20,10,2),'#fff5df',{lw:.45,hl:.3});P.wc(g,P.E(0,-20,4,3),'#e5c16e',{lw:.35,gloss:.5});}
 else if(icon==='🏐'){P.wc(g,P.E(0,-7,8,8),'#fffaf0',{lw:.45,gloss:.3});P.ln(g,[[-5,-9],[5,-5]],'#e2a1b8',.8);P.ln(g,[[1,-14],[-1,0]],'#9bbdd2',.8);}
 else if(icon==='🏝️'){P.wc(g,P.E(0,-4,12,3),'#f1d9aa',{lw:.3});P.wc(g,P.RR(-2,-14,4,10,1),'#c2936b',{lw:.35});}
 g.restore()};
E.addPoint=(list,key,x,y,label,hy=34)=>list.push({type:'exp46',key,x,y,r:24,hy,label});
E.actions={};H.act.unshift(it=>it.type==='exp46'&&E.actions[it.key]?Promise.resolve().then(()=>E.actions[it.key](it)):null);
const css=document.createElement('style');css.textContent='.e46-panel{width:min(440px,100%);padding:10px;border:2px solid #f4dfcf;border-radius:19px;background:#fff8edee;box-shadow:0 5px 18px #67404b33;font:800 13px Nunito,sans-serif;color:#704e5b;text-align:center}.e46-row{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}.e46-row button{flex:1;min-width:55px;min-height:44px;padding:8px;border:1px solid #dcb7c8;border-radius:12px;background:#f9e1e9;color:#694c5b;font:800 12px Nunito,sans-serif;touch-action:manipulation}.e46-caption{margin-bottom:6px}';document.head.appendChild(css);
})();