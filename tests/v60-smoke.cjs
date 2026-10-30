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
  const metro66=await page.evaluate(()=>{
    const eng=Metro,unit=WalesaMetro66,r=eng.R.lines[1],a=r.ST[0],b=r.ST[1];
    const train=eng.trains.find(t=>t.route===r);
    train.s=a.s+.01;train.stop=5.5;train.at=a;
    const ok=eng.depart(a,b),active=!!eng.ride;
    const inside=unit.setView('interior');
    const scene=!!document.querySelector('.w66-cabin');
    const perspective=!!document.querySelector('.w66-world3d .w66-car3d');
    const turn=document.querySelector('.w66-cabin [data-turn="55"]');
    turn?.click();
    const viewTurn=document.querySelector('.w66-cabin')?.style.getPropertyValue('--look');
    const canOpenPhone=typeof Fon?.open==='function';
    Fon?.open();
    const phoneOpened=!!document.querySelector('.fon.on'),menuWhenPhone=Game.X.st.menu;
    const lead=eng.trains.find(t=>t.route!==r&&t.stop<=0);
    const before=lead?.s;
    eng.tick(.04);
    const after=lead?.s;
    Fon?.close();
    unit.setView('exterior');
    train.at=b;train.s=b.s;train.stop=1;
    eng.tick(.04);
    const exitClean=!eng.ride&&!document.querySelector('.w66-cabin');
    return{ok,active,inside,scene,perspective,viewTurn,canOpenPhone,phoneOpened,menuWhenPhone,
       motion:before!=null&&after!=null&&after!==before,exitClean,view:unit.mode};
  });
  assert.equal(metro66.ok,true,'boarding a real train works');
  assert.equal(metro66.active,true,'player enters a real carriage');
  assert.equal(metro66.inside,true,'inside view accessible');
  assert.equal(metro66.scene,true,'car interior scene renders');
  assert.equal(metro66.perspective,true,'interior has 3D perspective structure');
  assert.equal(metro66.viewTurn,'55deg','player can rotate interior view');
  assert.equal(metro66.phoneOpened,true,'native phone opens inside carriage');
  assert.equal(metro66.menuWhenPhone,true,'phone is available during travel');
  assert.equal(metro66.motion,true,'trains keep moving while phone is open');
  assert.equal(metro66.exitClean,true,'interior closes after disembarking');
  console.log('✓ v66 metro onboard, 3D interior and phone while riding',metro66);
  const residentAudit=await page.evaluate(()=>{
   const removed=["walesa_iris","walesa_nico","walesa_luma","walesa_fede","walesa_mara","walesa_timo","walesa_cira","walesa_oli","walesa_bimba","walesa_tara","walesa_roco"];
   const original=['mimmy','cinna','melody','kuromi','pom','pochacco','keroppi','badtz','chococat','tuxedo','hangyo'];
   const candidates=Object.keys(Talk.P).filter(k=>k.startsWith('walesa_'));
   const forbidden=removed.filter(id=>Talk.P[id]||World.NPCDEF[id]||Game.X.NPCS.some(n=>n.id===id));
   const m=World.MAIN;
   let good=null;
   for(let y=2150;y<2500&&!good;y+=22)for(let x=3500;x<3950;x+=22)if(m.islandD(x,y)<.8&&!World.blockedOut(x,y,8)){good={x,y};break}
   if(good){Game.X.player.x=good.x;Game.X.player.y=good.y;WalesaPosition65.savePos()}
   return{forbidden,candidates,originals:original.filter(id=>!Talk.P[id]||!World.NPCDEF[id]),
    customResidents:WalesaMainland.townResidents,
    saved:save.lastPosition64?{...save.lastPosition64}:null,
    current:{x:Game.X.player.x,y:Game.X.player.y},foundFreeSpot:!!good};
  });
  assert.deepEqual(residentAudit.forbidden,[],'removed added NPCs from world and registry');
  assert.deepEqual(residentAudit.candidates,[],'no generated Walesa NPCs remain');
  assert.deepEqual(residentAudit.originals,[],'original character registry untouched');
  assert.deepEqual(residentAudit.customResidents,[],'expansion no longer injects new NPCs');
  assert.equal(residentAudit.foundFreeSpot,true,'found a walkable position');
  assert.equal(residentAudit.saved?.x,residentAudit.current.x,'saved player X');
  assert.equal(residentAudit.saved?.y,residentAudit.current.y,'saved player Y');
  assert.equal(residentAudit.saved?.map,'main','saved main-map coordinate');
  console.log('✓ V65 removed added NPCs without touching originals',residentAudit);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__ready&&World.MAIN.mainland&&World.MAIN.overworld60,null,{timeout:25000});
  await page.evaluate(async()=>{await Game.enter()});
  const restored=await page.evaluate(()=>({
   playerX:Game.X.player.x,playerY:Game.X.player.y,
   savedX:save.lastPosition64?.x,savedY:save.lastPosition64?.y,
   blocked:World.blockedOut(Game.X.player.x,Game.X.player.y,8)
  }));
  assert.equal(restored.playerX,residentAudit.saved.x,'restores previous X after reload');
  assert.equal(restored.playerY,residentAudit.saved.y,'restores previous Y after reload');
  assert.equal(restored.blocked,false,'restored position walkable');
  console.log('✓ V65 continues from saved location',restored);
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
