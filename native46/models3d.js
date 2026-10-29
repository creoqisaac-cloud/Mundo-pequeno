/* Walesa v47: mallas tridimensionales originales con perspectiva y sombreado
   proyectadas al canvas nativo del juego. Sin WebGL, texturas ni dependencias. */
(()=>{'use strict';
const E=Expansion46,{V,P,S}=E,PI=Math.PI,TAU=PI*2;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const rgb=s=>{const n=parseInt(s.replace('#',''),16);return[n>>16&255,n>>8&255,n&255]};
const shade=(s,k)=>{const a=rgb(s);return 'rgb('+a.map(n=>Math.round(clamp(n*k,0,255))).join(',')+')'};
function body(color,train){
 const faces=[];
 const add=(x,y,z,w,d,h,c)=>{
  const v=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]];
  for(const [idx,k] of[[[3,2,6,7],.77],[[1,2,6,5],.68],[[0,1,5,4],.92],[[4,5,6,7],1.21]])faces.push({v:idx.map(i=>v[i]),color:shade(c,k)});
 };
 add(-14,-6,3,28,12,train?12:9,color);
 if(!train)add(-9,-5,11,18,10,7,color);
 return faces;
}
function project(p,heading=0){
 const [x,y,z]=p,co=Math.cos(heading),si=Math.sin(heading),xx=x*co-y*si,yy=x*si+y*co;
 const perspective=230/(230+yy*.6);
 return [xx*perspective+yy*.36, yy*.45*perspective-z*perspective];
}
function mesh(g,train,color,heading=0,offset=0){
 g.save();const faces=body(color,train);
 const ordered=faces.map(f=>({pts:f.v.map(v=>project(v,heading)),depth:f.v.reduce((a,v)=>a+v[1],0)/f.v.length, color:f.color})).sort((a,b)=>a.depth-b.depth);
 E.ellipse(g,0,3,17,5,'rgba(47,43,53,.22)');
 for(const f of ordered){P.wc(g,P.PG(f.pts),f.color,{lw:.46})}
 // Vidrios y reflejos se adaptan a la cara, no son stickers planos.
 for(const x of train?[-8,-2,4,10]:[-5,4]){
  const q=project([x,6,train?11:16],heading),w=train?4.8:4.2;
  P.wc(g,P.PG([[q[0]-w/2,q[1]-3],[q[0]+w/2,q[1]-3],[q[0]+w/2+1,q[1]+.6],[q[0]-w/2-1,q[1]+.6]]),'#bde5f0',{lw:.28});
  g.fillStyle='rgba(255,255,255,.72)';g.fillRect(q[0]-1,q[1]-2,1.6,.6);
 }
 for(const x of[-10,10]){
  const q=project([x,6,3],heading);
  P.wc(g,P.E(q[0],q[1]+1.4,2.9,3.2),'#514a59',{lw:.35});
  P.wc(g,P.E(q[0],q[1]+1.4,1.4,1.4),'#cbc3d3',{lw:.22});
 }
 if(!train){const l=project([-11,6,6],heading),r=project([11,6,6],heading);
  for(const a of[l,r])E.ellipse(g,a[0],a[1],1.25,1,'#fff5a1');
 }else{
  const q=project([13,6,10],heading);E.ellipse(g,q[0],q[1],1.4,2,'#fff1ac');
  if(offset%2===0){g.strokeStyle='#fff7d0';g.lineWidth=.7;g.beginPath();g.moveTo(-9,-16);g.lineTo(8,-18);g.stroke()}
 }
 g.restore();
}
const cache=new Map(),old=V.HOOK.veh;
V.HOOK.veh=function(id,left,dir){
 if(id!=='auto')return old.apply(this,arguments);
 const color=S.carColor||'#f490b4';const d=Number.isFinite(dir)?dir:(left?2:3),k=color+':'+d;
 if(!cache.has(k))cache.set(k,P.paint(58,49,29,39,g=>{
  g.translate(29,37);mesh(g,false,color,d===2?-PI*.36:d===3?PI*.36:d===1?-PI/2:PI/2);
 },{clean:1,grain:.07}));
 return cache.get(k);
};
E.drawTrain46=(g,index)=>mesh(g,true,index?'#efe0e8':'#e690b0',0,index);
E.models3d={mesh,cache,project};
})();