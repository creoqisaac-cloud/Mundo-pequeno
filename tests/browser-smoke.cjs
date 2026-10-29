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
 // Evento de puntero REAL de Chromium, sin sintetizar PointerEvents sobre
 // un ID ficticio cuyo pointercapture puede perderse entre microtareas.
 const close=page.locator('#sheet .panel h3 .close');
 await close.waitFor({state:'visible'});
 // Playwright can scroll the document when selecting a low settings row.
 // The game's full-screen close handle must be back inside the viewport
 // before validating a real swipe; otherwise pointer coordinates are negative.
 await page.evaluate(()=>window.scrollTo(0,0));
 await close.scrollIntoViewIfNeeded();
 const rect=await close.boundingBox();
 assert.ok(rect&&rect.width>0&&rect.height>0,'Tirador visible');
 const x=rect.x+rect.width/2,y=rect.y+rect.height/2;
 const before=await page.evaluate(([x,y])=>{
  const c=document.querySelector('#sheet .panel h3 .close'),top=document.elementFromPoint(x,y);
  return{menu:Game.X.st.menu,top:top?.tagName+'.'+top?.className,
   same:top===c,drag:c.classList.contains('wcDragging37'),
   rect:{x:c.getBoundingClientRect().x,y:c.getBoundingClientRect().y},
   panelTransform:getComputedStyle(document.querySelector('#sheet .panel')).transform,
   sheetClass:document.querySelector('#sheet').className,
   viewport:[innerWidth,innerHeight],
   parent:c.parentElement?.outerHTML.slice(0,130)};
 },[x,y]);console.log('ZIP BEFORE',before);
 await page.mouse.move(x,y);
 await page.mouse.down();
 await page.mouse.move(x-95,y,{steps:7});
 await page.mouse.up();
 const after=await page.evaluate(()=>{
  const c=document.querySelector('#sheet .panel h3 .close'),sheet=document.querySelector('#sheet');
  return {menu:Game.X.st.menu,drag:c.classList.contains('wcDragging37'),
   xform:c.style.transform,closing:sheet.classList.contains('wcZipClosing37'),
   visible:sheet.classList.contains('on')};
 });console.log('ZIP AFTER',after);
 await page.waitForFunction(()=>!document.getElementById('sheet').classList.contains('on'),null,{timeout:7000});
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
  const tabs51=await page.evaluate(()=>({
   names:[...document.querySelectorAll('#tabs button')].map(x=>x.dataset.t),
   display:getComputedStyle(document.querySelector('#tabs')).display,
   columns:getComputedStyle(document.querySelector('#tabs')).gridTemplateColumns.split(' ').length
  }));
  assert.deepEqual(tabs51.names,['tasks','pets','cartas','dex','quests','partida','opts'],'Mochila: conservar Cartas, Encargos y Partida sin Mapa ni Armario');
  assert.equal(tabs51.display,'grid','Mochila: dos filas ordenadas');
  assert.equal(tabs51.columns,12,'Mochila: cuadricula de 12 columnas para dos filas 4+3');
  const rows51=await page.locator('#tabs button').evaluateAll(buttons=>{
   const positions=buttons.map(b=>b.getBoundingClientRect().top);
   const groups=[];
   for(const y of positions){
    const row=groups.find(g=>Math.abs(y-g.y)<7);
    if(row)row.count++;else groups.push({y,count:1});
   }
   return groups.map(g=>g.count);
  });
  assert.deepEqual(rows51,[4,3],'Se deben ver dos filas, una de cuatro y otra de tres');

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
  await slideZipper(page);
  assert.equal(await page.evaluate(()=>Game.X.st.menu),false,'La cremallera debe cerrar con swipe');
  assert.equal(await page.locator('#sheet').evaluate(el=>el.classList.contains('on')),false);
  assert.deepEqual(errors,[],'Cerrar con cremallera no debe producir errores de JavaScript');

  // El celular debe mantener visible su transicion despues de cerrar.
  await page.evaluate(()=>document.getElementById('fonBtn').click());
  await page.locator('#game .fon.on').waitFor({state:'visible'});

  // Seis apps nativas, mapa continental con zoom y foto local en el borde.
  const initialApps=await page.evaluate(()=>({
   keys:[...document.querySelectorAll('.fon .apps .app')].map(b=>b.dataset.a),
   columns:getComputedStyle(document.querySelector('.fon .apps')).gridTemplateColumns.split(' ').length
  }));
  assert.deepEqual(initialApps.keys,['calls','missions','games','metro','weather','map']);
  assert.equal(initialApps.columns,3,'Dos filas de tres apps');
  await page.locator('#game .fon .app[data-a="map"]').click();
  await page.locator('#game .fon #walesa-phone-map-root #walesa-streets-map').waitFor({state:'attached',timeout:12000});
  await page.locator('#game .fon [data-nav="plus"]').click();
  const zoom=await page.locator('#game .fon #walesa-streets-map').evaluate(el=>({
   width:el.width,height:el.height,parent:el.parentElement.className
  }));
  assert.ok(zoom.width>300&&zoom.height>300,'El mapa continental se renderiza a alta resolucion');
  assert.equal(await page.locator('#game .fon #mapC2').count(),0,'El mapa roto ya no se usa');
  await page.locator('#game .fon .hd button[data-back]').click();
  const imageData=await page.evaluate(()=>{
   const c=document.createElement('canvas');c.width=4;c.height=4;
   const x=c.getContext('2d');x.fillStyle='#efabc9';x.fillRect(0,0,4,4);
   return c.toDataURL('image/png');
  });
  // En Chromium sin interfaz no siempre se presenta un dialogo nativo de archivos.
  // Validar la accion directa del boton y luego simular la eleccion de una foto.
  await page.evaluate(()=>{
   const input=document.querySelector('#wcWallpaperInput51');
   input.click=()=>{input.dataset.activated='yes'};
  });
  await page.locator('#wcWallpaperButton51').click();
  assert.equal(await page.locator('#wcWallpaperInput51').getAttribute('data-activated'),'yes','El boton del borde abre el selector de galeria');
  await page.locator('#wcWallpaperInput51').setInputFiles({
   name:'fondo-de-prueba.png',mimeType:'image/png',
   buffer:Buffer.from(imageData.split(',')[1],'base64')
  });
  await page.waitForFunction(()=>localStorage.getItem('walesa-fon-wallpaper-v1')?.startsWith('data:image/jpeg'),null,{timeout:10000});
  const photo=await page.evaluate(()=>({
   inGameSave:!!save.wallpaper,
   active:document.querySelector('.fon').classList.contains('has-wallpaper'),
   image:document.querySelector('.fon .scr').style.backgroundImage.includes('data:image/jpeg'),
   buttonOffset:Math.round(document.querySelector('#wcWallpaperButton51').getBoundingClientRect().left-document.querySelector('.fon').getBoundingClientRect().left)
  }));
  assert.equal(photo.inGameSave,false,'El fondo no modifica la partida');
  assert.equal(photo.active,true,'La foto se aplica al telefono');
  assert.equal(photo.image,true,'La imagen se usa como fondo');
  assert.ok(photo.buttonOffset>=5&&photo.buttonOffset<=28,'El boton queda alineado al borde izquierdo del marco');

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
  // La imagen sigue guardada al cerrar y volver a abrir el telefono.
  await page.evaluate(()=>document.getElementById('fonBtn').click());
  await page.locator('#game .fon.on').waitFor({state:'visible'});
  assert.equal(await page.locator('#game .fon').evaluate(el=>el.classList.contains('has-wallpaper')),true);
  await page.evaluate(()=>window.Fon.close());


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
