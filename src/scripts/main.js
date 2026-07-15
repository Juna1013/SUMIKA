(function(){
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(id){ return document.getElementById(id); };

  /* ---------- 桜の配置（満開） [x,y,scale,variant] 0淡紅 1濃紅 2線描 3蕾 ---------- */
  var BLOSSOMS = [
    /* 上枝A（密） */
    [434,86,1.05,0],[452,96,.85,1],[420,71,.8,0],[445,73,.7,2],[458,88,.9,1],
    [448,99,.75,0],[430,106,.8,0],[468,80,.8,1],[440,60,.75,0],[462,108,.7,1],[414,92,.7,1],
    [426,80,.6,1],[456,66,.65,0],[406,102,.6,0],
    [336,82,.9,0],[348,69,.7,1],[326,94,.75,0],[346,120,.7,1],[366,100,.7,0],
    [358,86,.6,1],[322,76,.6,2],
    [318,206,.8,1],[338,167,.9,0],[329,188,.85,0],[330,150,.65,1],[310,224,.7,0],
    [344,178,.7,1],[320,196,.6,0],
    /* 上枝E（左） */
    [200,152,.95,0],[214,140,.8,1],[188,166,.75,1],[226,148,.6,2],
    [248,128,.85,0],[236,118,.7,1],[258,138,.65,0],
    [206,130,.6,0],[238,142,.55,1],
    /* 下枝F（左） */
    [320,288,.9,0],[334,280,.7,1],[306,296,.7,1],[330,296,.6,2],
    /* 下小枝H */
    [408,277,.85,0],[424,270,.7,1],[394,286,.7,1],[416,290,.55,0],
    /* 幹まわり */
    [262,240,.85,0],[286,252,.7,2],[228,244,.7,1],[130,246,.75,0],[86,248,.65,0],[40,250,.7,1],
    [160,240,.6,1],[60,252,.6,0],
    [528,196,.9,0],[546,207,.8,1],[560,196,.7,0],[620,200,.7,1],[410,228,.65,1],
    [576,204,.6,1],[646,206,.6,0],
    [790,190,.7,0],[840,178,.7,0],[816,184,.6,1],
    /* 小枝D */
    [500,252,.8,1],[517,246,.65,0],[488,262,.7,0],[530,258,.7,1],[476,246,.7,1],[508,264,.55,2],
    /* 上小枝G */
    [722,122,.9,0],[736,112,.75,1],[710,134,.7,1],[744,128,.65,0],[728,140,.55,0],
    /* 下枝B（密） */
    [664,292,.9,0],[690,305,.8,1],[748,314,.95,0],[731,322,.7,2],[712,305,.85,0],
    [710,342,.8,1],[724,350,.65,1],[676,300,.7,0],[700,318,.7,2],[760,308,.7,1],[736,336,.65,0],
    [698,330,.6,0],[756,326,.6,1],[772,300,.55,2],
    [780,284,.85,0],[792,276,.7,1],[768,292,.6,1],
    /* 上枝C（密） */
    [872,96,.95,0],[893,84,.8,1],[946,72,1,0],[929,60,.75,2],[917,84,.8,0],[960,80,.7,1],
    [924,44,.85,1],[939,53,.65,0],[956,88,.8,0],[938,92,.7,2],[906,70,.7,0],[884,110,.75,0],
    [936,78,.6,0],[900,94,.6,1],[968,64,.6,2],
    [1016,58,.9,0],[1032,66,.7,1],[1000,50,.7,1],[1008,70,.55,0],
    /* 先端（密） */
    [1050,126,.9,0],[1073,112,.75,1],[1135,80,.9,0],[1151,93,.7,2],[1117,90,.75,0],
    [1196,106,.8,0],[1182,118,.65,1],[1160,72,.8,0],[1168,104,.7,1],[1104,102,.7,0],
    [1062,140,.7,1],[1090,74,.7,1],[1082,92,.6,0],[1146,64,.6,1],[1170,86,.55,0],
    [1128,62,.85,0],[1140,76,.7,1],[1114,52,.7,0],[1190,94,.6,2],[1122,108,.6,1]
  ];
  var HREF = ['#sb0','#sb1','#sb2','#sbud'];
  var layer = $('bloomLayer');
  BLOSSOMS.forEach(function(b, i){
    var gPos = document.createElementNS(NS, 'g');
    var rot = (Math.random() * 60 - 30).toFixed(0);
    gPos.setAttribute('transform', 'translate(' + b[0] + ' ' + b[1] + ') rotate(' + rot + ') scale(' + b[2] + ')');
    var u = document.createElementNS(NS, 'use');
    u.setAttribute('href', HREF[b[3]]);
    u.setAttribute('class', 'bloom-unit');
    u.style.setProperty('--bd', (1.15 + i * 0.016 + Math.random() * 0.4).toFixed(2) + 's');
    gPos.appendChild(u);
    layer.appendChild(gPos);
  });

  /* ---------- 花びら ---------- */
  var SPETAL_D = 'M0 -5.2 C-0.6 -6.4 -2.4 -7 -3.6 -6 C-5.4 -4.4 -5.6 -0.8 -4.2 2 C-2.9 4.6 -1.4 5.6 0 6.6 C1.4 5.6 2.9 4.6 4.2 2 C5.6 -0.8 5.4 -4.4 3.6 -6 C2.4 -7 0.6 -6.4 0 -5.2 Z';
  var S_SVG = '<svg viewBox="-6.5 -8 13 16" xmlns="http://www.w3.org/2000/svg"><path d="' + SPETAL_D + '" fill="currentColor" opacity=".88"/></svg>';
  var COLORS = ['#e2aab6','#d494a4','#c98a9c','#efc9d2','#dda0af'];
  if (!reduce){
    var pl = document.querySelector('.petal-layer');
    for (var i = 0; i < 34; i++){
      var w = document.createElement('span');
      w.className = 'petal-fall';
      w.style.setProperty('--x0', (Math.random() * 100).toFixed(1) + 'vw');
      w.style.setProperty('--drift', (Math.random() * 22 - 11).toFixed(1) + 'vw');
      w.style.setProperty('--dur', (9 + Math.random() * 10).toFixed(1) + 's');
      w.style.setProperty('--delay', (-Math.random() * 18).toFixed(1) + 's');
      var inner = document.createElement('span');
      inner.className = 'petal';
      inner.style.width = (8 + Math.random() * 9).toFixed(0) + 'px';
      inner.style.setProperty('--sway', (2.2 + Math.random() * 2.4).toFixed(1) + 's');
      inner.style.color = COLORS[i % COLORS.length];
      inner.innerHTML = S_SVG;
      w.appendChild(inner);
      pl.appendChild(w);
    }
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
  var ROUTES = ['home', 'works', 'blog'];
  var wipe = $('wipe');
  var current = null;
  var busy = false;

  function routeFromHash(){
    var h = location.hash.replace(/^#\/?/, '');
    return ROUTES.indexOf(h) > -1 ? h : 'home';
  }
  function setView(r){
    document.querySelectorAll('.view').forEach(function(v){
      v.classList.toggle('active', v.dataset.route === r);
    });
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

