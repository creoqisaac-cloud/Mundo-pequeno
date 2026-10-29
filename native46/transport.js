/* Projected polygon meshes, rendered in the native canvas rather than a second 3D engine. */
(()=>{'use strict';const E=Expansion46,{X,G,V,P,H,S}=E;
const mesh=(g,train,color,left)=>E.models3d.mesh(g,train,color,left?-.4:.4);
// The existing car id keeps all its native speed, collisions, storage and controls.
// La agencia es un edificio real del plano urbano y utiliza el mismo
// cityBuilding, colliders, tejado, escaparate y sombras de Ciudad Corazón.
// Solo el vehículo de exposición es una malla 3D nativa aparcada enfrente.
const dealer=()=>V.MAIN.build.find(b=>b.id==='autosCorazon48');
H.bill.push(bb=>{
 const b=dealer();if(!b||V.map!==V.MAIN||X.st.scene!=='out'||Math.hypot(X.player.x-b.x,X.player.y-b.y)>255)return;
 bb.push({x:b.x+29,y:b.y+22,draw:g=>mesh(g,false,S.carColor||'#a8c8b3')});
});
H.act.unshift(it=>it.type==='job'&&it.b?.id==='autosCorazon48'?E.actions.cars46():null);
E.actions.cars46=async()=>{const i=await X.ask('Autos Corazón · carrocería artesanal',['🌸 Auto rosa · 1800 🔔','🌿 Auto menta · 1800 🔔','☁️ Auto cielo · 1800 🔔','Volver']);if(i>2)return;if(!S.garage.includes(i)){if(!X.payOr(1800))return;S.garage.push(i)}S.carColor=['#db9fb5','#a8c8b3','#a7bed6'][i];save.ownedVeh=save.ownedVeh||[];if(!save.ownedVeh.includes('auto'))save.ownedVeh.push('auto');save.vehicle='auto';G.save();X.vehHud();X.toast('🚗 Tu auto está listo para pasear.');};

})();