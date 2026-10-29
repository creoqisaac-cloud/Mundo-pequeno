/* Regresión del joystick v41 sin navegador ni paquetes externos.
   Ejecuta el módulo real con los objetos mínimos del juego. */
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

class FakeNode {
 constructor(id='') {
  this.id=id;this.style={};this.hidden=false;this.isConnected=true;
  this.dataset={};this.events={};this.children=[];
  this.attributes={};
  const set=new Set();
  this.classList={
   add:k=>set.add(k),remove:k=>set.delete(k),
   contains:k=>set.has(k),
   toggle:(k,on)=>{if(on===undefined)on=!set.has(k);if(on)set.add(k);else set.delete(k);return on;}
  };
 }
 addEventListener(name,fn){(this.events[name]||(this.events[name]=[])).push(fn);}
 fire(name,props={}){
  const e={pointerId:1,clientX:200,clientY:158,
   preventDefault(){},stopPropagation(){},...props};
  for(const fn of this.events[name]||[])fn(e);
 }
 setAttribute(k,v){this.attributes[k]=v;}
 appendChild(n){this.children.push(n);n.parent=this;return n;}
 prepend(n){this.children.unshift(n);n.parent=this;return n;}
 getBoundingClientRect(){
  if(this.id==='wcJoystick40')return{left:100,top:100,width:116,height:116};
  if(this.id==='preview')return{left:20,top:20,width:300,height:160};
  return{left:0,top:0,width:390,height:800};
 }
 setPointerCapture(id){this.captured=id;}
 querySelector(q){
  if(q==='.wcJ40Ball')return this.ball;
  if(this.id==='wcControlOptions40')return this.parts[q]||null;
  if(this.id==='optsBox'&&q==='#wcControlOptions40')return this.children.find(n=>n.id==='wcControlOptions40')||null;
  return null;
 }
 querySelectorAll(q){
  if(this.id==='wcControlOptions40'){
   if(q==='[data-mode]')return this.parts.modes;
   if(q==='[data-size]')return this.parts.sizes;
  }
  return [];
 }
}
const game=new FakeNode('game');game.classList.add('on');
const head=new FakeNode('head');
const optsBox=new FakeNode('optsBox');
const ball=new FakeNode('ball');
const editor=new FakeNode('editor');
const preview=new FakeNode('preview');
const handle=new FakeNode('handle');
const saveButton=new FakeNode('saveButton');
const modeButtons=['tap','joy'].map(v=>Object.assign(new FakeNode('mode-'+v),{dataset:{mode:v}}));
const sizeButtons=['92','116','144'].map(v=>Object.assign(new FakeNode('size-'+v),{dataset:{size:v}}));
let stick;
let saves=0;
const state={mode:'play',menu:false,mg:null,busy:false,trans:null,poseLock:false,tab:'opts'};
const player={path:[[1,2]],pending:{id:'pending'}};
const X={HOOKS:{tab:[]},st:state,player,toast:()=>{}};
const G={save:()=>{saves++;}};
const storage={joystick37:{enabled:false,x:19,y:76,size:116,ready40:true}};
const win={Game:{X,G},save:storage,addEventListener:()=>{}};
const doc={
 hidden:false,head,
 addEventListener:()=>{},
 getElementById:id=>id==='game'?game:null,
 createElement(tag){
  const n=new FakeNode(tag);
  if(tag==='div'){n.id='wcJoystick40';n.ball=ball;stick=n;}
  if(tag==='section'){
   n.id='wcControlOptions40';
   n.parts={
    '.wcEditor40':editor,'.wcPreview40':preview,
    '.wcPreviewHandle40':handle,'.wcSave40':saveButton,
    modes:modeButtons,sizes:sizeButtons
   };
  }
  return n;
 }
};
const context={window:win,document:doc,save:storage,console,
 innerWidth:390,innerHeight:800,
 queueMicrotask,Math,Number,String,Set,Array,Promise};
vm.runInNewContext(fs.readFileSync('native_joystick40.js','utf8'),context,{filename:'native_joystick40.js'});
const joy=win.WalesaJoystick41;
assert.ok(joy,'El control debe cargarse');
assert.equal(X.HOOKS.tab.length,1,'Opciones debe recibir un hook');
assert.equal(joy.enabled(),false);
assert.equal(joy.vector(),null);

(async()=>{
 X.HOOKS.tab[0]('opts',optsBox);
 await Promise.resolve();
 const panel=optsBox.querySelector('#wcControlOptions40');
 assert.ok(panel,'El menú nativo debe montarse después del render');
 assert.equal(editor.hidden,true,'El editor se oculta en modo tocar suelo');
 modeButtons[1].fire('click');
 assert.equal(storage.joystick37.enabled,true,'Palanca se activa al seleccionarla');
 assert.equal(editor.hidden,false);
 assert.equal(joy.enabled(),false,'La palanca sin dedo no secuestra el toque al suelo');

 state.menu=true;
 assert.equal(joy.vector(),null);
 state.menu=false;
 assert.equal(joy.vector(),null);

 stick.fire('pointerdown',{pointerId:42,clientX:207,clientY:158});
 assert.equal(joy.enabled(),true,'El control mantiene captura activa');
 assert.equal(player.path,null,'La palanca cancela la ruta vieja');
 const vec=joy.vector();
 assert.ok(vec&&vec.x>.1,'La palanca entrega una dirección');
 stick.fire('pointerup',{pointerId:42});
 assert.equal(joy.enabled(),false);
 assert.equal(joy.vector(),null,'Soltar permite volver a tocar el mapa');

 preview.fire('pointerdown',{pointerId:5,clientX:210,clientY:110});
 preview.fire('pointermove',{pointerId:5,clientX:230,clientY:130});
 preview.fire('pointerup',{pointerId:5});
 sizeButtons[2].fire('click');
 saveButton.fire('click');
 assert.equal(storage.joystick37.size,144);
 assert.ok(storage.joystick37.x>60&&storage.joystick37.y>60);
 assert.ok(saves>=2,'Se guardan modo y posición');

 modeButtons[0].fire('click');
 assert.equal(storage.joystick37.enabled,false,'Regresar a tocar suelo es inmediato');
 assert.equal(editor.hidden,true);
 assert.equal(joy.vector(),null);
 joy.mode(true);
 assert.equal(joy.vector(),null);
 game.classList.remove('on');
 assert.equal(joy.vector(),null,'Fuera del juego no hay movimiento residual');
 game.classList.add('on');
 assert.equal(joy.vector(),null);
 console.log('✓ Joystick v41: modos, opciones, arrastre, respaldo, pausa y seguridad.');
})().catch(err=>{console.error(err);process.exitCode=1;});
