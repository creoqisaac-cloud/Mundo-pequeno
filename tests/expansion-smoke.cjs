/* Regresión de expansión: motor original, continentes, bosque, persistencia, render y regreso. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(html,/<script src="\.\/world_expansion_v1\.js"><\/script>/);
assert.ok(html.includes('walesa-ds-v1'));
const server=http.createServer((req,res)=>{
 let filename;
 try{filename=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch(_){res.writeHead(400).end();return}
 const abs=path.resolve(root,'.'+(filename==='/'?'/index.html':filename));
 if(!abs.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.readFile(abs,(e,data)=>{if(e){res.writeHead(404).end();return}
  const ct=abs.endsWith('.js')?'text/javascript':abs.endsWith('.html')?'text/html':abs.endsWith('.svg')?'image/svg+xml':'application/octet-stream';
  res.writeHead(200,{'Content-Type':ct});res.end(data)});
});
const withTimeout=(ms,p)=>Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(Error('Timeout '+ms+'ms')),ms))]);
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',error=>{errors.push(String(error));console.error('PAGEERROR:',error.stack||String(error))});
  page.setDefaultTimeout(120000);
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.__ready===true && typeof window.WalesaExpansion==='object',{timeout:90000});
  const init=await page.evaluate(()=>({version:WalesaExpansion.version,area:WalesaExpansion.dimensions,
    home:World.MAIN.build.some(b=>b.id==='home'),city:World.MAIN.build.some(b=>b.id==='hospital32'),
    save:typeof Game.G.save==='function'}));
  assert.equal(init.version,1);
  assert.deepEqual(init.area,{columns:32,rows:32,sectorWidth:768,sectorHeight:704});
  assert.equal(init.home,true);assert.equal(init.city,true);assert.equal(init.save,true);
  await withTimeout(120000,page.evaluate(async()=>{
   await Game.enter();
   Game.X.st.mode='play';
   document.querySelector('#titleCov')?.classList.remove('on');
  }));
  await withTimeout(120000,page.evaluate(()=>WalesaExpansion.go(16,16,false,90,352)));
  const c=await page.evaluate(()=>({x:World.map.gridX,y:World.map.gridY,economy:World.map.economy,
   count:World.map.build.length,objects:World.map.objs.length,ground:World.map.ground.width,
   entrances:Game.X.interactables().filter(o=>o.type==='expGate').length}));
  assert.equal(c.x,16);assert.equal(c.y,16);assert.ok(c.economy>0);
  assert.ok(c.count>=3,'El distrito contiene edificios nativos');
  assert.ok(c.objects>10,'Los objetos usan World.addObj');
  assert.equal(c.ground,768,'Sólo se renderiza un sector, no el atlas completo');
  assert.ok(c.entrances>=1,'Hay un regreso a Walesa');
  // Cruce natural por el borde sin teletransporte manual: HOOK update llama al motor de sectores.
  await page.evaluate(()=>{Game.X.player.x=755;Game.X.player.y=352});
  await page.waitForFunction(()=>World.map.gridX===17&&!Game.X.st.busy,{timeout:120000});
  const right=await page.evaluate(()=>World.map.gridX);
  assert.equal(right,17);
  await withTimeout(120000,page.evaluate(()=>WalesaExpansion.go(0,0,true,98,352)));
  const f1=await page.evaluate(()=>({id:World.map.id,seed:World.map.seed,forest:World.map.forest,ground:World.map.ground.width}));
  assert.equal(f1.forest,true);assert.equal(f1.ground,768);
  await withTimeout(120000,page.evaluate(()=>WalesaExpansion.go(0,1,true,384,352)));
  assert.equal(await page.evaluate(()=>World.map.gridY),1);
  await withTimeout(120000,page.evaluate(()=>WalesaExpansion.go(0,0,true,98,352)));
  const f2=await page.evaluate(()=>({id:World.map.id,seed:World.map.seed}));
  assert.equal(f1.id,f2.id);assert.equal(f1.seed,f2.seed,'Bosque reproducible por semilla');
  const persistence=await page.evaluate(()=>({
   stored:!!localStorage.getItem('walesa-ds-v1'),
   forest:!!save.expansionV1.visited['f:0:0'],
   continent:!!save.expansionV1.visited['c:16:16'],
   district:World.MAIN.id,
   pix:[...document.getElementById('cv').getContext('2d').getImageData(20,20,1,1).data]
  }));
  assert.equal(persistence.stored,true);
  assert.equal(persistence.forest,true);assert.equal(persistence.continent,true);
  assert.equal(persistence.district,'main');
  assert.ok(persistence.pix[3]>0,'Se pinta la escena en pantalla');
  await withTimeout(120000,page.evaluate(()=>WalesaExpansion.returnHome()));
  assert.equal(await page.evaluate(()=>World.map===World.MAIN),true,'Regresa al mundo original');
  assert.deepEqual(errors,[],'Sin errores JavaScript en navegador');
  console.log('✓ 1024 distritos, paso de fronteras, bosque determinista, guardado, render y Walesa original: OK');
 }catch(error){console.error('BROWSER REGRESSION:',error);process.exit(1)}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
