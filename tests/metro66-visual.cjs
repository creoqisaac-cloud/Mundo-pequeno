'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const p=new URL(req.url,'http://localhost').pathname;
 const full=path.resolve(root,'.'+(p==='/'?'/index.html':p));
 if(!full.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(full,(err,data)=>err?res.writeHead(404).end():res.writeHead(200,{'Content-Type':full.endsWith('.js')?'text/javascript':'text/html'}).end(data));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',err=>errors.push(String(err)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForFunction(()=>window.__ready===true&&World.MAIN.mainland&&World.MAIN.overworld60,null,{timeout:25000});
  await page.evaluate(async()=>{
   save.created=true;save.helped=true;save.v4=1;save.mainlandV3Welcome=1;
   save.fon=save.fon||{};save.fon.intro=1;
   await Game.enter();Game.X.st.mode='play';
  });
  await page.locator('#titleCov').dispatchEvent('pointerdown',{pointerType:'touch'});
  await page.waitForFunction(()=>WalesaOverworld60.ready&&Metro.R?.lines?.length===6,null,{timeout:120000});
  await page.evaluate(()=>{
   const r=Metro.R.lines[1],st=r.ST[0],dest=r.ST[1],tr=Metro.trains.find(t=>t.route===r);
   Game.X.player.x=st.px;Game.X.player.y=st.py;Game.X.cam.x=st.px;Game.X.cam.y=st.py;
   tr.s=st.s+.01;tr.stop=5.5;tr.at=st;
   if(!Metro.depart(st,dest))throw Error('Tren no acepta el boleto de prueba');
   if(!WalesaMetro66.setView('interior'))throw Error('Interior no disponible');
  });
  await page.locator('.w66-cabin .w66-shell').waitFor({state:'visible'});
  await page.waitForTimeout(250);
  const before=await page.evaluate(()=>({
   cabin:document.querySelector('.w66-cabin')?.getBoundingClientRect().toJSON(),
   view:document.querySelector('.w66-viewport')?.getBoundingClientRect().toJSON(),
   bottomControls:[...document.querySelectorAll('.w66-cabin button')].map(x=>{
    const r=x.getBoundingClientRect();return {text:x.textContent.trim(),height:r.height,width:r.width,visible:r.top>=0&&r.bottom<=innerHeight};
   }),
   phone:!!document.querySelector('.fon.on')
  }));
  assert.ok(before.view.height>=120,'The cabin window should be clearly visible');
  assert.ok(before.bottomControls.every(b=>b.height>=40&&b.visible),'All cabin controls must be usable on iPhone');
  const img=await page.screenshot({type:'jpeg',quality:48,animations:'disabled'});
  console.log('WALESA_VISUAL_BEGIN'+img.toString('base64')+'WALESA_VISUAL_END');
  console.log('WALESA_VISUAL_AUDIT',JSON.stringify(before));
  assert.deepEqual(errors,[],'No JS errors');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});