/* Walesa v47: regiones realmente contiguas en el mismo overworld.
   Se configura ANTES de World.prepare(), no depende de Game/Expansion46. */
(()=>{'use strict';
const V=World,m=V.MAIN;
if(m.walkable47)return;
const regions={
 sand:{name:'Bahía de los Castillos',x:960,y:1500,rx:360,ry:290,biome:'beach'},
 coast:{name:'Costa de las Cometas',x:1675,y:1520,rx:430,ry:325,biome:'beach'},
 meadow:{name:'Praderas de Mermelada',x:2420,y:1470,rx:430,ry:345,biome:'candy'},
 forest:{name:'Bosque de los Farolitos',x:3060,y:1050,rx:360,ry:425,biome:'shroom'}
};
const oldLand=V.landShape(m),oldBiome=m.biome.bind(m),noise=V.vnoise;
const paths=[
 [755,1220,960,1500],
 [960,1500,1675,1520],
 [1675,1520,2420,1470],
 [2420,1470,3060,1050],
 [2540,790,3060,1050]
];
const segDist=(x,y,a)=>{const[ax,ay,bx,by]=a,dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-ax-t*dx,y-ay-t*dy)};
m.MW=3500;m.MH=1940;
m.walkable47=true;
m.region47=regions;
m.islandD=(x,y)=>{
 let d=oldLand(x,y);
 for(const r of Object.values(regions)){
  const n=Math.hypot((x-r.x)/r.rx,(y-r.y)/r.ry);
  d=Math.min(d,n+(noise(x/99+17,y/99-8)-.5)*.035);
 }
 for(const a of paths)d=Math.min(d,segDist(x,y,a)/74);
 return d;
};
m.biome=(x,y,map)=>{
 if(x>2690&&y>570&&y<1535)return 'shroom';
 if(y>1135){if(x<1370)return'beach';if(x<2090)return'beach';if(x<2870)return'candy'}
 return oldBiome(x,y,map);
};
for(const [key,r] of Object.entries(regions)){
 m.centers[key]=[r.x,r.y];
 m.paths.push([r.x-90,r.y,r.x+90,r.y]);
}
for(const a of paths)m.paths.push(a);
// Reutiliza casas originales y el sistema nativo de interiores, colisiones y sombreado.
m.build.push(
 {id:'farolitos47',job:'shop',x:3055,y:900,wall:'#e2eee4',roof:'#5a8e7a',name:'Refugio de los Farolitos',sign:'heart'},
 {id:'mermelada47',job:'shop',x:2490,y:1370,wall:'#fff0ed',roof:'#d88fad',name:'Casita de Mermelada',sign:'bow'},
 {id:'cometas47',job:'shop',x:1730,y:1400,wall:'#e4f4ff',roof:'#83b7cf',name:'Taller de Cometas',sign:'heart'}
);
// No hay portales de viaje rápido: todos los caminos se atraviesan físicamente.
window.WalesaMainworld={regions,paths,at(x,y){
 for(const [key,r] of Object.entries(regions))if(Math.hypot((x-r.x)/r.rx,(y-r.y)/r.ry)<.85)return key;
 return null;
},sand:regions.sand};
})();