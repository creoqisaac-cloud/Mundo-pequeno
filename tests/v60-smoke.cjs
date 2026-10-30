'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const name=url.pathname==='/'?'/index.html':url.pathname;
 const file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(err,buf)=>err?res.writeHead(404).end():res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.webmanifest')?'application/manifest+json':'text/html'}).end(buf));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  try{await page.waitForFunction(()=>window.__ready&&World.MAIN.mainland&&World.MAIN.overworld60,null,{timeout:25000})}
  catch(e){console.error('v60 boot diagnostics',await page.evaluate(()=>({
   ready:window.__ready,world:typeof World,game:typeof Game,
   mainland:!!window.World?.MAIN?.mainland,overworld:!!window.World?.MAIN?.overworld60,
   module:!!window.WalesaOverworld60,loading:window.Game?.st?.mode,
   errors:document.documentElement.className
  })),errors);throw e}
  await page.evaluate(async()=>{save.created=true;save.helped=true;save.v4=1;save.fon=save.fon||{};save.fon.intro=1;Game.G.save();await Game.enter()});
  await page.locator('#titleCov').dispatchEvent('pointerdown',{pointerType:'touch'});
  await page.waitForFunction(()=>WalesaOverworld60.ready&&Metro.R?.lines.length===8,null,{timeout:120000});
  const info=await page.evaluate(()=>{
   const w=WalesaOverworld60,m=World.MAIN;
   return{extent:[m.MW,m.MH],newBuildings:m.build.filter(b=>b.id.startsWith('v3_')).length,
    islands:w.islands.length,bridges:w.bridges.length,berries:w.berries.length,
    details:m.objs.filter(o=>o.detail60).length,lines:Metro.R.lines.length,
    npcUnique:new Set(Game.X.NPCS.map(n=>n.id)).size===Game.X.NPCS.length,
    saveKey:localStorage.getItem('walesa-ds-v1')!==null};
  });
  assert.deepEqual(info.extent,[6800,4630]);
  assert.ok(info.newBuildings>=45,'preserved mainland buildings');
  assert.equal(info.islands,2);assert.equal(info.bridges,3);
  assert.ok(info.berries>=30,'daily berry bushes');assert.ok(info.details>150,'new coastal flora');
  assert.equal(info.lines,8,'metro lines');assert.equal(info.npcUnique,true);
  assert.equal(info.saveKey,true,'original save slot');
  const metro=await page.evaluate(()=>({
   lines:Metro.R.lines.map(r=>({id:r.id,stops:r.ST.length,km:r.L/1000})),
   ui:!!window.WalesaMetro61?.render,
   clear:Metro.R.ST.filter(s=>World.blockedOut(s.px,s.py+8,5)).map(s=>s.name)
  }));
  assert.equal(metro.ui,true,'phone metro map available');
  assert.ok(metro.lines.every(r=>r.stops>=5),'all lines have five or more stations');
  assert.ok(metro.lines.slice(1).every(r=>r.km>=5),'expanded lines must be long enough');
  assert.deepEqual(metro.clear,[],'metro platforms must be accessible');
  console.log('✓ Extended metro',metro);
  assert.deepEqual(errors,[],'no page errors');
  console.log('✓ Walesa v60 mobile smoke passed',info);
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
