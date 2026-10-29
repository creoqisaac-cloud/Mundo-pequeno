/* Prueba de interfaz real en Chromium: Opciones, cierre y render de la isla.
   Se ejecuta en GitHub Actions antes de publicar Pages. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.css':'text/css'};
const snapshot=fs.readFileSync(path.resolve(root,'index.html'),'utf8');
assert.ok(!snapshot.includes('native46/'),'No deben quedar expansiones de Codex');
assert.ok(snapshot.includes('wcBagZipTrack37'),'Debe conservarse la cremallera original');
const server=http.createServer((req,res)=>{
 let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch(_){res.writeHead(400).end();return;}
 const full=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!full.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(full,(error,data)=>{
  if(error){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream'});
  res.end(data);
 });
});
async function slideZipper(page){
 await page.evaluate(()=>{
  const close=document.querySelector('#sheet .panel h3 .close');
  const rect=close.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2;
  for(const [type,dx] of [['pointerdown',0],['pointermove',-78],['pointerup',-78]]){
   close.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',isPrimary:true,pointerId:87,clientX:x+dx,clientY:y,buttons:type==='pointerup'?0:1}));
  }
 });
 await page.waitForFunction(()=>!document.getElementById('sheet').classList.contains('on'),null,{timeout:4000});
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 const chromePath=process.env.CHROME_PATH||'/usr/bin/google-chrome';
 let browser;
 try{
  browser=await chromium.launch({executablePath:chromePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  page.setDefaultTimeout(12000);
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.__ready===true,{timeout:40000});
  const api=await page.evaluate(()=>({
   native:!!window.WalesaJoystick43,
   engine:typeof Game!=='undefined',
   gameHasSave:typeof save!=='undefined'
  }));
  assert.deepEqual(api,{native:true,engine:true,gameHasSave:true},'El joystick debe cargar con globals léxicos reales');

  await page.evaluate(()=>{
   // En la prueba se omite la carta inicial; en el juego normal la oculta Game.enter().
   document.querySelector('#desk').classList.remove('on');
   Game.X.st.mode='play';
   document.querySelector('#game').classList.add('on','playing');
   Game.X.openMenu('opts');
  });
  await page.locator('#wcControlOptions40').waitFor({state:'visible'});
  await page.locator('#wcControlOptions40 [data-mode="joy"]').click();
  await page.locator('#wcControlOptions40 [data-size="144"]').click();
  await page.evaluate(()=>{
   const slider=document.querySelector('.wcHitSlider43');
   slider.value='240';
   slider.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.locator('#wcControlOptions40 .wcSave40').click();
  const a=await page.evaluate(()=>({
   enabled:save.joystick37.enabled,
   size:save.joystick37.size,
   hitArea:save.joystick37.hitArea,
   visual:document.getElementById('wcJoystick40').style.getPropertyValue('--wc-visual'),
   hit:document.getElementById('wcJoystick40').style.width,
   cap:window.WalesaJoystick43.enabled()
  }));
  assert.equal(a.enabled,true);
  assert.equal(a.size,144);
  assert.equal(a.hitArea,240);
  assert.equal(a.visual,'144px');
  assert.equal(a.hit,'240px');
  assert.equal(a.cap,false,'La palanca sin presionar no debe secuestrar la pantalla');

  await page.locator('#sheet .panel h3 .close').click();
  assert.equal(await page.evaluate(()=>Game.X.st.menu),true,'Tocar la X NO debe cerrar');
  assert.equal(await page.locator('#sheet').evaluate(el=>el.classList.contains('on')),true);
  await slideZipper(page);
  assert.equal(await page.evaluate(()=>Game.X.st.menu),false,'Solo el arrastre debe cerrar');

  // Probar pestañas de la mochila sin depender del HUD de hambre superpuesto en la simulación.
  await page.evaluate(()=>Game.X.openMenu('tasks'));
  await page.locator('#tabs button[data-t="tasks"]').click();
  await page.locator('#tabs button[data-t="opts"]').click();
  await page.locator('#oTime').click();
  await page.locator('#wcControlOptions40').waitFor({state:'visible'});
  await slideZipper(page);
  assert.equal(await page.evaluate(()=>Game.X.st.menu),false);

  // La cremallera original permanece y permite cerrar arrastrando la X.
  await page.evaluate(()=>Game.X.openMenu('tasks'));
  await page.locator('#tabs button[data-t="opts"]').click();
  await page.locator('#wcBagZipTrack37').waitFor({state:'attached'});
  await page.evaluate(()=>{
   const close=document.querySelector('#sheet .panel h3 .close');
   const r=close.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
   for(const [type,dx] of [['pointerdown',0],['pointermove',-75],['pointerup',-75]]){
    close.dispatchEvent(new PointerEvent(type,{
     bubbles:true,cancelable:true,pointerType:'touch',isPrimary:true,
     pointerId:87,clientX:x+dx,clientY:y,buttons:type==='pointerup'?0:1
    }));
   }
  });
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>Game.X.st.menu),false,'La cremallera debe cerrar con swipe');
  assert.equal(await page.locator('#sheet').evaluate(el=>el.classList.contains('on')),false);
  assert.deepEqual(errors,[],'Cerrar con cremallera no debe producir errores de JavaScript');

  // El celular debe mantener visible su transicion despues de cerrar.
  await page.evaluate(()=>document.getElementById('fonBtn').click());
  await page.locator('#game .fon.on').waitFor({state:'visible'});
  // El gesto nativo de deslizar hacia arriba funciona aun cuando la barra
  // inferior esta muy cerca de otro contenido tactil.
  await page.evaluate(()=>{
   const gm=document.querySelector('#game'),fon=document.querySelector('.fon');
   const r=fon.getBoundingClientRect(),x=(r.left+r.right)/2,y=r.bottom-12;
   const t=(yy)=>new Touch({identifier:41,target:gm,clientX:x,clientY:yy});
   gm.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,touches:[t(y)],targetTouches:[t(y)],changedTouches:[t(y)]}));
   gm.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[t(y-104)],targetTouches:[t(y-104)],changedTouches:[t(y-104)]}));
   gm.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],targetTouches:[],changedTouches:[t(y-104)]}));
  });
  await page.waitForFunction(()=>document.querySelector('.fon')?.classList.contains('wcPhoneLeaving50'));
  const leaving=await page.evaluate(()=>getComputedStyle(document.querySelector('.fon')).visibility);
  assert.equal(leaving,'visible','El celular no debe desaparecer instantaneamente');
  await page.waitForTimeout(450);
  assert.equal(await page.locator('.fon').evaluate(el=>el.classList.contains('on')),false);

  // Validar que el motor siga pintando después de cerrar Opciones.
  await page.evaluate(async()=>{await Game.enter();});
  await page.waitForTimeout(850);
  const canvas=await page.evaluate(()=>{
   const c=document.getElementById('cv'),ctx=c.getContext('2d');
   const p=ctx.getImageData(Math.floor(c.width/2),Math.floor(c.height/2),1,1).data;
   return{width:c.width,height:c.height,alpha:p[3],visible:document.querySelector('#game').classList.contains('on')};
  });
  assert.ok(canvas.width>0&&canvas.height>0&&canvas.alpha>0&&canvas.visible,'La pantalla debe dibujarse, no quedar negra');
  assert.deepEqual(errors,[],'No debe haber errores JS de página');
  console.log('✓ Chromium real: joystick, tamaño, área invisible, cierre solo cremallera y telefono, navegación y render.');
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(err=>{console.error(err);process.exitCode=1;});
