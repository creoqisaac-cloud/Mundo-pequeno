/* Chromium móvil: app Mapa verdadera + parque circular de ladrillo */
'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(err,data)=>{
  if(err)return res.writeHead(404).end();
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':'text/html');
  res.end(data);
 });
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',
   headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE ERROR',e.stack||e)});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.__ready===true&&World.MAIN.mainland&&World.map===World.MAIN,{timeout:120000});
  const park=await page.evaluate(()=>{
   const m=World.MAIN,land=m.mainland,park=WalesaMainland.plaza;
   const canvas=document.createElement('canvas');canvas.width=460;canvas.height=460;
   const ctx=canvas.getContext('2d');land.draw(ctx,park.x-230,park.y-230,460,460,0);
   const color=(x,y)=>Array.from(ctx.getImageData(x,y,1,1).data);
   const pixels=[];
   for(let y=140;y<320;y+=6)for(let x=140;x<320;x+=6){
    const d=Math.hypot(x-230,y-230);if(d>36&&d<95)pixels.push(color(x,y).slice(0,3).join(','))
   }
   return {r:park.r,center:color(265,285),north:color(230,90),
     outside:color(450,450),unique:new Set(pixels).size,
     roadAtCenter:land.roadAt(park.x,park.y),
     original:m.build.filter(b=>['home','cinnaH','melodyH','kuromiH'].includes(b.id)).length,
     radial:m.build.filter(b=>b.id.startsWith('v3_radial')).length,
     nativeSprite:m.objs.some(o=>o.s===World.spr.pot?.[0]&&Math.hypot(o.x-park.x,o.y-park.y)<220),
     navigator:typeof WalesaMainland.mountPhone==='function'};
  });
  console.log('PARQUE CIRCULAR',park);
  assert.ok(park.r>=175&&park.r<=210,'Plaza de tamaño suficiente para paseo');
  assert.ok(park.center[0]>park.center[1]+20,'Ladrillos cálidos, no cruz de asfalto gris');
  assert.ok(park.north[0]>park.north[1]+12,'El parque está pavimentado en todas las orientaciones');
  assert.ok(park.unique>15,'No es una textura plana: ladrillos diferenciados');
  assert.equal(park.roadAtCenter,true,'La plaza completa es transitable');
  assert.equal(park.original,4,'Casas originales conservadas');
  assert.equal(park.radial,10,'Las 10 casas alrededor del parque siguen presentes');
  assert.ok(park.navigator,'API de mapa disponible');
  await page.evaluate(async()=>{
   await Game.enter();Game.X.st.mode='play';
   document.querySelector('#titleCov')?.classList.remove('on');
   Game.X.player.x=3770;Game.X.player.y=2395;
   Game.X.cam.x=3770;Game.X.cam.y=2395;
   Game.X.st.busy=false;
  });
  await page.waitForTimeout(750);
  fs.mkdirSync(path.join(root,'tests','proof'),{recursive:true});
  await page.screenshot({path:path.join(root,'tests','proof','plaza-circular-ladrillos-v57.png')});
  await page.evaluate(()=>Fon.open());
  await page.locator('.fon .app[data-a="map"]').click();
  const phone=page.locator('.fon.on #walesa-phone-map-root');
  await phone.waitFor({state:'visible',timeout:10000});
  const canvas=phone.locator('#walesa-streets-map');
  await canvas.waitFor({state:'visible'});
  assert.equal(await page.locator('.fon #mapC2').count(),0,'No se usa el antiguo mapa roto');
  const current=await canvas.evaluate(c=>{
   const g=c.getContext('2d'),a=g.getImageData(c.width/2,c.height/2,1,1).data;
   return {width:c.width,height:c.height,alpha:a[3],scroll:c.closest('.lst')?.scrollHeight||0};
  });
  assert.ok(current.width>=400&&current.height>=350&&current.alpha>0,'Mapa continental visible en teléfono');
  await phone.locator('[data-nav="plus"]').click();
  await phone.locator('input[aria-label="Buscar destino"]').fill('Altiplano');
  await phone.locator('[data-result="Altiplano Dorado"]').click();
  assert.match(await phone.locator('[data-nav="status"]').innerText(),/Altiplano Dorado/);
  await page.screenshot({path:path.join(root,'tests','proof','mapa-celular-v57.png')});
  await phone.locator('[data-nav="route"]').click();
  await page.waitForFunction(()=>document.querySelector('#walesa-route-hud')?.style.display==='block',{timeout:15000});
  assert.equal(await page.locator('.fon.on').count(),0,'Se cierra el teléfono al activar la guía');
  assert.match(await page.locator('#walesa-route-hud').innerText(),/Altiplano Dorado/);
  await page.locator('[aria-label="Cancelar guía"]').click();
  assert.deepEqual(errors,[],'Sin errores al tocar, buscar y seguir rutas desde el móvil');
  console.log('✓ Parque circular pavimentado, 10 casas y app móvil con búsqueda, zoom y rutas: OK');
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(e=>{console.error('PHONE MAP / PARK REGRESSION',e);process.exitCode=1;server.close()});