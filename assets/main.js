const theme=document.querySelector('#theme');try{if(localStorage.getItem('anran-theme')==='dark')document.body.classList.add('dark')}catch{}theme.addEventListener('click',()=>{document.body.classList.toggle('dark');try{localStorage.setItem('anran-theme',document.body.classList.contains('dark')?'dark':'light')}catch{}});document.querySelectorAll('[data-abstract]').forEach(b=>b.addEventListener('click',()=>{const el=document.getElementById(b.dataset.abstract);el.hidden=!el.hidden;b.setAttribute('aria-expanded',String(!el.hidden));b.textContent=el.hidden?'Abstract +':'Abstract −'}));const navLinks=[...document.querySelectorAll('nav a[href^="#"]')];const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))})},{rootMargin:'-15% 0px -55% 0px'});document.querySelectorAll('section[id]').forEach(s=>observer.observe(s));

// A single navigation bar remains available from the opening through the details.
(()=>{const header=document.querySelector('header');const update=()=>header.classList.toggle('past-opening',window.scrollY>32);window.addEventListener('scroll',update,{passive:true});update()})();

// Match the initial News viewport to the first six complete entries.
(()=>{
  const viewport=document.querySelector('#news .news-scroll');
  if(!viewport)return;
  const list=viewport.querySelector('.news-list');
  const rows=[...viewport.querySelectorAll('.news-row')];
  const visibleCount=Number(viewport.dataset.visibleRows)||6;
  const last=rows[Math.min(visibleCount,rows.length)-1];
  if(!rows.length||!last)return;
  const update=()=>{
    const height=Math.ceil(last.getBoundingClientRect().bottom-rows[0].getBoundingClientRect().top);
    if(height>0)viewport.style.height=height+'px';
  };
  const schedule=()=>requestAnimationFrame(update);
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(schedule).observe(list);
  window.addEventListener('resize',schedule,{passive:true});
  if(document.fonts)document.fonts.ready.then(schedule);
  schedule();
})();
