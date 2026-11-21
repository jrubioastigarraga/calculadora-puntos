// @ts-nocheck
import { AfterViewInit, Component, ViewEncapsulation, inject } from '@angular/core';
import { PageDataService } from '../../../core/page-data.service';

@Component({
  selector: 'app-clasificacion-legacy',
  standalone: true,
  templateUrl: './clasificacion.component.html',
  styleUrl: './clasificacion.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ClasificacionLegacyComponent implements AfterViewInit {
  private readonly pageData = inject(PageDataService);

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.pageData.ensure('datos');
      /* Lógica original de clasificacion.html */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (id) => document.getElementById(id);

  const nf = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const fmt = (v) => nf.format(Math.round((Number(v) || 0) * 10000) / 10000);
  const fmtInt = (value) => String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const normalize = (text) => String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

  if (!window.DATOS) {
    document.body.innerHTML = '<p style="padding:40px;font-family:system-ui">No se ha podido cargar <code>datos.js</code>. Mantén los archivos en la misma carpeta.</p>';
    return;
  }

  const RAW = window.DATOS;
  const YEARS = RAW.years.slice().sort((a, b) => b - a);
  const BODIES = RAW.bodies;
  const SPECIALTIES = {};
  Object.keys(RAW.specialties).forEach((key) => {
    const name = RAW.specialties[key];
    if (name && name !== '/' && name !== '-') SPECIALTIES[key] = name;
  });

  const PEOPLE = RAW.people.map((a) => ({
    y: a[0], n: a[1], c: a[2], m: a[3], p: a[4], e: a[5], t: a[6], s: a[7], d: a[8] || {}, asig: a[9] || null, det: a[10] || null
  }));

  const espLabel = (cuerpo, esp) => SPECIALTIES[cuerpo + '|' + esp] || ('Especialidad ' + esp);
  const cuerpoLabel = (cuerpo) => BODIES[cuerpo] || ('Cuerpo ' + cuerpo);

  const SUB_GROUPS = [
    { label: '1.1', items: [
      [0, '1.1.1', 'Permanencia ininterrumpida con destino definitivo en el centro'],
      [1, '1.1.2', 'Años en situación de provisionalidad'],
      [2, '1.1.3', 'Servicios en centro o puesto de especial dificultad']
    ] },
    { label: '1.2', items: [
      [3, '1.2.1', 'Servicios efectivos en el cuerpo de la vacante'],
      [4, '1.2.2', 'Servicios en otros cuerpos del mismo o superior subgrupo'],
      [5, '1.2.3', 'Servicios en otros cuerpos de subgrupo inferior']
    ] },
    { label: '2', items: [
      [6, '2', 'Pertenencia a los cuerpos de Catedráticos/as']
    ] },
    { label: '3.1', items: [
      [7, '3.1.1', 'Título de Doctora o Doctor'],
      [8, '3.1.2', 'Título de Máster (mínimo 60 créditos)'],
      [9, '3.1.3', 'Suficiencia investigadora o estudios avanzados'],
      [10, '3.1.4', 'Premio extraordinario']
    ] },
    { label: '3.2', items: [
      [11, '3.2.1', 'Titulación de Grado'],
      [12, '3.2.2', 'Titulación de primer ciclo'],
      [13, '3.2.3', 'Titulación de segundo ciclo']
    ] },
    { label: '3.3', items: [
      [14, '3.3.a', 'Certificado de idioma C2 (EOI)'],
      [15, '3.3.b', 'Certificado de idioma C1 (EOI)'],
      [16, '3.3.c', 'Certificado de idioma B2 (EOI)'],
      [17, '3.3.d', 'Certificado de idioma B1 (EOI)'],
      [18, '3.3.e', 'Título de Técnico/a Superior'],
      [19, '3.3.f', 'Título Profesional de Música o Danza']
    ] },
    { label: '3.4', items: [
      [20, '3.4.a', 'Certificado de idioma extranjero C2'],
      [21, '3.4.b', 'Certificado de idioma extranjero C1'],
      [22, '3.4.c', 'Certificado de idioma extranjero B2'],
      [23, '3.4.d', 'Certificado de idioma extranjero B1']
    ] },
    { label: '4', items: [
      [24, '4.1', 'Dirección o dirección adjunta'],
      [25, '4.2', 'Vicedirección, jefatura de estudios o secretaría'],
      [26, '4.3', 'Coordinación docente, departamento o tutoría'],
      [27, '4.4.a', 'Dirección con valoración positiva'],
      [28, '4.4.b', 'Jefatura de estudios o secretaría con valoración positiva']
    ] },
    { label: '5', items: [
      [29, '5.1', 'Actividades de formación superadas'],
      [30, '5.2', 'Actividades de formación impartidas'],
      [31, '5.3', 'Nuevas especialidades adquiridas'],
      [32, '5.4', 'Competencia digital docente'],
      [33, '5.5', 'Certificados de idiomas externos (ACLES)']
    ] },
    { label: '6', items: [
      [34, '6.1', 'Publicaciones'],
      [35, '6.2', 'Premios y proyectos de investigación e innovación'],
      [36, '6.3', 'Méritos artísticos, deportivos y literarios'],
      [37, '6.4', 'Puestos en la Administración educativa'],
      [38, '6.5', 'Miembro de tribunales'],
      [39, '6.6', 'Tutorización de prácticas']
    ] }
  ];

  const state = { year: YEARS[0], q: '', cuerpo: '', esp: '', moda: [], sort: 'esp' };
  let ROWS = [];
  let filtered = [];
  let visible = 80;
  const STEP = 120;

  /* ---------- orden oficial: puntos y desempates ---------- */

  function compareRows(a, b) {
    if (b.total !== a.total) return b.total - a.total;
    for (let i = 0; i < 7; i += 1) {
      if (b.person.s[i] !== a.person.s[i]) return b.person.s[i] - a.person.s[i];
    }
    return a.name.localeCompare(b.name, 'es');
  }

  function buildYear(year) {
    const people = PEOPLE.filter((p) => p.y === year);

    ROWS = [];
    people.forEach((person) => {
      person.e.forEach((esp) => {
        ROWS.push({
          key: year + '|' + person.n + '|' + esp,
          person,
          cuerpo: person.c,
          esp,
          moda: person.m,
          pl: person.p,
          total: person.t,
          name: person.n,
          nameNorm: normalize(person.n),
          espLabel: espLabel(person.c, esp),
          dest: person.d[esp] || null,
          pos: 0
        });
      });
    });

    const groups = new Map();
    ROWS.forEach((row) => {
      const key = row.cuerpo + '|' + row.esp;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    });
    groups.forEach((list) => {
      list.sort(compareRows);
      list.forEach((row, i) => { row.pos = i + 1; });
    });

    const summary = RAW.summary[year] || { p: people.length, d: 0 };
    el('subtitle').textContent = fmtInt(summary.p) + ' participantes · ' + fmtInt(summary.d) + ' con destino · ' + year;

    rebuildEspSelect();
  }

  /* ---------- filtros ---------- */

  function applyFilters() {
    const q = state.q;
    filtered = ROWS.filter((row) => {
      if (state.cuerpo && row.cuerpo !== state.cuerpo) return false;
      if (state.esp && row.cuerpo + '|' + row.esp !== state.esp) return false;
      if (state.moda.length && state.moda.indexOf(row.moda) === -1) return false;
      if (q && row.nameNorm.indexOf(q) === -1) return false;
      return true;
    });

    if (state.sort === 'puntos') {
      filtered.sort(compareRows);
    } else {
      filtered.sort((a, b) => {
        const ca = a.cuerpo + a.esp;
        const cb = b.cuerpo + b.esp;
        if (ca !== cb) return ca < cb ? -1 : 1;
        return compareRows(a, b);
      });
    }

    visible = 80;
    renderAll();
  }

  /* ---------- pintado ---------- */

  function destLabel(dest) {
    if (!dest) return '';
    return dest[0] || (dest[3] ? 'Centro ' + dest[3] : '');
  }

  function rowHtml(row) {
    const medal = row.pos <= 3 ? ' p' + row.pos : '';
    const destLine = row.dest ? '<span class="dest">' + destLabel(row.dest) + '</span>' : '';
    const asig = row.person.asig;
    const asigLine = (row.person.y === 2025 && asig)
      ? '<span class="asig" title="Asignación para el curso 2026/2027">' + asig[3] + ' · ' + asig[0] + '</span>'
      : '';
    return '<tr class="main-row" data-key="' + row.key + '" aria-expanded="false">' +
      '<td class="pos"><span class="posnum' + medal + '">' + row.pos + '</span></td>' +
      '<td class="name">' + row.name + destLine + asigLine + '</td>' +
      '<td class="esp">' + row.espLabel + '</td>' +
      '<td class="moda"><b class="m-' + (row.moda || 'x') + '">' + (row.moda || '·') + '</b></td>' +
      '<td class="pl">' + (row.pl || '·') + '</td>' +
      '<td class="pts">' + fmt(row.total) + '</td>' +
      '<td class="chev"><button type="button" class="chev-btn" aria-expanded="false" aria-label="Ver desglose de ' + row.name + '">›</button></td>' +
    '</tr>';
  }

  function detailHtml(row) {
    const s = row.person.s;
    const labels = ['1.1', '1.2', '2', '3', '4', '5', '6'];
    const desc = {
      '1.1': 'Antigüedad en el centro',
      '1.2': 'Antigüedad en el cuerpo',
      '2': 'Pertenencia a los cuerpos de Catedráticos/as',
      '3': 'Méritos académicos',
      '4': 'Cargos directivos y otras funciones',
      '5': 'Formación y perfeccionamiento',
      '6': 'Otros méritos'
    };
    const chips = labels.map((label, i) =>
      '<span class="chip" title="' + desc[label] + '"><i>' + label + '</i><b>' + fmt(s[i]) + '</b></span>'
    ).join('');

    let dest;
    if (row.dest) {
      const name = destLabel(row.dest);
      const place = [row.dest[1], row.dest[2]].filter(Boolean).join(' · ');
      dest = '<p class="destino"><span class="tag">Destino</span> <b>' + (name || '—') + '</b>' +
        (row.dest[3] ? ' <span>(' + row.dest[3] + ')</span>' : '') +
        (place ? ' <span>· ' + place + '</span>' : '') + '</p>';
    } else {
      dest = '<p class="no-dest">Sin destino adjudicado en este listado.</p>';
    }

    let asigDetail = '';
    if (row.person.y === 2025 && row.person.asig) {
      const a = row.person.asig;
      const place = [a[1], a[2]].filter(Boolean).join(' · ');
      asigDetail = '<p class="destino"><span class="tag asig-tag">' + a[3] + '</span> <b>' + a[0] + '</b>' +
        (place ? ' <span>· ' + place + '</span>' : '') + '</p>';
    }

    let subdetail = '';
    const det = row.person.det;
    if (det) {
      const groups = SUB_GROUPS.map((group) => {
        const items = group.items.filter(([i]) => det[i] != null && det[i] > 0);
        if (!items.length) return '';
        return '<div class="subgroup"><span class="sglabel">' + group.label + '</span><div class="subchips">' +
          items.map(([i, label, description]) =>
            '<span class="chip sub" title="' + description + '"><i>' + label + '</i><b>' + fmt(det[i]) + '</b></span>'
          ).join('') +
          '</div></div>';
      }).filter(Boolean).join('');

      subdetail = groups
        ? '<div class="subdetail"><p class="detail-note">Detalle interno del listado · el total del apartado aplica el tope</p>' + groups + '</div>'
        : '<p class="no-dest">Sin subapartados con puntuación.</p>';
    } else {
      subdetail = '<p class="no-dest">Detalle interno no disponible para este participante.</p>';
    }

    return '<tr class="detail-row"><td colspan="7"><div class="detail">' +
      '<div class="detail-top"><strong>' + row.name + '</strong>' +
      '<span>' + cuerpoLabel(row.cuerpo) + ' · ' + row.esp + ' ' + row.espLabel + '</span>' +
      '<span>Modalidad ' + (row.moda || '—') + ' · Perfil ' + (row.pl || '—') + '</span>' +
      '<span>Puesto ' + row.pos + ' en la especialidad · ' + row.person.y + '</span></div>' +
      '<p class="detail-note">Desglose por apartados · pasa el ratón para ver la descripción</p>' +
      '<div class="chips">' + chips + '</div>' + subdetail + dest + asigDetail +
    '</div></td></tr>';
  }

  function renderRows() {
    const part = filtered.slice(0, visible);
    el('tbody').innerHTML = part.map(rowHtml).join('');
    el('empty').hidden = filtered.length !== 0;
    el('showing').textContent = filtered.length
      ? 'Mostrando ' + fmtInt(part.length) + ' de ' + fmtInt(filtered.length) + ' resultados'
      : 'Sin resultados';
    el('more').hidden = visible >= filtered.length;
  }

  function renderStats() {
    const count = filtered.length;
    const esps = new Set(filtered.map((r) => r.cuerpo + '|' + r.esp)).size;
    const max = count ? Math.max.apply(null, filtered.map((r) => r.total)) : 0;
    const avg = count ? filtered.reduce((acc, r) => acc + r.total, 0) / count : 0;
    el('st-count').textContent = fmtInt(count);
    el('st-esp').textContent = fmtInt(esps);
    el('st-max').textContent = fmt(max);
    el('st-avg').textContent = fmt(avg);
  }

  function renderAll() {
    renderStats();
    renderRows();
    updateCompare();
  }

  /* ---------- desglose ---------- */

  el('tbody').addEventListener('click', (event) => {
    const rowEl = event.target.closest('tr.main-row');
    if (!rowEl) return;
    const open = rowEl.classList.contains('open');
    const key = rowEl.dataset.key;

    $$('tr.main-row.open').forEach((tr) => {
      tr.classList.remove('open');
      tr.setAttribute('aria-expanded', 'false');
      const b = $('.chev-btn', tr);
      if (b) b.setAttribute('aria-expanded', 'false');
      const next = tr.nextElementSibling;
      if (next && next.classList.contains('detail-row')) next.remove();
    });

    if (open) return;

    const row = ROWS.find((r) => r.key === key);
    if (!row) return;
    rowEl.classList.add('open');
    rowEl.setAttribute('aria-expanded', 'true');
    $('.chev-btn', rowEl).setAttribute('aria-expanded', 'true');
    rowEl.insertAdjacentHTML('afterend', detailHtml(row));
  });

  /* ---------- comparador ---------- */

  function readScore() {
    const raw = String(el('mi-puntos').value || '').replace(/\s/g, '').replace(',', '.');
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  function hideGauge() {
    const gauge = el('gauge');
    if (gauge) gauge.hidden = true;
  }

  function showGauge(pool, score) {
    const gauge = el('gauge');
    if (!gauge || !pool.length) { if (gauge) gauge.hidden = true; return; }
    const totals = pool.map((r) => r.total);
    const min = Math.min.apply(null, totals);
    const max = Math.max.apply(null, totals);
    const span = max - min;
    const ratio = span > 0 ? Math.min(1, Math.max(0, (score - min) / span)) : 0.5;
    el('gauge-fill').style.width = (ratio * 100) + '%';
    el('gauge-mark').style.left = (ratio * 100) + '%';
    el('gauge-min').textContent = 'Mín. ' + fmt(min);
    el('gauge-max').textContent = 'Máx. ' + fmt(max);
    gauge.hidden = false;
  }

  function updateCompare() {
    const out = el('compare-result');
    const score = readScore();

    if (!state.esp) {
      out.textContent = 'Selecciona una especialidad para ver tu puesto.';
      hideGauge();
      return;
    }
    if (score === null) {
      out.textContent = 'Escribe tu puntuación (por ejemplo 85,4321).';
      hideGauge();
      return;
    }

    const key = state.esp;
    const pool = ROWS.filter((r) => r.cuerpo + '|' + r.esp === key).sort(compareRows);

    if (!pool.length) {
      out.textContent = 'No hay participantes con esos filtros.';
      hideGauge();
      return;
    }

    const above = pool.filter((r) => r.total > score + 1e-9).length;
    const ties = pool.filter((r) => Math.abs(r.total - score) < 1e-9).length;
    const pos = above + 1;
    const total = pool.length;
    showGauge(pool, score);

    const espName = espLabel(key.split('|')[0], key.split('|')[1]);
    const sufijo = state.moda.length ? ' (' + state.moda.join(', ') + ')' : '';

    if (pos === 1 && ties === 0) {
      out.innerHTML = 'Con <b>' + fmt(score) + '</b> puntos serías el <span class="hi">mejor puesto</span> de ' + espName + ' en ' + state.year + sufijo + '.';
    } else if (pos > total) {
      out.innerHTML = 'Con <b>' + fmt(score) + '</b> puntos quedarías por debajo de los ' + fmtInt(total) + ' participantes de ' + espName + ' en ' + state.year + sufijo + '.';
    } else {
      out.innerHTML = 'Con <b>' + fmt(score) + '</b> puntos: puesto <span class="hi">' + fmtInt(pos) + '</span> de ' +
        fmtInt(total) + ' en ' + espName + ' (' + state.year + ')' + sufijo + (ties ? ' · empatarías con ' + fmtInt(ties) : '') + '.';
    }
  }

  el('mi-puntos').addEventListener('input', updateCompare);

  /* ---------- selectores ---------- */

  const bodySelect = el('f-cuerpo');
  Object.keys(BODIES).forEach((code) => {
    if (!PEOPLE.some((p) => p.c === code)) return;
    const option = document.createElement('option');
    option.value = code;
    option.textContent = code + ' · ' + BODIES[code];
    bodySelect.appendChild(option);
  });

  function rebuildEspSelect() {
    const select = el('f-esp');
    const current = state.esp;
    select.innerHTML = '<option value="">Todas las especialidades</option>';

    const byBody = new Map();
    ROWS.forEach((row) => {
      if (state.cuerpo && row.cuerpo !== state.cuerpo) return;
      if (!byBody.has(row.cuerpo)) byBody.set(row.cuerpo, new Set());
      byBody.get(row.cuerpo).add(row.esp);
    });

    Array.from(byBody.keys()).sort().forEach((cuerpo) => {
      const group = document.createElement('optgroup');
      group.label = cuerpo + ' · ' + cuerpoLabel(cuerpo);
      Array.from(byBody.get(cuerpo)).sort().forEach((esp) => {
        const option = document.createElement('option');
        option.value = cuerpo + '|' + esp;
        option.textContent = esp + ' · ' + espLabel(cuerpo, esp);
        group.appendChild(option);
      });
      select.appendChild(group);
    });

    if (current && select.querySelector('option[value="' + current + '"]')) select.value = current;
    else {
      state.esp = '';
      select.value = '';
    }
    refreshSelect(select);
  }

  bodySelect.addEventListener('change', () => {
    state.cuerpo = bodySelect.value;
    rebuildEspSelect();
    applyFilters();
  });

  el('f-esp').addEventListener('change', (event) => {
    state.esp = event.target.value;
    applyFilters();
  });

  el('q').addEventListener('input', (event) => {
    state.q = normalize(event.target.value);
    applyFilters();
  });

  el('moda').addEventListener('change', () => {
    state.moda = Array.from(el('moda').selectedOptions).map((o) => o.value);
    applyFilters();
  });

  el('clear').addEventListener('click', () => {
    state.q = ''; state.cuerpo = ''; state.esp = ''; state.moda = [];
    el('q').value = '';
    bodySelect.value = '';
    rebuildEspSelect();
    if (window.jQuery && window.jQuery(el('moda')).data('select2')) {
      window.jQuery(el('moda')).val(null).trigger('change.select2');
    }
    applyFilters();
  });

  /* ---------- año ---------- */

  YEARS.forEach((year) => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    el('f-year').appendChild(option);
  });
  el('f-year').value = state.year;

  el('f-year').addEventListener('change', () => {
    state.year = Number(el('f-year').value);
    state.esp = '';
    el('f-esp').value = '';
    buildYear(state.year);
    applyFilters();
  });

  /* ---------- orden ---------- */

  function setSort(mode) {
    state.sort = mode;
    el('th-esp').classList.toggle('active', mode === 'esp');
    el('th-pts').classList.toggle('active', mode === 'puntos');
    $('.arrow', el('th-esp')).textContent = mode === 'esp' ? '▲' : '↕';
    $('.arrow', el('th-pts')).textContent = mode === 'puntos' ? '▼' : '↕';
    applyFilters();
  }

  $$('th.sortable button').forEach((button) => {
    button.addEventListener('click', () => setSort(button.dataset.sort));
  });

  /* ---------- mostrar más ---------- */

  el('more').addEventListener('click', () => {
    visible += STEP;
    renderRows();
  });

  /* ---------- CSV ---------- */

  function csvCell(value) {
    const text = String(value == null ? '' : value).replace(/"/g, '""');
    return '"' + text + '"';
  }

  el('csv').addEventListener('click', () => {
    const header = ['Año', 'Puesto', 'Nombre', 'Cuerpo', 'Especialidad', 'Modalidad', 'Perfil', 'Puntos', 'Centro destino', 'Municipio', 'Localidad', 'Asignación 2026/27'];
    const lines = [header.map(csvCell).join(';')];

    filtered.forEach((row) => {
      lines.push([
        row.person.y,
        row.pos,
        row.name,
        row.cuerpo,
        row.espLabel,
        row.moda,
        row.pl,
        fmt(row.total),
        row.dest ? destLabel(row.dest) : '',
        row.dest ? row.dest[1] : '',
        row.dest ? row.dest[2] : '',
        row.person.y === 2025 && row.person.asig ? row.person.asig[0] : ''
      ].map(csvCell).join(';'));
    });

    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clasificacion-' + state.year + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  /* ---------- selects (Select2) ---------- */

  function refreshSelect(select) {
    if (window.jQuery && window.jQuery(select).data('select2')) {
      window.jQuery(select).trigger('change.select2');
    }
  }

  function initSelects() {
    if (!window.jQuery || !window.jQuery.fn.select2) return;
    const jq = window.jQuery;
    const lang = {
      noResults: function () { return 'Sin resultados'; },
      searching: function () { return 'Buscando…'; }
    };

    jq('#f-year').select2({ minimumResultsForSearch: Infinity, width: '100%' });
    jq('#f-cuerpo').select2({ minimumResultsForSearch: Infinity, width: '100%' });
    jq('#f-esp').select2({ width: '100%', language: lang });
    jq('#moda').select2({
      width: '100%',
      placeholder: 'Modalidad',
      allowClear: true,
      closeOnSelect: false,
      language: lang
    });

    jq('#f-year, #f-cuerpo, #f-esp, #moda').on('select2:select select2:unselect', function () {
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /* ---------- inicio ---------- */

  buildYear(state.year);
  setSort('esp');
  initSelects();
})();
    } catch (error) {
      console.error('[legacy:clasificacion]', error);
    }
  }
}
