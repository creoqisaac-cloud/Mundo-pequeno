/* v47: prueba en Chromium de continuidad terrestre y sistemas originales. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 const target=path.resolve(root,'.'+(name==='/'?'/index.html':decodeURIComponent(name)));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(err,buf)=>{if(err){res.writeHead(404).end();return;}const ext=path.extname(target);res.setHeader('Content-Type',ext==='.js'?'application/javascript':ext==='.svg'?'image/svg+xml':'text/html');res.end(buf)});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.__ready===true,{timeout:45000});
  await page.waitForFunction(()=>!!World.MAIN.ground&&!!World.MAIN.objs,{timeout:180000});
  const land=await page.evaluate(()=>{
   const map=World.MAIN,W=WalesaMainworld,r=W.regions;
   const samples=W.paths.map(([x,y,xx,yy])=>{
    let worst=0;for(let i=0;i<=24;i++){const t=i/24;worst=Math.max(worst,map.islandD(x+(xx-x)*t,y+(yy-y)*t))}return worst;
   });
   return{width:map.MW,height:map.MH,old:map.islandD(750,650),center:Object.values(r).map(p=>({name:p.name,d:map.islandD(p.x,p.y)})),samples,
    route:W.at(r.forest.x,r.forest.y),mesh:!!Expansion46.models3d,mod:!!Expansion46.mainworld,
    screenshotMap:map.ground.width,save:!!save};
  });
  assert.ok(land.width>=3400&&land.height>=1900);
  assert.ok(land.old<.9&&land.center.every(x=>x.d<.85),JSON.stringify(land.center));
  assert.ok(land.samples.every(d=>d<.93),'Senderos cortados: '+land.samples);
  assert.ok(land.mesh&&land.mod&&land.save&&land.route==='forest');
  await page.evaluate(async()=>{await Game.enter();Game.st.mode='play';document.querySelector('#titleCov').classList.remove('on');});
  await page.waitForTimeout(300);
  const zones=await page.evaluate(()=>{
   const X=Game.X,r=WalesaMainworld.regions,z=[];
   for(const key of ['sand','coast','meadow','forest']){
    const area=r[key];X.player.x=area.x;X.player.y=area.y;X.cam.x=area.x;X.cam.y=area.y;
    X.HOOKS.update.forEach(fn=>fn(.016,1));
    const a=X.interactables();
    z.push({key,land:World.MAIN.islandD(area.x,area.y),sand:key==='sand'&&a.some(q=>q.key==='sandTools'),
      water:key==='sand'&&a.some(q=>q.key==='water'),pieces:!!Expansion46.models3d.mesh,portal:a.some(q=>q.key==='travel'||q.key==='sand')});
   }
   const v=World.vehSprite('auto',false,3);return {z,car:[v.c.width,v.c.height],same:World.map===World.MAIN};
  });
  assert.ok(zones.same&&zones.z.every(x=>!x.portal),JSON.stringify(zones));
  assert.ok(zones.z[0].sand&&zones.z[0].water,JSON.stringify(zones.z[0]));
  assert.ok(zones.car[0]>=40&&zones.car[1]>=30);
  assert.deepEqual(errors,[],'Errores de Javascript del navegador');
  console.log('✓ v47: cuatro regiones caminables en la isla, puentes, actividades, arte nativo y mallas 3D.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(err=>{console.error(err);process.exitCode=1});