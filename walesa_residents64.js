/* Walesa v64: nuevos vecinos originales y continuidad de posicion, sin alterar los personajes clasicos. */
(function(){
'use strict';
const X=Game.X,G=Game.G,V=World;
if(!X||!G||!V)return;
const profiles={
 walesa_iris:{name:'Petalí',kind:'bunny',fur:'#ffe5db',ear:'#fa91aa',hair:'#bb7087',eye:'#507f88',dress:'vestido',cloth:'#b58cc8',accessory:'flower',accent:'#ffd16f',hairStyle:1},
 walesa_nico:{name:'Brisquín',kind:'fox',fur:'#e9c6a8',ear:'#bc7056',hair:'#764c47',eye:'#5399ad',dress:'overol',cloth:'#4682a3',accessory:'beanie',accent:'#f6c56e',hairStyle:3},
 walesa_luma:{name:'Nubalú',kind:'bunny',fur:'#dff2fa',ear:'#9dcadd',hair:'#8eafdc',eye:'#6c6bba',dress:'tutu',cloth:'#af91cb',accessory:'halo',accent:'#ffe5a0',hairStyle:2},
 walesa_fede:{name:'Mocorín',kind:'frog',fur:'#94ca91',ear:'#699c7c',hair:'#637a4f',eye:'#4a6fbc',dress:'marinero',cloth:'#d59a6a',accessory:'sailor',accent:'#f0d476',hairStyle:0},
 walesa_mara:{name:'Lunavela',kind:'cat',fur:'#f3ddd4',ear:'#c49aab',hair:'#664c8a',eye:'#cf7e6e',dress:'yukata',cloth:'#76a9ac',accessory:'flowercrown',accent:'#f6bbbe',hairStyle:4},
 walesa_timo:{name:'Pipizú',kind:'fox',fur:'#80788f',ear:'#db9d96',hair:'#4c506c',eye:'#ffbd62',dress:'hoodie',cloth:'#bd78aa',accessory:'headphones',accent:'#d2c5eb',hairStyle:3},
 walesa_cira:{name:'Cielumi',kind:'deer',fur:'#9ca7c8',ear:'#ded3dd',hair:'#f5e4c3',eye:'#447b8d',dress:'astro',cloth:'#6b9eae',accessory:'star',accent:'#f0ce82',hairStyle:2},
 walesa_oli:{name:'Mielito',kind:'bear',fur:'#ebd39c',ear:'#ceab73',hair:'#a17b46',eye:'#659c6a',dress:'huipil',cloth:'#c4a466',accessory:'straw',accent:'#85bb82',hairStyle:1},
 walesa_bimba:{name:'Trufelia',kind:'cat',fur:'#696a73',ear:'#b5a3bd',hair:'#d0a6c9',eye:'#e8b276',dress:'chef',cloth:'#95aa7d',accessory:'chefhat',accent:'#eac6da',hairStyle:0},
 walesa_tara:{name:'Rocelí',kind:'deer',fur:'#8f7eab',ear:'#d9b3ca',hair:'#503e7a',eye:'#9cdaaa',dress:'mago',cloth:'#735f9f',accessory:'witch',accent:'#f3cd88',hairStyle:4},
 walesa_roco:{name:'Rocajú',kind:'fox',fur:'#7aadb6',ear:'#c5d8ca',hair:'#314f68',eye:'#e9c56a',dress:'impermeable',cloth:'#b67d5c',accessory:'bufanda',accent:'#e5b6a5',hairStyle:3}
};
const native=V.HOOK.char,cache=new Map();
function render(sp,dir=0,frame=0){
 const result=native(sp,dir,frame);
 if(!sp?.walesa64)return result;
 const p=sp.walesa64,key=sp.walesaId64+':'+dir+':'+frame;
 if(cache.has(key))return cache.get(key);
 const canvas=document.createElement('canvas');canvas.width=result.c.width;canvas.height=result.c.height;
 const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
 g.drawImage(result.c,0,0);
 // Los sprites especiales se componen encima del cuerpo pero reemplazan totalmente la cara
 // y los rasgos del molde usado como esqueleto. Los originales siguen en su cache intactos.
 const k=canvas.width/34;
 g.save();g.scale(k,k);
 g.clearRect(0,0,34,21.4);
 const back=dir===1,side=dir===2||dir===3;
 const ell=(x,y,rx,ry,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()};
 const tri=(x1,y1,x2,y2,x3,y3,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.lineTo(x3,y3);g.closePath();g.fill()};
 const stroke=(x1,y1,x2,y2,col,w=1)=>{g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()};
 const fur=p.fur,ear=p.ear,hair=p.hair,ink='#3b344b';
 if(p.kind==='bunny'){
  for(const d of[-1,1]){ell(17+d*8,5,3.4,7,fur);ell(17+d*8,5,1.65,5,ear)}
 }else if(p.kind==='cat'||p.kind==='fox'){
  for(const d of[-1,1]){
   tri(17+d*6,9,17+d*14,1,17+d*13,15,fur);
   tri(17+d*8,9,17+d*13,4,17+d*12,13,ear)
  }
 }else if(p.kind==='bear'){
  for(const d of[-1,1]){ell(17+d*10,6,5.3,5.2,fur);ell(17+d*10,6,2.6,2.7,ear)}
 }else if(p.kind==='frog'){
  for(const d of[-1,1]){ell(17+d*8.5,7.5,5.4,5.4,fur);ell(17+d*8.5,7.5,3.1,3.2,ear)}
 }else if(p.kind==='deer'){
  for(const d of[-1,1]){ell(17+d*10,7,4.2,2.5,fur);ell(17+d*10,7,2.4,1.3,ear);
   stroke(17+d*8,7,17+d*11,0,hair,2);stroke(17+d*10,5,17+d*13,2,hair,1)}
 }
 ell(17,14,11.7,9.7,fur);
 // Peinados de flequillos, mechones o un pequeño copete, distintos por vecino.
 if(p.hairStyle===0){ell(17,5.5,8.8,3.2,hair);ell(22,7,3,2,hair)}
 else if(p.hairStyle===1){ell(16,5.6,9,4,hair);ell(12,8,5,4.6,hair);ell(22,6,2.3,3,hair)}
 else if(p.hairStyle===2){ell(17,6.3,10,3.9,hair);tri(8,7,15,7,13,14,hair);tri(15,7,23,7,20,12,hair)}
 else if(p.hairStyle===3){ell(16,6,7.8,3.2,hair);tri(12,5,14,-2,18,5,hair);tri(18,5,23,0,22,7,hair)}
 else{ell(17,6,8.8,3.2,hair);ell(11,9,3.2,5,hair);ell(24,10,3,4.5,hair)}
 if(!back){
  const ey=14.5,eyeX=side?(dir===3?21:13):12.4;
  if(side){
   ell(eyeX,ey,2.15,2.55,'#fff');ell(eyeX+.15,ey+.3,1.4,1.85,p.eye);ell(eyeX+.2,ey+.5,.8,1.3,ink);ell(eyeX-.35,ey-.5,.47,.58,'#fff')
  }else{
   for(const x of[12.3,21.7]){ell(x,ey,2.15,2.55,'#fff');ell(x+.15,ey+.3,1.38,1.84,p.eye);ell(x+.23,ey+.5,.72,1.27,ink);ell(x-.3,ey-.55,.43,.57,'#fff')}
   ell(17,18,1.3,.8,p.kind==='frog'?'#497c55':'#b9888d');
   stroke(15.7,19.7,17,20.3,ink,.65);stroke(17,20.3,18.3,19.7,ink,.65);
   for(const x of[8.1,26])ell(x,18.6,1.7,.8,'#ecb4b0');
  }
 }
 // Distintivo de color, exclusivo del nuevo personaje, en la ropa.
 ell(17,24.5,2.2,1.65,p.accent);ell(16.5,24.1,.56,.48,'#fff');
 g.restore();
 const obj={c:canvas,ax:result.ax,ay:result.ay};
 cache.set(key,obj);return obj;
}
if(typeof native==='function')V.HOOK.char=render;
function install(){
 for(const [id,p] of Object.entries(profiles)){
  if(!V.NPCDEF[id]||!Talk.P?.[id])continue;
  const sp=V.NPCDEF[id];
  Object.assign(sp,{walesa64:p,walesaId64:id,fur:p.fur,outfit:p.dress,oColor:p.cloth,acc:p.accessory==='star'?'halo':p.accessory,aColor:p.accent,eyes:0});
  Talk.P[id].name=p.name;
 }
 // Cualquier vecino que ya esté creado conserva identidad, solo cambia su sprite.
 for(const n of X.NPCS)if(profiles[n.id])n.spec=V.NPCDEF[n.id];
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
let acc=0;
function savePos(){
 if(X.st.mode!=='play'||X.st.scene!=='out'||X.M()!==V.MAIN||X.st.mg||X.st.busy)return false;
 const p=X.player;
 if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<40||p.y<40||p.x>V.MAIN.MW-40||p.y>V.MAIN.MH-40)return false;
 // No grabar dentro del agua, edificios, ni durante un viaje en metro.
 if(V.MAIN.islandD(p.x,p.y)>.89||V.blockedOut(p.x,p.y,7))return false;
 save.lastPosition64={x:Math.round(p.x),y:Math.round(p.y),dir:p.dir|0,map:'main',t:Date.now()};
 G.save();return true;
}
X.HOOKS.update.push(dt=>{acc+=Math.min(.1,dt||0);if(acc>2.5){acc=0;savePos()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)savePos()});
window.addEventListener('pagehide',savePos);
window.WalesaResidents64={profiles,savePos,get names(){return Object.values(profiles).map(p=>p.name)}};
})();
