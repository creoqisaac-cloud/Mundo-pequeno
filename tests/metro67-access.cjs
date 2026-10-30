'use strict';
/* Recorrido completo del metro elevado: taquilla, escaleras, torniquete y tren real. */
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const assert=require('node:assert/strict'),{chromium}=require('playwright');
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
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForFunction(()=>window.__ready===true&&World.MAIN.mainland&&World.MAIN.overworld60,null,{timeout:25000});
  await page.evaluate(async()=>{
    save.created=true;save.helped=true;save.v4=1;save.mainlandV3Welcome=1;
    save.fon=save.fon||{};save.fon.intro=1;
    await Game.enter();Game.X.st.mode='play';
  });
  await page.locator('#titleCov').dispatchEvent('pointerdown',{pointerType:'touch'});
  await page.waitForFunction(()=>WalesaOverworld60.ready&&Metro.R?.lines?.length===6,null,{timeout:120000});
  const entry=await page.evaluate(()=>{
    const r=Metro.R.lines[1],s=r.ST[0],t=r.ST[1];
    Game.X.player.x=s.px;Game.X.player.y=s.py;
    Game.X.cam.x=s.px;Game.X.cam.y=s.py;
    save.bells=200;save.metroPass63=null;
    const opened=WalesaMetro63.openStation(s);
    const purchase=document.querySelector('.w63-overlay [data-buy]');
    const destination=document.querySelector('.w63-overlay [data-to]');
    destination.value=t.name;destination.dispatchEvent(new Event('change'));
    document.querySelector('.w63-overlay [data-buy]')?.click();
    const paid=save.bells===155&&save.metroPass63?.from===s.name;
    const ascend=document.querySelector('.w63-overlay [data-escalator]');
    ascend?.click();
    const escalator=WalesaMetro63.stationLevel==='escalator'&&!!document.querySelector('.w67-moving-stairs');
    document.querySelector('.w63-overlay [data-climb]')?.click();
    return{opened,purchase:!!purchase,paid,escalator,station:s.name};
  });
  assert.ok(entry.opened&&entry.purchase&&entry.paid&&entry.escalator,'Taquilla y escalera accesibles');
  await page.waitForTimeout(2900);
  const gate=await page.evaluate(()=>{
   const reached=WalesaMetro63.stationLevel==='gate';
   document.querySelector('.w63-overlay [data-scan]')?.click();
   const platform=WalesaMetro63.stationLevel==='platform';
   const route=Metro.R.lines[1],st=route.ST[0],dest=route.ST[1];
   const tr=Metro.trains.find(t=>t.route===route);
   tr.s=st.s+.01;tr.stop=5.5;tr.at=st;
   return{reached,platform,station:st.name,destination:dest.name};
  });
  assert.ok(gate.reached&&gate.platform,'Torniquete valida boleto y llega al anden');
  await page.waitForTimeout(850);
  const journey=await page.evaluate(()=>{
    const btn=document.querySelector('.w63-overlay [data-board]');
    const enabled=!!btn&&!btn.disabled;
    btn?.click();
    return{enabled,onboard:!!Metro.ride,used:save.metroPass63?.used,
      overlayClosed:!document.querySelector('.w63-overlay'),
      speed:Metro.R.lines[1].speed,
      renderer:!!WalesaMetro66.elevated};
  });
  assert.equal(journey.enabled,true,'Solo permite subir al llegar el tren');
  assert.equal(journey.onboard,true,'Tren real inicia el viaje');
  assert.equal(journey.used,true,'Boleto se valida una vez');
  assert.equal(journey.overlayClosed,true,'Acceso libera controles al viajar');
  assert.ok(journey.speed<=120,'Metro circula a velocidad reducida');
  assert.ok(journey.renderer,'Viaducto elevado activo');
  assert.deepEqual(errors,[],'No errores JS durante la visita');
  console.log('✓ Metro v67: compra, escalera animada, torniquete, espera y abordaje real',entry,gate,journey);
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});