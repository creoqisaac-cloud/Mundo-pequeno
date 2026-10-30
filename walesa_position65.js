/* Walesa v65: preserva la posicion sin crear ni modificar NPC. */
(function(){
'use strict';
const X=Game.X,G=Game.G,V=World;
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
window.WalesaPosition65={savePos};
})();
