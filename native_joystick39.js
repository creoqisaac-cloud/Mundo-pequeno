/* Isla de Walesa v39: control nativo de movimiento. */
(()=>{'use strict';
try{
 const X=Game.X,G=Game.G,H=X.HOOKS,g=document.getElementById('game'),c=save.joystick37||(save.joystick37={});
 if(!g||!X.player||!H)return;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 if(c.native39!==true){c.enabled=false;c.native39=true;c.x=18;c.y=77;c.size=122;}
 c.x=Number.isFinite(+c.x)?+c.x:18;c.y=Number.isFinite(+c.y)?+c.y:77;c.size=Number.isFinite(+c.size)?+c.size:122;
 const css=document.createElement('style');
 css.textContent=[
 '#game #nativeJoy39{position:absolute;left:18%;top:77%;width:122px;height:122px;z-index:44;transform:translate(-50%,-50%);border-radius:100%;display:none;touch-action:none;user-select:none;-webkit-user-select:none;pointer-events:auto;filter:drop-shadow(0 4px 9px #34263966)}',
 '#game #nativeJoy39.on,#game #nativeJoy39.editing{display:grid;place-items:center}',
 '#game #nativeJoy39 .base{box-sizing:border-box;width:100%;height:100%;display:grid;place-items:center;border-radius:100%;background:#ffe6f399;border:3px solid #fff9f3cc;box-shadow:inset 0 0 0 3px #a870a088}',
 '#game #nativeJoy39 .knob{width:43%;height:43%;border-radius:100%;display:grid;place-items:center;background:linear-gradient(140deg,#fffaff,#e8adcb);border:2px solid white;box-shadow:0 3px 7px #74456777;color:#ad6b94;font-size:24px;pointer-events:none;will-change:transform}',
 '#game #nativeJoy39.editing{z-index:94;border:3px dashed #d76b9b;box-sizing:border-box;filter:drop-shadow(0 0 8px #ffe6f2)}',
 '#game #nativeJoy39.editing .knob{transform:none!important}',
 '#game #nativeJoyBar39{position:absolute;left:50%;top:max(10px,env(safe-area-inset-top));transform:translateX(-50%);width:min(330px,calc(100% - 26px));box-sizing:border-box;z-index:95;background:#fff9f4;color:#794b66;border:2px solid #fff;border-radius:18px;box-shadow:0 6px 20px #301d3066;padding:12px;text-align:center;font-family:Nunito,sans-serif;display:none}',
 '#game #nativeJoyBar39.on{display:block}',
 '#game #nativeJoyBar39 strong{display:block;font-size:15px}',
 '#game #nativeJoyBar39 small{display:block;font-size:12px;margin:4px 0 9px}',
 '#game #nativeJoyBar39 .row{display:flex;gap:6px;margin:6px 0}',
 '#game #nativeJoyBar39 button{flex:1;min-height:38px;border-radius:12px;background:#f3dce7;color:#79536b;font-weight:900;font-size:12px;padding:5px}',
 '#game #nativeJoyBar39 button.selected{box-shadow:inset 0 0 0 2px #c96d9d;background:#ffe0ec}',
 '#game #nativeJoyBar39 button[data-ok]{background:#c45f93;color:white}',
 '#game.mg #nativeJoy39,#game:not(.playing) #nativeJoy39.on,#game:has(#sheet.on) #nativeJoy39.on,#game:has(#shop.on) #nativeJoy39.on{display:none!important}'
 ].join('\n');document.head.appendChild(css);
 const joy=document.createElement('div');joy.id='nativeJoy39';joy.setAttribute('aria-label','Palanca para caminar');
 joy.innerHTML='<div class="base"><div class="knob">✿</div></div>';g.appendChild(joy);
 const knob=joy.querySelector('.knob');
 const bar=document.createElement('div');bar.id='nativeJoyBar39';
 bar.innerHTML='<strong>🕹️ Acomoda tu palanca</strong><small>Arrástrala sobre el juego.</small><div class="row"><button data-size="98">Pequeña</button><button data-size="122">Normal</button><button data-size="150">Grande</button></div><div class="row"><button data-cancel>Cancelar</button><button data-ok>✓ Listo</button></div>';
 g.appendChild(bar);
 let held=null,dx=0,dy=0,editing=false,backup=null;
 function place(){
  const r=g.getBoundingClientRect(),w=r.width||innerWidth,h=r.height||innerHeight;
  c.size=clamp(+c.size||122,98,150);
  const minx=Math.min(49,(c.size/2+10)/Math.max(w,1)*100),miny=Math.min(49,(c.size/2+10)/Math.max(h,1)*100);
  c.x=clamp(+c.x||18,minx,100-minx);c.y=clamp(+c.y||77,miny,100-miny);
  joy.style.left=c.x+'%';joy.style.top=c.y+'%';joy.style.width=c.size+'px';joy.style.height=c.size+'px';
 }
 function playable(){return X.st.mode==='play'&&!X.st.menu&&!X.st.mg&&!X.st.busy&&!X.st.poseLock&&!X.st.trans}
 function enabled(){return c.enabled===true&&!editing&&playable()&&joy.isConnected}
 function release(){held=null;dx=dy=0;knob.style.transform='translate(0px,0px)'}
 function updateUI(){joy.classList.toggle('on',enabled());joy.classList.toggle('editing',editing)}
 function vector(){try{if(!enabled()){release();updateUI();return null;}updateUI();return{x:dx,y:dy};}catch(err){console.warn('Se restableció el control táctil',err);c.enabled=false;try{release()}catch(_){}return null;}}
 function center(e){
  const r=joy.getBoundingClientRect(),xx=e.clientX-r.left-r.width/2,yy=e.clientY-r.top-r.height/2,dist=Math.hypot(xx,yy),max=c.size*.33;
  const mul=dist?Math.min(1,max/dist):0;
  knob.style.transform='translate('+Math.round(xx*mul)+'px,'+Math.round(yy*mul)+'px)';
  const m=clamp((dist/max-.14)/.86,0,1);dx=dist?xx/dist*m:0;dy=dist?yy/dist*m:0;
 }
 function relocate(e){const r=g.getBoundingClientRect();if(!r.width||!r.height)return;c.x=(e.clientX-r.left)/r.width*100;c.y=(e.clientY-r.top)/r.height*100;place();}
 joy.addEventListener('pointerdown',e=>{if(held!==null||(!editing&&!enabled()))return;
  e.stopPropagation();e.preventDefault();held=e.pointerId;try{joy.setPointerCapture(held)}catch(_){}
  if(editing)relocate(e);else{X.player.path=null;X.player.pending=null;center(e);}
 });
 joy.addEventListener('pointermove',e=>{if(e.pointerId!==held)return;e.preventDefault();e.stopPropagation();if(editing)relocate(e);else center(e)});
 const up=e=>{if(e.pointerId===held)release()};
 joy.addEventListener('pointerup',up);joy.addEventListener('pointercancel',up);joy.addEventListener('lostpointercapture',up);
 addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release()});
 addEventListener('resize',()=>{place();release()});
 function sizes(){bar.querySelectorAll('[data-size]').forEach(b=>b.classList.toggle('selected',+b.dataset.size===c.size))}
 function setup(){if(editing)return;release();backup={enabled:c.enabled,x:c.x,y:c.y,size:c.size};c.enabled=false;editing=true;
  X.player.path=null;X.player.pending=null;if(X.st.menu)X.closeMenu();place();sizes();bar.classList.add('on');updateUI();
 }
 function finish(ok){if(!editing)return;release();editing=false;bar.classList.remove('on');
  if(ok){c.enabled=true;c.native39=true;}else if(backup)Object.assign(c,backup);
  backup=null;place();updateUI();try{G.save()}catch(_){}
 }
 bar.querySelectorAll('[data-size]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();c.size=+b.dataset.size;place();sizes()}));
 bar.querySelector('[data-ok]').addEventListener('click',e=>{e.stopPropagation();finish(true);X.toast('🕹️ ¡Palanca lista!')});
 bar.querySelector('[data-cancel]').addEventListener('click',e=>{e.stopPropagation();finish(false)});
 addEventListener('keydown',e=>{if(editing&&e.key==='Escape'){e.preventDefault();finish(false)}});
 H.tab.push((tab,box)=>{if(tab!=='opts')return;queueMicrotask(()=>{
  if(!box.isConnected||X.st.tab!=='opts'||box.querySelector('#nativeJoyOption39'))return;
  const row=document.createElement('button');row.className='orow';row.id='nativeJoyOption39';
  row.textContent='🕹️ Movimiento: '+(c.enabled?'Palanca':'Tocar suelo');
  row.onclick=()=>{
   if(box.querySelector('#nativeJoyChoices39'))return;
   const choices=document.createElement('div');choices.id='nativeJoyChoices39';choices.style.cssText='display:flex;gap:8px;margin:9px 0';
   choices.innerHTML='<button class="orow" data-touch>👆 Tocar suelo</button><button class="orow" data-stick>🕹️ Palanca</button>';
   row.after(choices);
   choices.querySelector('[data-touch]').onclick=()=>{release();c.enabled=false;c.native39=true;updateUI();try{G.save()}catch(_){}X.showTab('opts')};
   choices.querySelector('[data-stick]').onclick=setup;
  };box.insertBefore(row,box.firstChild);
 })});
 place();updateUI();
 window.WalesaJoystick37={vector,enabled,release,setup,config:c};window.WalesaJoystick39=window.WalesaJoystick37;
}catch(err){
 console.warn('Joystick v39 desactivado por seguridad',err);
 try{if(save.joystick37)save.joystick37.enabled=false}catch(_){}
 window.WalesaJoystick37={vector:()=>null,enabled:()=>false,release:()=>{}};
}
})();