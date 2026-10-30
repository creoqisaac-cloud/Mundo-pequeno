'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 const full=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!full.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(full,(err,data)=>err?res.writeHead(404).end():
  res.writeHead(200,{'Content-Type':full.endsWith('.js')?'text/javascript':'text/html'}).end(data));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',
   headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForFunction(()=>window.__ready&&World.MAIN.mainland&&World.MAIN.overworld60,null,{timeout:30000});
  await page.evaluate(async()=>{
   save.created=true;save.helped=true;save.v4=1;save.mainlandV3Welcome=1;
   save.fon=save.fon||{};save.fon.intro=1;await Game.enter();Game.X.st.mode='play';
  });
  await page.locator('#titleCov').dispatchEvent('pointerdown',{pointerType:'touch'});
  await page.waitForFunction(()=>WalesaOverworld60.ready&&Metro.R?.lines?.length===6,null,{timeout:120000});
  const seed=await page.evaluate(()=>{
   save.metroPass63=null;save.bells=500;
   // Choose a route which the planner actually uses from this station.
   let trip=null;
   for(const r of Metro.R.lines){
    for(const a of r.ST)for(const b of r.ST){
     if(a===b)continue;
     const j=WalesaMetro62.plan(a.name,b.name);
     if(j?.legs?.length===1&&j.legs[0].from.name===a.name&&j.legs[0].route===r){trip={a:a.name,b:b.name};break}
     if(trip)break;
    }
    if(trip)break;
   }
   if(!trip)throw Error('No direct route found for ticket test');
   const start=Metro.R.ST.find(s=>s.name===trip.a);
   Game.X.player.x=start.px;Game.X.player.y=start.py;
   Game.X.cam.x=start.px;Game.X.cam.y=start.py;
   WalesaMetro63.openStation(start);
   return trip;
  });
  await page.locator('.w63-station [data-to]').selectOption(seed.b);
  await page.locator('.w63-station [data-buy]').click();
  assert.ok(await page.locator('.w63-pass').count(),'ticket visible at street kiosk');
  assert.equal(await page.evaluate(()=>save.metroPass63?.used),false,'unspent ticket preserved');
  await page.locator('.w63-station [data-escalator]').click();
  assert.equal(await page.evaluate(()=>WalesaMetro63.stationLevel),'escalator');
  await page.locator('[data-climb]').click();
  await page.waitForFunction(()=>WalesaMetro63.stationLevel==='gate',null,{timeout:8000});
  assert.ok(await page.locator('[data-scan]').isEnabled(),'turnstile accepts purchased ticket');
  await page.locator('[data-scan]').click();
  assert.equal(await page.evaluate(()=>WalesaMetro63.stationLevel),'platform');
  assert.equal(await page.locator('[data-board]').isEnabled(),false,'must wait for an actual train');
  const ready=await page.evaluate(()=>{
   const pass=save.metroPass63,j=WalesaMetro62.plan(pass.from,pass.to);
   const st=j.legs[0].from,r=j.legs[0].route;
   const train=Metro.trains.find(t=>t.route===r);
   if(!train)throw Error('Train not found for planned route');
   train.s=st.s+.01;train.stop=6;train.at=st;
   return{line:r.id,from:st.name};
  });
  await page.waitForFunction(()=>!!document.querySelector('[data-board]')&&!document.querySelector('[data-board]').disabled,
    null,{timeout:5000});
  await page.locator('[data-board]').click();
  const ridden=await page.evaluate(()=>({riding:!!Metro.ride,used:save.metroPass63?.used,
    stage:WalesaMetro63.stationLevel,stationOpen:!!document.querySelector('.w63-overlay')}));
  assert.equal(ridden.riding,true,'train boarding starts real overworld travel');
  assert.equal(ridden.used,true,'ticket is consumed only on successful boarding');
  assert.equal(ridden.stationOpen,false,'station closes after boarding');
  // Draw the actual elevated geometry on a transparent canvas with a projected camera.
  const drawing=await page.evaluate(()=>{
   const st=Metro.R.ST.find(s=>s.name===save.metroPass63.from);
   Game.X.player.x=st.px;Game.X.player.y=st.py;
   Game.X.st.scene='out';
   const canvas=document.createElement('canvas');canvas.width=390;canvas.height=844;
   const ctx=canvas.getContext('2d');
   WalesaMetro66.renderElevated(ctx,{},(_,x,y)=>({x:195+(x-st.px)*.55,y:400+(y-st.py)*.55,s:1}));
   const pixels=ctx.getImageData(0,0,390,844).data;
   let painted=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)painted++;
   return{painted};
  });
  assert.ok(drawing.painted>400,'real viaduct, columns and station must render');
  assert.deepEqual(errors,[],'No browser JS errors');
  console.log('Metro v67 PASS',JSON.stringify({seed,ready,ridden,drawing}));
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});
