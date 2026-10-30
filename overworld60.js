/* Additive v60: southern islands, native berry bushes, coastal details and metro routes. */
window.WalesaOverworld60=(()=>{'use strict';
 const V=World,X=Game.X,H=X.HOOKS;
 const islands=[{id:'azahar',name:'Isla Azahar',x:750,y:2300,rx:680,ry:600,phase:.4},{id:'luciernaga',name:'Isla Luciérnaga',x:1880,y:3800,rx:680,ry:620,phase:2.1}];
 const bridges=[[[750,1222],[750,1810]],[[1120,2670],[1500,3320]],[[2460,3730],[3350,3730]]];
 const paths=[...bridges,[[750,1810],[750,2300]],[[750,2300],[1120,2670]],[[1500,3320],[1880,3800]],[[1880,3800],[2460,3730]],[[3350,3730],[3350,3760]],
  [[750,2300],[410,2120]],[[410,2120],[600,1880]],[[600,1880],[1040,2090]],[[1040,2090],[1120,2470]],[[1120,2470],[1120,2670]],[[1120,2670],[650,2700]],[[650,2700],[410,2450]],[[410,2450],[410,2120]],
  [[1880,3800],[1560,3630]],[[1560,3630],[1700,3430]],[[1700,3430],[2150,3490]],[[2150,3490],[2300,3850]],[[2300,3850],[2110,4210]],[[2110,4210],[1690,4180]],[[1690,4180],[1500,3900]],[[1500,3900],[1560,3630]]];
 const segment=(x,y,[a,b])=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)};
 function regionAt(x,y){return islands.find(r=>Math.hypot((x-r.x)/r.rx,(y-r.y)/r.ry)<1.2)||null}
 function distance(x,y){if(y<1200||x>3400)return 9;let d=9;for(const r of islands){const nx=(x-r.x)/r.rx,ny=(y-r.y)/r.ry,a=Math.atan2(ny,nx),form=1+.07*Math.sin(a*3+r.phase)+.035*Math.sin(a*5-r.phase);d=Math.min(d,Math.hypot(nx,ny)/form+(V.vnoise(x/75,y/75)-.5)*.035)}for(const l of bridges){if(x<Math.min(l[0][0],l[1][0])-30||x>Math.max(l[0][0],l[1][0])+30||y<Math.min(l[0][1],l[1][1])-30||y>Math.max(l[0][1],l[1][1])+30)continue;d=Math.min(d,segment(x,y,l)/22*.88)}return d}
 function biome(x,y,r=regionAt(x,y)){if(!r)return'beach';const w=(V.vnoise(x/110,y/110)-.5)*90;if(r.id==='azahar'){if(y>2580+w)return'beach';if(x<570+w+(y-2300)*.12)return'candy';if(Math.hypot((x-1090)/280,(y-2090)/330)<1+w/600)return'chile';return'town'}if(y>4110+w)return'beach';if(Math.hypot((x-2180)/290,(y-3540)/270)<1+w/600)return'snow';if(Math.hypot((x-2210)/310,(y-3910)/320)<1+w/600)return'star';return'shroom'}
 const lines=[
  {id:'norte60',name:'Línea del Continente',color:'#729ca3',speed:110,points:[[2530,940],[2675,930],[2810,1000],[3000,1240],[3170,1650],[3440,2020],[3570,2310],[3650,1830],[3560,1390],[3480,880],[3280,1020],[3000,1240],[2750,1050]],stops:[['Corazón · enlace',2530,940],['Paso del Oeste',3000,1240],['Pueblo de Walesa',3570,2310],['Cordillera',3480,880]]},
  {id:'este60',name:'Línea de los Distritos',color:'#cb956c',speed:120,points:[[3970,2310],[4230,2360],[4780,2340],[5300,2290],[5540,2660],[5700,3020],[5840,3650],[5550,3890],[5320,4040],[4080,4020],[3600,3940],[3600,3450],[3690,3100],[3760,2730]],stops:[['Pueblo · este',3970,2310],['Meseta Oriental',5300,2290],['Bosque Profundo',5840,3650],['Ciudad del Sur',3600,3760]]},
  {id:'sur60',name:'Línea de las Islas',color:'#9c8ab7',speed:120,points:[[760,1100],[750,1600],[750,2300],[1120,2670],[1500,3320],[1880,3800],[2460,3720],[3350,3720],[3320,3740],[2460,3740],[1850,3840],[1470,3350],[1090,2700],[720,2340],[720,1600],[730,1120]],stops:[['Playa · sur',760,1100],['Azahar',750,2300],['Luciérnaga',1880,3800],['Sur · enlace',3350,3720]]}
 ];
 let main=null,done=false;const berries=[];
 function install(m){if(m.overworld60)return;m.overworld60=api;main=m;const old=m.islandD;m.islandD=(x,y)=>Math.min(old(x,y),distance(x,y));m.metro47=lines;}
 const here=()=>main&&X.M()===main&&X.st.scene==='out';
 const onBridge=(x,y)=>bridges.some(l=>segment(x,y,l)<48);
 const onRail=(x,y,r=26)=>lines.some(l=>l.points.some((p,i)=>segment(x,y,[p,l.points[(i+1)%l.points.length]])<r));
 function free(x,y,r=13){return main.islandD(x,y)<.84&&!V.blockedOut(x,y,r)&&!onRail(x,y,r+12)&&!onBridge(x,y)}
 function add(s,x,y,r=0,extra={}){return V.addObj(main,s,x,y,r?V.circS(x,y-3,r):null,{detail60:true,...extra})}
 function populate(){if(done||!here()||!V.spr||!window.Metro?.R)return;done=true;const s=V.spr,R=V.rng(60029);
  // Keep all footbridges and their approaches clear, including overhanging tree canopies.
  main.objs=main.objs.filter(o=>o.house||o.stand||o.plot||!onBridge(o.x,o.y));main.solids=main.solids.filter(q=>!onBridge(q.x+(q.w||0)/2,q.y+(q.h||0)/2));
  main.fruitTrees=main.fruitTrees.filter(o=>main.objs.includes(o));main.harvest=main.harvest.filter(o=>main.objs.includes(o));Isaac.rebuildSG(main);
  for(const r of islands)for(let i=0;i<720;i++){const x=r.x+(R()-.5)*r.rx*2,y=r.y+(R()-.5)*r.ry*2;if(!free(x,y,20)||paths.some(l=>segment(x,y,l)<30)||main.objs.some(o=>Math.hypot(o.x-x,o.y-y)<28))continue;
   const b=biome(x,y,r);let sp,extra={};
   if(b==='snow')sp=i%4?s.tree.snow:s.crystal[i%3];else if(b==='star')sp=i%3?s.tree.star:s.crystal[i%3];else if(b==='shroom')sp=i%3?s.shroom[i%4]:s.fern;else if(b==='candy')sp=i%3?s.tree.cotton:s.lolli[i%4];else if(b==='chile')sp=i%3?s.tree.tamarind:s.agave;else if(b==='beach')sp=i%3?s.palm[i%2]:s.bush[2];else{sp=i%3?s.tree.green:s.tree.fruit;if(i%3===0)extra={kind:'fruit',fid:'south60:'+r.id+':'+i,shadow:'T'}}
   const o=add(sp,x,y,5,extra);if(extra.kind)main.fruitTrees.push(o);
  }
  const roads=WalesaMainland.streetSegments;
  for(const [i,l]of roads.entries()){if(i%2&&berries.length>110)continue;const [a,b]=l,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<80)continue;
   for(const q of [.27,.62])for(const side of [-1,1]){const x=a[0]+dx*q-dy/len*side*36,y=a[1]+dy*q+dx/len*side*36;if(x<2700&&!regionAt(x,y)||!free(x,y,16)||berries.some(p=>Math.hypot(p.x-x,p.y-y)<80))continue;
    berries.push({id:'overworld60:'+i+':'+q+':'+side,x,y});if(berries.length>=160)break;
   }if(berries.length>=160)break;
  }
  // Native flora, palms, rocks and warm lamps along the expanded mainland's coast and trails.
  for(let i=0;i<1100;i++){const x=2850+R()*3650,y=180+R()*4200,d=main.islandD(x,y);if(d<.58||d>.91||!free(x,y,18)||WalesaMainland.nearbyRoad(x,y,32)||main.objs.some(o=>Math.hypot(o.x-x,o.y-y)<29))continue;
   const b=main.biome(x,y,main),sp=d>.81?s.rock[i%2]:b==='shroom'?s.glowF[i%3]:b==='candy'?s.bush[1]:b==='chile'?s.agave:s.palm[i%2];add(sp,x,y,4,{glowF:b==='shroom'});
  }
  berries.forEach((b,i)=>{if(i%7)return;for(const [dx,dy]of [[-24,-22],[24,-22]])if(free(b.x+dx,b.y+dy,8)){add(s.lamp,b.x+dx,b.y+dy,3);main.glows.push([b.x+dx,b.y+dy-24])}if(free(b.x,b.y-25,17))add(s.bench,b.x,b.y-25,10)});
 }
 H.update.push(populate);
 H.bill.push((bb,t)=>{if(!here())return;for(const b of berries)if(Math.hypot(b.x-X.player.x,b.y-X.player.y)<650)bb.push({x:b.x,y:b.y,draw:g=>{const s=V.berryBush();g.drawImage(s.c,-s.ax,-s.ay);if(save.bush?.[b.id]!==X.today()&&Math.sin(t*2+b.x)>.75)Paint.star(g,8,-26,1.6,'#fffbe0')}})});
 H.inter.push(l=>{if(here())for(const b of berries)if(Math.hypot(X.player.x-b.x,X.player.y-b.y)<70)l.push({type:'bayas',i:b.id,x:b.x,y:b.y,r:23,hy:26,label:'🫐 Buscar bayas entre las hojas'})});
 H.ground.unshift((g,ox,oy)=>{if(!here())return;for(const [a,b]of bridges){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;if(Math.max(a[0],b[0])<ox-50||Math.min(a[0],b[0])>ox+X.W*2.2+50||Math.max(a[1],b[1])<oy-50||Math.min(a[1],b[1])>oy+X.H*2.2+50)continue;g.save();g.lineCap='butt';for(const [w,c]of [[36,'#8a6040'],[31,'#c79a6a']]){g.lineWidth=w;g.strokeStyle=c;g.beginPath();g.moveTo(a[0]-ox,a[1]-oy);g.lineTo(b[0]-ox,b[1]-oy);g.stroke()}for(let d=0;d<L;d+=6){const x=a[0]+dx*d/L-ox,y=a[1]+dy*d/L-oy;g.lineWidth=1;g.strokeStyle=(d/6|0)%3?'#a77850':'#e0b681';g.beginPath();g.moveTo(x+nx*15,y+ny*15);g.lineTo(x-nx*15,y-ny*15);g.stroke();if(d%30===0)for(const side of [-1,1]){g.fillStyle='#946743';g.fillRect(x+nx*17*side-1.5,y+ny*17*side-7,3,10)}}g.restore()}});
 const api={install,islands,bridges,paths,distance,regionAt,biome,berries,get ready(){return done},lines};
 if(V.MAIN.mainland)install(V.MAIN);
 return api;
})();
