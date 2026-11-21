// @ts-nocheck
import { AfterViewInit, Component, ViewEncapsulation, inject } from '@angular/core';
import { PageDataService } from '../../../core/page-data.service';

@Component({
  selector: 'app-calculadora-legacy',
  standalone: true,
  templateUrl: './calculadora.component.html',
  styleUrl: './calculadora.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CalculadoraLegacyComponent implements AfterViewInit {
  private readonly pageData = inject(PageDataService);

  async ngAfterViewInit(): Promise<void> {
    try {
      /* Lógica original de index.html */

/* ==========================================================================
   Calculadora de puntos · Concurso de traslados docentes Euskadi 2025/2026
   Baremo: Anexo I de la Orden de 13 de noviembre de 2025 (BOPV n.º 243)
   ========================================================================== */

(() => {
  'use strict';

  const STORAGE_KEY = 'calc-puntos-euskadi-2526';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (id) => document.getElementById(id);

  const nf = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  });
  const fmt = (v) => nf.format(Math.round((Number(v) || 0) * 10000) / 10000);

  /* ------------------------------------------------------------------ */
  /* Utilidades de lectura y pintado                                     */
  /* ------------------------------------------------------------------ */

  function valueOf(node) {
    if (!node) return 0;
    const raw = parseFloat(String(node.value).replace(',', '.'));
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
  }

  const nv = (id) => valueOf(el(id));

  function setOut(id, value) {
    const node = el(id);
    if (!node) return value;
    node.textContent = fmt(value);
    node.classList.toggle('zero', Math.abs(value) < 0.00005);
    if (node.dataset.last !== undefined && node.dataset.last !== String(value)) {
      node.classList.remove('bump');
      void node.offsetWidth;
      node.classList.add('bump');
    }
    node.dataset.last = String(value);
    return value;
  }

  const monthsOf = (prefix) => nv(prefix + '-y') * 12 + nv(prefix + '-m');

  /** Años completos a la tarifa anual + meses sueltos a la tarifa mensual. */
  function periodPoints(prefix, yearly, monthly) {
    const total = monthsOf(prefix);
    return Math.floor(total / 12) * yearly + (total % 12) * monthly;
  }

  /** 1.1.1: 4 pts/año (1.º y 2.º), 6 el 3.º, 8 del 4.º en adelante. */
  function centerPoints(prefix) {
    const total = monthsOf(prefix);
    const years = Math.floor(total / 12);
    const rest = total % 12;
    let points = Math.min(years, 2) * 4;
    if (years >= 3) points += 6;
    if (years >= 4) points += (years - 3) * 8;
    const rate = years < 2 ? 0.3333 : years === 2 ? 0.5000 : 0.6666;
    return points + rest * rate;
  }

  /* ------------------------------------------------------------------ */
  /* Idiomas (3.3 y 3.4)                                                 */
  /* ------------------------------------------------------------------ */

  const LEVEL_POINTS = { B1: 1, B2: 2, C1: 3, C2: 4 };
  const DIG_POINTS = { A1: 0.5, A2: 1, B1: 1.5, B2: 2, C1: 2.5, C2: 3 };

  const SPANISH_NAMES = new Set(['espanol', 'castellano', 'spanish']);
  const langKey = (value) => String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function collectLang(selector) {
    const out = [];
    $$(selector + ' .lang-row').forEach((row) => {
      const name = ($('.lang-name', row).value || '').trim();
      const key = langKey(name);
      const level = $('.lang-level', row).value;
      if (!name || !LEVEL_POINTS[level] || SPANISH_NAMES.has(key)) return;
      out.push({ name: key, level, points: LEVEL_POINTS[level] });
    });
    return out;
  }

  function languagePoints() {
    const best = new Map();
    collectLang('#idiomas-rows').forEach((e) => {
      const current = best.get(e.name);
      if (!current || e.points > current.points) best.set(e.name, e);
    });
    let total = 0;
    best.forEach((e) => { total += e.points; });
    return total;
  }

  function languageSplit() {
    const best = new Map();
    const add = (selector, origin) => {
      collectLang(selector).forEach((e) => {
        const current = best.get(e.name);
        if (!current || e.points > current.points || (e.points === current.points && origin === 'eoi' && current.origin !== 'eoi')) {
          best.set(e.name, { ...e, origin });
        }
      });
    };
    add('#idiomas-rows', 'eoi');
    add('#idiomas-ext-rows', 'ext');
    let eoi = 0;
    let ext = 0;
    best.forEach((e) => {
      if (e.origin === 'eoi') eoi += e.points;
      else ext += e.points;
    });
    return { eoi, ext };
  }

  function updateLangRows(v26) {
    const best = new Map();
    const meta = new Map();
    const consider = (selector, origin) => {
      $$(selector + ' .lang-row').forEach((row) => {
        const name = langKey($('.lang-name', row).value);
        const level = $('.lang-level', row).value;
        meta.set(row, { name, origin });
        if (!name || !LEVEL_POINTS[level] || SPANISH_NAMES.has(name)) return;
        const points = LEVEL_POINTS[level];
        const current = best.get(name);
        if (!current || points > current.points || (v26 && points === current.points && origin === 'eoi' && current.origin !== 'eoi')) {
          best.set(name, { level, origin, points });
        }
      });
    };
    consider('#idiomas-rows', 'eoi');
    if (v26) consider('#idiomas-ext-rows', 'ext');

    const used = new Set();
    $$('.lang-row').forEach((row) => {
      const m = meta.get(row) || { name: '', origin: '' };
      const level = $('.lang-level', row).value;
      const chosen = best.get(m.name);
      let value = 0;
      if (chosen && chosen.level === level && chosen.origin === m.origin) {
        const key = m.name + '|' + level + '|' + m.origin;
        if (!used.has(key)) {
          value = chosen.points;
          used.add(key);
        }
      }
      $('.row-value', row).textContent = fmt(value);
      row.classList.toggle('muted', value === 0 && Boolean(level));
    });
  }

  function makeLangRow(data = {}, placeholder = 'Idioma (p. ej. inglés)') {
    const row = document.createElement('div');
    row.className = 'row-item lang-row';
    row.innerHTML = `
      <input type="text" class="lang-name" placeholder="${placeholder}" aria-label="Idioma" list="idiomas-list" autocomplete="off">
      <select class="lang-level" aria-label="Nivel de idioma">
        <option value="">Nivel</option>
        <option value="B1">B1 · 1 pt</option>
        <option value="B2">B2 · 2 pts</option>
        <option value="C1">C1 · 3 pts</option>
        <option value="C2">C2 · 4 pts</option>
      </select>
      <span class="row-value">0,0000</span>
      <button type="button" class="icon-btn" data-remove aria-label="Quitar idioma" title="Quitar idioma">×</button>`;
    $('.lang-name', row).value = data.name || '';
    $('.lang-level', row).value = data.level || '';
    return row;
  }

  function addLangRow(data = {}) {
    const row = makeLangRow(data);
    $('#idiomas-rows').appendChild(row);
    return row;
  }

  function addExtLangRow(data = {}) {
    const row = makeLangRow(data, 'Idioma extranjero');
    $('#idiomas-ext-rows').appendChild(row);
    return row;
  }

  /* ------------------------------------------------------------------ */
  /* Publicaciones (6.1)                                                 */
  /* ------------------------------------------------------------------ */

  const PUB_POINTS = {
    libro:   { 1: 1.0000, 2: 0.5000, 3: 0.4000, 4: 0.3000, 5: 0.2000, 6: 0.1000 },
    revista: { 1: 0.2000, 2: 0.1000, 3: 0.0500, 4: 0.0500, 5: 0.0500, 6: 0.0500 }
  };

  function pubRowPoints(row) {
    const type = $('.pub-type', row).value;
    const authors = $('.pub-authors', row).value;
    return (PUB_POINTS[type] && PUB_POINTS[type][authors]) || 0;
  }

  function publicationsPoints() {
    return $$('#pubs-rows .pub-row').reduce((acc, row) => acc + pubRowPoints(row), 0);
  }

  function addPubRow(data = {}) {
    const row = document.createElement('div');
    row.className = 'row-item pub-row';
    row.innerHTML = `
      <input type="text" class="pub-title" placeholder="Título (opcional)" aria-label="Título de la publicación" autocomplete="off">
      <select class="pub-type" aria-label="Tipo de publicación">
        <option value="libro">Libro</option>
        <option value="revista">Revista</option>
      </select>
      <select class="pub-authors" aria-label="Número de autores">
        <option value="">Autores/as</option>
        <option value="1">1 autor/a</option>
        <option value="2">2 autores/as</option>
        <option value="3">3 autores/as</option>
        <option value="4">4 autores/as</option>
        <option value="5">5 autores/as</option>
        <option value="6">Más de 5</option>
      </select>
      <span class="row-value">0,0000</span>
      <button type="button" class="icon-btn" data-remove aria-label="Quitar publicación" title="Quitar publicación">×</button>`;
    $('.pub-title', row).value = data.title || '';
    $('.pub-type', row).value = data.type || 'libro';
    $('.pub-authors', row).value = data.authors || '';
    $('#pubs-rows').appendChild(row);
    return row;
  }

  function refreshPubRow(row) {
    $('.row-value', row).textContent = fmt(pubRowPoints(row));
  }

  /* ------------------------------------------------------------------ */
  /* 6.7 Euskera                                                         */
  /* ------------------------------------------------------------------ */

  const EUSKERA = {
    b2: { 'pl1-dif': 2 },
    c1: { 'pl1-dif': 3, 'pl1-ven': 2 },
    c2: { 'pl1-dif': 4, 'pl1-ven': 3, 'pl2-ven': 2 }
  };

  function euskeraPoints() {
    const plaza = el('perfil-plaza').value;
    const acred = el('perfil-acred').value;
    if (plaza === 'none' || !acred) return 0;
    return (EUSKERA[acred] && EUSKERA[acred][plaza]) || 0;
  }

  /* ------------------------------------------------------------------ */
  /* Composición visual del total                                        */
  /* ------------------------------------------------------------------ */

  const SEC_META = [
    ['1', 'Antigüedad', '#7a1738'],
    ['2', 'Catedráticos', '#6d28d9'],
    ['3', 'Académicos', '#1d4ed8'],
    ['4', 'Cargos', '#b45309'],
    ['5', 'Formación', '#be185d'],
    ['6', 'Otros', '#475569']
  ];

  function renderComp(sections, total) {
    const bar = el('comp-bar');
    const legend = el('comp-legend');
    const empty = el('comp-empty');
    if (!bar || !legend) return;

    bar.innerHTML = '';
    legend.innerHTML = '';

    SEC_META.forEach(([key, label, color]) => {
      const value = sections[key] || 0;
      const pct = total > 0 ? (value / total) * 100 : 0;

      if (pct > 0.05) {
        const segment = document.createElement('span');
        segment.style.width = pct + '%';
        segment.style.background = color;
        segment.title = label + ': ' + fmt(value) + ' (' + pct.toFixed(1) + '%)';
        bar.appendChild(segment);
      }

      const item = document.createElement('li');
      item.innerHTML = '<i style="background:' + color + '"></i><span>' + label + '</span><b>' + fmt(value) + '</b>';
      legend.appendChild(item);
    });

    empty.hidden = total > 0;
    legend.hidden = total <= 0;
  }

  /* ------------------------------------------------------------------ */
  /* Cálculo principal                                                   */
  /* ------------------------------------------------------------------ */

  const caps = [];

  function applyCap(label, raw, cap, section) {
    if (raw > cap + 1e-9) {
      caps.push({ label, raw, cap, section });
      return cap;
    }
    return raw;
  }

  function compute() {
    caps.length = 0;
    const v26 = document.body.dataset.version === '2627';

    /* ---- 1. Antigüedad ---- */
    const s111 = centerPoints('a111');
    const s112 = periodPoints('a112', 4, 0.3333);
    const s113 = periodPoints('a113', 4, 0.3333);
    const s121 = periodPoints('a121', 2, 0.1666);
    const s122 = periodPoints('a122', 1.5, 0.1250);
    const s123 = periodPoints('a123', 0.75, 0.0625);

    setOut('o-111', s111);
    setOut('o-112', s112);
    setOut('o-113', s113);
    setOut('o-121', s121);
    setOut('o-122', s122);
    setOut('o-123', s123);

    const sec1 = s111 + s112 + s113 + s121 + s122 + s123;

    /* ---- 2. Catedráticos/as ---- */
    const sec2 = el('catedratico').checked ? 5 : 0;
    setOut('o-catedratico', sec2);

    /* ---- 3. Méritos académicos ---- */
    const s311raw = (el('doc').checked ? 6 : 0)
      + nv('master') * 3
      + (el('dea').checked ? 2 : 0)
      + nv('premio') * 1;

    const s32 = nv('grado') * 5
      + nv('grado-parcial') * 2.5
      + nv('primer-ciclo') * 3
      + nv('segundo-ciclo') * 3;

    const lang = v26 ? languageSplit() : { eoi: languagePoints(), ext: 0 };
    updateLangRows(v26);

    const s33 = lang.eoi
      + nv('ts') * 2
      + nv('musica') * 2;

    setOut('o-doc', el('doc').checked ? 6 : 0);
    setOut('o-master', nv('master') * 3);
    setOut('o-dea', el('dea').checked ? 2 : 0);
    setOut('o-premio', nv('premio') * 1);
    setOut('o-grado', nv('grado') * 5 + nv('grado-parcial') * 2.5);
    setOut('o-primer-ciclo', nv('primer-ciclo') * 3);
    setOut('o-segundo-ciclo', nv('segundo-ciclo') * 3);
    setOut('o-ts', nv('ts') * 2);
    setOut('o-musica', nv('musica') * 2);
    setOut('o-31', applyCap('3.1 Doctorado y postgrados', s311raw, 10));
    setOut('o-32', s32);
    setOut('o-33', s33);

    const sec3raw = Math.min(s311raw, 10) + s32 + s33;
    setOut('o-3raw', sec3raw);
    const sec3 = applyCap('3. Méritos académicos', sec3raw, 10, 3);

    /* ---- 4. Cargos ---- */
    const s41 = periodPoints('d41', 4.5, 0.3750);
    const s42 = periodPoints('d42', 3, 0.2500);
    const s43 = applyCap('4.3 Coordinación y tutoría', periodPoints('d43', 1.5, 0.1250), 10);
    const s44a = v26 ? 0 : periodPoints('d44a', 2, 0.1667);
    const s44b = v26 ? 0 : periodPoints('d44b', 1.25, 0.1042);

    setOut('o-41', s41);
    setOut('o-42', s42);
    setOut('o-43', s43);
    setOut('o-44a', s44a);
    setOut('o-44b', s44b);

    const simultaneously = !v26 && el('simultaneos').checked;
    const sec4raw = simultaneously
      ? Math.max(s41, s42, s43, s44a, s44b)
      : s41 + s42 + s43 + s44a + s44b;
    if (simultaneously) {
      setOut('o-simultaneos', sec4raw);
    } else {
      const node = el('o-simultaneos');
      node.textContent = '—';
      node.classList.remove('zero');
    }
    const sec4 = applyCap('4. Cargos directivos', sec4raw, 30, 4);

    /* ---- 5. Formación ---- */
    const s51 = applyCap('5.1 Formación superada', Math.floor(nv('f51') / 10) * 0.1, 9);
    const s52 = applyCap('5.2 Formación impartida', Math.floor(nv('f52') / 3) * 0.1, 3);
    const s53 = applyCap('5.3 Nuevas especialidades', nv('f53') * 0.5, 1);
    const s54 = v26 ? (DIG_POINTS[el('dig').value] || 0) : 0;
    const s55 = v26 ? lang.ext : 0;

    setOut('o-51', s51);
    setOut('o-52', s52);
    setOut('o-53', s53);
    setOut('o-54', s54);
    setOut('o-55', s55);
    const sec5 = applyCap('5. Formación y perfeccionamiento', s51 + s52 + s53 + s54 + s55, 15, 5);

    /* ---- 6. Otros méritos ---- */
    let s61 = 0;
    $$('#pubs-rows .pub-row').forEach((row) => {
      const points = pubRowPoints(row);
      s61 += points;
      $('.row-value', row).textContent = fmt(points);
    });
    s61 = applyCap('6.1 Publicaciones', s61, 8);

    let s62 = 0;
    $$('input[data-factor]').forEach((input) => {
      const points = valueOf(input) * parseFloat(input.dataset.factor || '0');
      if (/^art-/.test(input.id)) return;
      s62 += points;
      setOut('o-' + input.id, points);
    });

    let s63 = 0;
    $$('input[data-factor]').forEach((input) => {
      if (!/^art-/.test(input.id)) return;
      const points = valueOf(input) * parseFloat(input.dataset.factor || '0');
      s63 += points;
      setOut('o-' + input.id, points);
    });

    s62 = applyCap('6.2 Premios y proyectos', s62, 2.5);
    s63 = applyCap('6.3 Méritos artísticos y deportivos', s63, 2.5);

    const s64 = periodPoints('d64', 1.5, 0.1250);
    const s65 = nv('trib') * 0.5;
    const s661 = nv('tut1') * 0.1;
    const s662 = nv('tut2') * 0.2;
    const s67 = euskeraPoints();

    setOut('o-61', s61);
    setOut('o-62', s62);
    setOut('o-63', s63);
    setOut('o-64', s64);
    setOut('o-65', s65);
    setOut('o-661', s661);
    setOut('o-662', s662);
    setOut('o-67', s67);
    setOut('o-67b', s64 + s65 + s661 + s662 + s67);

    const sec6raw = s61 + s62 + s63 + s64 + s65 + s661 + s662 + s67;
    const sec6 = applyCap('6. Otros méritos', sec6raw, 15, 6);

    /* ---- Totales ---- */
    const sections = { 1: sec1, 2: sec2, 3: sec3, 4: sec4, 5: sec5, 6: sec6 };
    const total = sec1 + sec2 + sec3 + sec4 + sec5 + sec6;

    ['1', '2', '3', '4', '5', '6'].forEach((i) => {
      const value = sections[i];
      setOut('sec' + i, value);
      setOut('s' + i, value);
      const row = $('#brk li[data-sec="' + i + '"]');
      if (row) row.classList.toggle('is-capped', caps.some((c) => c.section === Number(i)));
    });

    setOut('total', total);
    el('total-mobile').textContent = fmt(total);
    renderComp(sections, total);

    /* ---- Avisos de topes ---- */
    const box = el('cap-box');
    const list = el('cap-list');
    list.innerHTML = '';
    caps.forEach((c) => {
      const li = document.createElement('li');
      li.textContent = `${c.label}: ${fmt(c.raw)} → ${fmt(c.cap)}`;
      list.appendChild(li);
    });
    box.hidden = caps.length === 0;

    /* ---- Pie de impresión ---- */
    const name = (el('persona').value || '').trim();
    const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    el('print-meta').textContent =
      `${name ? name + ' · ' : ''}${fmt(total)} puntos · ${date}`;

    return total;
  }

  /* ------------------------------------------------------------------ */
  /* Estado: guardar / cargar / reiniciar                                */
  /* ------------------------------------------------------------------ */

  function collectState() {
    const fields = {};
    $$('input[id], select[id]').forEach((node) => {
      if (node.type === 'file') return;
      fields[node.id] = node.type === 'checkbox' ? node.checked : node.value;
    });

    const idiomas = $$('#idiomas-rows .lang-row').map((row) => ({
      name: $('.lang-name', row).value,
      level: $('.lang-level', row).value
    }));

    const idiomasExt = $$('#idiomas-ext-rows .lang-row').map((row) => ({
      name: $('.lang-name', row).value,
      level: $('.lang-level', row).value
    }));

    const pubs = $$('#pubs-rows .pub-row').map((row) => ({
      title: $('.pub-title', row).value,
      type: $('.pub-type', row).value,
      authors: $('.pub-authors', row).value
    }));

    return {
      version: 2,
      convocatoria: document.body.dataset.version || '2627',
      savedAt: new Date().toISOString(),
      fields, idiomas, idiomasExt, pubs
    };
  }

  let saveTimer = null;

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectState()));
    } catch (error) {
      /* almacenamiento no disponible */
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 400);
  }

  function applyState(state) {
    if (!state || typeof state !== 'object') return false;

    if (state.fields) {
      Object.keys(state.fields).forEach((id) => {
        const node = el(id);
        if (!node || node.type === 'file') return;
        if (node.type === 'checkbox') node.checked = Boolean(state.fields[id]);
        else node.value = state.fields[id];
      });
    }

    $('#idiomas-rows').innerHTML = '';
    (Array.isArray(state.idiomas) ? state.idiomas : []).forEach((item) => addLangRow(item));

    $('#idiomas-ext-rows').innerHTML = '';
    (Array.isArray(state.idiomasExt) ? state.idiomasExt : []).forEach((item) => addExtLangRow(item));

    $('#pubs-rows').innerHTML = '';
    (Array.isArray(state.pubs) ? state.pubs : []).forEach((item) => addPubRow(item));

    if (!state.idiomas || !state.idiomas.length) addLangRow();
    if (!state.idiomasExt || !state.idiomasExt.length) addExtLangRow();
    if (!state.pubs || !state.pubs.length) addPubRow();

    setVersion(state.convocatoria || '2526');
    return true;
  }

  function resetAll() {
    $$('#main input, #main select').forEach((node) => {
      if (node.type === 'file') return;
      if (node.type === 'checkbox') node.checked = false;
      else if (node.tagName === 'SELECT') node.selectedIndex = 0;
      else node.value = '';
    });
    $$('input[type="number"]', document).forEach((node) => { node.value = '0'; });

    $('#idiomas-rows').innerHTML = '';
    $('#idiomas-ext-rows').innerHTML = '';
    $('#pubs-rows').innerHTML = '';
    addLangRow();
    addExtLangRow();
    addPubRow();

    compute();
    scheduleSave();
    updateDates();
  }

  function downloadState() {
    const data = JSON.stringify(collectState(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'puntos-concurso-docentes-euskadi-' + (document.body.dataset.version || '2627') + '.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ------------------------------------------------------------------ */
  /* Herramienta de fechas                                               */
  /* ------------------------------------------------------------------ */

  function completeMonths(from, to) {
    if (!from || !to) return null;
    const a = new Date(from + 'T00:00:00');
    const b = new Date(to + 'T00:00:00');
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return null;
    let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    if (b.getDate() < a.getDate()) months -= 1;
    return Math.max(0, months);
  }

  function updateDates() {
    const from = el('fecha-desde').value;
    const to = el('fecha-hasta').value;
    const months = completeMonths(from, to);
    const result = el('fecha-result');

    if (months === null) {
      result.textContent = from && to
        ? 'La fecha final debe ser posterior a la inicial.'
        : 'Introduce las fechas para ver los meses completos.';
      el('fecha-copy').disabled = true;
      return;
    }

    const years = Math.floor(months / 12);
    const rest = months % 12;
    result.innerHTML = `<b>${months}</b> meses completos` +
      (months >= 12 ? ` (${years} ${years === 1 ? 'año' : 'años'} y ${rest} ${rest === 1 ? 'mes' : 'meses'})` : '') +
      '. Se computan por meses completos.';
    el('fecha-copy').disabled = false;
  }

  function copyMonths() {
    const months = completeMonths(el('fecha-desde').value, el('fecha-hasta').value);
    if (months === null) return;
    const text = String(months);

    const done = () => {
      const btn = el('fecha-copy');
      const original = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = original; }, 1500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); done(); } catch (error) { /* sin portapapeles */ }
    area.remove();
  }

  /* ------------------------------------------------------------------ */
  /* Eventos                                                             */
  /* ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------ */
  /* Convocatoria                                                        */
  /* ------------------------------------------------------------------ */

  function setVersion(value) {
    const version = value === '2526' ? '2526' : '2627';
    const v26 = version === '2627';
    document.body.dataset.version = version;

    $$('.vtab').forEach((button) => {
      const active = button.dataset.version === version;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    el('lede-version').textContent = v26
      ? 'Baremo del Anexo I · convocatoria 2026/2027 (BOPV n.º 211)'
      : 'Baremo del Anexo I · convocatoria 2025/2026 (BOPV n.º 243)';
    el('version-ref').textContent = v26
      ? 'Orden de 8/10/2026 · BOPV n.º 211 · ámbito estatal'
      : 'Orden de 13/11/2025 · BOPV n.º 243 · ámbito autonómico';
    el('intro-ref').textContent = v26
      ? 'de la Orden de 8 de octubre de 2026 (BOPV n.º 211, 4/11/2026)'
      : 'de la Orden de 13 de noviembre de 2025 (BOPV n.º 243, 17/12/2025)';

    el('lbl-33').textContent = v26
      ? '3.3 a) – d) · Certificados de EOI · 3.3 e) – f) · FP y música/danza'
      : '3.3 a) – d) y 3.4 a) – d) · Certificados de idiomas · 3.3 e) – f) · FP y música/danza';
    el('help-33').innerHTML = v26
      ? '<strong>3.3.a</strong> C2 = 4 pts · <strong>3.3.b</strong> C1 = 3 pts · <strong>3.3.c</strong> B2 = 2 pts · <strong>3.3.d</strong> B1 = 1 pt. Los certificados de EOI se valoran aquí; los externos (ACLES) en 5.5. Solo el nivel superior de cada idioma, una vez entre 3.3 y 5.5.'
      : '<strong>3.3.a</strong> C2 = 4 pts · <strong>3.3.b</strong> C1 = 3 pts · <strong>3.3.c</strong> B2 = 2 pts · <strong>3.3.d</strong> B1 = 1 pt. En 3.4 se aplica la misma escala. Solo puntúa el nivel superior de cada idioma, una única vez entre 3.3 y 3.4.';

    el('help-662').textContent = v26
      ? '0,2 pts por cada curso (desde 2025/2026)'
      : '0,2 pts por cada curso (desde 2024/2025)';

    el('print-title').textContent = 'Baremo de méritos · Concurso de traslados docentes ' + (v26 ? '2026/2027' : '2025/2026');
    document.title = 'Calculadora de puntos · Concurso de traslados docentes Euskadi ' + (v26 ? '2026/2027' : '2025/2026');

    el('aside-ref').innerHTML = v26
      ? 'de la Orden de 8 de octubre de 2026 (<a href="https://www.euskadi.eus/contenidos/informacion/langile_d_ct_secundaria_2627/es_def/adjuntos/ORDEN_es.pdf" target="_blank" rel="noopener">BOPV n.º 211</a>)'
      : 'de la Orden de 13 de noviembre de 2025 (<a href="https://www.euskadi.eus/bopv2/datos/2025/12/2505405a.shtml" target="_blank" rel="noopener">BOPV n.º 243</a>)';

    el('fuente-ref').innerHTML = v26
      ? 'Orden de 8 de octubre de 2026, de la consejera de Educación, por la que se convoca concurso de traslados de ámbito estatal del personal funcionario de los cuerpos docentes no universitarios (BOPV n.º 211, 4/11/2026). <a href="https://www.euskadi.eus/contenidos/informacion/langile_d_ct_secundaria_2627/es_def/adjuntos/ORDEN_es.pdf" target="_blank" rel="noopener">Texto completo (PDF)</a>'
      : 'Orden de 13 de noviembre de 2025, de la consejera de Educación, por la que se convoca concurso de traslados del personal funcionario de los cuerpos docentes no universitarios (BOPV n.º 243, 17/12/2025). <a href="https://www.euskadi.eus/contenidos/informacion/langile_d_ct_secundaria_2526/es_def/adjuntos/Orden-docentes_es.pdf" target="_blank" rel="noopener">Texto completo (PDF)</a>';

    compute();
    scheduleSave();
  }

  function init() {
    compute();

    let saved = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (error) {
      saved = null;
    }

    if (saved) {
      applyState(saved);
    } else {
      addLangRow();
      addExtLangRow();
      addPubRow();
      setVersion('2627');
    }

    compute();
    updateDates();

    $$('.vtab').forEach((button) => {
      button.addEventListener('click', () => setVersion(button.dataset.version));
    });

    $('#add-idioma-ext').addEventListener('click', () => {
      const row = addExtLangRow();
      $('.lang-name', row).focus();
      compute();
      scheduleSave();
    });

    $('#idiomas-ext-rows').addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove]');
      if (!button) return;
      button.closest('.lang-row').remove();
      compute();
      scheduleSave();
    });

    document.addEventListener('input', (event) => {
      if (event.target.closest('#main')) {
        compute();
        scheduleSave();
      }
    });

    document.addEventListener('change', (event) => {
      if (event.target.closest('#main')) {
        compute();
        scheduleSave();
      }
    });

    $$('input[type="number"]', document).forEach((node) => {
      node.addEventListener('blur', () => {
        if (node.value === '' || Number(node.value) < 0) node.value = '0';
      });
    });

    $('#add-idioma').addEventListener('click', () => {
      const row = addLangRow();
      $('.lang-name', row).focus();
      compute();
      scheduleSave();
    });

    $('#add-pub').addEventListener('click', () => {
      const row = addPubRow();
      $('.pub-title', row).focus();
      compute();
      scheduleSave();
    });

    $('#idiomas-rows').addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove]');
      if (!button) return;
      button.closest('.lang-row').remove();
      compute();
      scheduleSave();
    });

    $('#pubs-rows').addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove]');
      if (!button) return;
      button.closest('.pub-row').remove();
      compute();
      scheduleSave();
    });

    ['fecha-desde', 'fecha-hasta'].forEach((id) => {
      el(id).addEventListener('change', updateDates);
      el(id).addEventListener('input', updateDates);
    });
    $('#fecha-copy').addEventListener('click', copyMonths);

    $('#btn-print').addEventListener('click', () => window.print());

    $('#btn-save').addEventListener('click', () => {
      saveState();
      downloadState();
      const button = el('btn-save');
      const original = button.textContent;
      button.textContent = 'Guardado ✓';
      setTimeout(() => { button.textContent = original; }, 1600);
    });

    $('#file-load').addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const state = JSON.parse(String(reader.result));
          if (!applyState(state)) throw new Error('Formato no válido');
          compute();
          saveState();
        } catch (error) {
          window.alert('No se ha podido cargar el archivo. Comprueba que sea un JSON exportado por esta calculadora.');
        }
        event.target.value = '';
      };
      reader.readAsText(file);
    });

    $('#btn-reset').addEventListener('click', () => {
      if (!window.confirm('¿Vaciar todos los datos de la calculadora?')) return;
      resetAll();
      try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* nada */ }
    });

    window.addEventListener('beforeprint', () => {
      el('print-meta').textContent =
        `${(el('persona').value || '').trim()}${el('persona').value ? ' · ' : ''}${fmt(compute())} puntos · ` +
        new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


    } catch (error) {
      console.error('[legacy:calculadora]', error);
    }
  }
}
