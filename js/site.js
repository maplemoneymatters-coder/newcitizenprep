(function(){
  var S = window.SITE || {}, root = document.documentElement;
  document.querySelectorAll('[data-kofi]').forEach(function(a){ a.href = S.kofi || '#'; a.target='_blank'; a.rel='noopener noreferrer'; });
  document.querySelectorAll('[data-email]').forEach(function(a){ a.href='mailto:'+S.email; a.textContent=S.email; });
  var b=document.getElementById('burger'), m=document.getElementById('menu');
  if(b&&m) b.addEventListener('click',function(){ var o=m.classList.toggle('open'); b.setAttribute('aria-expanded',o); });
  document.querySelectorAll('[data-year]').forEach(function(e){ e.textContent=new Date().getFullYear(); });

  /* theme toggle: remembers choice, otherwise follows the device setting */
  var KEY='dc_theme', t=document.getElementById('theme');
  function current(){ return root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'); }
  function label(){ if(t) t.setAttribute('aria-label','Switch to '+(current()==='dark'?'light':'dark')+' theme'); }
  root.setAttribute('data-theme', current()); label();
  if(t) t.addEventListener('click',function(){
    var n=current()==='dark'?'light':'dark'; root.setAttribute('data-theme',n);
    try{localStorage.setItem(KEY,n);}catch(e){} label();
  });
})();
