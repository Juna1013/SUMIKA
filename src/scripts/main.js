(function(){
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(id){ return document.getElementById(id); };

  /* ---------- 桜 ----------
     絵と花びらは HeroArtwork がビルド時に描いてある。ここでは、ヒーローが
     画面の外にあるあいだ花びらと星の動きを止めるだけ（読んでいる間に
     見えない所で描き続けないため）。 */
  var hero = $('hero');
  if (hero && 'IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      hero.classList.toggle('is-idle', !entries[entries.length - 1].isIntersecting);
    }).observe(hero);
  }

  /* ---------- 雫 → 波紋（画面のどこでも） ---------- */
  var rippleLayer = $('rippleLayer');
  document.addEventListener('pointerdown', function(ev){
    if (reduce) return;
    var x = ev.clientX, y = ev.clientY;
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'rip');
    g.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
    var drop = document.createElementNS(NS, 'circle');
    drop.setAttribute('r', '3');
    drop.setAttribute('class', 'rip-drop');
    g.appendChild(drop);
    for (var i = 0; i < 3; i++){
      var e = document.createElementNS(NS, 'ellipse');
      e.setAttribute('rx', 42);
      e.setAttribute('ry', 14.5);
      e.setAttribute('vector-effect', 'non-scaling-stroke');
      e.style.animationDelay = (0.12 + i * 0.38) + 's';
      g.appendChild(e);
    }
    rippleLayer.appendChild(g);
    setTimeout(function(){ g.remove(); }, 3500);
  });

  /* ---------- ページ遷移（ハッシュルーティング＋墨ワイプ） ---------- */
  var ROUTES = ['home', 'works', 'experience', 'output'];
  var wipe = $('wipe');
  var current = null;
  var busy = false;

  function routeFromHash(){
    var h = location.hash.replace(/^#\/?/, '');
    return ROUTES.indexOf(h) > -1 ? h : 'home';
  }
  function setView(r){
    document.documentElement.dataset.route = r;
    document.querySelectorAll('[data-route]').forEach(function(a){
      if (a.tagName === 'A') a.classList.toggle('current', a.dataset.route === r);
    });
    window.scrollTo(0, 0);
    current = r;
  }
  function navigate(r, after){
    if (r === current){
      if (after) after();
      return;
    }
    if (busy) return;
    if (reduce){
      setView(r);
      if (after) after();
      return;
    }
    busy = true;
    wipe.classList.remove('out');
    wipe.classList.add('cover');
    setTimeout(function(){
      setView(r);
      wipe.classList.remove('cover');
      wipe.classList.add('out');
      setTimeout(function(){
        wipe.classList.remove('out');
        busy = false;
        if (after) after();
        var want = routeFromHash();
        if (want !== current) navigate(want);
      }, 460);
    }, 370);
  }
  function scrollToAbout(){
    var about = $('about');
    if (about) about.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  function isAboutAnchor(){ return location.hash === '#about'; }
  window.addEventListener('hashchange', function(){
    if (isAboutAnchor()) navigate('home', scrollToAbout);
    else navigate(routeFromHash());
  });
  setView(routeFromHash());
  if (isAboutAnchor()) requestAnimationFrame(scrollToAbout);

  /* ---------- スクロールで現れる ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
})();

