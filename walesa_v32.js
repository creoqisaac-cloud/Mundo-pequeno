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


/* Mundo Pequeño v68: prendas dibujadas en Procreate por la autora.
 * Render sobre el personaje original, con el mismo motor y equipamiento v32.
 * Fuentes: Ilustración sin título 1, Ilustración sin título 2,
 *          Ilustración sin título(1) (.procreate).
 */
(()=>{
'use strict';
if(typeof Game==='undefined'||!Game.X?.HOOKS?.bill)return;
const X=Game.X,H=X.HOOKS;
const DATA={
  botas: 'data:image/png;base64,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',
  perfil: 'data:image/png;base64,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',
  frente: 'data:image/png;base64,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'
};
const images={};
for(const [k,src] of Object.entries(DATA)){
 const im=new Image();im.src=src;images[k]=im;
}
function drawSprite(g,im,x,y,w,h){
 if(!im?.complete||!im.naturalWidth)return;
 g.save();g.imageSmoothingEnabled=false;g.drawImage(im,x,y,w,h);g.restore();
}
H.bill.push(b=>{
 if(X.st.scene!=='out'||X.st.mg||X.st.mode!=='play'||!X.player)return;
 const p=X.player;
 if(save.inv?.impermeable32>0&&save.outfit==='impermeable'){
  b.push({x:p.x,y:p.y+2,draw:g=>{
   const side=(p.dir===1||p.dir===3);
   drawSprite(g,images[side?'perfil':'frente'],-13,-30,26,27);
  }});
 }
 if(save.inv?.botas32>0&&save.shoes==='botasLluvia'){
  b.push({x:p.x,y:p.y+3,draw:g=>drawSprite(g,images.botas,-8,-9,16,10)});
 }
});
window.WalesaRopaDibujada={version:68,images,usesOwnProcreate:true};
})();
