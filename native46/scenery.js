/* Cached watercolor scenery, with the same brush and grain as the native island. */
(()=>{'use strict';const E=Expansion46,{X,G,V,P}=E,base=E.background;
E.background=(g,key,top,bottom)=>{base(g,key,top,bottom);const night=X.night();MGFX.bgc('e46scene'+key+night,g,G.W,G.H,(c,w,h)=>{
 const wc=(shape,col,lw=.4)=>P.wc(c,shape,col,{lw}),line=(pts,col,lw=.5)=>P.ln(c,pts,col,lw);
 if(key.startsWith('pizza')||key.startsWith('kitchen')){for(let y=h*.13;y<h*.37;y+=13)for(let x=0;x<w;x+=20){c.globalAlpha=.18;wc(P.RR(x+1,y+1,18,11,1),'#bfa6a0',0)}c.globalAlpha=1;for(const x of[w*.1,w*.72]){wc(P.RR(x,h*.16,w*.18,h*.12,3),'#967c70');wc(P.RR(x+2,h*.16+2,w*.18-4,h*.12-4,2),night?'#444d78':'#c6dfdc');line([[x+w*.09,h*.16],[x+w*.09,h*.28]],'#b9a18a',1);line([[x,h*.22],[x+w*.18,h*.22]],'#b9a18a',1);if(night)P.star(c,x+w*.1,h*.19,2,'#fff1bb')}
 if(key.startsWith('pizza')){wc(P.RR(-4,h*.39,w+8,h*.44,1),'#c79d79');for(let i=0;i<9;i++){line([[0,h*.4+i*h*.05],[w,h*.4+i*h*.05]],'#9c795a',.35);for(let j=0;j<5;j++)line([[j*43,h*.415+i*h*.05],[j*43+25,h*.418+i*h*.05]],'#b18a65',.3)}wc(P.RR(w*.04,h*.395,w*.92,6,1),'#e0bf98');}
 }else{
 const dreamy=key==='dream46'||key==='arena'||key==='turnos';const sky=night?'#8588b3':dreamy?'#d1d5e8':'#b6d9de';for(let i=0;i<5;i++){const x=i*w*.27-12,y=h*(.25+i%2*.04);wc(P.PG([[x-50,h*.52],[x,y-10],[x+65,h*.52]]),sky,0)}
 for(let i=0;i<7;i++){const x=V.hash(i,90)*w,y=h*(.19+V.hash(i,91)*.22);for(let j=0;j<3;j++)wc(P.E(x+(j-1)*8,y-Math.abs(j-1)*2,11,5),night?'#c6bedb':'#fff6ed',0)}
 if(!dreamy){for(let i=0;i<4;i++)wc(P.E(w*(i*.34),h*.62,w*.38,h*.15),['#bad1bb','#b3c5b8','#a7bfad','#bfd2b9'][i],0);for(let i=0;i<18;i++){const x=V.hash(i,20)*w,y=h*.63+V.hash(i,21)*h*.18;P.wc(c,P.E(x,y,1.4,2),'#e1b5c8',{lw:0});line([[x,y+1],[x,y+5]],'#8da58a',.45)}}
 if(key==='arena'||key==='turnos'){for(const x of[w*.09,w*.91]){wc(P.RR(x-3,h*.35,6,h*.28,1),'#a48c9f');wc(P.E(x,h*.35,4,3),'#e6c5a1');wc(P.PG([[x,h*.38],[x+(x<w/2?24:-24),h*.4],[x,h*.44]]),'#d9a7bf');}line([[w*.09,h*.36],[w*.5,h*.4],[w*.91,h*.36]],'#aa8d9b',.6);for(let i=0;i<9;i++){const x=w*(.13+i*.09),y=h*(.36+Math.sin(i/8*Math.PI)*.035);wc(P.PG([[x-3,y],[x+3,y],[x,y+6]]),i%2?'#dfb08e':'#c69cbd',.2)}}
 if(['circulos46','piano46','baile46','rhythm'].includes(key)){wc(P.RR(w*.06,h*.76,w*.88,13,3),'#ad919d');wc(P.RR(w*.03,h*.79,w*.94,10,3),'#c1a7aa');for(const x of[w*.06,w*.94]){wc(P.RR(x-4,h*.15,8,h*.64,2),'#a78b94');wc(P.PG([[x-8,h*.14],[x+8,h*.14],[x+5,h*.43],[x-5,h*.48]]),'#cb98b4')}for(let i=0;i<6;i++){const x=w*(.16+i*.136);wc(P.E(x,h*.16,2,3),'#fff0c9');line([[x,h*.11],[x,h*.16]],'#9e8497',.4)}}
 }
 });};
})();