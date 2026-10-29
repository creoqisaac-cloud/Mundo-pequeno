/* Visual v58: inspect real terrain pixels, native sprites, map controls and mobile render. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(err,b)=>{
  if(err)return res.writeHead(404).end();
  res.writeHead(200,{'Content-Type':file.endsWith('.js')?'application/javascript':'text/html'}).end(b);
 });
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',
   headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>{errors.push(String(e));console.error('JS',String(e))});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__ready===true&&World.MAIN.mainland&&World.map===World.MAIN,{timeout:120000});
  const features=await page.evaluate(()=>{
   const m=World.MAIN,L=WalesaMainland,p=L.plaza,c=document.createElement('canvas');c.width=370;c.height=370;
   const g=c.getContext('2d');L.draw(g,p.x-185,p.y-185,370,370,0);
   const data=g.getImageData(0,0,370,370).data,colors=new Set();let mosaic=0,terracotta=0;
   for(let y=118;y<252;y++)for(let x=118;x<252;x++){
    const k=(y*370+x)*4,d=Math.hypot(x-185,y-185);
    if(d>24&&d<60){
     colors.add([data[k],data[k+1],data[k+2]].join(','));
     if(data[k]===120&&data[k+1]===171&&data[k+2]===153)mosaic++;
    }
    if(d>80&&d<95&&data[k]>data[k+1]+30&&data[k+1]>data[k+2]+15)terracotta++;
   }
   const homes=m.build.filter(b=>b.id.startsWith('v3_')&&!b.job);
   const urban=homes.filter(b=>b.city),original=m.build.filter(b=>['home','cinnaH','melodyH','kuromiH'].includes(b.id));
   const details=['Paseo de los Jacarandás','Jardines del Altiplano','Alameda del Sur',
    'Sendero de los Helechos','Descanso de la Cordillera'];
   const found=details.filter(name=>L.destinations().some(p=>p.name===name));
   return {mosaic,terracotta,colors:colors.size,homes:homes.length,urban:urban.length,
    urbanPalettes:new Set(urban.map(b=>b.wall+'|'+b.acc)).size,original:original.length,
    districtGardens:found.length,sprites:m.objs.length,
    pixels:c.toDataURL('image/png').length>3000};
  });
  console.log('VISUAL V58',features);
  assert.equal(features.original,4,'Legacy homes cannot be replaced');
  assert.ok(features.homes>30&&features.urban>=6,'Original expanded houses persist');
  assert.ok(features.urbanPalettes>=5,'Diverse district palette');
  assert.ok(features.colors>20&&features.mosaic>8&&features.terracotta>100,
   'Actual 2D rendered circular mosaic and terracotta brick floor');
  assert.ok(features.districtGardens>=3,'New native gardens in additional districts');
  assert.ok(features.sprites>1500,'Sprite ecosystem intact');
  assert.equal(features.pixels,true,'Generated real terrain pixels');
  await page.evaluate(async()=>{
   await Game.enter();Game.X.st.mode='play';
   document.querySelector('#titleCov')?.classList.remove('on');
   const p=Game.X.player,cam=Game.X.cam;
   Object.assign(p,{x:3770,y:2395});Object.assign(cam,{x:p.x,y:p.y});
  });
  fs.mkdirSync(path.join(root,'tests','proof'),{recursive:true});
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(root,'tests','proof','visual-v58-circular-plaza.png')});
  for(const [name,x,y] of [['south',3600,3690],['plateau',5540,2200]]){
   await page.evaluate(({x,y})=>{
    Object.assign(Game.X.player,{x,y});Object.assign(Game.X.cam,{x,y});
   },{x,y});
   await page.waitForTimeout(180);
   await page.screenshot({path:path.join(root,'tests','proof','visual-v58-'+name+'.png')});
  }
  await page.evaluate(()=>{
   Object.assign(Game.X.player,{x:3770,y:2395});
   Object.assign(Game.X.cam,{x:3770,y:2395});
   Fon.open();
  });
  await page.locator('.fon .app[data-a="map"]').click();
  const box=page.locator('.fon.on #walesa-phone-map-root');
  await box.locator('#walesa-streets-map').waitFor({state:'visible'});
  const all=await box.locator('select[aria-label="Elegir destino"] option').count();
  await box.locator('[data-filter="parks"]').click();
  const parks=await box.locator('select[aria-label="Elegir destino"] option').count();
  assert.ok(parks>3&&parks<all,'Map has functional natural place filters');
  assert.equal(await box.locator('[data-filter="parks"]').getAttribute('aria-pressed'),'true');
  await box.locator('[data-filter="shops"]').click();
  const shops=await box.locator('select[aria-label="Elegir destino"] option').count();
  assert.ok(shops>3&&shops<all,'Map has functional services filter');
  await box.locator('[data-filter="all"]').click();
  await box.locator('[data-nav="style"]').click();
  assert.equal(await box.locator('[data-nav="style"]').getAttribute('aria-pressed'),'true',
   'Relief style activated without losing the original map');
  await page.screenshot({path:path.join(root,'tests','proof','visual-v58-phone-relief.png')});
  await box.locator('[data-nav="style"]').click();
  await box.locator('input[aria-label="Buscar destino"]').fill('Jardines del Altiplano');
  await box.locator('[data-result="Jardines del Altiplano"]').click();
  assert.match(await box.locator('[data-nav="status"]').innerText(),/Jardines del Altiplano/);
  await page.screenshot({path:path.join(root,'tests','proof','visual-v58-phone-map.png')});
  await box.locator('[data-nav="route"]').click();
  await page.waitForFunction(()=>document.querySelector('#walesa-route-hud')?.style.display==='block',{timeout:10000});
  assert.match(await page.locator('#walesa-route-hud').innerText(),/Jardines del Altiplano/);
  await page.locator('[aria-label="Cancelar guía"]').click();
  assert.deepEqual(errors,[],'No JS errors in mobile map, rendering, and live routing');
  console.log('✓ v58: mosaic, softer palettes, native gardens, map filters, relief and guide PASS');
 }finally{
  await browser?.close();
  await new Promise(r=>server.close(r));
 }
})().catch(e=>{console.error('VISUAL V58 REGRESSION',e);process.exitCode=1;server.close()});