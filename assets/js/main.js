/* Athoneli — site behaviour: header, mobile menu, works, single work, lightbox, contact form. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var WORKS = window.ATHONELI_WORKS || [];
  var CONTACT_EMAIL = 'athoneliart@gmail.com';

  var CATEGORIES = [
    ['all', 'All'],
    ['sculpture', 'Sculpture'],
    ['capitals', 'Capitals & reliefs'],
    ['figures', 'Portraits & figures'],
    ['paper', 'Works on paper']
  ];

  root.classList.add('js-reveal');

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = doc.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value === null || value === undefined || value === false) return;
        if (key === 'text') node.textContent = value;
        else if (key === 'class') node.className = value;
        else if (key === 'html') node.innerHTML = value;
        else node.setAttribute(key, value === true ? '' : String(value));
      });
    }
    (children || []).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === 'string' ? doc.createTextNode(child) : child);
    });
    return node;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function numLabel(i) { return 'Nº ' + pad(i + 1); }
  function catLabel(c) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i][0] === c) return CATEGORIES[i][1];
    return '';
  }
  function metaLine(w) { return [w.year, w.material].filter(Boolean).join(' · '); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ratio(img, lo, hi) { return img && img.w && img.h ? clamp(img.w / img.h, lo, hi).toFixed(3) : null; }

  function imgPath(w, img, small) {
    return 'assets/img/works/' + w.slug + '/' + img.f + (small ? '-sm' : '') + '.jpg';
  }

  function picture(w, img, opts) {
    opts = opts || {};
    var full = imgPath(w, img, false);
    var hasSmall = img.sw && img.w && img.sw < img.w;
    var attrs = {
      src: opts.small && hasSmall ? imgPath(w, img, true) : full,
      alt: opts.alt !== undefined ? opts.alt : w.title + (w.material ? ', ' + w.material : '') + ' — Irakli Athoneli',
      width: img.w || null,
      height: img.h || null,
      loading: opts.eager ? 'eager' : 'lazy',
      decoding: 'async'
    };
    if (hasSmall) {
      attrs.srcset = imgPath(w, img, true) + ' ' + img.sw + 'w, ' + full + ' ' + img.w + 'w';
      attrs.sizes = opts.sizes || '100vw';
    }
    return el('img', attrs);
  }

  function findWork(slug) {
    for (var i = 0; i < WORKS.length; i++) if (WORKS[i].slug === slug) return i;
    return -1;
  }

  function workUrl(w) { return 'work.html?w=' + encodeURIComponent(w.slug); }

  function card(w, index, opts) {
    opts = opts || {};
    var cover = w.images && w.images[0];
    var frame = el('div', { class: 'frame', style: cover ? '--ar: ' + ratio(cover, opts.lo || .62, opts.hi || 1.6) : null }, [
      cover ? picture(w, cover, { sizes: opts.sizes || '(max-width: 560px) 50vw, (max-width: 1100px) 45vw, 420px' }) : null
    ]);
    return el('a', { class: 'card' + (opts.animate ? ' card-in' : ''), href: workUrl(w), style: opts.delay ? 'animation-delay: ' + opts.delay + 'ms' : null, 'data-reveal': opts.reveal ? true : null }, [
      frame,
      el('span', { class: 'card__cap' }, [
        el('span', { class: 'card__title', text: w.title }),
        el('span', { class: 'card__no', text: numLabel(index) }),
        el('span', { class: 'card__meta', text: metaLine(w) })
      ])
    ]);
  }

  /* ---------- Header + menu ---------- */
  function initHeader() {
    var header = $('.site-header');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('is-solid', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initMenu() {
    var btn = $('.menu-btn');
    var menu = $('#mobile-menu');
    if (!btn || !menu) return;
    var label = $('.menu-btn__label', btn);
    menu.setAttribute('inert', '');
    function set(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Close' : 'Menu';
      root.classList.toggle('menu-open', open);
      if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { set(false); btn.focus(); } });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (m) { if (m.matches) set(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  var observer = null;
  function reveal(scope) {
    var items = $$('[data-reveal]:not(.is-in)', scope);
    if (!('IntersectionObserver' in window)) { items.forEach(function (n) { n.classList.add('is-in'); }); return; }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .06 });
    }
    items.forEach(function (n) { observer.observe(n); });
  }

  /* ---------- Home ---------- */
  function renderLatest() {
    var box = $('#latest-rooms');
    if (!box) return;
    var latest = WORKS.filter(function (w) { return w.latest; });
    latest.forEach(function (w, k) {
      var cover = w.images[0];
      box.appendChild(el('article', { class: 'room', 'data-reveal': true }, [
        el('a', { class: 'room__media spot', href: workUrl(w), tabindex: '-1', 'aria-hidden': 'true' }, [
          el('span', { style: '--ar: ' + ratio(cover, .78, 1.34), class: 'room__img frame' }, [
            picture(w, cover, { sizes: '(max-width: 900px) 100vw, 58vw', alt: '' })
          ])
        ]),
        el('div', { class: 'room__text' }, [
          el('span', { class: 'room__index', text: pad(k + 1) + ' / ' + pad(latest.length) }),
          el('h3', { class: 'h3' }, [el('a', { href: workUrl(w), text: w.title, style: 'text-decoration: none' })]),
          el('div', { class: 'room__meta label' }, [w.year ? el('span', { text: w.year }) : null, el('span', { text: w.material })]),
          w.text ? el('p', { text: w.text }) : null,
          el('a', { class: 'arrow-link', href: workUrl(w) }, ['View the work', el('span', { class: 'arr', 'aria-hidden': 'true' })])
        ])
      ]));
    });
  }

  function renderCollection() {
    var grid = $('#home-collection');
    if (!grid) return;
    var picks = (grid.getAttribute('data-picks') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    picks.forEach(function (slug) {
      var i = findWork(slug);
      if (i >= 0) grid.appendChild(card(WORKS[i], i, { reveal: true, lo: .7, hi: 1.25, sizes: '(max-width: 900px) 92vw, 40vw' }));
    });
  }

  function fillCounts() {
    $$('[data-works-count]').forEach(function (n) { n.textContent = String(WORKS.length); });
  }

  /* ---------- Works page ---------- */
  function renderWorks() {
    var grid = $('#gallery');
    var bar = $('#filters');
    if (!grid || !bar) return;

    var current = (location.hash || '').slice(1);
    if (!CATEGORIES.some(function (c) { return c[0] === current; })) current = 'all';

    var buttons = CATEGORIES.filter(function (c) {
      return c[0] === 'all' || WORKS.some(function (w) { return w.category === c[0]; });
    }).map(function (c) {
      var n = c[0] === 'all' ? WORKS.length : WORKS.filter(function (w) { return w.category === c[0]; }).length;
      var b = el('button', { type: 'button', class: 'filter', 'data-cat': c[0], 'aria-pressed': 'false' }, [
        c[1], el('span', { class: 'count', text: String(n) })
      ]);
      b.addEventListener('click', function () {
        current = c[0];
        history.replaceState(null, '', current === 'all' ? location.pathname + location.search : '#' + current);
        draw();
      });
      bar.appendChild(b);
      return b;
    });

    function columnCount() { return window.innerWidth > 1000 ? 3 : 2; }
    var cols = columnCount();

    /* Masonry: each card goes into the shortest column, so the order still reads left to right. */
    function draw(animate) {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === current ? 'true' : 'false'); });
      grid.innerHTML = '';
      var columns = [], heights = [];
      for (var c = 0; c < cols; c++) { columns.push(grid.appendChild(el('div', { class: 'gallery__col' }))); heights.push(0); }
      var shown = 0;
      WORKS.forEach(function (w, i) {
        if (current !== 'all' && w.category !== current) return;
        var cover = w.images && w.images[0];
        var r = cover ? Number(ratio(cover, .62, 1.6)) : 1;
        var k = heights.indexOf(Math.min.apply(null, heights));
        columns[k].appendChild(card(w, i, { animate: animate !== false, delay: Math.min(shown * 60, 540), lo: .62, hi: 1.6 }));
        heights[k] += 1 / r + .32;
        shown++;
      });
      if (!shown) { grid.innerHTML = ''; grid.appendChild(el('p', { class: 'gallery-empty', text: 'No works in this category yet.' })); }
      var active = buttons.filter(function (b) { return b.getAttribute('data-cat') === current; })[0];
      if (active && bar.scrollWidth > bar.clientWidth) bar.scrollLeft = Math.max(0, active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2);
    }
    draw();
    window.addEventListener('resize', function () {
      var n = columnCount();
      if (n !== cols) { cols = n; draw(false); }
    });
  }

  /* ---------- Single work ---------- */
  function renderWork() {
    var mount = $('#work-root');
    if (!mount) return;
    var slug = new URLSearchParams(location.search).get('w');
    var index = findWork(slug);
    if (index < 0 && !slug && WORKS.length) index = 0;
    if (index < 0) {
      mount.appendChild(el('div', { class: 'notfound-work' }, [
        el('p', { class: 'label label--lamp', text: 'Not found' }),
        el('h1', { class: 'h2', html: 'This work is <em>not here.</em>' }),
        el('a', { class: 'btn', href: 'works.html', text: 'See all works' })
      ]));
      return;
    }

    var w = WORKS[index];
    var imgs = w.images || [];
    var current = 0;

    doc.title = w.title + ' — Irakli Athoneli, sculptor';
    var desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', (w.text || (w.title + (metaLine(w) ? ', ' + metaLine(w) : '') + '. A work by Irakli Athoneli, sculptor in Athens.')).slice(0, 300));

    /* crumbs */
    var crumbs = el('nav', { class: 'crumbs label', 'aria-label': 'Breadcrumb' }, [
      el('a', { href: 'works.html', text: 'Works' }),
      el('span', { 'aria-hidden': 'true', text: '/' }),
      el('a', { href: 'works.html#' + w.category, text: catLabel(w.category) }),
      el('span', { 'aria-hidden': 'true', text: '/' }),
      el('span', { 'aria-current': 'page', text: w.title })
    ]);

    /* stage */
    var stageBtn = el('button', { type: 'button', class: 'stage__btn', 'aria-label': 'Open the image full screen' });
    var count = el('span', { class: 'stage__count', 'aria-hidden': 'true' });
    var thumbs = el('div', { class: 'thumbs', role: 'group', 'aria-label': 'Views of this work' });

    function showImage(k) {
      current = k;
      var img = imgs[k];
      stageBtn.innerHTML = '';
      stageBtn.appendChild(el('span', { class: 'frame spot' }, [picture(w, img, { eager: k === 0, sizes: '(max-width: 960px) 100vw, 60vw' })]));
      count.textContent = imgs.length > 1 ? pad(k + 1) + ' / ' + pad(imgs.length) : '';
      $$('.thumb', thumbs).forEach(function (t, j) { t.setAttribute('aria-current', j === k ? 'true' : 'false'); });
    }
    if (imgs.length > 1) {
      imgs.forEach(function (img, k) {
        var t = el('button', { type: 'button', class: 'thumb', 'aria-label': 'View ' + (k + 1) + ' of ' + imgs.length }, [
          el('img', { src: imgPath(w, img, img.sw && img.sw < img.w), alt: '', loading: 'lazy', decoding: 'async', width: 76, height: 76 })
        ]);
        t.addEventListener('click', function () { showImage(k); });
        thumbs.appendChild(t);
      });
    }
    stageBtn.addEventListener('click', function () {
      openViewer(imgs.map(function (img) { return { src: imgPath(w, img, false), alt: w.title }; }), current, w.title);
    });
    showImage(0);

    /* placard */
    var rows = [['Year', w.year], ['Material', w.material], ['Dimensions', w.size], ['Place', w.place], ['Category', catLabel(w.category)]]
      .filter(function (r) { return r[1]; });
    var dl = el('dl');
    rows.forEach(function (r) {
      dl.appendChild(el('dt', { class: 'label', text: r[0] }));
      dl.appendChild(el('dd', { text: r[1] }));
    });

    var placard = el('div', { class: 'placard' }, [
      el('p', { class: 'label label--lamp', text: numLabel(index) + ' · ' + catLabel(w.category) }),
      el('h1', { text: w.title }),
      el('p', { class: 'placard__artist', text: 'Irakli Athoneli' }),
      w.text ? el('p', { class: 'placard__text', text: w.text }) : null,
      dl,
      w.note ? el('p', { class: 'placard__note' }, [el('span', { 'aria-hidden': 'true', text: '✦' }), el('span', { text: w.note })]) : null,
      el('div', { class: 'placard__actions' }, [
        el('a', { class: 'btn btn--solid', href: 'contact.html?w=' + encodeURIComponent(w.slug), text: 'Enquire about this work' }),
        el('a', { class: 'arrow-link', href: 'works.html' }, ['All works', el('span', { class: 'arr', 'aria-hidden': 'true' })])
      ])
    ]);

    var stage = el('div', { class: 'stage' }, [el('div', { class: 'stage__view' }, [stageBtn, count]), thumbs]);
    mount.appendChild(crumbs);
    mount.appendChild(el('div', { class: 'work__grid' }, [stage, placard]));

    /* pager */
    var pager = $('#pager');
    if (pager && WORKS.length > 1) {
      var prev = WORKS[(index - 1 + WORKS.length) % WORKS.length];
      var next = WORKS[(index + 1) % WORKS.length];
      [[prev, 'Previous', 'prev'], [next, 'Next', 'next']].forEach(function (item) {
        var p = item[0];
        pager.appendChild(el('a', { class: item[2], href: workUrl(p) }, [
          el('span', { class: 'frame' }, [p.images[0] ? picture(p, p.images[0], { small: true, sizes: '96px', alt: '' }) : null]),
          el('span', {}, [el('span', { class: 'label', text: item[1] }), el('span', { class: 'serif', text: p.title })])
        ]));
      });
    }

    doc.addEventListener('keydown', function (e) {
      if (viewer && viewer.open) return;
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (imgs.length < 2) return;
      if (e.key === 'ArrowRight') showImage((current + 1) % imgs.length);
      if (e.key === 'ArrowLeft') showImage((current - 1 + imgs.length) % imgs.length);
    });
  }

  /* ---------- Lightbox ---------- */
  var viewer = null;
  function openViewer(list, start, title) {
    if (!list.length) return;
    if (!viewer) viewer = buildViewer();
    viewer._list = list;
    viewer._title.textContent = title || '';
    viewer._show(start || 0);
    if (typeof viewer.showModal === 'function') viewer.showModal(); else viewer.setAttribute('open', '');
    root.classList.add('no-scroll');
  }

  function buildViewer() {
    var d = el('dialog', { class: 'lightbox', 'aria-label': 'Image viewer' });
    var title = el('p', { class: 'lightbox__title' });
    var close = el('button', { type: 'button', class: 'lightbox__close' }, [el('span', { text: 'Close' }), el('span', { 'aria-hidden': 'true' })]);
    var stage = el('div', { class: 'lightbox__stage' });
    var img = el('img', { alt: '' });
    var prev = el('button', { type: 'button', class: 'lightbox__nav lightbox__nav--prev', 'aria-label': 'Previous image' }, [el('span')]);
    var next = el('button', { type: 'button', class: 'lightbox__nav lightbox__nav--next', 'aria-label': 'Next image' }, [el('span')]);
    var count = el('p', { class: 'lightbox__count', 'aria-live': 'polite' });
    var hint = el('p', { class: 'lightbox__hint', text: 'Use the arrow keys or swipe' });
    stage.appendChild(img); stage.appendChild(prev); stage.appendChild(next);
    d.appendChild(el('div', { class: 'lightbox__top' }, [title, close]));
    d.appendChild(stage);
    d.appendChild(el('div', { class: 'lightbox__bottom' }, [count, hint]));
    doc.body.appendChild(d);

    var i = 0;
    d._title = title;
    d._show = function (k) {
      var list = d._list;
      i = (k + list.length) % list.length;
      img.src = list[i].src;
      img.alt = list[i].alt || '';
      count.textContent = list.length > 1 ? pad(i + 1) + ' / ' + pad(list.length) : '';
      prev.hidden = next.hidden = list.length < 2;
      hint.hidden = list.length < 2;
    };
    function shut() { if (d.open && typeof d.close === 'function') d.close(); else d.removeAttribute('open'); }
    d.addEventListener('close', function () { root.classList.remove('no-scroll'); });
    close.addEventListener('click', shut);
    prev.addEventListener('click', function () { d._show(i - 1); });
    next.addEventListener('click', function () { d._show(i + 1); });
    stage.addEventListener('click', function (e) { if (e.target === stage) shut(); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') d._show(i + 1);
      if (e.key === 'ArrowLeft') d._show(i - 1);
    });
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) d._show(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    return d;
  }

  /* ---------- Contact ---------- */
  function initContact() {
    var form = $('#enquiry');
    if (!form) return;
    var slug = new URLSearchParams(location.search).get('w');
    var k = slug ? findWork(slug) : -1;
    if (k >= 0) {
      var w = WORKS[k];
      var type = $('#f-type');
      var msg = $('#f-message');
      if (type) type.value = 'An existing work';
      if (msg && !msg.value) msg.value = 'I am interested in “' + w.title + '”' + (w.year ? ' (' + w.year + ')' : '') + '.\n\n';
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var name = $('#f-name').value.trim();
      var email = $('#f-email').value.trim();
      var type = $('#f-type').value;
      var message = $('#f-message').value.trim();
      var subject = 'Enquiry: ' + type + (name ? ' — ' + name : '');
      var body = message + '\n\n—\n' + name + (email ? '\n' + email : '');
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var status = $('#form-status');
      if (status) status.textContent = 'Your email app should open with the message ready to send. If it does not, write to ' + CONTACT_EMAIL + '.';
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initHeader();
    initMenu();
    renderLatest();
    renderCollection();
    renderWorks();
    renderWork();
    fillCounts();
    initContact();
    $$('[data-year]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
    reveal(doc);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();
