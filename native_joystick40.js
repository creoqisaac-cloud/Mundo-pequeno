/* Isla de Walesa v40 | Palanca integrada en Opciones, sin pantallas extra */
(()=>{'use strict';
try{
 const X=window.Game?.X,G=window.Game?.G,H=X?.HOOKS,game=document.getElementById('game');
 if(!X||!G||!H||!game||!window.save)return;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const cfg=save.joystick37||(save.joystick37={});
 if(cfg.ready40!==true){cfg.enabled=false;cfg.x=19;cfg.y=76;cfg.size=116;cfg.ready40=true;}
 cfg.x=clamp(Number(cfg.x)||19,15,85);
 cfg.y=clamp(Number(cfg.y)||76,23,87);
 cfg.size=[92,116,144].reduce((a,b)=>Math.abs(b-cfg.size)<Math.abs(a-cfg.size)?b:a,116);
 const css=document.createElement('style');
 css.textContent=[
 '#game #wcJoystick40{position:absolute;z-index:24;width:116px;height:116px;left:19%;top:76%;transform:translate(-50%,-50%);display:none;touch-action:none;user-select:none;border-radius:50%;pointer-events:auto}',
 '#game #wcJoystick40.wcOn40{display:block}',
 '#game #wcJoystick40 .wcJ40Well{width:100%;height:100%;box-sizing:border-box;border-radius:50%;background:#fff2f0ac;border:3px solid #f9e4f0;box-shadow:0 2px 12px #54395060,inset 0 0 0 2px #bd88a477;display:grid;place-items:center}',
 '#game #wcJoystick40 .wcJ40Ball{width:41%;height:41%;box-sizing:border-box;border-radius:50%;background:#f2bbd6;border:3px solid #fff9fc;box-shadow:0 3px 6px #49304255;display:grid;place-items:center;color:#925470;font:bold 23px Nunito,sans-serif;pointer-events:none}',
 '#game #wcControlOptions40{padding:14px;margin:12px 0 15px;border:2px solid #f3dce7;border-radius:19px;background:linear-gradient(155deg,#fffbf8,#fff0f4);box-shadow:0 4px 13px #9d64801f;color:#6e4961}',
 '#game #wcControlOptions40 strong{display:block;font:900 16px Nunito,sans-serif;margin-bottom:5px}',
 '#game #wcControlOptions40 p{font:700 12px/1.45 Nunito,sans-serif;margin:5px 0 9px;color:#927386}',
 '#game #wcControlOptions40 .wcModes40,#game #wcControlOptions40 .wcSizes40{display:flex;gap:7px;margin:8px 0;align-items:center}',
 '#game #wcControlOptions40 button{border:2px solid #ead5e0;border-radius:12px;min-height:36px;padding:7px 6px;flex:1;background:#fff;color:#875b73;font:800 12px Nunito,sans-serif;touch-action:manipulation}',
 '#game #wcControlOptions40 button.wcChosen40{border-color:#c76f99;background:#fce5f0;color:#a94f7d}',
 '#game #wcControlOptions40 button.wcSave40{background:#bd648c;color:#fff;border-color:#bd648c;width:100%;margin-top:8px;font-size:14px}',
 '#game #wcControlOptions40 .wcPreview40{position:relative;touch-action:none;height:166px;max-width:340px;margin:8px auto 12px;overflow:hidden;border:2px solid #e6bfd0;border-radius:15px;background:repeating-linear-gradient(0deg,#e6efdf 0 25px,#d9ead4 25px 50px)}',
 '#game #wcControlOptions40 .wcPreview40:before{content:"🌳　🌼　🏠";position:absolute;top:10px;left:12px;font-size:24px;opacity:.7;pointer-events:none}',
 '#game #wcControlOptions40 .wcPreview40:after{content:"🐾　🌷";position:absolute;right:22px;bottom:19px;font-size:20px;opacity:.5;pointer-events:none}',
 '#game #wcControlOptions40 .wcPreviewHandle40{position:absolute;width:56px;height:56px;transform:translate(-50%,-50%);touch-action:none;border-radius:50%;border:3px solid #fff9fa;background:#e7a6c6dc;box-shadow:0 2px 8px #75506978,inset 0 0 0 6px #f9d8e9;display:grid;place-items:center;font:900 24px Nunito,sans-serif;color:#fff;user-select:none;z-index:2}',
 '#game #wcControlOptions40 .wcPreviewHandle40:before{content:"✿";pointer-events:none}',
 '#game #wcControlOptions40 .wcPreviewLabel40{position:absolute;bottom:5px;left:9px;background:#fff9;border-radius:8px;padding:2px 7px;font:bold 10px Nunito,sans-serif;color:#8b5372;pointer-events:none}'
 ].join('\n');
 document.head.appendChild(css);
 const stick=document.createElement('div');stick.id='wcJoystick40';stick.setAttribute('aria-label','Palanca de movimiento');
 stick.innerHTML='<div class="wcJ40Well"><div class="wcJ40Ball">✿</div></div>';
 game.appendChild(stick);
 const ball=stick.querySelector('.wcJ40Ball');
 let pointer=null,vx=0,vy=0,shown=false;
 function release(){pointer=null;vx=vy=0;ball.style.transform='translate(0,0)';}
 function enabled(){const s=X.st;return cfg.enabled===true&&s&&s.mode==='play'&&!s.menu&&!s.busy&&!s.mg&&!s.trans&&!s.poseLock;}
 function position(){const r=game.getBoundingClientRect(),w=r.width||innerWidth,h=r.height||innerHeight;
  const ex=Math.min(49,(cfg.size/2+12)*100/w),ey=Math.min(49,(cfg.size/2+12)*100/h);
  stick.style.width=cfg.size+'px';stick.style.height=cfg.size+'px';
  stick.style.left=clamp(cfg.x,ex,100-ex)+'%';stick.style.top=clamp(cfg.y,ey,100-ey)+'%';}
 function visible(){const on=enabled();if(shown!==on){stick.classList.toggle('wcOn40',on);shown=on;if(!on)release();}}
 function vector(){visible();return enabled()?{x:vx,y:vy}:null;}
 function point(e){const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
  const d=Math.hypot(dx,dy),rad=cfg.size*.31,k=d?Math.min(1,rad/d):0;
  ball.style.transform='translate('+Math.round(dx*k)+'px,'+Math.round(dy*k)+'px)';
  const strength=Math.min(1,Math.max(0,(d/rad-.15)/.85));vx=d?dx/d*strength:0;vy=d?dy/d*strength:0;}
 stick.addEventListener('pointerdown',e=>{if(!enabled()||pointer!==null)return;
  e.preventDefault();e.stopPropagation();pointer=e.pointerId;
  try{stick.setPointerCapture(pointer)}catch(_){}
  X.player.path=null;X.player.pending=null;point(e);});
 stick.addEventListener('pointermove',e=>{if(pointer===e.pointerId){e.preventDefault();e.stopPropagation();point(e)}});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(ev,e=>{if(e.pointerId===pointer)release()});
 window.addEventListener('blur',release);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)release()});
 window.addEventListener('resize',()=>{position();release()});
 function mode(v){cfg.enabled=!!v;release();visible();try{G.save()}catch(_){}}
 H.tab.push((tab,box)=>{
  if(tab!=='opts')return;
  queueMicrotask(()=>{
   if(!box.isConnected||X.st.tab!=='opts')return;
   const section=document.createElement('section');section.id='wcControlOptions40';
   section.innerHTML='<strong>🕹️ Cómo caminar</strong><p>Elige cómo mover a tu personaje.</p><div class="wcModes40"><button type="button" data-mode="tap">👆 Tocar suelo</button><button type="button" data-mode="joy">🕹️ Palanca</button></div><div class="wcEditor40"><p>Arrastra la flor a tu lugar favorito:</p><div class="wcPreview40"><div class="wcPreviewHandle40"></div><div class="wcPreviewLabel40">Vista previa del juego</div></div><div class="wcSizes40"><button type="button" data-size="92">Pequeña</button><button type="button" data-size="116">Normal</button><button type="button" data-size="144">Grande</button></div><button type="button" class="wcSave40">✓ Guardar y activar</button></div>';
   box.prepend(section);
   const editor=section.querySelector('.wcEditor40'),preview=section.querySelector('.wcPreview40'),handle=section.querySelector('.wcPreviewHandle40');
   let choice=!!cfg.enabled,draft={x:cfg.x,y:cfg.y,size:cfg.size},drag=null;
   const paint=()=>{handle.style.left=draft.x+'%';handle.style.top=draft.y+'%';
    const d=Math.round(draft.size*.45);handle.style.width=d+'px';handle.style.height=d+'px';
    section.querySelectorAll('[data-size]').forEach(b=>b.classList.toggle('wcChosen40',Number(b.dataset.size)===draft.size));};
   const update=()=>{section.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('wcChosen40',(b.dataset.mode==='joy')===choice));editor.hidden=!choice;};
   section.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{
    if(b.dataset.mode==='tap'){choice=false;mode(false);}else choice=true;
    update();paint();});
   section.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{draft.size=Number(b.dataset.size);paint()});
   const move=e=>{const r=preview.getBoundingClientRect();if(!r.width||!r.height)return;
    draft.x=clamp((e.clientX-r.left)/r.width*100,15,85);
    draft.y=clamp((e.clientY-r.top)/r.height*100,23,87);paint();};
   handle.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();drag=e.pointerId;
    try{handle.setPointerCapture(drag)}catch(_){}move(e)});
   handle.addEventListener('pointermove',e=>{if(drag===e.pointerId){e.preventDefault();move(e)}});
   for(const ev of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(ev,e=>{if(e.pointerId===drag)drag=null});
   section.querySelector('.wcSave40').onclick=()=>{cfg.x=draft.x;cfg.y=draft.y;cfg.size=draft.size;
    position();mode(true);choice=true;update();X.toast('🕹️ Palanca activada');};
   paint();update();
  });
 });
 position();visible();
 window.WalesaJoystick37={enabled,vector,release,config:cfg};
 window.WalesaJoystick40={enabled,vector,release,config:cfg};
}catch(err){
 console.error('Joystick v40: recuperación segura',err);
 try{if(window.save?.joystick37)save.joystick37.enabled=false}catch(_){}
 window.WalesaJoystick37={enabled:()=>false,vector:()=>null,release:()=>{}};
}
})();