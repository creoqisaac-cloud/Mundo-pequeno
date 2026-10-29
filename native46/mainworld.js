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
// Casas a escala original (80×82), ubicadas en el centro de Ciudad Corazón,
// lejos de la villa, la playa y los biomas naturales; volumen de acuarela,
// chimenea y macetas) con letreros ILUSTRADOS en vez del mismo corazón genérico.
// Cada edificio tiene su interacción propia, no abre por error la Boutique Kitty.
m.build.push(
 {id:'farolitos47',job:'farolitos48',x:1812,y:620,wall:'#e5f0e7',roof:'#6c9b87',name:'Refugio de los Farolitos',sign:'lantern',awning:['#b8d9c2','#fbf6ee']},
 {id:'mermelada47',job:'mermelada48',x:1960,y:620,wall:'#fff0e6',roof:'#d8839d',name:'Casita de Mermelada',sign:'jam',awning:['#f7b0c2','#fbf6ee']},
 {id:'cometas47',job:'cometas48',x:2220,y:620,wall:'#eaf3f4',roof:'#85b8cc',name:'Taller de Cometas',sign:'kite',awning:['#c5e4ec','#fffaf3']},
 // Agencia real en la misma avenida: utiliza el edificio comercial original
 // de Ciudad Corazón, no un anuncio ni una figura plana sobre el terreno.
 {id:'autosCorazon48',city:1,job:'autosCorazon48',x:2460,y:620,
  wall:'#e8f2ef',acc:'#8cb8b2',icon:'🚗',name:'Agencia Autos Corazón'}
);
// El único acceso al minijuego especial es un puestito pequeño de playa,
// en el trayecto caminable junto a la bahía. No es un botón ni un warp global.
m.stands.push({id:'castillos48',job:'sandcastle48',x:897,y:1375,
 c:['#f4b8c8','#fff7e4'],icon:'castle',name:'Puestito de castillos de arena'});
m.paths.push([755,1220,897,1390],[897,1390,960,1500]);
// No hay portales de viaje rápido: todos los caminos se atraviesan físicamente.
window.WalesaMainworld={regions,paths,at(x,y){
 for(const [key,r] of Object.entries(regions))if(Math.hypot((x-r.x)/r.rx,(y-r.y)/r.ry)<.85)return key;
 return null;
},sand:regions.sand};
})();