// @ts-nocheck
import { AfterViewInit, Component, ViewEncapsulation, inject } from '@angular/core';
import { PageDataService } from '../../../core/page-data.service';

@Component({
  selector: 'app-ikha-legacy',
  standalone: true,
  templateUrl: './ikha.component.html',
  styleUrl: './ikha.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class IkhaLegacyComponent implements AfterViewInit {
  private readonly pageData = inject(PageDataService);

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.pageData.ensure('curso');
      /* Lógica original de ikha.html */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (id) => document.getElementById(id);
  const fmtInt = (v) => String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const nf = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPts = (v) => nf.format(Math.round((Number(v) || 0) * 100) / 100);
  const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

  if (!window.IKHA) {
    document.body.innerHTML = '<p style="padding:40px;font-family:system-ui">No se ha podido cargar <code>datos-curso.js</code>. Mantén los archivos en la misma carpeta.</p>';
    return;
  }

  const RAW = window.IKHA;
  const ESP = RAW.especialidades;

  const base = (a) => ({
    cc: a[0], centro: a[1], muni: a[2], prov: a[3], nivel: a[4],
    esp: a[5], espName: a[6], perfil: a[7], situ: a[8]
  });

  const DATA = {
    puestos: RAW.puestos.map((a) => ({ ...base(a), horas: a[9], jornada: a[10], obs: a[11] })),
    sustitutos: RAW.sustitutos.map((a) => ({ ...base(a), nombre: a[9], puntos: a[10], jornada: a[11] })),
    carrera: RAW.carrera.map((a) => ({ ...base(a), nombre: a[9] })),
    practicas: RAW.practicas.map((a) => ({ ...base(a), nombre: a[9], dni: a[10] }))
  };

  const espLabel = (code) => ESP[code] || ('Especialidad ' + code);

  const TABS = {
    puestos: {
      title: 'Puestos de trabajo',
      columns: [
        { label: 'Centro', cls: 'centro', html: (r) => r.centro + (r.cc ? '<small>' + r.cc + '</small>' : '') },
        { label: 'Municipio', key: 'muni', cls: 'muni' },
        { label: 'Provincia', key: 'prov', cls: 'muni' },
        { label: 'Nivel', key: 'nivel', cls: 'muni' },
        { label: 'Especialidad', key: 'espName', cls: 'esp' },
        { label: 'Perfil', key: 'perfil', cls: 'muni' },
        { label: 'Horas', key: 'horas', cls: 'muni' },
        { label: 'Jornada', key: 'jornada', cls: 'muni' },
        { label: 'Situación', key: 'situ', cls: 'situ' }
      ]
    },
    sustitutos: {
      title: 'Sustitutos',
      columns: [
        { label: 'Nombre', key: 'nombre', cls: 'nombre' },
        { label: 'Puntos', cls: 'pts', html: (r) => fmtPts(r.puntos) },
        { label: 'Centro', cls: 'centro', html: (r) => r.centro + (r.cc ? '<small>' + r.cc + '</small>' : '') },
        { label: 'Municipio', key: 'muni', cls: 'muni' },
        { label: 'Especialidad', key: 'espName', cls: 'esp' },
        { label: 'Jornada', key: 'jornada', cls: 'muni' },
        { label: 'Situación', key: 'situ', cls: 'situ' }
      ]
    },
    carrera: {
      title: 'Funcionarios de carrera',
      columns: [
        { label: 'Nombre', key: 'nombre', cls: 'nombre' },
        { label: 'Centro', cls: 'centro', html: (r) => r.centro + (r.cc ? '<small>' + r.cc + '</small>' : '') },
        { label: 'Municipio', key: 'muni', cls: 'muni' },
        { label: 'Especialidad', key: 'espName', cls: 'esp' },
        { label: 'Situación', key: 'situ', cls: 'situ' }
      ]
    },
    practicas: {
      title: 'Funcionarios en prácticas',
      columns: [
        { label: 'Nombre', cls: 'nombre', html: (r) => r.nombre || '<span style="color:#b3a2a8">Sin identificar</span>' },
        { label: 'DNI', key: 'dni', cls: 'muni' },
        { label: 'Centro', cls: 'centro', html: (r) => r.centro + (r.cc ? '<small>' + r.cc + '</small>' : '') },
        { label: 'Municipio', key: 'muni', cls: 'muni' },
        { label: 'Especialidad', key: 'espName', cls: 'esp' },
        { label: 'Situación', key: 'situ', cls: 'situ' }
      ]
    }
  };

  const PROVS = ['Araba', 'Bizkaia', 'Gipuzkoa', 'Otras'];
  const state = { tab: 'puestos', q: '', prov: '', nivel: '', esp: '', onlyNamed: false };
  let rows = [];
  let filtered = [];
  let visible = 60;
  const STEP = 120;

  function dataset() {
    return DATA[state.tab];
  }

  function match(row, opts = {}) {
    if (state.q) {
      const hay = normalize(row.centro + ' ' + (row.nombre || '') + ' ' + row.muni + ' ' + row.espName + ' ' + row.situ);
      if (hay.indexOf(state.q) === -1) return false;
    }
    if (state.prov && row.prov !== state.prov) return false;
    if (state.nivel && row.nivel !== state.nivel) return false;
    if (state.esp && row.esp !== state.esp) return false;
    if (state.onlyNamed && !row.nombre) return false;
    return true;
  }

  function applyFilters() {
    filtered = rows.filter((r) => match(r));
    filtered.sort((a, b) => {
      if (a.nombre && b.nombre) return a.nombre.localeCompare(b.nombre, 'es');
      return a.centro.localeCompare(b.centro, 'es');
    });
    visible = 60;
    el('table-count').textContent = fmtInt(filtered.length) + ' registros';
    renderTable();
    renderKpis();
  }

  function renderKpis() {
    const centros = new Set(filtered.map((r) => r.cc || r.centro));
    const esps = new Set(filtered.map((r) => r.esp));
    const munis = new Set(filtered.map((r) => r.muni).filter(Boolean));
    el('k-rows').textContent = fmtInt(filtered.length);
    el('k-centros').textContent = fmtInt(centros.size);
    el('k-esp').textContent = fmtInt(esps.size);
    el('k-muni').textContent = fmtInt(munis.size);
  }

  function renderTable() {
    const cols = TABS[state.tab].columns;
    const part = filtered.slice(0, visible);

    el('thead').innerHTML = '<tr>' + cols.map((c) => '<th class="' + (c.cls || '') + '">' + c.label + '</th>').join('') + '</tr>';

    if (!part.length) {
      el('tbody').innerHTML = '<tr class="empty-row"><td colspan="' + cols.length + '">No hay datos con estos filtros.</td></tr>';
    } else {
      el('tbody').innerHTML = part.map((r) =>
        '<tr>' + cols.map((c) => {
          const value = c.html ? c.html(r) : (r[c.key] || '');
          return '<td class="' + (c.cls || '') + '">' + value + '</td>';
        }).join('') + '</tr>'
      ).join('');
    }

    el('table-title').textContent = TABS[state.tab].title;
    el('showing').textContent = 'Mostrando ' + fmtInt(part.length) + ' de ' + fmtInt(filtered.length) + ' registros';
    el('more').hidden = visible >= filtered.length;
  }

  /* ---------- gráficas ---------- */

  function renderProvChart() {
    const scoped = rows.filter((r) => {
      if (state.nivel && r.nivel !== state.nivel) return false;
      if (state.esp && r.esp !== state.esp) return false;
      if (state.onlyNamed && !r.nombre) return false;
      if (state.q) {
        const hay = normalize(r.centro + ' ' + (r.nombre || '') + ' ' + r.muni + ' ' + r.espName);
        if (hay.indexOf(state.q) === -1) return false;
      }
      return true;
    });
    const counts = {};
    PROVS.forEach((p) => { counts[p] = 0; });
    scoped.forEach((r) => { counts[r.prov] = (counts[r.prov] || 0) + 1; });
    const max = Math.max.apply(null, Object.values(counts).concat([1]));

    el('prov-chart').innerHTML = PROVS.map((p) => {
      const count = counts[p] || 0;
      const active = state.prov === p;
      return '<div class="hbar' + (active ? ' sel' : '') + '"><span class="hl">' + p + '</span>' +
        '<span class="htrack"><i style="width:' + Math.round((count / max) * 100) + '%"></i></span>' +
        '<b>' + count + '</b></div>';
    }).join('');
    el('prov-caption').textContent = fmtInt(scoped.length) + ' registros';
  }

  function renderEspChart() {
    const scoped = rows.filter((r) => {
      if (state.prov && r.prov !== state.prov) return false;
      if (state.nivel && r.nivel !== state.nivel) return false;
      if (state.onlyNamed && !r.nombre) return false;
      if (state.q) {
        const hay = normalize(r.centro + ' ' + (r.nombre || '') + ' ' + r.muni + ' ' + r.espName);
        if (hay.indexOf(state.q) === -1) return false;
      }
      return true;
    });
    const counts = new Map();
    scoped.forEach((r) => { counts.set(r.esp, (counts.get(r.esp) || 0) + 1); });
    const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (!top.length) {
      el('esp-chart').innerHTML = '<p class="note">Sin datos.</p>';
      el('esp-caption').textContent = '';
      return;
    }
    const max = top[0][1];
    el('esp-chart').innerHTML = top.map(([code, count]) =>
      '<div class="hbar' + (state.esp === code ? ' sel' : '') + '"><span class="hl" title="' + espLabel(code) + '">' + espLabel(code) + '</span>' +
      '<span class="htrack"><i style="width:' + Math.round((count / max) * 100) + '%"></i></span>' +
      '<b>' + count + '</b></div>'
    ).join('');
    el('esp-caption').textContent = state.tab;
  }

  /* ---------- selectores ---------- */

  function refreshSelect(select) {
    if (window.jQuery && window.jQuery(select).data('select2')) {
      window.jQuery(select).trigger('change.select2');
    }
  }

  function rebuildSelects() {
    const data = dataset();

    const niveles = Array.from(new Set(data.map((r) => r.nivel)));
    const order = ['Primaria', 'Secundaria', 'Idiomas', 'Adultos', 'Música', 'Artes', 'Especial', 'Otras'];
    niveles.sort((a, b) => order.indexOf(a) - order.indexOf(b));

    const nivelSel = el('nivel');
    nivelSel.innerHTML = '<option value="">Todos los niveles</option>' +
      niveles.map((n) => '<option value="' + n + '">' + n + '</option>').join('');
    if (state.nivel && niveles.indexOf(state.nivel) === -1) state.nivel = '';
    nivelSel.value = state.nivel;

    const codes = Array.from(new Set(data.map((r) => r.esp)));
    codes.sort((a, b) => espLabel(a).localeCompare(espLabel(b), 'es'));
    const espSel = el('esp');
    espSel.innerHTML = '<option value="">Todas las especialidades</option>' +
      codes.map((c) => '<option value="' + c + '">' + c + ' · ' + espLabel(c) + '</option>').join('');
    if (state.esp && codes.indexOf(state.esp) === -1) state.esp = '';
    espSel.value = state.esp;

    refreshSelect(nivelSel);
    refreshSelect(espSel);
  }

  function setTab(tab) {
    state.tab = tab;
    state.esp = '';
    state.nivel = '';
    state.onlyNamed = false;
    el('only-named').checked = false;
    el('named-wrap').hidden = tab !== 'practicas';
    rows = dataset();
    document.querySelectorAll('.tab').forEach((b) => {
      const active = b.dataset.tab === tab;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    rebuildSelects();

    const note = el('tab-note');
    if (tab === 'practicas') {
      const named = DATA.practicas.filter((r) => r.nombre).length;
      note.hidden = false;
      note.textContent = named + ' de ' + DATA.practicas.length + ' prácticas con nombre identificado por cruce de DNI con los listados de 2025/2026. El resto no consta en esos listados.';
    } else {
      note.hidden = true;
    }

    renderProvChart();
    renderEspChart();
    applyFilters();
  }

  el('prov').addEventListener('change', (e) => {
    state.prov = e.target.value;
    renderProvChart();
    renderEspChart();
    applyFilters();
  });

  el('nivel').addEventListener('change', (e) => {
    state.nivel = e.target.value;
    renderProvChart();
    renderEspChart();
    applyFilters();
  });

  el('esp').addEventListener('change', (e) => {
    state.esp = e.target.value;
    renderEspChart();
    applyFilters();
  });

  el('q').addEventListener('input', (e) => {
    state.q = normalize(e.target.value);
    renderProvChart();
    renderEspChart();
    applyFilters();
  });

  el('only-named').addEventListener('change', (e) => {
    state.onlyNamed = e.target.checked;
    renderProvChart();
    renderEspChart();
    applyFilters();
  });

  document.querySelectorAll('.tab').forEach((b) => {
    b.addEventListener('click', () => setTab(b.dataset.tab));
  });

  el('more').addEventListener('click', () => {
    visible += STEP;
    renderTable();
  });

  /* ---------- CSV ---------- */

  const cell = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';

  el('csv').addEventListener('click', () => {
    const headers = ['Centro', 'Código', 'Municipio', 'Provincia', 'Nivel', 'Especialidad', 'Perfil', 'Situación', 'Nombre', 'DNI', 'Puntos', 'Horas', 'Jornada'];
    const lines = [headers.map(cell).join(';')];
    filtered.forEach((r) => {
      lines.push([r.centro, r.cc, r.muni, r.prov, r.nivel, r.espName, r.perfil, r.situ, r.nombre || '', r.dni || '', r.puntos != null ? fmtPts(r.puntos) : '', r.horas || '', r.jornada || ''].map(cell).join(';'));
    });
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ikha-' + state.tab + '-2026-2027.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  /* ---------- inicio ---------- */

  function initSelects() {
    if (!window.jQuery || !window.jQuery.fn.select2) return;
    const jq = window.jQuery;
    const lang = {
      noResults: function () { return 'Sin resultados'; },
      searching: function () { return 'Buscando…'; }
    };
    jq('#prov').select2({ minimumResultsForSearch: Infinity, width: '100%' });
    jq('#nivel').select2({ minimumResultsForSearch: Infinity, width: '100%' });
    jq('#esp').select2({ width: '100%', language: lang });
    jq('#prov, #nivel, #esp').on('select2:select select2:unselect', function () {
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  el('c-puestos').textContent = fmtInt(DATA.puestos.length);
  el('c-sustitutos').textContent = fmtInt(DATA.sustitutos.length);
  el('c-carrera').textContent = fmtInt(DATA.carrera.length);
  el('c-practicas').textContent = fmtInt(DATA.practicas.length);

  rows = DATA.puestos;
  setTab('puestos');
  initSelects();
})();
    } catch (error) {
      console.error('[legacy:ikha]', error);
    }
  }
}
