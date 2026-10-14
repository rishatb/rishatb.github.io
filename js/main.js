(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const store = (k, v) => { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} };

  /* ---------- Тема (кнопка или клавиша T) ---------- */
  const tb = $('#theme');
  if (!root.dataset.theme) root.dataset.theme = 'light';
  if (tb) {
    const set = (t) => {
      root.dataset.theme = t;
      try { localStorage.setItem('theme', t); } catch (e) {}
      tb.setAttribute('aria-pressed', String(t === 'dark'));
      document.dispatchEvent(new Event('themechange'));
    };
    tb.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
    tb.addEventListener('click', () => set(root.dataset.theme === 'dark' ? 'light' : 'dark'));
    addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if ((k === 't' || k === 'е') && !e.metaKey && !e.ctrlKey && !e.altKey &&
          !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) tb.click();
    });
  }

  /* ---------- Разбивка заголовка на буквы ---------- */
  let offset = 0;
  $$('[data-split]').forEach((el) => {
    const t = el.textContent;
    el.textContent = '';
    [...t].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i + offset);
      s.textContent = c === ' ' ? '\u00a0' : c;
      el.appendChild(s);
    });
    offset += t.length;
  });
  $$('[data-stagger]').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--d', (i * 0.08) + 's')));

  /* ---------- Прелоадер ---------- */
  const loader = $('.loader');
  if (loader && !root.classList.contains('seen')) {
    const p = $('#ldp');
    let n = 0;
    const iv = setInterval(() => { n = Math.min(100, n + Math.ceil(Math.random() * 9)); p.textContent = n; if (n >= 100) clearInterval(iv); }, 40);
    const done = () => setTimeout(() => {
      clearInterval(iv); p.textContent = 100;
      loader.classList.add('done'); root.classList.add('ready'); store('loaded', '1');
    }, reduce ? 0 : 1500);
    document.readyState === 'complete' ? done() : addEventListener('load', done);
  } else {
    requestAnimationFrame(() => root.classList.add('ready'));
    store('loaded', '1');
  }

  /* ---------- Переход между страницами (шторка) ---------- */
  const sh = $('.shutter');
  if (sh) {
    if (root.classList.contains('from-trans')) {
      sh.classList.add('leave');
      requestAnimationFrame(() => root.classList.remove('from-trans'));
      store('trans', null);
    }
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-transition]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      const href = a.getAttribute('href');
      store('trans', '1');
      sh.classList.remove('leave');
      sh.classList.add('enter');
      setTimeout(() => { location.href = href; }, reduce ? 0 : 560);
    });
    addEventListener('pageshow', (e) => { if (e.persisted) sh.classList.remove('enter', 'leave'); });
  }

  /* ---------- Перекрестие, подсветка сетки, «магнитные» кнопки ---------- */
  if (fine && !reduce) {
    const cr = $('.cross'), cx = $('.cx'), cy = $('.cy'), co = $('.coord'), sp = $('.spot');
    let x = 0, y = 0, raf = 0;
    const pad = (v) => String(Math.max(0, Math.round(v))).padStart(4, '0');
    addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        cx.style.transform = `translateY(${y}px)`;
        cy.style.transform = `translateX(${x}px)`;
        co.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
        co.textContent = `X ${pad(x)}  Y ${pad(y + scrollY)}`;
        sp.style.setProperty('--mx', x + 'px');
        sp.style.setProperty('--my', y + 'px');
      });
      cr.classList.add('on'); sp.classList.add('on');
    }, { passive: true });
    root.addEventListener('mouseleave', () => { cr.classList.remove('on'); sp.classList.remove('on'); });

    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- Скролл: прогресс, шапка, линия опыта ---------- */
  const prog = $('.progress'), nav = $('.nav'), tl = $('.tl'), fill = $('.tl-fill');
  const onScroll = () => {
    const h = root.scrollHeight - innerHeight;
    if (prog) prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    if (nav) nav.classList.toggle('solid', scrollY > 20);
    if (tl && fill) {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      fill.style.height = (p * (r.height - 16)) + 'px';
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Появление при прокрутке ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- Счётчики ---------- */
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = reduce ? 0 : 1600;
    const step = (t) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1;
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))).toLocaleString('ru-RU') + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => { el.textContent = '0' + (el.dataset.suffix || ''); cio.observe(el); });

  /* ---------- Активный пункт меню ---------- */
  const links = $$('.links a[href^="#"]');
  if (links.length) {
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const sio = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { links.forEach((a) => a.classList.remove('active')); map.get(e.target.id)?.classList.add('active'); }
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((a, id) => { const s = document.getElementById(id); if (s) sio.observe(s); });
  }

  /* ---------- Печатающийся текст ---------- */
  const ty = $('#typed');
  if (ty) {
    const words = JSON.parse(ty.dataset.words);
    if (reduce) ty.textContent = words[0];
    else {
      let wi = 0, ci = 0, del = false;
      const tick = () => {
        const w = words[wi];
        ty.textContent = w.slice(0, ci);
        if (!del && ci < w.length) { ci++; setTimeout(tick, 70); }
        else if (!del) { del = true; setTimeout(tick, 1700); }
        else if (ci > 0) { ci--; setTimeout(tick, 32); }
        else { del = false; wi = (wi + 1) % words.length; setTimeout(tick, 300); }
      };
      setTimeout(tick, 1200);
    }
  }

  /* ---------- Уведомления, копирование, печать, год ---------- */
  const toast = $('.toast');
  let tt;
  window.say = (m) => {
    if (!toast) return;
    toast.textContent = m; toast.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const v = b.dataset.copy;
    try { await navigator.clipboard.writeText(v); window.say('Скопировано: ' + v); }
    catch (e) { location.href = 'mailto:' + v; }
  }));
  $('#print')?.addEventListener('click', () => window.print());
  $$('[data-year]').forEach((e) => { e.textContent = new Date().getFullYear(); });

  /* ---------- 3D-шестерня (каркас) на canvas ---------- */
  const cv = $('#gear');
  if (cv && cv.getContext) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, col = '#000';
    const readCol = () => { col = getComputedStyle(root).getPropertyValue('--fg').trim() || '#000'; };
    readCol();

    const TAU = Math.PI * 2, N = 14, RO = 1, RR = 0.84, HZ = 0.18, HZ2 = 0.3;
    const ring = (r, n, cx = 0, cy = 0) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(i / n * TAU), cy + r * Math.sin(i / n * TAU)]);
    const prof = [];
    for (let i = 0; i < N; i++) {
      const a = i / N * TAU, s = TAU / N;
      [[RR, 0], [RO, 0.2], [RO, 0.45], [RR, 0.65]].forEach(([r, f]) => prof.push([r * Math.cos(a + s * f), r * Math.sin(a + s * f)]));
    }
    const bore = ring(0.17, 40), hub = ring(0.36, 48);
    const holes = Array.from({ length: 5 }, (_, k) => { const a = k / 5 * TAU + 0.3; return ring(0.1, 24, 0.6 * Math.cos(a), 0.6 * Math.sin(a)); });

    let spin = 0, rx = -0.55, ry = 0.35, ox = 0, oy = 0, vox = 0, voy = 0, drag = null, mx = 0.5, my = 0.5;
    const P = (x, y, z, sp = spin) => {
      let c = Math.cos(sp), s = Math.sin(sp);
      const X = x * c - y * s, Y = x * s + y * c;
      c = Math.cos(rx); s = Math.sin(rx);
      const y2 = Y * c - z * s, z2 = Y * s + z * c;
      c = Math.cos(ry); s = Math.sin(ry);
      const x2 = X * c + z2 * s, z3 = -X * s + z2 * c;
      const f = 3.4 / (3.4 + z3), k = Math.min(W, H) * 0.34;
      return [W / 2 + x2 * k * f, H / 2 + y2 * k * f];
    };
    const poly = (pts, z) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => { const [a, b] = P(x, y, z); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); });
      ctx.closePath(); ctx.stroke();
    };
    const edges = (pts, z1, z2, step = 1) => {
      ctx.beginPath();
      for (let i = 0; i < pts.length; i += step) {
        const [x, y] = pts[i], [a, b] = P(x, y, z1), [c, d] = P(x, y, z2);
        ctx.moveTo(a, b); ctx.lineTo(c, d);
      }
      ctx.stroke();
    };
    const axis = (p, q) => {
      const [a, b] = P(p[0], p[1], p[2], 0), [c, d] = P(q[0], q[1], q[2], 0);
      ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke();
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.3;
      poly(prof, -HZ); holes.forEach((h) => poly(h, -HZ)); poly(hub, -HZ2); poly(bore, -HZ2);
      ctx.globalAlpha = 0.45;
      edges(prof, HZ, -HZ); edges(hub, HZ2, -HZ2, 6); edges(bore, HZ2, -HZ2, 5);
      holes.forEach((h) => edges(h, HZ, -HZ, 6));
      ctx.globalAlpha = 1;
      poly(prof, HZ); holes.forEach((h) => poly(h, HZ)); poly(hub, HZ2); poly(hub, HZ); poly(bore, HZ2);
      ctx.globalAlpha = 0.55; ctx.setLineDash([12, 4, 2, 4]);
      axis([0, 0, -0.9], [0, 0, 0.9]); axis([-1.25, 0, 0], [1.25, 0, 0]); axis([0, -1.25, 0], [0, 1.25, 0]);
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    };
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * d); cv.height = Math.round(H * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      draw();
    };
    new ResizeObserver(size).observe(cv);
    document.addEventListener('themechange', () => { readCol(); draw(); });

    addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; }, { passive: true });
    cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
    cv.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      vox = -dy * 0.008; voy = dx * 0.008; ox += vox; oy += voy;
      if (reduce) { rx = -0.55 + ox; ry = 0.35 + oy; draw(); }
    });
    const up = () => { drag = null; cv.style.cursor = ''; };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);

    if (!reduce) {
      let vis = true, raf = 0;
      const tick = () => {
        raf = 0;
        spin += 0.004;
        if (!drag) { ox += vox; oy += voy; vox *= 0.94; voy *= 0.94; }
        ox = Math.max(-1.3, Math.min(1.3, ox));
        rx += ((-0.55 + (my - 0.5) * 0.4 + ox) - rx) * 0.08;
        ry += ((0.35 + (mx - 0.5) * 0.6 + oy) - ry) * 0.08;
        draw();
        if (vis) raf = requestAnimationFrame(tick);
      };
      new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(tick); }).observe(cv);
    }
  }
})();
