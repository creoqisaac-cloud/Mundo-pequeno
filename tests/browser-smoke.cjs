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
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 const chromePath=process.env.CHROME_PATH||'/usr/bin/google-chrome';
 let browser;
 try{
  browser=await chromium.launch({executablePath:chromePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
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
   Game.X.st.mode='play';
   document.querySelector('#game').classList.add('on');
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
  assert.equal(await page.evaluate(()=>Game.X.st.menu),false,'Cerrar debe liberar el juego');
  assert.equal(await page.locator('#sheet').evaluate(el=>el.classList.contains('on')),false);

  // Navegar varias veces entre páginas no debe dejar listeners rotos.
  await page.locator('#menuBtn').click();
  await page.locator('#tabs button[data-t="tasks"]').click();
  await page.locator('#tabs button[data-t="opts"]').click();
  await page.locator('#oTime').click();
  await page.locator('#wcControlOptions40').waitFor({state:'visible'});
  await page.locator('#sheet .panel h3 .close').click();
  assert.equal(await page.evaluate(()=>Game.X.st.menu),false);

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
  console.log('✓ Chromium real: opciones, modo palanca, tamaño, área invisible, cierre, navegación y render.');
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(err=>{console.error(err);process.exitCode=1;});
