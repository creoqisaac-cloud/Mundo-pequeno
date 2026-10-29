/* Prueba de añadidos: conserva mundo, rutas reales y mapa interactivo. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(err,b)=>{if(err)return res.writeHead(404).end();
  res.writeHead(200,{'Content-Type':file.endsWith('.js')?'application/javascript':'text/html'}).end(b)});
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__ready===true&&World.MAIN.mainland&&World.map===World.MAIN,{timeout:120000});
  const visuals=await page.evaluate(()=>{
   const m=World.MAIN,L=WalesaMainland,homes=m.build.filter(b=>b.id.startsWith('v3_')&&!b.job);
   const original=m.build.filter(b=>!b.id.startsWith('v3_')&&b.room!==undefined);
   const room=World.rooms[homes[0].room];
   const a=L.roadRoute({x:3770,y:2310},{x:3600,y:3690}),
    b=L.roadRoute({x:3770,y:2310},{x:5540,y:2200});
   const all=L.destinations(),uniques=new Set(homes.map(b=>b.wall+'|'+b.roof+'|'+b.facade));
   return {original:original.map(b=>b.room),rooms:homes.length,distinct:uniques.size,
    noGifts:homes.every(b=>World.rooms[b.room]?.gift===false),
    hasNativeFence:m.objs.some(o=>o.x>3300&&o.x<3900&&o.y>2050&&o.y<2600&&o.s===World.spr.fence),
    roomCanvas:room.bg.width===256&&room.bg.height===192,
    viaRoads:a.connected&&a.points.length>=3,
    viaPlateau:b.connected&&b.points.length>=3,
    landmarks:all.some(p=>p.name==='Ciudad Corazón')&&all.some(p=>p.name==='Bosque Profundo'),
    legacyTexture:m.ground.width===2700&&m.ground.height===1320,
    biomeColors:World.BIO.town.g.length===4,
    lowRise:homes.filter(b=>b.districtHome).length,
    civicStops:L.destinations().filter(p=>['Parque del Pueblo','Mirador de la Meseta','Plaza del Sur','Jardín del Bosque'].includes(p.name)).length};
  });
  console.log('ADITIVO',visuals);
  assert.deepEqual(visuals.original,[0,1,2,3],'No se pierden los interiores originales');
  assert.ok(visuals.rooms>25,'Viviendas nuevas conservadas');
  assert.ok(visuals.distinct>=12,'Fachadas diferenciables');
  assert.ok(visuals.noGifts&&visuals.roomCanvas&&visuals.legacyTexture&&visuals.biomeColors);
  assert.ok(visuals.viaRoads&&visuals.viaPlateau,'Grafo de calles conecta regiones');
  assert.ok(visuals.lowRise>=2,'Barrio urbano con casas bajas y edificios');
  assert.ok(visuals.civicStops>=3,'Plazas y jardines originales añadidos a los distritos');
  assert.ok(visuals.landmarks,'Destinos antiguos y nuevos visibles');
  await page.evaluate(async()=>{await Game.enter();Game.X.st.mode='play';document.querySelector('#titleCov')?.classList.remove('on')});
  fs.mkdirSync(path.join(root,'tests','proof'),{recursive:true});
  await page.waitForTimeout(500);
  await page.screenshot({path:path.join(root,'tests','proof','overworld-v56.png')});
  await page.evaluate(()=>Game.X.openMenu('map'));
  await page.waitForSelector('#walesa-streets-map');
  const options=await page.locator('select[aria-label="Elegir destino"] option').count();
  assert.ok(options>=20,'Buscador de puntos de interés y casas');
  await page.locator('[data-nav="plus"]').click();
  await page.locator('select[aria-label="Elegir destino"]').selectOption('0');
  await page.screenshot({path:path.join(root,'tests','proof','mapa-navegacion-v56.png')});
  assert.match(await page.locator('[data-nav="status"]').innerText(),/Plaza de Walesa/);
  await page.locator('[data-nav="route"]').click();
  await page.waitForFunction(()=>document.querySelector('#walesa-route-hud')?.style.display==='block',{timeout:10000});
  const hud=await page.locator('#walesa-route-hud').innerText();
  assert.match(hud,/Plaza de Walesa/);
  await page.locator('[aria-label="Cancelar guía"]').click();
  assert.deepEqual(errors,[],'Ningún error del navegador');
  console.log('✓ estilos nativos, viviendas variadas, mapa con zoom, destinos y guía: OK');
 }finally{await browser?.close();await new Promise(ok=>server.close(ok))}
})().catch(e=>{console.error('ADDITIVE REGRESSION',e);process.exitCode=1;server.close()});