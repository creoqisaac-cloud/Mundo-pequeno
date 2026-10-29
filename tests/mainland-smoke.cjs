/* E2E: World.MAIN expandido sin portales, pantallas ni atlas independiente. */
'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(html,/<script src="\.\/walesa_mainland_v3\.js"><\/script>/);
assert.ok(!html.includes('<script src="./world_expansion_v1.js"></script>'));
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname,
 full=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!full.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.readFile(full,(err,data)=>{
  if(err){res.writeHead(404).end();return}
  res.writeHead(200,{'Content-Type':full.endsWith('.js')?'text/javascript':'text/html'});res.end(data);
 });
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>{errors.push(String(e));console.error(e.stack||e)});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.__ready===true&&World.MAIN.mainland,{timeout:120000});
  const map=await page.evaluate(()=>{
   const m=World.MAIN,land=m.mainland;
   return{
    main:World.map===m,MW:m.MW,MH:m.MH,oldMW:m.ground.width,oldMH:m.ground.height,
    buildings:m.build.length,objs:m.objs.length,zoneV:land.zone(3770,2310),
    zoneF:land.zone(5840,3650),zoneC:land.zone(3600,3690),zoneM:land.zone(3500,900),
    mountain:land.height(3500,900),valley:land.height(3700,2600),
    bridge:land.coast(2750,960),forest:land.coast(5840,3650),
    home:m.build.some(b=>b.id==='home'),
    newHouse:m.build.some(b=>b.id==='v3_radial0'),
    city:m.build.some(b=>b.id==='v3_urb3_4'),
    forestHouse:m.build.some(b=>b.id==='v3_forest-lodge')
   };
  });
  console.log('World.MAIN',map);
  assert.equal(map.main,true,'La expansión vive en World.MAIN');
  assert.equal(map.MW,6800);assert.equal(map.MH,4630);
  assert.equal(map.oldMW,2700);assert.equal(map.oldMH,1320);
  assert.ok(map.buildings>=35);assert.ok(map.objs>300);
  assert.equal(map.zoneV,'pueblo');assert.equal(map.zoneF,'forest');
  assert.equal(map.zoneC,'administrativo');assert.equal(map.zoneM,'montana');
  assert.ok(map.mountain>map.valley,'Se ve y se transita el relieve del boceto');
  assert.ok(map.bridge<.95,'Existe paso terrestre desde Ciudad Corazón');
  assert.ok(map.forest<.95,'El bosque se encuentra dentro del mapa');
  assert.ok(map.home&&map.newHouse&&map.city&&map.forestHouse);
  const homes=await page.evaluate(()=>{
   const m=World.MAIN,all=m.build.filter(b=>b.id.startsWith('v3_')&&!b.job);
   return {count:all.length,rooms:all.map(b=>b.room),
     names:all.map(b=>World.rooms[b.room]?.name),
     noGifts:all.every(b=>World.rooms[b.room]?.gift===false),
     originalRooms:m.build.filter(b=>!b.id.startsWith('v3_')&&b.room!==undefined).map(b=>b.room)};
  });
  assert.ok(homes.count>=25,'Todas las viviendas nuevas tienen interior');
  assert.equal(new Set(homes.rooms).size,homes.count,'Cada casa tiene una habitación propia');
  assert.ok(homes.rooms.every(n=>Number.isInteger(n)&&n>=4));
  assert.equal(homes.noGifts,true,'No aparece un regalo inexistente');
  assert.deepEqual(homes.originalRooms,[0,1,2,3],'Las viviendas originales no cambian');
  await page.evaluate(async()=>{
   await Game.enter();
   Game.X.st.mode='play';
   document.querySelector('#titleCov')?.classList.remove('on');
  });
  await page.waitForFunction(()=>save.mainlandV3Welcome===1&&Game.X.player.x>3400,{timeout:30000}).catch(async err=>{
    console.error('WELCOME DEBUG',await page.evaluate(()=>({
      mode:Game.X.st.mode,scene:Game.X.st.scene,menu:Game.X.st.menu,busy:Game.X.st.busy,mg:!!Game.X.st.mg,
      sx:Game.X.player.x,sy:Game.X.player.y,flag:save.mainlandV3Welcome,main:World.map===World.MAIN,
      hookCount:Game.X.HOOKS.update.length,hookTexts:Game.X.HOOKS.update.slice(-4).map(f=>String(f).slice(0,120))
    })));
    throw err;
  });
  const start=await page.evaluate(()=>({main:World.map===World.MAIN,x:Game.X.player.x,y:Game.X.player.y,scene:Game.X.st.scene}));
  assert.equal(start.main,true);assert.equal(start.scene,'out');
  assert.ok(start.x>3500&&start.y>2100,'La partida aparece en el pueblo nuevo');
  // Recorrer dos interiores muy separados, mediante la interacción ORIGINAL.
  for(const id of ['v3_radial0','v3_urb3_4']){
   const door=await page.evaluate(async id=>{
    const X=Game.X,b=World.MAIN.build.find(b=>b.id===id);
    X.player.x=b.x;X.player.y=b.y+17;X.cam.x=b.x;X.cam.y=b.y;
    const it=X.interactables().find(it=>it.type==='house'&&it.b===b);
    if(!it)throw Error('Casa sin interacción: '+id);
    await X.act(it);
    return {scene:X.st.scene,room:X.st.room,name:World.rooms[X.st.room]?.name,
      gift:X.interactables().some(it=>it.type==='gift')};
   },id);
   assert.equal(door.scene,'in',id+' abre un interior funcional');
   assert.equal(door.gift,false,'Sin regalos inexistentes');
   const out=await page.evaluate(async()=>{
    const X=Game.X,exit=X.interactables().find(it=>it.type==='exit');
    if(!exit)throw Error('Interior sin salida');
    await X.act(exit);
    return {scene:X.st.scene,x:X.player.x,y:X.player.y};
   });
   const expected=await page.evaluate(id=>{
    const b=World.MAIN.build.find(b=>b.id===id);return {x:b.x,y:b.y+16};
   },id);
   assert.equal(out.scene,'out',id+' permite salir');
   assert.deepEqual({x:out.x,y:out.y},expected,id+' regresa a su propia puerta');
  }
  for(const [x,y] of [[3500,900],[5540,2200],[3600,3690],[5840,3650],[2675,930]]){
   const step=await page.evaluate(async([x,y])=>{
    const X=Game.X;X.player.x=x;X.player.y=y;X.cam.x=x;X.cam.y=y;
    await new Promise(r=>setTimeout(r,550));
    const c=document.querySelector('#cv');
    return{main:World.map===World.MAIN,scene:X.st.scene,x:X.player.x,y:X.player.y,canvas:c?.width,
      bio:World.biomeAt(x,y),height:World.MAIN.elevation(x,y)};
   },[x,y]);
   console.log('OVERWORLD',step);
   assert.equal(step.main,true,'No puede cambiar World.map al recorrer el nuevo mundo');
   assert.equal(step.scene,'out');
   assert.ok(step.canvas>0);
  }
  assert.deepEqual(errors,[],'Sin errores de navegador');
  console.log('✓ Un solo overworld de 6800×4630, casas nativas, cinco biomas, laderas y continuidad sin portales: OK');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error('REGRESSION:',e);process.exitCode=1;server.close()});
