/* Isla de Walesa · Control nativo v45.
   Sin dependencias: el joystick no puede detener el bucle del juego.
   Al soltarlo, tocar el suelo sigue disponible como control de respaldo. */
(()=>{
 'use strict';
 try {
  // Game y save son "const" globales del HTML, no propiedades de window.
  // Buscar window.Game/window.save impedía cargar el control en producción.
  const X=typeof Game!=='undefined'&&Game&&Game.X;
  const G=typeof Game!=='undefined'&&Game&&Game.G;
  const game=document.getElementById('game');
  if(!X||!G||!X.HOOKS||!game||typeof save==='undefined')return;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const cfg=save.joystick37||(save.joystick37={});
  const sizeOpts=[92,116,144];
  cfg.enabled=cfg.enabled===true;
  cfg.x=clamp(Number.isFinite(Number(cfg.x))?Number(cfg.x):19,15,85);
  cfg.y=clamp(Number.isFinite(Number(cfg.y))?Number(cfg.y):76,23,87);
  cfg.size=sizeOpts.reduce((best,n)=>Math.abs(n-Number(cfg.size))<Math.abs(best-Number(cfg.size))?n:best,116);
  cfg.hitArea=clamp(Number(cfg.hitArea)||180,Math.max(cfg.size,120),260);
  cfg.ready40=true;
  cfg.native41=true;

  const style=document.createElement('style');
  style.id='wcJoystickStyle41';
  style.textContent=[
   '#game #wcJoystick40{position:absolute;z-index:44;left:19%;top:76%;width:116px;height:116px;transform:translate(-50%,-50%);display:none;touch-action:none;user-select:none;-webkit-user-select:none;border-radius:50%;pointer-events:auto;overscroll-behavior:contain;filter:drop-shadow(0 4px 10px #53394e55)}',
   '#game #wcJoystick40.wcOn40{display:flex;align-items:center;justify-content:center}',
   '#game:not(.on) #wcJoystick40,#game.mg #wcJoystick40,#game:has(#sheet.on) #wcJoystick40,#game:has(#shop.on) #wcJoystick40{display:none!important}',
   '#game #wcJoystick40 .wcJ40Well{box-sizing:border-box;width:var(--wc-visual,116px);height:var(--wc-visual,116px);flex:none;display:grid;place-items:center;border-radius:50%;border:3px solid #fff9f1dc;background:radial-gradient(circle at 34% 28%,#fffcf3de,#f7cadeaa 72%,#df91b57a);box-shadow:inset 0 0 0 3px #c481a69a,0 2px 7px #694b6077}',
   '#game #wcJoystick40 .wcJ40Ball{width:42%;height:42%;box-sizing:border-box;display:grid;place-items:center;border:3px solid #fffdfb;border-radius:50%;background:linear-gradient(145deg,#fff5fa,#e6a5c8);box-shadow:0 3px 9px #61435d6b,inset 0 1px 3px #fff8;color:#ab5e89;font:900 24px Nunito,sans-serif;pointer-events:none;will-change:transform}',
   '#game #wcJoystick40.wcTouching41 .wcJ40Well{border-color:#fff;box-shadow:inset 0 0 0 3px #bf6b9699,0 0 0 3px #f6d6e564}',
   '#game #wcControlOptions40{padding:14px;margin:12px 0 15px;border:2px solid #efd1e0;border-radius:19px;background:linear-gradient(155deg,#fffcf8,#fff0f5);box-shadow:0 4px 13px #9d64801f;color:#704a62;font-family:Nunito,sans-serif}',
   '#game #wcControlOptions40 strong{display:block;font:900 16px Nunito,sans-serif;margin-bottom:4px}',
   '#game #wcControlOptions40 p{font:700 12px/1.5 Nunito,sans-serif;margin:5px 0 10px;color:#93758a}',
   '#game #wcControlOptions40 .wcModes40,#game #wcControlOptions40 .wcSizes40{display:flex;align-items:center;gap:7px;margin:9px 0}',
   '#game #wcControlOptions40 button{min-height:38px;flex:1;padding:7px 6px;border:2px solid #ead5e0;border-radius:12px;background:#fff;color:#80546f;font:800 12px Nunito,sans-serif;touch-action:manipulation}',
   '#game #wcControlOptions40 button.wcChosen40{background:#ffe1ed;border-color:#c76f99;color:#a84d80;box-shadow:inset 0 0 0 1px #fff8}',
   '#game #wcControlOptions40 .wcSave40{display:block;width:100%;margin-top:9px;background:linear-gradient(135deg,#d47aa5,#b95986);border-color:#b95986;color:white;font-size:14px}',
   '#game #wcControlOptions40 .wcPreview40{position:relative;max-width:340px;height:160px;overflow:hidden;margin:9px auto 12px;border:2px solid #dfbad0;border-radius:16px;touch-action:none;background:linear-gradient(180deg,#e7f4f5,#e4f1db 68%,#d5e5c9);box-shadow:inset 0 2px 8px #7a9b9c24}',
   '#game #wcControlOptions40 .wcPreview40:before{content:"☁️　🌳　🌼";position:absolute;top:9px;left:9px;opacity:.65;font-size:24px;pointer-events:none}',
   '#game #wcControlOptions40 .wcPreview40:after{content:"🏠　🌷　🐾";position:absolute;bottom:12px;right:12px;opacity:.6;font-size:19px;pointer-events:none}',
   '#game #wcControlOptions40 .wcPreviewHit43{position:absolute;transform:translate(-50%,-50%);border:2px dashed #bf73a2a9;border-radius:50%;background:#dc9cb725;pointer-events:none;box-sizing:border-box;z-index:1}',
   '#game #wcControlOptions40 .wcPreviewHandle40{position:absolute;display:grid;place-items:center;transform:translate(-50%,-50%);border:3px solid #fffdfb;border-radius:50%;background:linear-gradient(135deg,#ffd9e8,#d67caa);box-shadow:0 2px 10px #88587980,inset 0 0 0 5px #ffe8f1;touch-action:none;user-select:none;-webkit-user-select:none;z-index:2;color:#fff;font:900 24px Nunito,sans-serif}',
   '#game #wcControlOptions40 .wcPreviewHandle40:before{content:"✿";pointer-events:none}',
   '#game #wcControlOptions40 .wcPreviewLabel40{position:absolute;bottom:6px;left:8px;border-radius:9px;padding:3px 7px;background:#fffcf0c9;color:#99617e;font:800 10px Nunito,sans-serif;pointer-events:none}',
   '#game #wcControlOptions40 .wcHitRow43{display:flex;align-items:center;justify-content:space-between;margin:10px 0 2px;font:800 12px Nunito,sans-serif;color:#78516a}',
   '#game #wcControlOptions40 input.wcHitSlider43{width:100%;height:28px;accent-color:#c76f99;touch-action:pan-x}',
   '#game #wcControlOptions40 .wcBackup41{font-size:11px;color:#977d8c;margin:8px 0 0}',
   '@media(prefers-reduced-motion:reduce){#game #wcJoystick40,#game #wcJoystick40 *{transition:none!important;animation:none!important}}'
  ].join('\n');
  document.head.appendChild(style);

  const stick=document.createElement('div');
  stick.id='wcJoystick40';
  stick.setAttribute('role','group');
  stick.setAttribute('aria-label','Palanca táctil para caminar');
  stick.innerHTML='<div class="wcJ40Well"><div class="wcJ40Ball">✿</div></div>';
  game.appendChild(stick);
  const ball=stick.querySelector('.wcJ40Ball');
  let pointer=null,vx=0,vy=0,shown=false,lastError=false;
  const canPlay=()=>{
   const s=X.st;
   return !!(s&&game.classList.contains('on')&&s.mode==='play'&&!s.menu&&!s.mg&&!s.busy&&!s.trans&&!s.poseLock&&!document.hidden);
  };
  function release(){
   pointer=null;vx=0;vy=0;
   stick.classList.remove('wcTouching41');
   ball.style.transform='translate3d(0px,0px,0)';
  }
  function visible(){
   const on=cfg.enabled===true&&canPlay();
   if(on!==shown){
    shown=on;
    stick.classList.toggle('wcOn40',on);
    if(!on)release();
   }
   return on;
  }
  // El motor consulta "enabled" para decidir si debe bloquear el toque del
  // suelo. Sólo se bloquea mientras el dedo realmente sostiene la palanca.
  function enabled(){
   try{return pointer!==null&&cfg.enabled===true&&canPlay();}
   catch(_){return false;}
  }
  function vector(){
   try{
    if(!visible()||pointer===null)return null;
    if(!Number.isFinite(vx)||!Number.isFinite(vy)){release();return null;}
    return Math.hypot(vx,vy)>.02?{x:vx,y:vy}:null;
   }catch(err){
    // Ningún error del control debe romper requestAnimationFrame del juego.
    if(!lastError){console.warn('Palanca recuperada; se mantiene tocar suelo.',err);lastError=true;}
    cfg.enabled=false;
    try{release();shown=false;stick.classList.remove('wcOn40');G.save();}
    catch(_){}
    return null;
   }
  }
  function position(){
   const r=game.getBoundingClientRect(),w=Math.max(1,r.width||innerWidth),h=Math.max(1,r.height||innerHeight);
   cfg.hitArea=clamp(Number(cfg.hitArea)||180,Math.max(cfg.size,120),260);
   const half=cfg.hitArea/2+10;
   const xmin=Math.min(49,half/w*100),ymin=Math.min(49,half/h*100);
   stick.style.width=cfg.hitArea+'px';
   stick.style.height=cfg.hitArea+'px';
   stick.style.setProperty('--wc-visual',cfg.size+'px');
   stick.style.left=clamp(cfg.x,xmin,100-xmin)+'%';
   stick.style.top=clamp(cfg.y,ymin,100-ymin)+'%';
  }
  function sample(e){
   const r=stick.getBoundingClientRect();
   if(!r.width||!r.height){release();return;}
   const dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
   const dist=Math.hypot(dx,dy),rad=Math.max(10,cfg.size*.30);
   const amount=dist?Math.min(rad,dist)/dist:0;
   ball.style.transform='translate3d('+Math.round(dx*amount)+'px,'+Math.round(dy*amount)+'px,0)';
   const strength=clamp((dist/rad-.14)/.86,0,1);
   vx=dist?dx/dist*strength:0;
   vy=dist?dy/dist*strength:0;
  }
  stick.addEventListener('pointerdown',e=>{
   if(pointer!==null||!cfg.enabled||!canPlay())return;
   e.preventDefault();e.stopPropagation();
   pointer=e.pointerId;
   stick.classList.add('wcTouching41');
   try{stick.setPointerCapture(pointer);}catch(_){}
   X.player.path=null;X.player.pending=null;
   sample(e);
  });
  stick.addEventListener('pointermove',e=>{
   if(e.pointerId!==pointer)return;
   e.preventDefault();e.stopPropagation();
   sample(e);
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture']){
   stick.addEventListener(name,e=>{if(e.pointerId===pointer)release();});
  }
  window.addEventListener('blur',release);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
  window.addEventListener('resize',()=>{release();position();});
  window.addEventListener('orientationchange',()=>{release();position();});
  function mode(on){
   cfg.enabled=!!on;
   cfg.native41=true;
   release();
   try{visible();G.save();}catch(err){console.warn('No se pudo guardar la preferencia de movimiento',err);}
  }

  // Mantener la cremallera original de v37: el cierre se maneja en index.html.
  X.HOOKS.tab.push((tab,box)=>{
   if(tab!=='opts')return;
   // showTab() invoca los hooks antes de dibujar las Opciones originales.
   // Montar tras el render evita que su innerHTML borre nuestros controles.
   queueMicrotask(()=>{
    try{
     if(!box.isConnected||X.st.tab!=='opts'||box.querySelector('#wcControlOptions40'))return;
     const panel=document.createElement('section');
     panel.id='wcControlOptions40';
     panel.innerHTML=[
      '<strong>🕹️ Cómo caminar</strong>',
      '<p>Escoge el movimiento que te resulte más cómodo.</p>',
      '<div class="wcModes40">',
      '<button type="button" data-mode="tap">👆 Tocar suelo</button>',
      '<button type="button" data-mode="joy">🕹️ Palanca</button>',
      '</div>',
      '<div class="wcEditor40">',
      '<p>Mueve la flor para elegir dónde va tu palanca:</p>',
      '<div class="wcPreview40" aria-label="Vista previa de la posición del control"><div class="wcPreviewHit43" aria-hidden="true"></div>',
      '<div class="wcPreviewHandle40" role="img" aria-label="Arrastrar palanca"></div>',
      '<div class="wcPreviewLabel40">Tu espacio de juego ♡</div></div>',
      '<div class="wcSizes40">',
      '<button type="button" data-size="92">Pequeña</button>',
      '<button type="button" data-size="116">Normal</button>',
      '<button type="button" data-size="144">Grande</button>',
      '</div>',
      '<div class="wcHitRow43"><span>Área táctil invisible</span><output class="wcHitValue43">180 px</output></div>',
      '<input class="wcHitSlider43" type="range" min="120" max="260" step="1" aria-label="Tamaño real del área táctil invisible">',
      '<button type="button" class="wcSave40">✓ Guardar posición</button>',
      '<p class="wcBackup41">Puedes seguir tocando el suelo aunque uses la palanca.</p>',
      '</div>'
     ].join('');
     box.prepend(panel);
     const editor=panel.querySelector('.wcEditor40');
     const preview=panel.querySelector('.wcPreview40');
     const handle=panel.querySelector('.wcPreviewHandle40');
     const hit=panel.querySelector('.wcPreviewHit43');
     const hitSlider=panel.querySelector('.wcHitSlider43');
     const hitValue=panel.querySelector('.wcHitValue43');
     let chosen=cfg.enabled===true;
     const draft={x:cfg.x,y:cfg.y,size:cfg.size,hitArea:cfg.hitArea};
     let dragging=null;
     const paint=()=>{
      handle.style.left=draft.x+'%';handle.style.top=draft.y+'%';
      handle.style.width=Math.round(draft.size*.45)+'px';
      handle.style.height=Math.round(draft.size*.45)+'px';
      hit.style.left=draft.x+'%';hit.style.top=draft.y+'%';
      hit.style.width=Math.round(draft.hitArea*.45)+'px';hit.style.height=Math.round(draft.hitArea*.45)+'px';
      hitSlider.value=String(draft.hitArea);hitSlider.min=String(Math.max(120,draft.size));
      hitValue.textContent=draft.hitArea+' px';
      panel.querySelectorAll('[data-size]').forEach(b=>b.classList.toggle('wcChosen40',Number(b.dataset.size)===draft.size));
     };
     const paintMode=()=>{
      panel.querySelectorAll('[data-mode]').forEach(b=>{
       const chosenButton=(b.dataset.mode==='joy')===chosen;
       b.classList.toggle('wcChosen40',chosenButton);
       b.setAttribute('aria-pressed',String(chosenButton));
      });
      editor.hidden=!chosen;
     };
     panel.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      chosen=b.dataset.mode==='joy';
      mode(chosen);
      paintMode();
     }));
     panel.querySelectorAll('[data-size]').forEach(b=>b.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      draft.size=Number(b.dataset.size);draft.hitArea=Math.max(draft.hitArea,draft.size);paint();
     }));
     hitSlider.addEventListener('input',()=>{draft.hitArea=clamp(Number(hitSlider.value),Math.max(120,draft.size),260);paint()});
     const move=e=>{
      const r=preview.getBoundingClientRect();
      if(!r.width||!r.height)return;
      draft.x=clamp((e.clientX-r.left)/r.width*100,15,85);
      draft.y=clamp((e.clientY-r.top)/r.height*100,23,87);
      paint();
     };
     preview.addEventListener('pointerdown',e=>{
      if(!chosen||dragging!==null)return;
      e.preventDefault();e.stopPropagation();
      dragging=e.pointerId;
      try{preview.setPointerCapture(dragging);}catch(_){}
      move(e);
     });
     preview.addEventListener('pointermove',e=>{
      if(dragging!==e.pointerId)return;
      e.preventDefault();e.stopPropagation();move(e);
     });
     for(const name of ['pointerup','pointercancel','lostpointercapture']){
      preview.addEventListener(name,e=>{if(e.pointerId===dragging)dragging=null;});
     }
     panel.querySelector('.wcSave40').addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      cfg.x=draft.x;cfg.y=draft.y;cfg.size=draft.size;cfg.hitArea=draft.hitArea;
      chosen=true;mode(true);position();paintMode();paint();
      X.toast('🕹️ Palanca guardada. ¡A pasear!');
     });
     paint();paintMode();
    }catch(err){
     console.warn('Las opciones de palanca no pudieron dibujarse',err);
    }
   });
  });
  position();
  visible();
  const api={enabled,vector,release,config:cfg,mode,position};
  window.WalesaJoystick37=api;
  window.WalesaJoystick40=api;
  window.WalesaJoystick41=api;
  window.WalesaJoystick43=api;
 }catch(err){
  console.error('Palanca: control táctil de respaldo activado',err);
  try{if(typeof save!=='undefined'&&save.joystick37)save.joystick37.enabled=false;}catch(_){}
  const fallback={enabled:()=>false,vector:()=>null,release:()=>{}};
  window.WalesaJoystick37=fallback;
  window.WalesaJoystick40=fallback;
  window.WalesaJoystick41=fallback;
 }
})();
