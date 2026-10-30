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
  await page.waitForFunction(()=>window.__ready&&World.MAIN.mainland&&World.MAIN.overworld60,null,{timeout:120000});
  await page.evaluate(async()=>{save.created=true;save.helped=true;save.v4=1;save.fon=save.fon||{};save.fon.intro=1;Game.G.save();await Game.enter()});
  await page.locator('#titleCov').dispatchEvent('pointerdown',{pointerType:'touch'});
  await page.waitForFunction(()=>WalesaOverworld60.ready&&Metro.R?.lines.length===4,null,{timeout:120000});
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
  assert.equal(info.lines,4,'metro lines');assert.equal(info.npcUnique,true);
  assert.equal(info.saveKey,true,'original save slot');
  assert.deepEqual(errors,[],'no page errors');
  console.log('✓ Walesa v60 mobile smoke passed',info);
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
