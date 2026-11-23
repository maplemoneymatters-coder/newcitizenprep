(function(){
  var ALL = QUESTION_BANK.map(function(r,i){return {id:i,cat:r[0],q:r[1],opts:r[2],ans:r[3],why:r[4]};});
  var CATS = Array.from(new Set(ALL.map(function(q){return q.cat;})));
  var $ = function(id){return document.getElementById(id);};
  var LS = 'dc_history_v1', QUICK_N = 20, QUICK_PASS = 15, QUICK_SECS = 45*60;
  var S = null, tick = null;

  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function show(name){['screen-pick','screen-quiz','screen-result'].forEach(function(n){$(n).classList.toggle('hidden',n!=='screen-'+name);});window.scrollTo(0,0);}
  function fmt(s){var m=Math.floor(s/60),x=s%60;return m+':'+(x<10?'0':'')+x;}
  function load(){try{return JSON.parse(localStorage.getItem(LS))||[];}catch(e){return [];}}
  function save(r){try{var h=load();h.unshift(r);localStorage.setItem(LS,JSON.stringify(h.slice(0,10)));}catch(e){}}

  /* ---------- picker ---------- */
  var picked = new Set();
  function renderPicker(){
    $('count-all').textContent = ALL.length;
    var box = $('chips'); box.innerHTML='';
    CATS.forEach(function(c){
      var n = ALL.filter(function(q){return q.cat===c;}).length;
      var b = document.createElement('button'); b.type='button'; b.className='chip'; b.setAttribute('aria-pressed','false');
      b.textContent = c+' ('+n+')';
      b.onclick=function(){ if(picked.has(c)){picked.delete(c);}else{picked.add(c);} b.setAttribute('aria-pressed',picked.has(c)); $('go-topic').disabled = picked.size===0; };
      box.appendChild(b);
    });
    var h = load(), ul = $('hist-list'); ul.innerHTML='';
    if(!h.length){$('hist').classList.add('hidden');}
    else{ $('hist').classList.remove('hidden');
      h.slice(0,5).forEach(function(r){var li=document.createElement('li');var a=document.createElement('span');a.textContent=r.date+' · '+r.mode;var b=document.createElement('b');b.textContent=r.score+'/'+r.total+(r.pass?' ✓':'');li.appendChild(a);li.appendChild(b);ul.appendChild(li);});
    }
  }

  /* ---------- session ---------- */
  function start(mode, pool){
    S = {mode:mode, qs:shuffle(pool), i:0, sel:null, done:false, log:[], t0:Date.now(), left:QUICK_SECS};
    if(mode==='quick') S.qs = S.qs.slice(0,QUICK_N);
    show('quiz'); clearInterval(tick); tick=setInterval(onTick,1000); onTick(); draw();
  }
  function onTick(){
    var el=$('timer'), el2;
    if(S.mode==='quick'){ S.left = QUICK_SECS-Math.floor((Date.now()-S.t0)/1000); if(S.left<=0){finish();return;} el.textContent='⏱ '+fmt(S.left); el.classList.toggle('warn',S.left<300); }
    else{ el.textContent='⏱ '+fmt(Math.floor((Date.now()-S.t0)/1000)); }
  }
  function draw(){
    var q=S.qs[S.i], n=S.qs.length;
    $('q-cat').textContent=q.cat; $('q-prog').textContent='Question '+(S.i+1)+' of '+n;
    $('bar').style.width=(S.i/n*100)+'%'; $('q-text').textContent=q.q;
    var box=$('opts'); box.innerHTML='';
    q.opts.forEach(function(o,i){
      var b=document.createElement('button'); b.type='button'; b.className='opt';
      var k=document.createElement('span'); k.className='k'; k.textContent='ABCD'[i];
      var t=document.createElement('span'); t.textContent=o; b.appendChild(k); b.appendChild(t);
      b.onclick=function(){pick(i);}; box.appendChild(b);
    });
    $('why').className='why'; $('why').textContent='';
    S.sel=null; S.done=false; var nb=$('next'); nb.disabled=true; nb.textContent='Check answer';
  }
  function pick(i){
    if(S.done) return; S.sel=i;
    Array.prototype.forEach.call($('opts').children,function(e,x){e.classList.toggle('sel',x===i);});
    $('next').disabled=false;
  }
  function next(){
    var q=S.qs[S.i];
    if(!S.done){
      S.done=true; S.log.push({q:q,chosen:S.sel,ok:S.sel===q.ans});
      Array.prototype.forEach.call($('opts').children,function(e,x){e.classList.add('lock');e.classList.remove('sel'); if(x===q.ans)e.classList.add('ok'); else if(x===S.sel)e.classList.add('no');});
      $('why').textContent=(S.sel===q.ans?'Correct. ':'Not quite. ')+q.why; $('why').classList.add('show');
      $('next').textContent = S.i===S.qs.length-1 ? 'See results' : 'Next question';
    } else if(S.i<S.qs.length-1){ S.i++; draw(); }
    else finish();
  }
  function finish(){
    clearInterval(tick);
    var total=S.log.length, score=S.log.filter(function(a){return a.ok;}).length;
    var denom = S.mode==='quick'?S.qs.length:total;
    var need = S.mode==='quick'?QUICK_PASS:Math.ceil(denom*0.75), pass=score>=need&&denom>0;
    var v=$('verdict'); v.textContent=pass?'PASS':'KEEP STUDYING'; v.className='verdict'+(pass?'':' fail');
    $('score').textContent=score+'/'+denom;
    $('score-sub').textContent = (S.mode==='quick'?'Quick Test: ':'Target: ')+need+' of '+denom+' correct to pass.'+(total<denom?' Time ran out after '+total+' answers.':'');
    var cb=$('catbars'); cb.innerHTML=''; var by={};
    S.log.forEach(function(a){var c=by[a.q.cat]=by[a.q.cat]||{c:0,t:0};c.t++;if(a.ok)c.c++;});
    Object.keys(by).forEach(function(k){var r=document.createElement('div');r.className='catrow';
      var a=document.createElement('span');a.textContent=k;var t=document.createElement('span');t.className='t';var i=document.createElement('i');i.style.width=Math.round(by[k].c/by[k].t*100)+'%';t.appendChild(i);var f=document.createElement('b');f.textContent=by[k].c+'/'+by[k].t;r.appendChild(a);r.appendChild(t);r.appendChild(f);cb.appendChild(r);});
    var rv=$('review'); rv.innerHTML=''; var miss=S.log.filter(function(a){return !a.ok;});
    if(!miss.length){rv.textContent='Perfect — nothing to review.';}
    miss.forEach(function(a){var d=document.createElement('div');d.className='review';
      var q=document.createElement('p');q.innerHTML='<b></b>';q.firstChild.textContent=a.q.q;
      var y=document.createElement('div');y.className='bad';y.textContent='Your answer: '+(a.chosen==null?'(none)':a.q.opts[a.chosen]);
      var c=document.createElement('div');c.className='good';c.textContent='Correct: '+a.q.opts[a.q.ans];
      var w=document.createElement('small');w.textContent=a.q.why;
      d.appendChild(q);d.appendChild(y);d.appendChild(c);d.appendChild(w);rv.appendChild(d);});
    rv.classList.add('hidden'); $('toggle-review').textContent='Show missed questions ('+miss.length+')';
    save({date:new Date().toLocaleDateString(),mode:S.mode==='quick'?'Quick Test':S.mode==='full'?'Full Exam':'Topic review',score:score,total:denom,pass:pass});
    show('result');
  }

  /* ---------- wiring ---------- */
  $('go-quick').onclick=function(){start('quick',ALL);};
  $('go-full').onclick=function(){start('full',ALL);};
  $('go-topic').onclick=function(){start('topic',ALL.filter(function(q){return picked.has(q.cat);}));};
  $('next').onclick=next;
  $('quit').onclick=function(){if(confirm('Quit this session? Progress will be lost.')){clearInterval(tick);renderPicker();show('pick');}};
  $('again').onclick=function(){var m=S.mode;start(m,m==='topic'?ALL.filter(function(q){return picked.has(q.cat);}):ALL);};
  $('home').onclick=function(){renderPicker();show('pick');};
  $('toggle-review').onclick=function(){var r=$('review');var h=r.classList.toggle('hidden');this.textContent=h?'Show missed questions':'Hide missed questions';};
  document.addEventListener('keydown',function(e){
    if($('screen-quiz').classList.contains('hidden')||!S) return;
    var k=e.key.toLowerCase(), ix='abcd1234'.indexOf(k);
    if(ix>-1&&ix<8){pick(ix%4);}
    else if(e.key==='Enter'&&!$('next').disabled&&document.activeElement.className.indexOf('opt')<0){next();}
  });

  renderPicker();
  var p=new URLSearchParams(location.search), m=p.get('mode');
  if(m==='quick') start('quick',ALL);
  else if(m==='full') start('full',ALL);
  else if(p.get('topic')&&CATS.indexOf(p.get('topic'))>-1){picked.add(p.get('topic'));start('topic',ALL.filter(function(q){return q.cat===p.get('topic');}));}
})();
