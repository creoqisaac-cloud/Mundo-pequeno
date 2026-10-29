/* Isla de Walesa v32 | objetos, salud y diálogos */
(()=>{
'use strict';
const X=Game.X,H=X.HOOKS,G=Game.G;
const groups={
alimentos:[
['pudin','Pudín de caramelo','🍮',220],['sopa','Sopa caliente','🍲',210],['sandwich','Sándwich de corazón','🥪',180],['pan','Pan dulce','🥐',110],['manzana','Manzana fresca','🍎',75],['fresa','Fresas','🍓',95],['pera','Pera','🍐',90],['sandia','Rebanada de sandía','🍉',95],['platano','Plátano','🍌',90],['cereza','Cerezas','🍒',130],['limon','Limón','🍋',70],['zanahoria','Zanahoria','🥕',90],['champi','Champiñones','🍄',130],['panque','Panqué de canela','🍰',220],['donas','Donitas','🍩',180],['chocolate','Chocolate','🍫',160],['miel','Miel de abejas','🍯',190],['leche','Leche tibia','🥛',100],['jugo','Jugo de fruta','🧃',120],['agua','Botella de agua','💧',65],['onigiri','Bolita de arroz','🍙',150],['ramen','Ramen','🍜',280],['bento','Bento de picnic','🍱',330],['ensaladaV','Ensalada verde','🥗',180],['pescado','Pescadito cocido','🍣',240],['limonada','Limonada','🥤',120],['paleta','Paleta de fresa','🍧',130]],
regalos:[
['postal','Postal de la isla','💌',140],['costurero','Costurero de Mimmy','🧵',380],['selloCorreo','Sello postal de nube','📮',300],['teFlores','Té floral de Melody','🍵',260],['cristalMorado','Cristal de Kuromi','🔮',470],['silbato','Silbato de Pochacco','📣',180],['hojaMusical','Hoja musical','🎵',210],['insignia','Insignia de amistad','🏅',400],['periodico','Periódico de Chococat','📰',180],['panuelo','Pañuelo elegante','🪡',250],['burbujaMarina','Burbuja de cristal','🫧',220],['recetario','Recetario de vecinos','📔',350],['llaveroNube','Llavero de nube','🔑',290],['confeti','Confeti de fiesta','🎊',140],['pulseraAmistad','Pulsera de amistad','📿',400],['fotoPolaroid','Foto instantánea','📸',300],['medallaR','Medalla de repartidora','🥇',550],['cintaRosa','Cinta rosa','🎀',120],['origami','Grulla de origami','🕊️',160],['caracolEco','Concha de eco','🐚',250],['florSeca','Flor preservada','🌹',140],['conchaCorazon','Concha corazón','💗',210],['piedraLuna','Piedra lunar','🌙',430],['lapiz','Lápiz de colores','✏️',85],['cuaderno','Cuaderno de cuentos','📒',170],['relojito','Reloj de bolsillo','⌚',500],['mapaTesoro','Mapa del tesoro','🗺️',550],['cometa','Cometa de playa','🪁',460],['pelota','Pelota para jugar','⚽',240],['flotador','Flotador de patito','🛟',340],['campanilla','Campanilla','🔔',250],['corona','Corona de cartón','👑',380],['trofeo','Trofeo de juegos','🏆',650],['podometro','Podómetro','👟',420],['radio','Radio pequeña','📻',520],['paquete','Paquete decorativo','📦',140],['taza','Taza del picnic','☕',320],['vela','Velita perfumada','🕯️',260],['pelucheGato','Peluche gatito','🐱',650],['estampa','Estampa brillante','✨',120]],
salud:[
['impermeable32','Impermeable de lluvia','🧥',680],['botas32','Botas para lluvia','👢',440],['paraguas32','Paraguas plegable','☂️',360],['petCoat32','Impermeable para mascota','🐾',450],['botiquin','Botiquín portátil','🩹',330],['vitaminas','Vitaminas de fresa','💊',180],['teMiel','Té con miel','🍯',170],['termometro','Termómetro','🌡️',280],['pijama','Pijama de descanso','🛌',320],['mascarilla','Mascarilla suave','😷',100]]
};
for(const list of Object.values(groups))for(const [id,name,emoji,price] of list){if(!Talk.ITEMS[id])Talk.ITEMS[id]=[name,emoji,price]}
const item=id=>Talk.ITEMS[id],inv=id=>save.inv[id]||0;
function buy(id){const it=item(id);if(!it||!X.payOr(it[2]))return;X.invAdd(id);save.dex.i[id]=1;X.toast(it[1]+' ¡Comprado!');X.reSheet()}
function shop(){
 X.sheet('🛍️ Objetos y regalos',box=>{
  box.innerHTML='<p class="shop-hi">Objetos reales para tu mochila, tus misiones y tus regalos.</p><div class="bal">🔔 '+save.bells.toLocaleString('es-MX')+'</div>'+
  Object.entries(groups).map(([group,list])=>'<h4>'+({alimentos:'🍡 Comida y merienda',regalos:'🎁 Souvenirs y regalos',salud:'🌧️ Salud y protección'}[group])+'</h4>'+list.map(([id,n,ic,price])=>X.buyRow(ic,n+(inv(id)?' · tienes '+inv(id):''),group==='salud'?'Equipo y recuperación':'Para usar, regalar o coleccionar',price,id)).join('')).join('');
  box.querySelectorAll('button.buy').forEach(b=>b.onclick=()=>buy(b.dataset.id));
 });
}
window.Items32={SET:groups,shop};
H.tab.push((tab,box)=>{if(tab!=='tasks')return;const d=document.createElement('div');d.innerHTML='<button class="orow" id="shopEmoji32">🛍️ Tienda de objetos con emojis <span>›</span></button><small class="memtext">Comida, regalos, equipo y premios de los vecinos.</small>';box.appendChild(d);d.querySelector('button').onclick=()=>{X.closeMenu();shop()}});
})();
(()=>{
'use strict';
const X=Game.X,H=X.HOOKS,G=Game.G;
const s=save.health32||(save.health32={hunger:86,wet:0,stings:0,sick:false,reason:'',last:Date.now(),notified:0});
s.hunger=Math.max(0,Math.min(100,Number(s.hunger??86)));s.wet=Math.max(0,Math.min(100,Number(s.wet||0)));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const pet=()=>X.activePet();
const raincoat=()=>save.outfit==='impermeable'&&!!save.inv.impermeable32;
const boots=()=>save.shoes==='botasLluvia'&&!!save.inv.botas32;
const umbrella=()=>!!save.umbrella32&&!!save.inv.paraguas32;
const protectedRain=()=>raincoat()&&boots()||umbrella();
const persist=()=>G.save();let timer=0,once=0;
const snacks=['galleta','fruta','pizza','ensalada','baya','galletasC','sandwich','pudin','sopa','pan','manzana','fresa','pera','sandia','platano','cereza','limon','zanahoria','champi','panque','donas','chocolate','leche','jugo','agua','onigiri','ramen','bento','ensaladaV','pescado','limonada','paleta','te','teMiel','cupcake','helado','dulce','algodon','miel'];
async function feed(){
 const all=snacks.filter(k=>save.inv[k]>0&&Talk.ITEMS[k]);if(!all.length){X.toast('🍎 No traes comida. Compra algo en el mercadito.');return}
 let offset=0;for(;;){const page=all.slice(offset,offset+6),more=offset+6<all.length,opts=page.map(k=>Talk.ITEMS[k][1]+' '+Talk.ITEMS[k][0]+' ×'+save.inv[k]).concat(more?['🍽️ Ver más comida','Mejor luego']:['Mejor luego']);const i=await X.ask('🍽️ ¿Qué vas a comer?',opts);if(more&&i===page.length){offset+=6;continue}if(i>=page.length)return;const k=page[i];X.invAdd(k,-1);s.hunger=clamp(s.hunger+(k==='pizza'||k==='ramen'||k==='bento'?42:k==='sopa'||k==='sandwich'?34:22),0,100);if(k==='sopa'||k==='teMiel')s.wet=clamp(s.wet-18,0,100);persist();X.toast('😋 ¡Qué rico! Saciedad '+Math.round(s.hunger)+'%');return}
}
function cure(){s.sick=false;s.reason='';s.stings=0;s.wet=0;s.hunger=Math.max(s.hunger,40);persist();X.toast('💗 Te sientes mucho mejor.')}
function sting(){s.stings++;s.sick=true;s.reason='Picadura de abejita';s.wet=Math.max(s.wet,25);X.toast('🐝 ¡Picadura! Ve al hospital o usa un botiquín.');persist()}
async function treatment(){if(!s.sick){X.toast('💚 ¡Todo bien! No necesitas tratamiento.');return}const have=['botiquin','medicina','teMiel'].filter(k=>inv(k)>0);const i=await X.ask('🩹 Recuperarte',have.map(k=>Talk.ITEMS[k][1]+' Usar '+Talk.ITEMS[k][0]).concat('Ir al hospital','Cancelar'));if(i<have.length){X.invAdd(have[i],-1);cure()}else if(i===have.length)X.toast('🏥 Hospital de los Corazones, al sureste de tu casita.')}
async function hospital(){
 const i=await X.ask('🏥 Hospital de los Corazones',['🩺 Consulta médica · 120 🔔','💝 Curación de mascotas · 80 🔔','🛍️ Botiquín y ropa de lluvia','👋 Salir']);
 if(i===0){if(!s.sick&&s.hunger>25&&s.wet<20){await X.say('Enfermera Mimi','¡Estás muy bien! Come y descansa para seguir así.');return}if(!X.payOr(120))return;cure();await X.say('Enfermera Mimi','Ya te curamos. Aquí tienes una sopita caliente. 🍲');X.invAdd('sopa');save.dex.i.sopa=1;persist()}
 else if(i===1){const p=pet();if(!p){X.toast('🐾 Trae una mascota contigo.');return}if(!X.payOr(80))return;p.hunger=100;p.love=Math.max(70,p.love);persist();X.toast('🐾 '+p.name+' está sanito y con su pancita llena.')}
 else if(i===2){const ks=['botiquin','vitaminas','teMiel','impermeable32','botas32','paraguas32','petCoat32'];const j=await X.ask('Farmacia y lluvia',ks.map(k=>Talk.ITEMS[k][1]+' '+Talk.ITEMS[k][0]+' · '+Talk.ITEMS[k][2]+' 🔔').concat('Cerrar'));if(j>=ks.length)return;const id=ks[j];if(!X.payOr(Talk.ITEMS[id][2]))return;X.invAdd(id);save.dex.i[id]=1;X.toast('🛍️ '+Talk.ITEMS[id][0]+' en tu mochila.');persist()}
}
H.act.unshift(it=>it.type==='job'&&it.b?.job==='hospital32'?hospital():null);
H.update.push(dt=>{
 if(X.st.mode!=='play'||X.st.mg)return;const active=X.st.scene==='out'&&!X.st.menu&&!X.st.busy;
 if(active){s.hunger=clamp(s.hunger-dt*.065,0,100);
  if(X.wx()==='lluvia')s.wet=clamp(s.wet+dt*(protectedRain()?-.38:raincoat()||boots()?.17:.43),0,100);
  else s.wet=clamp(s.wet-dt*.32,0,100);
 }
 if(s.wet>=94&&!s.sick){s.sick=true;s.reason='Resfriado por lluvia';X.toast('🤒 Te resfriaste por la lluvia. Visita el hospital o usa botiquín.');persist()}
 timer+=dt;if(timer>7){timer=0;persist()}
 const mark=Math.floor((100-s.hunger)/20);if(mark>once&&s.hunger<=20){once=mark;X.toast('🍎 Tienes hambre. Abre Misiones → Comer.')}else if(s.hunger>30)once=0;
});
H.screen.push(f=>{if(X.st.scene!=='out'||X.st.mg||X.st.mode!=='play')return;
 const px=Math.max(5,X.W-94);f.save();f.fillStyle='rgba(30,39,58,.68)';f.beginPath();f.roundRect(px,38,89,33,5);f.fill();
 f.font='8px sans-serif';f.textAlign='left';f.fillStyle='#fff';f.fillText('🍎',px+4,49);f.fillText('🌧',px+4,62);
 for(const [v,y,c] of [[s.hunger,43,'#f5bd69'],[s.wet,56,'#8ccbf6']]){f.fillStyle='rgba(255,255,255,.2)';f.fillRect(px+21,y,63,5);f.fillStyle=c;f.fillRect(px+21,y,63*v/100,5)}
 if(s.sick){f.font='12px sans-serif';f.fillText('🤒',px-16,55)}f.restore();
});
H.bill.push((bb,t)=>{if(X.st.scene!=='out'||X.st.mg)return;
 if(umbrella()&&X.wx()==='lluvia')bb.push({x:X.player.x,y:X.player.y+2,draw:g=>{g.font='25px sans-serif';g.textAlign='center';g.fillText('☂️',0,-40)}});
 const p=pet();if(p&&save.petCoats32?.[p.uid]&&save.inv.petCoat32&&X.wx()==='lluvia')bb.push({x:X.petE.x,y:X.petE.y+1,draw:g=>{g.fillStyle='#78c9c3';g.strokeStyle='#245c63';g.lineWidth=.8;g.beginPath();g.moveTo(-9,-17);g.lineTo(10,-17);g.lineTo(8,-6);g.lineTo(-8,-6);g.closePath();g.fill();g.stroke();g.font='9px sans-serif';g.fillText('💧',-3,-8)}});
});
H.tab.push((tab,box)=>{
 if(tab==='tasks'){const d=document.createElement('div');d.innerHTML='<h4>💗 Bienestar</h4><div class="task"><div><b>🍎 Saciedad: '+Math.round(s.hunger)+'% · 🌧️ Mojada: '+Math.round(s.wet)+'%</b><small>'+(s.sick?'🤒 '+s.reason:'😊 Saludable')+' · '+(protectedRain()?'Protegida de lluvia':'Sin protección completa')+'</small></div></div><button class="orow" id="eat32">🍽️ Comer algo <span>›</span></button><button class="orow" id="rain32">🧥 Ropa de lluvia <span>›</span></button><button class="orow" id="care32">🩹 Botiquín o medicina <span>›</span></button>';
  box.appendChild(d);
  d.querySelector('#eat32').onclick=()=>{X.closeMenu();feed()};
  d.querySelector('#care32').onclick=()=>{X.closeMenu();treatment()};
  d.querySelector('#rain32').onclick=async()=>{X.closeMenu();const opts=[inv('impermeable32')?'🧥 Equipar impermeable':'🧥 Comprar impermeable',inv('botas32')?'👢 Equipar botas':'👢 Comprar botas',inv('paraguas32')?(umbrella()?'☂️ Guardar paraguas':'☂️ Abrir paraguas'):'☂️ Comprar paraguas','Cerrar'];const k=await X.ask('🌧️ Protección de lluvia',opts);if(k===3||k<0)return;const ids=['impermeable32','botas32','paraguas32'];if(!inv(ids[k])){window.Items32?.shop();return}if(k===0){save.outfit='impermeable';save.owned.outfit=save.owned.outfit||[];if(!save.owned.outfit.includes('impermeable'))save.owned.outfit.push('impermeable')}if(k===1){save.shoes='botasLluvia';save.owned.shoes=save.owned.shoes||[];if(!save.owned.shoes.includes('botasLluvia'))save.owned.shoes.push('botasLluvia')}if(k===2)save.umbrella32=!save.umbrella32;persist();X.toast('🌧️ Equipo actualizado')};
 }
 if(tab==='pets'){const p=pet();if(!p)return;const d=document.createElement('div');d.innerHTML='<button class="orow" id="pcoat32">🐾 '+(save.petCoats32?.[p.uid]?'Quitar':'Poner')+' impermeable a '+String(p.name).replace(/[&<>]/g,'')+' <span>›</span></button><small class="memtext">La barra de tu mascota representa su saciedad. Puedes darle comida desde su interacción.</small>';box.appendChild(d);d.querySelector('button').onclick=()=>{if(!inv('petCoat32')){X.toast('🛍️ Compra un impermeable de mascota en el mercadito.');return}save.petCoats32=save.petCoats32||{};save.petCoats32[p.uid]=!save.petCoats32[p.uid];persist();X.showTab('pets')}}
});
window.Health32={sting,cure,feed,shop:hospital,get speed(){return s.sick?.78:s.hunger<18?.85:1},status:s};
})();
(()=>{
'use strict';
const previous=Talk.build;
Talk.build=function(id,ctx){
 const steps=previous.apply(this,arguments);if(!steps?.length||!Talk.P[id]||!ctx?.save?.met?.[id])return steps;
 const h=gameHour(),hour=h<6?'noche':h<12?'mañana':h<19?'tarde':'noche';
 const messages=['¡Qué gusto verte esta '+hour+'!','¡Qué sorpresa encontrarte por aquí!','¡Justo pensaba en ti!','Cuéntame qué aventuras has tenido.','Hoy quería platicar contigo.','¿Cómo va ese paseo por la isla?','Tengo algo nuevo que contarte.','Qué bonito volver a coincidir.','¿Te apetece un rato de charla?','Ven, tengo una historia de hoy.','¿Otra vez de aventuras? ¡Me apunto!','Hoy pasó algo que me recordó a ti.'];
 const special={cinna:['¡Tengo cartas nuevas!','¡Se ven muy bonitas las nubes!'],melody:['¡Hice una receta nueva!','¡Traje una flor!'],kuromi:['¡Tengo un desafío para ti!','¿Revancha?'],pom:['¡Soñé con un pudín gigante!','¡Me dormí en el parque!'],pochacco:['¡Hoy corrí hasta el muelle!','¿Jugamos una carrera?'],keroppi:['¡Vi una hoja enorme!','¡Kero! El estanque está precioso.'],badtz:['Tengo un plan secreto.','No le digas a nadie.'],mimmy:['Cosí algo para ti.','Traigo un moño nuevo.'],chococat:['Mi periódico tiene novedades.','Acabo de descubrir un misterio.'],tuxedo:['Qué placer saludarla.','¿Te preparo un té?'],hangyo:['Hoy ensayé un chiste.','¿Viste a los pececitos?']};
 const hist=save.hello32||(save.hello32={}),rec=hist[id]||(hist[id]={seq:-1,recent:[]});
 let index=(rec.seq+1+Math.floor(Math.random()*3))%messages.length;for(let i=0;i<messages.length&&rec.recent.includes(index);i++)index=(index+1)%messages.length;
 rec.seq=index;rec.recent.push(index);if(rec.recent.length>6)rec.recent.shift();
 let intro=messages[index];if(index%3===2&&special[id])intro=special[id][index%special[id].length];
 const first=steps.find(s=>typeof s.say==='string');if(first)first.say=intro;
 return steps;
};
})();
