// @ts-nocheck
import { AfterViewInit, Component, ViewEncapsulation, inject } from '@angular/core';
import { PageDataService } from '../../../core/page-data.service';

@Component({
  selector: 'app-plazas-legacy',
  standalone: true,
  templateUrl: './plazas.component.html',
  styleUrl: './plazas.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PlazasLegacyComponent implements AfterViewInit {
  private readonly pageData = inject(PageDataService);

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.pageData.ensure('datos');
      /* Lógica original de plazas.html */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (id) => document.getElementById(id);
  const fmtInt = (v) => String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const plazaTxt = (n) => fmtInt(n) + (Math.round(Number(n) || 0) === 1 ? ' plaza' : ' plazas');
  const nf = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const fmt = (v) => nf.format(Math.round((Number(v) || 0) * 10000) / 10000);
  const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

  if (!window.DATOS) {
    document.body.innerHTML = '<p style="padding:40px;font-family:system-ui">No se ha podido cargar <code>datos.js</code>. Mantén los archivos en la misma carpeta.</p>';
    return;
  }

  const RAW = window.DATOS;
  const YEARS = RAW.years.slice().sort((a, b) => b - a);
  const SPECIALTIES = {};
  Object.keys(RAW.specialties).forEach((key) => {
    const name = RAW.specialties[key];
    if (name && name !== '/' && name !== '-') SPECIALTIES[key] = name;
  });
  const BODIES = RAW.bodies;
  const PROV_BY_PREFIX = { '01': 'Araba', '20': 'Gipuzkoa', '48': 'Bizkaia' };
  const PROVS = [['Araba', '#b45309'], ['Bizkaia', '#7a1738'], ['Gipuzkoa', '#1d4ed8'], ['Otras', '#8d7a80']];

  const PLAZAS = RAW.plazas.map((a) => ({
    y: a[0], c: a[1], esp: a[2], n: a[3], t: a[4], m: a[5],
    centro: a[6] || '', muni: a[7] || '', loc: a[8] || '', en: a[9] || '', code: a[10] || '',
    prov: PROV_BY_PREFIX[(a[10] || '').slice(0, 2)] || 'Otras'
  }));

  const espLabel = (c, e) => SPECIALTIES[c + '|' + e] || ('Especialidad ' + e);
  const centroLabel = (p) => p.centro || ('Centro ' + (p.code || '—'));

  const byYear = new Map();
  PLAZAS.forEach((p) => {
    if (!byYear.has(p.y)) byYear.set(p.y, []);
    byYear.get(p.y).push(p);
  });

  const state = { year: YEARS[0], esp: '', prov: '', q: '' };
  let filtered = [];
  let visible = 60;
  const STEP = 120;

  function espBase(year) {
    const rows = byYear.get(year) || [];
    return state.esp ? rows.filter((p) => p.c + '|' + p.esp === state.esp) : rows;
  }

  function rowsForYear(year) {
    const rows = espBase(year);
    return state.prov ? rows.filter((p) => p.prov === state.prov) : rows;
  }

  /* ---------- gráfica de años ---------- */

  function yearData(year) {
    if (state.prov) {
      return { total: rowsForYear(year).length, segs: null };
    }
    const rows = espBase(year);
    const counts = {};
    PROVS.forEach(([name]) => { counts[name] = 0; });
    rows.forEach((p) => { counts[p.prov] = (counts[p.prov] || 0) + 1; });
    return {
      total: rows.length,
      segs: PROVS.map(([name, color]) => ({ name, color, count: counts[name] || 0 }))
    };
  }

  function renderYearChart() {
    const years = RAW.years.slice().sort((a, b) => a - b);
    const data = years.map(yearData);
    const max = Math.max.apply(null, data.map((d) => d.total).concat([1]));

    const caption = el('year-caption');
    if (caption) {
      const parts = [];
      if (state.esp) parts.push(espLabel(state.esp.split('|')[0], state.esp.split('|')[1]));
      if (state.prov) parts.push(state.prov);
      caption.textContent = parts.length ? parts.join(' · ') + ' · por año' : 'Plazas por año · por provincia';
    }

    el('year-chart').innerHTML = years.map((y, i) => {
      const d = data[i];
      const h = d.total > 0 ? Math.max(4, Math.round(Math.sqrt(d.total / max) * 120)) : 0;
      let stack;

      if (d.segs) {
        const segs = d.segs.filter((s) => s.count > 0).map((s) =>
          '<span class="yseg" style="flex-grow:' + s.count + ';background:' + s.color + '" title="' + y + ' · ' + s.name + ': ' + s.count + '"></span>'
        ).join('');
        stack = '<span class="ystack" style="height:' + h + 'px">' + segs + '</span>';
      } else {
        const color = (PROVS.find((p) => p[0] === state.prov) || ['', '#7a1738'])[1];
        stack = '<span class="ystack" style="height:' + h + 'px"><span class="yseg" style="flex-grow:1;background:' + color + '"></span></span>';
      }

      const detail = d.segs
        ? ' (' + d.segs.filter((s) => s.count > 0).map((s) => s.name + ' ' + s.count).join(', ') + ')'
        : '';

      return '<button type="button" class="ycol' + (y === state.year ? ' sel' : '') + '" data-year="' + y + '" ' +
        'aria-label="' + y + ': ' + d.total + ' plazas' + detail + '" aria-pressed="' + (y === state.year) + '">' +
        '<span class="yval">' + d.total + '</span>' +
        '<span class="yplot">' + stack + '</span>' +
        '<span class="ylab">' + y + '</span></button>';
    }).join('');

    const legend = el('year-legend');
    if (legend) {
      legend.hidden = Boolean(state.prov);
      legend.innerHTML = PROVS.map(([name, color]) =>
        '<span><i style="background:' + color + '"></i>' + name + '</span>'
      ).join('') +
        '<span class="scale" title="La altura de las barras usa escala raíz cuadrada para que se aprecien todos los años">altura √</span>';
    }
  }

  el('year-chart').addEventListener('click', (event) => {
    const col = event.target.closest('[data-year]');
    if (!col) return;
    state.year = Number(col.dataset.year);
    el('year').value = state.year;
    refreshSelect(el('year'));
    renderAll();
  });

  /* ---------- gráfica de especialidades ---------- */

  function renderEspChart(rows) {
    el('esp-year').textContent = state.year;
    const counts = new Map();
    rows.forEach((p) => {
      const key = p.c + '|' + p.esp;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 9);
    if (!top.length) {
      el('esp-chart').innerHTML = '<p class="empty">Sin datos para este año.</p>';
      return;
    }
    const max = top[0][1];
    el('esp-chart').innerHTML = top.map(([key, count]) => {
      const [c, e] = key.split('|');
      return '<div class="hbar' + (state.esp === key ? ' sel' : '') + '"><span class="hl" title="' + espLabel(c, e) + '">' + e + ' · ' + espLabel(c, e) + '</span>' +
        '<span class="htrack"><i style="width:' + Math.round((count / max) * 100) + '%"></i></span>' +
        '<b>' + count + '</b></div>';
    }).join('');
  }

  /* ---------- tabla ---------- */

  function renderTable() {
    const part = filtered.slice(0, visible);
    if (!part.length) {
      el('tbody').innerHTML = '<tr class="empty-row"><td colspan="6">No hay plazas con estos filtros.</td></tr>';
    } else {
      el('tbody').innerHTML = part.map((p) => {
        const place = p.muni || p.loc || '';
        return '<tr>' +
          '<td class="centro">' + centroLabel(p) + (p.code && p.centro ? '<small>' + p.code + '</small>' : '') + '</td>' +
          '<td class="muni">' + (place ? place + ' ' : '') + '<span class="ptag">' + p.prov + '</span></td>' +
          '<td class="esp">' + espLabel(p.c, p.esp) + '</td>' +
          '<td class="persona">' + p.n + '</td>' +
          '<td class="pts">' + fmt(p.t) + '</td>' +
          '<td class="mod"><b>' + (p.m || '·') + '</b></td>' +
        '</tr>';
      }).join('');
    }
    el('showing').textContent = 'Mostrando ' + fmtInt(part.length) + ' de ' + plazaTxt(filtered.length);
    el('more').hidden = visible >= filtered.length;
  }

  function applyFilters() {
    const q = state.q;
    filtered = PLAZAS.filter((p) => {
      if (p.y !== state.year) return false;
      if (state.esp && p.c + '|' + p.esp !== state.esp) return false;
      if (state.prov && p.prov !== state.prov) return false;
      if (q && normalize(centroLabel(p) + ' ' + p.n + ' ' + p.muni + ' ' + espLabel(p.c, p.esp)).indexOf(q) === -1) return false;
      return true;
    });
    filtered.sort((a, b) => b.t - a.t || a.n.localeCompare(b.n, 'es'));
    visible = 60;
    el('table-count').textContent = plazaTxt(filtered.length);
    renderTable();
  }

  /* ---------- KPIs ---------- */

  function renderKpis() {
    const rows = rowsForYear(state.year);
    const centros = new Set(rows.map((p) => p.code || centroLabel(p)));
    const esps = new Set(rows.map((p) => p.c + '|' + p.esp));
    const cuerpos = new Set(rows.map((p) => p.c));
    el('k-plazas').textContent = fmtInt(rows.length);
    el('k-centros').textContent = fmtInt(centros.size);
    el('k-esp').textContent = fmtInt(esps.size);
    el('k-cuerpos').textContent = fmtInt(cuerpos.size);
    el('table-year').textContent = state.year;
    const parts = [];
    if (state.esp) parts.push(espLabel(state.esp.split('|')[0], state.esp.split('|')[1]));
    if (state.prov) parts.push(state.prov);
    el('lede').textContent = (parts.length ? parts.join(' · ') + ' · ' : 'Destinos adjudicados en ') +
      state.year + ' · ' + plazaTxt(rows.length);
  }

  /* ---------- provincias ---------- */

  function renderProvChart() {
    const rows = espBase(state.year);
    const counts = {};
    PROVS.forEach(([name]) => { counts[name] = 0; });
    rows.forEach((p) => { counts[p.prov] = (counts[p.prov] || 0) + 1; });
    const max = Math.max.apply(null, Object.values(counts).concat([1]));

    el('prov-chart').innerHTML = PROVS.map(([name, color]) => {
      const count = counts[name] || 0;
      const selected = state.prov === name;
      return '<button type="button" class="prov' + (selected ? ' sel' : '') + '" data-prov="' + name + '" aria-pressed="' + selected + '">' +
        '<span class="pn">' + name + '</span>' +
        '<span class="pbar"><i style="width:' + Math.round((count / max) * 100) + '%;background:' + color + '"></i></span>' +
        '<b>' + count + '</b></button>';
    }).join('');
  }

  el('prov-chart').addEventListener('click', (event) => {
    const button = event.target.closest('[data-prov]');
    if (!button) return;
    const name = button.dataset.prov;
    state.prov = state.prov === name ? '' : name;
    refresh();
  });

  el('prov-clear').addEventListener('click', () => {
    state.prov = '';
    refresh();
  });

  /* ---------- selectores ---------- */

  YEARS.forEach((y) => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    el('year').appendChild(opt);
  });
  el('year').value = state.year;

  function rebuildEspSelect() {
    const rows = byYear.get(state.year) || [];
    const map = new Map();
    rows.forEach((p) => {
      const key = p.c + '|' + p.esp;
      if (!map.has(key)) map.set(key, p.c);
    });
    const select = el('esp');
    select.innerHTML = '<option value="">Todas las especialidades</option>';
    const byBody = new Map();
    Array.from(map.keys()).sort().forEach((key) => {
      const [c, e] = key.split('|');
      if (!byBody.has(c)) byBody.set(c, []);
      byBody.get(c).push(e);
    });
    Array.from(byBody.keys()).sort().forEach((c) => {
      const group = document.createElement('optgroup');
      group.label = c + ' · ' + (BODIES[c] || c);
      byBody.get(c).sort().forEach((e) => {
        const opt = document.createElement('option');
        opt.value = c + '|' + e;
        opt.textContent = e + ' · ' + espLabel(c, e);
        group.appendChild(opt);
      });
      select.appendChild(group);
    });

    if (state.esp && select.querySelector('option[value="' + state.esp + '"]')) {
      select.value = state.esp;
    } else {
      state.esp = '';
      select.value = '';
    }
    refreshSelect(select);
  }

  el('year').addEventListener('change', () => {
    state.year = Number(el('year').value);
    state.q = '';
    el('q').value = '';
    renderAll();
  });

  el('esp').addEventListener('change', (event) => {
    state.esp = event.target.value;
    refresh();
  });

  el('q').addEventListener('input', (event) => {
    state.q = normalize(event.target.value);
    applyFilters();
  });

  el('more').addEventListener('click', () => {
    visible += STEP;
    renderTable();
  });

  /* ---------- CSV ---------- */

  const cell = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';

  el('csv').addEventListener('click', () => {
    const header = ['Año', 'Centro', 'Código', 'Municipio', 'Localidad', 'Provincia', 'Especialidad', 'Persona', 'Puntos', 'Modalidad'];
    const lines = [header.map(cell).join(';')];
    filtered.forEach((p) => {
      lines.push([p.y, centroLabel(p), p.code, p.muni, p.loc, p.prov, espLabel(p.c, p.esp), p.n, fmt(p.t), p.m].map(cell).join(';'));
    });
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plazas-' + state.year + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  /* ---------- inicio ---------- */

  function renderAll() {
    rebuildEspSelect();
    refresh();
  }

  function refresh() {
    renderKpis();
    renderYearChart();
    renderProvChart();
    renderEspChart((byYear.get(state.year) || []).filter((p) => !state.prov || p.prov === state.prov));
    applyFilters();
  }

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

    jq('#year').select2({ minimumResultsForSearch: Infinity, width: '100%' });
    jq('#esp').select2({ width: '100%', language: lang });

    jq('#year, #esp').on('select2:select select2:unselect', function () {
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  renderAll();
  initSelects();
})();
    } catch (error) {
      console.error('[legacy:plazas]', error);
    }
  }
}
