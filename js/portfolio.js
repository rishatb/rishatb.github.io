/* =====================================================================
   ПОРТФОЛИО — редактируйте только этот блок.
   Чтобы добавить проект, скопируйте объект в массив PROJECTS и заполните:
     title  — название проекта
     cat    — категория (ключ из CATS)
     year   — год
     role   — ваша роль
     tools  — программы / методы
     desc   — короткое описание (на карточке)
     details— подробное описание (в окне проекта), можно не заполнять
     img    — путь к картинке, например 'img/reducer.jpg' (пусто = чертёж-заглушка)
     draw   — вид заглушки: 'flange' | 'shaft' | 'frame' | 'bracket'
     soon   — true, если проект ещё готовится (метка «В работе»)
   ===================================================================== */
const CATS = { all: 'Все', equip: 'Оборудование', tool: 'Оснастка', calc: 'Расчёты МКЭ', study: 'Учебные проекты' };

const PROJECTS = [
  { title: 'Изостатическое оборудование под заказ', cat: 'equip', year: '2025', role: 'Инженер-конструктор',
    tools: ['Autodesk Inventor', 'КОМПАС-3D', 'ЕСКД'], desc: 'Проектирование под требования заказчика, 3D-модель и полный комплект КД.',
    details: 'Описание появится позже: задача, ограничения, принятые решения и результат.', img: '', draw: 'flange', soon: true },
  { title: 'Оснастка и инструмент для авиационного производства', cat: 'tool', year: '2026', role: 'Инженер-конструктор',
    tools: ['КОМПАС-3D', 'ЕСКД'], desc: 'Проектирование оснастки, сборочные чертежи и спецификации.',
    details: '', img: '', draw: 'bracket', soon: true },
  { title: 'МКЭ-моделирование процесса прокатки', cat: 'calc', year: '2024', role: 'Инженер-исследователь',
    tools: ['МКЭ', '3D-моделирование'], desc: 'Расчёт процесса прокатки, анализ результатов, отчётная документация.',
    details: '', img: '', draw: 'shaft', soon: true },
  { title: 'Дипломный проект, МГТУ им. Н. Э. Баумана', cat: 'study', year: '2026', role: 'Автор',
    tools: ['КОМПАС-3D', 'Расчёты'], desc: 'Проектирование технологической машины: расчёты, модель, чертежи.',
    details: '', img: '', draw: 'frame', soon: true },
];
/* ===================================================================== */

