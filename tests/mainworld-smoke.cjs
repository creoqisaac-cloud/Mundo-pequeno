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
  assert.ok(!zones.z[0].sand&&!zones.z[0].water,'No deben existir botones de construcción en el overworld');
  const v48=await page.evaluate(async()=>{const X=Game.X,m=World.MAIN,st=m.stands.find(b=>b.id==='castillos48'),b=m.build.filter(b=>b.id.endsWith('47'));
    if(!st||!st.spr||st.job!=='sandcastle48')return{error:'no native stall'};
    if(b.length!==3||b.some(h=>!h.day||!h.night||h.job==='shop'))return{error:'generic new houses'};
    const dealer=m.build.find(x=>x.id==='autosCorazon48');
    const roads=m.roads||[];
    if(!dealer||!dealer.city||!dealer.day||dealer.job!=='autosCorazon48')return{error:'car dealer not native city building'};
    if(b.some(x=>x.x<1600||x.x>2700||x.y<160||x.y>1160))return{error:'new houses outside Ciudad Corazón'};
    if(b.some(x=>x.city||x.day.c.width!==80))return{error:'houses not using original 80px watercolor sprites'};
    const buildings=[...b,dealer];
    if(buildings.some(x=>m.islandD(x.x,x.y)>.85))return{error:'buildings in sea'};
    if(buildings.some(x=>buildings.some(y=>x!==y&&Math.hypot(x.x-y.x,x.y-y.y)<98)))return{error:'buildings collide'};
    if(buildings.some(x=>m.build.some(y=>!buildings.includes(y)&&Math.hypot(x.x-y.x,x.y-y.y)<110)))return{error:'existing buildings overlap'};
    const button=document.querySelector('#movBtns');
    if(getComputedStyle(button).display!=='none')return{error:'old visual sprint button'};
    const game=m.id;X.player.x=st.x;X.player.y=st.y+24;const entry=X.interactables().find(it=>it.b?.id==='castillos48');
    if(!entry||entry.type!=='job')return{error:'stall unreachable'};
    const prevAsk=X.ask,prevIntro=Expansion46.S.sand.intro;Expansion46.S.sand.intro=1;X.ask=async()=>0;
    try{await X.act(entry);if(World.map.exp46!=='sand')return{error:'booth did not open minigame world'};await Expansion46.home();}
    finally{X.ask=prevAsk;Expansion46.S.sand.intro=prevIntro;}
    return{home:World.map.id===game,stall:!!st.spr,house:b.length};
  });
  assert.deepEqual(v48,{home:true,stall:true,house:3},JSON.stringify(v48));
  assert.ok(zones.car[0]>=40&&zones.car[1]>=30);
  assert.deepEqual(errors,[],'Errores de Javascript del navegador');
  console.log('✓ v48: regiones caminables, casas nativas, puestito, castillos y regreso, sin botones flotantes.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(err=>{console.error(err);process.exitCode=1});