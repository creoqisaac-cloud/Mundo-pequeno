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
  await page.waitForFunction(()=>WalesaOverworld60.ready&&Metro.R?.lines.length===6,null,{timeout:120000});
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
  assert.equal(info.lines,6,'metro lines');assert.equal(info.npcUnique,true);
  assert.equal(info.saveKey,true,'original save slot');
  const metro=await page.evaluate(()=>({
   lines:Metro.R.lines.map(r=>({id:r.id,stops:r.ST.length,km:r.L/1000})),
   ui:!!window.WalesaMetro62?.view,
   elevated:WalesaMetro63?.elevated,
   expressStops:Metro.R.lines.slice(1).map(r=>r.ST.slice().map(s=>[s.name,s.px,s.py])),
   transferRoute:WalesaMetro62.plan('Isla Azahar','Terminal del Faro')?.transfers,
   clear:Metro.R.ST.filter(s=>World.blockedOut(s.px,s.py+8,5)).map(s=>s.name)
  }));
  assert.equal(metro.ui,true,'interactive metro route planner available');
  assert.equal(metro.elevated,true,'elevated metro renderer with separate noncolliding viaduct');
  assert.ok(metro.transferRoute>=1,'island-to-faro journey uses direct transfer');
  assert.ok(metro.expressStops.every(line=>line.every((s,i)=>i===0||Math.hypot(s[1]-line[i-1][1],s[2]-line[i-1][2])>=600)),'express stops spaced at least 600 world units');
  assert.ok(metro.lines.every(r=>r.stops>=5),'all lines have five or more stations');
  assert.ok(metro.lines.slice(1).every(r=>r.km>=5),'expanded lines must be long enough');
  assert.deepEqual(metro.clear,[],'metro platforms must be accessible');
  const fare=await page.evaluate(()=>{
   const app=document.createElement('div');
   app.className='w63-spec';document.body.appendChild(app);
   const api=WalesaMetro63;
   // Comprobar el precio, las paradas elegibles y la compra sin tocar la partida de otros usuarios.
   save.bells=200;
   const before=save.bells;
   api.render({scr:app,bar:()=>'',hd:()=>'',back:()=>{}});
   const map=app.querySelector('.w63-app');
   const mapStations=app.querySelectorAll('[data-pick]').length;
   const hasTicket=!!app.querySelector('[data-buy]');
   if(!hasTicket)return {mapStations,hasTicket,after:save.bells};
   // Seleccionar dos estaciones conectadas para el viaje real.
   const from=app.querySelector('[data-from]'),to=app.querySelector('[data-to]');
   from.value='Isla Azahar';from.dispatchEvent(new Event('change'));
   const currentTo=app.querySelector('[data-to]');currentTo.value='Terminal del Faro';currentTo.dispatchEvent(new Event('change'));
   app.querySelector('[data-buy]')?.click();
   const pass=save.metroPass63?{...save.metroPass63}:null;
   const result={mapStations,hasTicket,pass,charged:before-save.bells,hasTicketCard:!!app.querySelector('.w63-pass'),
     elevated:WalesaMetro63.elevated,overworldView:!document.querySelector('.wm62-coach'),
     route:WalesaMetro62.plan('Isla Azahar','Terminal del Faro')};
   app.remove();return result;
  });
  assert.ok(fare.mapStations>=12,'interactive metro network map exposes destinations');
  assert.equal(fare.hasTicket,true,'ticket purchase is available in the in-game phone');
  assert.equal(fare.charged,45,'one ticket costs 45 bells');
  assert.equal(fare.pass?.from,'Isla Azahar','ticket has selected origin');
  assert.equal(fare.pass?.to,'Terminal del Faro','ticket has selected destination');
  assert.equal(fare.pass?.used,false,'ticket persists unused until boarding');
  assert.equal(fare.hasTicketCard,true,'phone displays the purchased pass');
  assert.equal(fare.elevated,true,'viaduct elevated');
  assert.equal(fare.overworldView,true,'no fullscreen underground ride overlay');
  assert.ok(fare.route?.transfers>=1,'transfer remains available with one pass');
  console.log('✓ V63 elevated metro, in-game ticket, route and transfers',fare.mapStations,fare.pass);
  const residentAudit=await page.evaluate(()=>{
   const ids=Object.keys(WalesaResidents64.profiles);
   const newDefs=ids.map(id=>World.NPCDEF[id]);
   const names=ids.map(id=>Talk.P[id].name);
   const original=World.NPCDEF.melody;
   const samples=ids.map(id=>World.charSprite(World.NPCDEF[id],0,0).c.toDataURL('image/png'));
   const before=Game.X.player;
   // Usar un punto transitable y distante del punto de inicio de v59.
   const model=World.MAIN;
   let good=null;
   for(let y=2150;y<2500&&!good;y+=22)for(let x=3500;x<3950;x+=22)if(model.islandD(x,y)<.8&&!World.blockedOut(x,y,8)){good={x,y};break}
   if(good){Game.X.player.x=good.x;Game.X.player.y=good.y;WalesaResidents64.savePos();}
   return{num:ids.length,uniqueNames:new Set(names).size,uniqueLooks:new Set(samples).size,
    originalUnchanged:original.type==='melody'&&!original.walesa64,
    originalName:Talk.P.melody.name,
    outfits:new Set(newDefs.map(x=>x.outfit)).size,
    faces:newDefs.every(x=>!!x.walesa64?.eye&&!!x.walesa64?.hair),
    saved:save.lastPosition64?{...save.lastPosition64}:null,
    current:{x:Game.X.player.x,y:Game.X.player.y},
    foundFreeSpot:!!good
   };
  });
  assert.equal(residentAudit.num,11,'eleven new Walesa residents are customized');
  assert.equal(residentAudit.uniqueNames,11,'each new resident has a unique original name');
  assert.equal(residentAudit.uniqueLooks,11,'residents have visually different rendered sprites');
  assert.equal(residentAudit.originalUnchanged,true,'original Sanrio-style residents are untouched');
  assert.ok(residentAudit.outfits>=9,'wide diversity of wardrobe');
  assert.equal(residentAudit.faces,true,'new residents have independent hair and iris colors');
  assert.equal(residentAudit.foundFreeSpot,true,'found a free location to save');
  assert.equal(residentAudit.saved?.x,residentAudit.current.x,'saved player X');
  assert.equal(residentAudit.saved?.y,residentAudit.current.y,'saved player Y');
  assert.equal(residentAudit.saved?.map,'main','saved persistent mainland coordinate');
  console.log('✓ V64 unique neighbors and world position',residentAudit.uniqueNames,residentAudit.uniqueLooks,residentAudit.saved);
  const water=await page.evaluate(()=>{
   const model=World.MAIN,ground=model.mainland,sea=World.sea;
   const ocean=sea.getContext('2d').getImageData(0,0,64,64).data;
   const points=[[100,3000],[6500,950],[6500,4400],[100,2100],[3100,4400]];
   return points.filter(([x,y])=>model.islandD(x,y)>1.08).map(([x,y])=>{
    const canvas=document.createElement('canvas');canvas.width=3;canvas.height=3;
    const g=canvas.getContext('2d');ground.draw(g,x,y,3,3,0);
    const pixel=[...g.getImageData(0,0,1,1).data].slice(0,3);
    const k=((y%64)*64+x%64)*4,reference=[...ocean.slice(k,k+3)];
    return {x,y,pixel,reference,match:pixel.every((v,i)=>v===reference[i])};
   });
  });
  assert.ok(water.length>=2,'two open-water test locations');
  assert.ok(water.every(p=>p.match),'all open seas share native water pixels');
  console.log('✓ Extended metro',metro);
  assert.deepEqual(errors,[],'no page errors');
  console.log('✓ Walesa v60 mobile smoke passed',info);
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
