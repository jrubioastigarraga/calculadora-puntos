// @ts-nocheck
import { AfterViewInit, Component, ViewEncapsulation, inject } from '@angular/core';
import { PageDataService } from '../../../core/page-data.service';

@Component({
  selector: 'app-forzosak-legacy',
  standalone: true,
  templateUrl: './forzosak.component.html',
  styleUrl: './forzosak.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ForzosakLegacyComponent implements AfterViewInit {
  private readonly pageData = inject(PageDataService);

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.pageData.ensure('datos');
      /* Lógica original de forzosak.html */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (id) => document.getElementById(id);

  const nf = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const fmt = (v) => nf.format(Math.round((Number(v) || 0) * 10000) / 10000);
  const fmtInt = (v) => String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const normalize = (text) => String(text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

  if (!window.DATOS || !window.FORZOSAK_DATA) {
    document.body.innerHTML = '<p style="padding:40px;font-family:system-ui">No se han podido cargar los datos. Mantén todos los archivos en la misma carpeta.</p>';
    return;
  }

  const RAW = window.DATOS;
  const FORZ = window.FORZOSAK_DATA;
  const BODIES = RAW.bodies || {};
  const SPECIALTIES = {};
  Object.keys(RAW.specialties || {}).forEach((k) => {
    const name = RAW.specialties[k];
    if (name && name !== '/' && name !== '-') SPECIALTIES[k] = name;
  });

  const espLabel = (cuerpo, esp) => SPECIALTIES[cuerpo + '|' + esp] || ('Especialidad ' + esp);
  const cuerpoLabel = (cuerpo) => BODIES[cuerpo] || ('Cuerpo ' + cuerpo);

  /* plazas ofertadas: [codigo, plazas, nombre, centros] */
  const PLAZAS = new Map(FORZ.plazas.map((p) => [p[0], { n: p[1], name: p[2], centros: p[3] }]));
  /* plazas ofertadas por especialidad y provincia: [codigo, provincia, plazas] */
  const PLAZAS_PROV = new Map((FORZ.plazasProv || []).map((p) => [p[0] + '|' + p[1], p[2]]));

  const normKey = (s) => normalize(s).replace(/[^A-Z0-9]/g, '');

  /* provincia del PDF del traslado 2025 (CK3024, campo LH/TH) */
  const LAL = new Map((FORZ.lal || []).map((r) => [normKey(r[0]) + '|' + r[1], r[2]]));
  const provinciaLal = (name, cuerpo) => LAL.get(normKey(name) + '|' + cuerpo) || '';

  /* Emparejamiento robusto: el PDF usa códigos "0237" pero los listados pueden
     usar "237", el nombre de la especialidad u otro formato. */
  const ESP_BY_CODE = new Map();   // variantes de código -> {cuerpo, esp, name}
  const ESP_BY_NAME = new Map();   // nombre normalizado -> {cuerpo, esp, name}
  Object.keys(SPECIALTIES).forEach((k) => {
    const sep = k.lastIndexOf('|');
    const rec = { cuerpo: k.slice(0, sep), esp: k.slice(sep + 1), name: SPECIALTIES[k] };
    [rec.esp, String(rec.esp).padStart(4, '0'), String(parseInt(rec.esp, 10) || '')].forEach((v) => {
      if (v && !ESP_BY_CODE.has(v)) ESP_BY_CODE.set(v, rec);
    });
    const nk = normKey(rec.name);
    if (nk && !ESP_BY_NAME.has(nk)) ESP_BY_NAME.set(nk, rec);
  });

  /* nombre de la especialidad de cada código en el PDF de la OPE */
  const SPEC_NAME = new Map((FORZ.specs || []).map((s) => [s[0], s[1]]));

  function plazasPara(esp, label) {
    const variants = [String(esp), String(esp).padStart(4, '0'), String(parseInt(esp, 10) || '')];
    for (const v of variants) if (PLAZAS.has(v)) return PLAZAS.get(v);
    const nk = normKey(label);
    for (const p of PLAZAS.values()) if (normKey(p.name) === nk) return p;
    return null;
  }

  function codigoPlazas(esp, label) {
    const variants = [String(esp), String(esp).padStart(4, '0'), String(parseInt(esp, 10) || '')];
    for (const v of variants) if (PLAZAS.has(v)) return v;
    const nk = normKey(label);
    for (const [code, p] of PLAZAS) if (normKey(p.name) === nk) return code;
    return null;
  }

  /* plazas de la especialidad en una provincia concreta */
  function plazasEnProvincia(esp, label, provincia) {
    const code = codigoPlazas(esp, label);
    if (!code || !provincia || provincia === 'Sin provincia') return 0;
    return PLAZAS_PROV.get(code + '|' + provincia) || 0;
  }

  /* provincia elegida el curso anterior: destino del concurso, asignación azul o prácticas (OPE) */
  function provinciaDeDestino(dest) {
    if (!dest) return '';
    const c = String(dest[3] || '');
    if (c.length === 6) {
      return ({ '010': 'Araba', '012': 'Gipuzkoa', '013': 'Gipuzkoa', '014': 'Bizkaia', '015': 'Bizkaia' })[c.slice(0, 3)] || 'Otras';
    }
    return ({ '01': 'Araba', '20': 'Gipuzkoa', '48': 'Bizkaia' })[c.slice(0, 2)] || 'Otras';
  }

  function provinciaConcurso(person, esp) {
    const dest = (person[8] || {})[esp];
    if (dest && dest.length) return provinciaDeDestino(dest);
    if (person[9] && person[9][2]) return person[9][2];
    return 'Sin provincia';
  }

  function registroEsp(code) {
    const variants = [String(code), String(code).padStart(4, '0'), String(parseInt(code, 10) || '')];
    for (const v of variants) if (ESP_BY_CODE.has(v)) return ESP_BY_CODE.get(v);
    return ESP_BY_NAME.get(normKey(SPEC_NAME.get(code) || '')) || null;
  }

  /* cuerpo de Profesorado de Enseñanza Secundaria (los seleccionados en la OPE son todos de ese cuerpo) */
  let PES_BODY = '';
  Object.keys(BODIES).forEach((c) => {
    const label = normalize(BODIES[c]);
    if (label.indexOf('PROFESOR') !== -1 && label.indexOf('SECUNDARIA') !== -1) PES_BODY = c;
  });
  if (!PES_BODY) {
    const rec = registroEsp('0237');
    if (rec) PES_BODY = rec.cuerpo;
  }

  function datosOpe(code) {
    let rec = registroEsp(code);
    if (rec && PES_BODY && rec.cuerpo !== PES_BODY && SPECIALTIES[PES_BODY + '|' + rec.esp]) {
      rec = { cuerpo: PES_BODY, esp: rec.esp, name: SPECIALTIES[PES_BODY + '|' + rec.esp] };
    }
    if (rec) return { cuerpo: rec.cuerpo, esp: rec.esp };
    return { cuerpo: PES_BODY || '', esp: code };
  }

  /* ---------- construcción de la lista combinada ---------- */

  const ALL = [];

  (RAW.people || []).filter((p) => p[0] === 2025).forEach((person) => {
    (person[5] || []).forEach((esp) => {
      const provBase = provinciaConcurso(person, esp);
      const provLal = provinciaLal(person[1], person[2]);
      ALL.push({
        key: 'C|' + person[1] + '|' + person[2] + '|' + esp,
        tipo: 'concurso',
        cuerpo: person[2],
        esp: esp,
        prov: provBase !== 'Sin provincia' ? provBase : (provLal || 'Sin provincia'),
        provLal: provLal,
        usaLal: provBase === 'Sin provincia' && !!provLal,
        name: person[1],
        moda: person[3],
        pl: person[4],
        total: person[6],
        s: person[7] || [],
        dest: person[8] || null,
        asig: person[9] || null,
        det: person[10] || null,
        pos: 0,
        conPlaza: false,
        nPlazas: 0
      });
    });
  });

  FORZ.ope.forEach((o) => {
    const code = o[0];
    const info = datosOpe(code);
    if (!info.cuerpo) return;
    const provBase = o[7] || 'Sin provincia';
    const provLal = provinciaLal(o[1], info.cuerpo);
    ALL.push({
      key: 'F|' + o[4] + '|' + info.cuerpo + '|' + info.esp + '|' + o[6],
      tipo: 'forzoso',
      cuerpo: info.cuerpo,
      esp: info.esp,
      prov: provBase !== 'Sin provincia' ? provBase : (provLal || 'Sin provincia'),
      provLal: provLal,
      usaLal: provBase === 'Sin provincia' && !!provLal,
      name: o[1],
      turno: o[2],
      anexo: o[3],
      codigo: o[4],
      dni: o[5],
      orden: o[6],
      moda: null,
      pl: null,
      total: null,
      s: [],
      det: null,
      pos: 0,
      conPlaza: false,
      nPlazas: 0
    });
  });

  const CONCURSO_COUNT = ALL.filter((r) => r.tipo === 'concurso').length;
  const FORZOSO_COUNT = ALL.filter((r) => r.tipo === 'forzoso').length;
  el('subtitle').textContent = fmtInt(CONCURSO_COUNT) + ' de la clasificación 2025 + ' +
    fmtInt(FORZOSO_COUNT) + ' seleccionados en la OPE 2025';

  function compareConcurso(a, b) {
    if (b.total !== a.total) return b.total - a.total;
    for (let i = 0; i < 7; i += 1) {
      const av = a.s[i] || 0, bv = b.s[i] || 0;
      if (bv !== av) return bv - av;
    }
    return a.name.localeCompare(b.name, 'es');
  }

  /* reordena y recalcula puestos / plazas para el conjunto indicado */
  function rankPool(pool) {
    const groups = new Map();
    pool.forEach((r) => {
      const k = r.cuerpo + '|' + r.esp + '|' + r.prov;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(r);
    });

    const plazasPorGrupo = new Map();
    groups.forEach((list, k) => {
      list.sort((a, b) => {
        if (a.tipo !== b.tipo) return a.tipo === 'concurso' ? -1 : 1;
        if (a.tipo === 'forzoso') return a.orden - b.orden;
        return compareConcurso(a, b);
      });
      const n = plazasEnProvincia(list[0].esp, espLabel(list[0].cuerpo, list[0].esp), list[0].prov);
      let adjudicadas = 0;
      list.forEach((r, i) => {
        r.pos = i + 1;
        r.nPlazas = n;
        /* solo excluye a quien tiene DESTINO ADJUDICADO en el concurso anterior;
           la asignación azul de principio de curso no es una plaza de concurso */
        r.yaTiene = r.tipo === 'concurso' && tieneDestino(r);
        if (state.excluirYa && r.yaTiene) {
          r.conPlaza = false;
        } else if (adjudicadas < n) {
          r.conPlaza = true;
          adjudicadas += 1;
        } else {
          r.conPlaza = false;
        }
      });
      plazasPorGrupo.set(k, n);
    });
    return plazasPorGrupo;
  }

  const state = { q: '', cuerpo: '', esp: '', prov: '', moda: [], tipo: '', soloPlaza: false, excluirYa: true, sort: 'esp' };
  let centrosOpen = false;

  function tieneDestino(r) {
    if (!r.dest) return false;
    return Object.keys(r.dest).some((k) => !!(r.dest[k] && r.dest[k].length));
  }
  let filtered = [];
  let visible = 80;
  const STEP = 120;

  function applyFilters() {
    /* el pool (sin búsqueda por nombre ni filtro de origen) determina quién entra en las plazas */
    const pool = ALL.filter((r) => {
      if (state.cuerpo && r.cuerpo !== state.cuerpo) return false;
      if (state.esp && r.cuerpo + '|' + r.esp !== state.esp) return false;
      if (state.prov && r.prov !== state.prov) return false;
      if (state.moda.length && r.tipo === 'concurso' && state.moda.indexOf(r.moda) === -1) return false;
      return true;
    });

    const plazasPorGrupo = rankPool(pool);

    filtered = pool.filter((r) => {
      if (state.q && normalize(r.name).indexOf(state.q) === -1) return false;
      if (state.tipo && r.tipo !== state.tipo) return false;
      if (state.soloPlaza && !r.conPlaza) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (state.sort === 'puntos') {
        const aa = a.total == null ? -Infinity : a.total;
        const bb = b.total == null ? -Infinity : b.total;
        if (bb !== aa) return bb - aa;
      } else {
        const ka = a.cuerpo + a.esp + a.prov, kb = b.cuerpo + b.esp + b.prov;
        if (ka !== kb) return ka < kb ? -1 : 1;
      }
      if (a.tipo !== b.tipo && a.total == null !== (b.total == null)) {
        return a.total == null ? 1 : -1;
      }
      return a.pos - b.pos;
    });

    visible = 80;
    renderAll(plazasPorGrupo, pool);
  }

  /* ---------- pintado ---------- */

  function rowHtml(row) {
    const medal = row.conPlaza ? ' p1' : (row.pos <= 3 ? ' p' + row.pos : '');
    const lalTxt = row.provLal
      ? row.provLal + (row.usaLal ? ' <span class="lal-fallback" title="Provincia usada porque no consta destino ni asignación">*</span>' : '')
      : '—';
    const tipoChip = row.tipo === 'forzoso'
      ? '<span class="origen-chip f">OPE</span>'
      : '<span class="origen-chip c">Concurso</span>';
    const asigLine = (row.tipo === 'concurso' && row.asig && row.asig.length)
      ? '<span class="asig" title="Asignación para el curso 2026/2027">' + (row.asig[3] || '') + ' · ' + row.asig[0] + '</span>'
      : '';
    const pts = row.tipo === 'forzoso'
      ? '<td class="sel">Selecc. ' + row.orden + '</td>'
      : '<td class="pts">' + fmt(row.total) + '</td>';
    const badge = row.conPlaza
      ? '<span class="badge si">Con plaza</span>'
      : (row.yaTiene && state.excluirYa
        ? '<span class="badge ya">Ya con plaza</span>'
        : '<span class="badge no">Sin plaza</span>');
    return '<tr class="main-row' + (row.tipo === 'forzoso' ? ' forzoso' : '') + '" data-key="' + row.key + '" aria-expanded="false">' +
      '<td class="pos"><span class="posnum' + medal + (row.tipo === 'forzoso' ? ' forz' : '') + '">' + row.pos + '</span></td>' +
      '<td class="name">' + row.name + asigLine + '</td>' +
      '<td class="origen">' + tipoChip + '</td>' +
      '<td class="esp">' + espLabel(row.cuerpo, row.esp) + '</td>' +
      '<td class="prov">' + (row.prov === 'Sin provincia' ? '—' : row.prov) + '</td>' +
      '<td class="prov lal" title="PDF del traslado 2025 · LH/TH">' + lalTxt + '</td>' +
      '<td class="moda"><b class="m-' + (row.moda || 'x') + '">' + (row.moda || '·') + '</b></td>' +
      pts +
      '<td class="plaza">' + badge + '</td>' +
      '<td class="chev"><button type="button" class="chev-btn" aria-expanded="false" aria-label="Ver detalle de ' + row.name + '">›</button></td>' +
      '</tr>';
  }

  function destinoTexto(row) {
    if (row.dest) {
      const d = row.dest[row.esp] || Object.values(row.dest)[0];
      if (d && d.length) return d[0] + (d[1] ? ' · ' + d[1] : '');
    }
    if (row.asig && row.asig.length) return row.asig[0] + ' (2026/27)';
    return '';
  }

  function detailHtml(row) {
    let info;
    if (row.tipo === 'forzoso') {
      info = '<div class="detail-top"><strong>' + row.name + '</strong>' +
        '<span>Seleccionado/a en la OPE 2025 · Anexo ' + row.anexo + ' · Turno ' + (row.turno || '—') + '</span>' +
        '<span>Orden de selección: ' + row.orden + ' · Código ' + (row.codigo || '—') + ' · DNI ' + (row.dni || '—') + '</span>' +
        '<span>Puesto ' + row.pos + ' en la clasificación combinada de ' + espLabel(row.cuerpo, row.esp) + ' · ' + row.prov + (row.provLal ? ' · LH/TH ' + row.provLal : '') + '</span></div>';
    } else {
      const labels = ['1.1', '1.2', '2', '3', '4', '5', '6'];
      const desc = {
        '1.1': 'Antigüedad en el centro', '1.2': 'Antigüedad en el cuerpo',
        '2': 'Pertenencia a Catedráticos/as', '3': 'Méritos académicos',
        '4': 'Cargos y funciones', '5': 'Formación', '6': 'Otros méritos'
      };
      const chips = labels.map((l, i) =>
        '<span class="chip" title="' + desc[l] + '"><i>' + l + '</i><b>' + fmt(row.s[i] || 0) + '</b></span>'
      ).join('');
      info = '<div class="detail-top"><strong>' + row.name + '</strong>' +
        '<span>' + cuerpoLabel(row.cuerpo) + ' · ' + row.esp + ' ' + espLabel(row.cuerpo, row.esp) + '</span>' +
        '<span>Modalidad ' + (row.moda || '—') + ' · Perfil ' + (row.pl || '—') + '</span>' +
        '<span>Puesto ' + row.pos + ' en la clasificación combinada · ' + row.prov + '</span></div>' +
        '<p class="detail-note">Desglose por apartados de la clasificación del concurso</p>' +
        '<div class="chips">' + chips + '</div>' +
        (row.yaTiene
          ? '<p class="destino"><span class="tag">Plaza anterior</span> <b>' + destinoTexto(row) + '</b> · no consume una plaza nueva</p>'
          : (row.asig && row.asig.length
            ? '<p class="destino"><span class="tag asig-tag">Asignación 2026/27</span> <b>' + row.asig[0] + '</b> · no es plaza de concurso</p>'
            : ''));
    }
    const plazasInfo = '<p class="destino"><span class="tag">Plazas</span> <b>' + row.nPlazas + '</b> en ' +
      espLabel(row.cuerpo, row.esp) + ' en ' + row.prov + ' · ' + (row.conPlaza ? 'le correspondería plaza (puesto ' + row.pos + ')' : 'sin plaza (puesto ' + row.pos + ')') + '</p>';
    return '<tr class="detail-row"><td colspan="9"><div class="detail">' + info + plazasInfo + '</div></td></tr>';
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

  function centrosEspecialidad() {
    if (!state.esp) return [];
    const sep = state.esp.indexOf('|');
    const c = state.esp.slice(0, sep), e = state.esp.slice(sep + 1);
    const code = codigoPlazas(e, espLabel(c, e));
    const list = (code && (FORZ.plazasCentros || {})[code]) || [];
    return list
      .filter((r) => !state.prov || r[3] === state.prov)
      .map((r) => ({ code: r[0], name: r[1], town: r[2], prov: r[3], vac: r[4] }));
  }

  function renderCentros() {
    const btn = el('btn-centros');
    const panel = el('centros-panel');
    if (!state.esp) {
      centrosOpen = false;
      btn.hidden = true;
      panel.hidden = true;
      return;
    }
    const list = centrosEspecialidad();
    if (!list.length) {
      btn.hidden = true;
      panel.hidden = true;
      return;
    }
    const total = list.reduce((n, r) => n + r.vac, 0);
    el('centros-resumen').textContent = fmtInt(list.length) + (list.length === 1 ? ' centro' : ' centros') + ' · ' +
      fmtInt(total) + (total === 1 ? ' plaza' : ' plazas') + (state.prov ? ' · ' + state.prov : '');
    el('centros-lista').innerHTML = list.map((r) =>
      '<li><div><span class="centro-name">' + r.name + '</span><span class="centro-code">' + r.code + '</span>' +
      '<span class="centro-meta">' + r.town + ' · ' + r.prov + '</span></div>' +
      '<span class="centro-vac">' + fmtInt(r.vac) + (r.vac === 1 ? ' plaza' : ' plazas') + '</span></li>'
    ).join('');
    btn.hidden = false;
    btn.textContent = centrosOpen ? 'Ocultar centros' : 'Ver centros';
    btn.setAttribute('aria-expanded', centrosOpen ? 'true' : 'false');
    panel.hidden = !centrosOpen;
  }

  function renderStats(plazasPorGrupo, pool) {
    const totalPlazas = Array.from(plazasPorGrupo.values()).reduce((a, b) => a + b, 0);
    const conPlaza = pool.filter((r) => r.conPlaza).length;
    const forzConPlaza = pool.filter((r) => r.tipo === 'forzoso' && r.conPlaza).length;
    el('st-count').textContent = fmtInt(filtered.length);
    el('st-plazas').textContent = fmtInt(totalPlazas);
    el('st-adj').textContent = fmtInt(conPlaza);
    el('st-forz').textContent = fmtInt(forzConPlaza);

    if (state.esp) {
      const c = state.esp.split('|')[0], e = state.esp.split('|')[1];
      const p = plazasPara(e, espLabel(c, e));
      el('banner-esp').textContent = e + ' · ' + espLabel(c, e) + (state.prov ? ' · ' + state.prov : '');
      el('banner-plazas').textContent = fmtInt(totalPlazas) + (totalPlazas === 1 ? ' plaza' : ' plazas');
      const nCentros = centrosEspecialidad().length;
      el('banner-detalle').textContent = p ? '(' + fmtInt(nCentros) + (nCentros === 1 ? ' centro' : ' centros') + ' con vacantes en el documento provisional)' : '(sin vacantes en el documento provisional)';
    } else {
      el('banner-esp').textContent = 'Todas las especialidades';
      el('banner-plazas').textContent = fmtInt(totalPlazas) + ' plazas ofertadas';
      el('banner-detalle').textContent = '(' + fmtInt(plazasPorGrupo.size) + ' especialidades con vacantes)';
    }
    const excluidos = pool.filter((r) => r.yaTiene).length;
    el('banner-excluidos').textContent = state.excluirYa && excluidos
      ? '· ' + fmtInt(excluidos) + ' con plaza de concurso anterior (excluidos)'
      : '';
    el('banner-ope').textContent = '· ' + fmtInt(pool.filter((r) => r.tipo === 'forzoso').length) + ' forzosos OPE en la lista';
    renderCentros();
  }

  function renderAll(plazasPorGrupo, pool) {
    renderStats(plazasPorGrupo, pool);
    renderRows();
  }

  /* ---------- desglose ---------- */

  el('tbody').addEventListener('click', (event) => {
    const rowEl = event.target.closest('tr.main-row');
    if (!rowEl) return;
    const open = rowEl.classList.contains('open');
    $$('tr.main-row.open').forEach((tr) => {
      tr.classList.remove('open');
      tr.setAttribute('aria-expanded', 'false');
      const b = $('.chev-btn', tr);
      if (b) b.setAttribute('aria-expanded', 'false');
      const next = tr.nextElementSibling;
      if (next && next.classList.contains('detail-row')) next.remove();
    });
    if (open) return;
    const row = ALL.find((r) => r.key === rowEl.dataset.key);
    if (!row) return;
    rowEl.classList.add('open');
    rowEl.setAttribute('aria-expanded', 'true');
    $('.chev-btn', rowEl).setAttribute('aria-expanded', 'true');
    rowEl.insertAdjacentHTML('afterend', detailHtml(row));
  });

  /* ---------- selectores ---------- */

  const bodySelect = el('f-cuerpo');
  Object.keys(BODIES).forEach((code) => {
    if (!ALL.some((r) => r.cuerpo === code)) return;
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
    ALL.forEach((r) => {
      if (state.cuerpo && r.cuerpo !== state.cuerpo) return;
      if (!byBody.has(r.cuerpo)) byBody.set(r.cuerpo, new Set());
      byBody.get(r.cuerpo).add(r.esp);
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
    else { state.esp = ''; select.value = ''; }
    refreshSelect(select);
  }

  function refreshSelect(select) {
    if (window.jQuery && window.jQuery(select).data('select2')) {
      window.jQuery(select).trigger('change.select2');
    }
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

  el('f-prov').addEventListener('change', (event) => {
    state.prov = event.target.value;
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

  el('f-tipo').addEventListener('change', (event) => {
    state.tipo = event.target.value;
    applyFilters();
  });

  el('solo-plaza').addEventListener('change', (event) => {
    state.soloPlaza = event.target.checked;
    applyFilters();
  });

  el('excluir-ya').addEventListener('change', (event) => {
    state.excluirYa = event.target.checked;
    applyFilters();
  });

  function clearFilters() {
    state.q = ''; state.cuerpo = ''; state.esp = ''; state.prov = ''; state.moda = [];
    state.tipo = ''; state.soloPlaza = false; state.excluirYa = true;
    el('q').value = '';
    bodySelect.value = '';
    el('f-tipo').value = '';
    el('f-prov').value = '';
    el('solo-plaza').checked = false;
    el('excluir-ya').checked = true;
    if (window.jQuery && window.jQuery(el('moda')).data('select2')) {
      window.jQuery(el('moda')).val(null).trigger('change.select2');
    }
    rebuildEspSelect();
    applyFilters();
  }
  el('clear').addEventListener('click', clearFilters);
  el('clear2').addEventListener('click', clearFilters);

  function setSort(mode) {
    state.sort = mode;
    el('th-esp').classList.toggle('active', mode === 'esp');
    el('th-pts').classList.toggle('active', mode === 'puntos');
    $('.arrow', el('th-esp')).textContent = mode === 'esp' ? '▲' : '↕';
    $('.arrow', el('th-pts')).textContent = mode === 'puntos' ? '▼' : '↕';
    applyFilters();
  }
  $$('th.sortable button').forEach((b) => b.addEventListener('click', () => setSort(b.dataset.sort)));

  el('more').addEventListener('click', () => { visible += STEP; renderRows(); });

  el('btn-centros').addEventListener('click', () => {
    centrosOpen = !centrosOpen;
    renderCentros();
  });

  /* ---------- CSV ---------- */

  const cell = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  el('csv').addEventListener('click', () => {
    const header = ['Puesto', 'Nombre', 'Origen', 'Cuerpo', 'Especialidad', 'Provincia', 'LH/TH (PDF traslado)', 'Modalidad', 'Perfil', 'Puntos', 'Orden selección OPE', 'Anexo', 'Turno', 'Plazas ofertadas', 'Con plaza', 'Ya tenía plaza'];
    const lines = [header.map(cell).join(';')];
    filtered.forEach((r) => {
      lines.push([
        r.pos, r.name, r.tipo === 'forzoso' ? 'Forzoso OPE' : 'Clasificación',
        r.cuerpo, espLabel(r.cuerpo, r.esp), r.prov, r.provLal || '', r.moda || '', r.pl || '',
        r.total == null ? '' : fmt(r.total),
        r.tipo === 'forzoso' ? r.orden : '', r.anexo || '', r.turno || '',
        r.nPlazas, r.conPlaza ? 'SI' : 'NO', r.yaTiene ? 'SI' : 'NO'
      ].map(cell).join(';'));
    });
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'forzosak-27-28-lal.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  /* ---------- inicio ---------- */

  function initSelects() {
    if (!window.jQuery || !window.jQuery.fn.select2) return;
    const jq = window.jQuery;
    const lang = { noResults: () => 'Sin resultados', searching: () => 'Buscando…' };
    jq('#f-cuerpo').select2({ minimumResultsForSearch: Infinity, width: '100%' });
    jq('#f-esp').select2({ width: '100%', language: lang });
    jq('#f-prov').select2({ minimumResultsForSearch: Infinity, width: '100%' });
    jq('#moda').select2({ width: '100%', placeholder: 'Modalidad', allowClear: true, closeOnSelect: false, language: lang });
    jq('#f-tipo').select2({ minimumResultsForSearch: Infinity, width: '100%' });
    jq('#f-cuerpo, #f-esp, #f-prov, #moda, #f-tipo').on('select2:select select2:unselect', function () {
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  rebuildEspSelect();
  setSort('esp');
  initSelects();
})();
    } catch (error) {
      console.error('[legacy:forzosak]', error);
    }
  }
}