(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PL = 'pathLength="1000"';

  const holesOn = (r, n, rr, cx = 100, cy = 75) => Array.from({ length: n }, (_, i) => {
    const a = i / n * Math.PI * 2;
    return `<circle class="dr" ${PL} cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="${rr}"/>`;
  }).join('');

  const DRAW = {
    flange: () => `<circle class="dr" ${PL} cx="100" cy="75" r="56"/><circle class="dr" ${PL} cx="100" cy="75" r="24"/><circle class="dr" ${PL} cx="100" cy="75" r="40" style="stroke-dasharray:6 3;opacity:.4"/>${holesOn(40, 6, 6)}
      <path class="ax" d="M30 75h140M100 5v140"/><path class="dm" d="M44 142h112M44 137v10M156 137v10"/><text x="88" y="138">Ø112</text>`,
    shaft: () => `<path class="dr" ${PL} d="M15 62h28v-10h44v-8h36v8h44v10h18v26h-18v10h-44v8h-36v-8h-44v-10h-28z"/>
      <path class="dr" ${PL} d="M98 40h22v6h-22z"/><path class="dr" ${PL} d="M43 52v46M87 44v62M123 44v62M167 52v46"/>
      <path class="ax" d="M5 75h190"/><path class="dm" d="M15 128h170M15 123v10M185 123v10"/><text x="88" y="124">L=170</text>`,
    frame: () => `<path class="dr" ${PL} d="M20 30h160v80h-160z"/><path class="dr" ${PL} d="M28 38h144v64h-144z"/>
      <path class="dr" ${PL} d="M28 38l48 64M76 38v64M76 38l48 64M124 38v64M124 38l48 64"/>
      <path class="ax" d="M10 70h180M100 20v100"/><path class="dm" d="M20 128h160M20 123v10M180 123v10"/><text x="86" y="124">1600</text>`,
    bracket: () => `<path class="dr" ${PL} d="M30 20h26v84h94v26h-120z"/><path class="dr" ${PL} d="M56 70q0 34 34 34" />
      <circle class="dr" ${PL} cx="43" cy="42" r="7"/><circle class="dr" ${PL} cx="43" cy="76" r="7"/><circle class="dr" ${PL} cx="110" cy="117" r="7"/><circle class="dr" ${PL} cx="136" cy="117" r="7"/>
      <path class="ax" d="M20 42h36M20 76h36M110 96v34M136 96v34"/><path class="dm" d="M30 142h120M30 137v10M150 137v10"/><text x="82" y="138">120</text>`,
  };
  const svg = (k) => `<svg class="dw" viewBox="0 0 200 150" aria-hidden="true">${(DRAW[k] || DRAW.flange)()}</svg>`;
  const media = (p) => p.img ? `<img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy">` : svg(p.draw);

  const grid = $('#grid'), filters = $('#filters');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map((p, i) => `
    <article class="proj reveal" data-cat="${esc(p.cat)}" style="--d:${(i % 3) * 0.08}s">
      <div class="proj-img">${media(p)}${p.soon ? '<span class="badge mono">В РАБОТЕ</span>' : ''}</div>
      <div class="proj-body">
        <div class="proj-meta mono"><span>${String(i + 1).padStart(2, '0')} / ${esc(CATS[p.cat] || '')}</span><span>${esc(p.year)}</span></div>
        <h3><button class="proj-open" data-i="${i}">${esc(p.title)}</button></h3>
        <p>${esc(p.desc)}</p>
        <div class="tags">${(p.tools || []).map((t) => `<span class="mono">${esc(t)}</span>`).join('')}</div>
      </div>
    </article>`).join('') + `
    <div class="proj cta reveal" data-cat="all">
      <span class="plus" aria-hidden="true">+</span>
      <p>Раздел пополняется. Часть работ под NDA — могу показать их на собеседовании.</p>
      <a class="btn btn-ghost btn-sm" href="index.html#contact" data-transition>Связаться</a>
    </div>`;

  /* Фильтры */
  const counts = PROJECTS.reduce((m, p) => (m[p.cat] = (m[p.cat] || 0) + 1, m), {});
  const keys = Object.keys(CATS).filter((k) => k === 'all' || counts[k]);
  filters.innerHTML = keys.map((k) => `<button class="chip" data-f="${k}" aria-pressed="${k === 'all'}">${esc(CATS[k])}<sup class="mono">${k === 'all' ? PROJECTS.length : counts[k]}</sup></button>`).join('');
  filters.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    filters.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    const f = b.dataset.f;
    grid.querySelectorAll('.proj').forEach((card) => {
      const show = f === 'all' || card.dataset.cat === f || card.dataset.cat === 'all';
      card.classList.toggle('hide', !show);
      card.classList.remove('pop');
      if (show) { void card.offsetWidth; card.classList.add('pop', 'in'); }
    });
  });

  /* Окно проекта */
  const modal = $('#modal'), box = $('.modal-box', modal), closeBtn = $('.modal-close', modal);
  let last = null;
  const open = (i) => {
    const p = PROJECTS[i];
    $('.modal-img', modal).innerHTML = media(p);
    $('.modal-body', modal).innerHTML = `
      <span class="mono" style="font-size:12px;color:var(--mute)">${String(i + 1).padStart(2, '0')} / ${esc(CATS[p.cat] || '')}${p.soon ? ' · В РАБОТЕ' : ''}</span>
      <h2 id="modal-title">${esc(p.title)}</h2>
      <p>${esc(p.details || p.desc)}</p>
      <dl class="mono"><dt>Год</dt><dd>${esc(p.year)}</dd><dt>Роль</dt><dd>${esc(p.role)}</dd><dt>Инструменты</dt><dd>${esc((p.tools || []).join(', '))}</dd></dl>`;
    last = document.activeElement;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    box.scrollTop = 0;
    setTimeout(() => closeBtn.focus(), 50);
  };
  const close = () => {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    last?.focus();
  };
  grid.addEventListener('click', (e) => { const b = e.target.closest('.proj-open'); if (b) open(+b.dataset.i); });
  closeBtn.addEventListener('click', close);
  $('.modal-bg', modal).addEventListener('click', close);
  addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
  });
})();
