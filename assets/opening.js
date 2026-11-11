(()=>{
  const canvas=document.getElementById('opening-art'),hero=document.querySelector('.opening'),ctx=canvas.getContext('2d');
  if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const started=performance.now(),TAU=Math.PI*2;
  let w=1,h=1,frame=0,last=0,visible=true,seed=1+Math.floor(Math.random()*2147483645),scrollProgress=0,cycle=-1,shape=0,previousShape=-1,orientation=0,quietRects=[];
  const pointer={x:-1,y:-1,lastMove:-10000,active:false},trail=[];
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
  const particles=Array.from({length:1800},(_,i)=>({id:i,u:(i%60+.18+random()*.64)/60,v:(Math.floor(i/60)+.18+random()*.64)/30,sx:random(),sy:random(),phase:random()*TAU,size:(.45+random()*1.1)*1.5,alpha:.24+random()*.44,warm:i%13===0,dx:0,dy:0,vx:0,vy:0}));
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
  function resize(){const rect=hero.getBoundingClientRect();w=rect.width;h=rect.height;const d=Math.min(devicePixelRatio||1,1.65);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);quietRects=[...hero.querySelectorAll('.opening-copy h1,.opening-role,.opening-description')].map(el=>{const r=el.getBoundingClientRect();return{x:r.left-rect.left-15,y:r.top-rect.top-10,w:r.width+30,h:r.height+20}});render(performance.now())}
  function wash(x,y,r,color,alpha){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
  function surface(kind,u,v,t,index){const a=u*TAU,b=v*TAU;let x,y,z;
    if(kind>=5){const cloud=window.AnranPointClouds[kind===5?"cat":"bunny"];[x,y,z]=cloud[index%cloud.length]}
    else if(kind===0){const latitude=Math.acos(2*v-1);x=1.16*Math.sin(latitude)*Math.cos(a);y=.78*Math.cos(latitude);z=.77*Math.sin(latitude)*Math.sin(a)}
    else if(kind===1){const width=(v-.5)*.78;x=(.86+width*Math.cos(a/2))*Math.cos(a);y=(.86+width*Math.cos(a/2))*Math.sin(a);z=width*Math.sin(a/2)}
    else if(kind===2){const r=.29;x=(.81+r*Math.cos(b))*Math.cos(a);y=(.81+r*Math.cos(b))*Math.sin(a);z=r*Math.sin(b)}
    else if(kind===3){x=(u-.5)*2;y=(v-.5)*1.7;z=.65*(x*x-y*y)}
    else{x=(u-.5)*2.15;y=(v-.5)*1.65;z=.38*Math.sin(x*2.6)*Math.cos(y*2.1)}
    const yaw=kind>=5?-.25+.28*Math.sin(t*.09):t*.065+orientation,tilt=kind>=5?.10:.68+.14*Math.sin(t*.05+orientation);const xx=x*Math.cos(yaw)-z*Math.sin(yaw),zz=x*Math.sin(yaw)+z*Math.cos(yaw);return{x:xx,y:y*Math.cos(tilt)-zz*Math.sin(tilt),z:y*Math.sin(tilt)+zz*Math.cos(tilt)};
  }
  function render(now){const elapsed=(now-started)/1000,t=reduced.matches?12:elapsed;
    const nextCycle=Math.floor(t/25);if(nextCycle!==cycle){cycle=nextCycle;do{shape=cycle===0?5+Math.floor(random()*2):Math.floor(random()*7)}while(shape===previousShape);previousShape=shape;orientation=random()*TAU}
    const phase=t%25;let gather=reduced.matches?.88:smooth((phase-1.5)/6)*(1-smooth((phase-18)/6));
    const idle=now-pointer.lastMove,agitation=pointer.active?1-smooth((idle-100)/1400):0;
    // Pointer motion affects only local offsets, never the gathering phase.
    const dark=document.body.classList.contains('dark');
    ctx.clearRect(0,0,w,h);ctx.fillStyle=dark?'#071326':'#fff';ctx.fillRect(0,0,w,h);
    wash(w*.31,h*.27,w*.5,dark?'36,77,131':'174,197,215',dark?.13:.10);wash(w*.78,h*.51,w*.43,dark?'30,84,147':'151,184,209',dark?.16:.12);wash(w*.48,h*.77,w*.24,dark?'141,117,85':'207,188,157',.045);
    const scale=Math.min(w*.34,h*.41)*(shape>=5?.78:1),centerX=w*(.52+.045*Math.sin(orientation)),centerY=h*(shape>=5?.51:.46);
    for(const p of particles){const form=surface(shape,p.u,p.v,t,p.id);const perspective=1/(1+form.z*.12);const tx=centerX+form.x*scale*perspective,ty=centerY+form.y*scale*perspective;
      const sx=p.sx*w+Math.sin(t*.12+p.phase)*12,sy=p.sy*h+Math.cos(t*.10+p.phase)*12;
      let x=sx+(tx-sx)*gather,y=sy+(ty-sy)*gather;
      if(!reduced.matches){if(agitation>0){const dx=x+p.dx-pointer.x,dy=y+p.dy-pointer.y,distance=Math.hypot(dx,dy),radius=w<760?90:155;if(distance<radius&&distance>1){const force=Math.pow(1-distance/radius,2)*agitation*.65;p.vx+=(dx/distance-dy/distance*.45)*force;p.vy+=(dy/distance+dx/distance*.45)*force}}
        p.vx=(p.vx-p.dx*.012)*.90;p.vy=(p.vy-p.dy*.012)*.90;p.dx+=p.vx;p.dy+=p.vy}
      x+=p.dx;y+=p.dy;
      let textMask=1;for(const rect of quietRects){if(x>rect.x&&x<rect.x+rect.w&&y>rect.y&&y<rect.y+rect.h){textMask=.16;break}}
      const depth=.64+.36*(form.z+1.7)/3.4,alpha=p.alpha*textMask*(.63+.32*gather)*depth*(1-scrollProgress*.65);
      ctx.fillStyle=`rgba(${dark?(p.warm?'213,186,145':'163,200,232'):(p.warm?'158,131,96':'49,100,141')},${alpha})`;const radius=p.size*(.85+gather*.15)*perspective;ctx.beginPath();ctx.ellipse(x,y,radius,radius*(.8+.2*Math.sin(p.phase)),p.phase,0,TAU);ctx.fill();
    }
    if(!reduced.matches){
      const lifetime=1000,color=dark?'105,165,216':'25,83,127';
      for(let i=trail.length-1;i>=0;i--)if(now-trail[i].time>lifetime)trail.splice(i,1);
      for(const dab of trail){
        const age=Math.max(0,(now-dab.time)/lifetime),fade=Math.pow(1-age,1.8),spread=1+age*.35;
        // Overlapping uneven washes create a wet edge rather than a drawn line.
        for(let layer=0;layer<3;layer++){
          const a=dab.angle+layer*2.2,r=dab.radius*spread*(layer===0?1:.58);
          const x=dab.x+Math.cos(a)*dab.radius*(layer===0?0:.34)+Math.sin(age*2+dab.angle)*age*3;
          const y=dab.y+Math.sin(a)*dab.radius*(layer===0?0:.29)+age*2;
          const opacity=fade*(layer===0?.055:.028)*(dark?1.3:1);
          const gradient=ctx.createRadialGradient(x,y,0,x,y,r);
          gradient.addColorStop(0,`rgba(${color},${opacity})`);
          gradient.addColorStop(.42,`rgba(${color},${opacity*.7})`);
          gradient.addColorStop(.78,`rgba(${color},${opacity*.22})`);
          gradient.addColorStop(1,`rgba(${color},0)`);
          ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,r*2,r*2);
        }
        // A few faint granules suggest pigment settling in paper.
        ctx.fillStyle=`rgba(${color},${fade*.045})`;
        for(let j=0;j<3;j++){const a=dab.angle+j*2.4;ctx.beginPath();ctx.arc(dab.x+Math.cos(a)*dab.radius*.62,dab.y+Math.sin(a)*dab.radius*.48,.5+age*.35,0,TAU);ctx.fill()}
      }
    }
    canvas.style.opacity=String(1-scrollProgress*.8);
  }
  function tick(now){if(now-last>32){render(now);last=now}if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick)}
  function resume(){cancelAnimationFrame(frame);if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(tick);else render(performance.now())}
  hero.addEventListener('pointermove',event=>{
    if(reduced.matches)return;const rect=hero.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top,now=performance.now();
    const previous=trail[trail.length-1],distance=previous?Math.hypot(x-previous.x,y-previous.y):0;
    const fresh=!previous||now-previous.time>180||distance>200;
    if(fresh||distance>7){const steps=fresh?1:Math.min(12,Math.max(1,Math.ceil(distance/9)));
      const radius=distance>45?7:10;
      for(let i=1;i<=steps;i++){const f=i/steps;trail.push({x:fresh?x:previous.x+(x-previous.x)*f,y:fresh?y:previous.y+(y-previous.y)*f,time:now,radius:radius*(.85+Math.random()*.3),angle:Math.random()*TAU})}
      while(trail.length>110)trail.shift();
    }
    pointer.x=x;pointer.y=y;pointer.active=true;pointer.lastMove=now;
  },{passive:true});hero.addEventListener('pointerleave',()=>{pointer.active=false});
  window.addEventListener('scroll',()=>{scrollProgress=Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/h));if(reduced.matches)render(0)},{passive:true});new ResizeObserver(resize).observe(hero);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume()}).observe(hero);document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);new MutationObserver(()=>render(performance.now())).observe(document.body,{attributes:true,attributeFilter:['class']});document.fonts.ready.then(resize);resize();
})();
