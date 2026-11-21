import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { DataService, RptData } from '../../core/data.service';
import { EUSKADI_GEO } from './euskadi-geo';

type Center = {
  code: string;
  name: string;
  town: string;
  prov: string;
  official: string;
  lat?: number;
  lon?: number;
};

type Row = {
  centro: Center;
  spec: string;
  body: string;
  n: number;
  p1: number;
  p2: number;
};

type SortKey = 'centro' | 'muni' | 'prov' | 'body' | 'spec' | 'n' | 'p2';
type Bar = { label: string; code?: string; n: number; pct: number };

const PROV_COLORS: Record<string, string> = {
  Araba: '#b45309',
  Bizkaia: '#7a1738',
  Gipuzkoa: '#1d4ed8',
  Otras: '#8d7a80',
};

const PROV_FILLS: Record<string, string> = {
  Araba: '#fbf3e8',
  Bizkaia: '#f9edf0',
  Gipuzkoa: '#eef2fb',
  Otras: '#f3eff0',
};

const BODY_ORDER = ['CPES', 'CPSING', 'ESPECIALISTA', 'PTFP'];

@Component({
  selector: 'app-rpt',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rpt.component.html',
  styleUrl: './rpt.component.scss',
})
export class RptComponent implements OnInit, OnDestroy {
  private readonly dataService = inject(DataService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly meta = signal<RptData['meta'] | null>(null);
  readonly kpis = signal({ plazas: 0, centros: 0, esp: 0, muni: 0 });
  readonly bodies = signal<{ code: string; label: string }[]>([]);
  readonly specs = signal<{ code: string; label: string }[]>([]);
  readonly provBars = signal<Bar[]>([]);
  readonly espBars = signal<Bar[]>([]);
  readonly filtered = signal<Row[]>([]);
  readonly visible = signal(60);
  readonly sortKey = signal<SortKey>('centro');
  readonly sortDir = signal(1);

  readonly part = computed(() => this.filtered().slice(0, this.visible()));
  readonly hasMore = computed(() => this.visible() < this.filtered().length);

  q = '';
  prov = '';
  body = '';
  esp = '';
  readonly provinces = ['Araba', 'Bizkaia', 'Gipuzkoa'];

  private centers: Center[] = [];
  private rows: Row[] = [];
  private espNames: Record<string, string> = {};
  private cuerpos: Record<string, string> = {};

  private map?: L.Map;
  private markers?: L.LayerGroup;

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.dataService.loadRpt();
      this.meta.set(data.meta);
      this.espNames = data.especialidades;
      this.cuerpos = data.cuerpos;
      this.centers = data.centros.map((c) => ({
        code: c[0],
        name: c[1],
        town: c[2],
        prov: c[3],
        official: c[4] || '',
        lat: c[5],
        lon: c[6],
      }));
      this.rows = data.filas.map((f) => ({
        centro: this.centers[f[0]],
        spec: f[1],
        body: f[2],
        n: f[3],
        p1: f[4],
        p2: f[5],
      }));
      this.buildSelects();
      this.applyFilters();
      this.loading.set(false);
      setTimeout(() => {
        this.initMap();
        this.renderMap();
      }, 0);
    } catch (error) {
      this.error.set((error as Error).message || 'No se han podido cargar los datos.');
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  applyFilters(): void {
    const q = this.norm(this.q);
    const rows = this.rows.filter((r) => {
      if (this.prov && r.centro.prov !== this.prov) return false;
      if (this.body && r.body !== this.body) return false;
      if (this.esp && r.spec !== this.esp) return false;
      if (q) {
        const hay = this.norm(
          r.centro.name +
            ' ' +
            r.centro.town +
            ' ' +
            r.centro.code +
            ' ' +
            r.centro.official +
            ' ' +
            this.specLabel(r.spec) +
            ' ' +
            r.spec,
        );
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    rows.sort((a, b) => this.compare(a, b));
    this.filtered.set(rows);
    this.visible.set(60);
    this.updateKpis(rows);
    this.updateCharts();
    this.renderMap();
  }

  resetFilters(): void {
    this.q = '';
    this.prov = '';
    this.body = '';
    this.esp = '';
    this.applyFilters();
  }

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => -d);
    } else {
      this.sortKey.set(key);
      this.sortDir.set(key === 'n' || key === 'p2' ? -1 : 1);
    }
    const rows = [...this.filtered()].sort((a, b) => this.compare(a, b));
    this.filtered.set(rows);
    this.visible.set(60);
  }

  more(): void {
    this.visible.update((v) => v + 120);
  }

  ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) return 'none';
    return this.sortDir() > 0 ? 'ascending' : 'descending';
  }

  bodyLabel(body: string): string {
    return this.cuerpos[body] || body;
  }

  specLabel(code: string): string {
    return this.espNames[code] || 'Especialidad ' + code;
  }

  fmtInt(value: number): string {
    return String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  downloadCsv(): void {
    const headers = ['Centro', 'Código oficial', 'Código RPT', 'Municipio', 'Provincia', 'Cuerpo', 'Especialidad', 'Plazas', 'PL2'];
    const cell = (v: unknown) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = [headers.map(cell).join(';')];
    this.filtered().forEach((r) => {
      lines.push(
        [
          r.centro.name,
          r.centro.official,
          r.centro.code,
          r.centro.town,
          r.centro.prov,
          this.bodyLabel(r.body),
          this.specLabel(r.spec),
          r.n,
          r.p2,
        ]
          .map(cell)
          .join(';'),
      );
    });
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plazas-rpt-2026-2027.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  private buildSelects(): void {
    const bodies = Array.from(new Set(this.rows.map((r) => r.body)));
    bodies.sort((a, b) => {
      const ia = BODY_ORDER.indexOf(a);
      const ib = BODY_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || this.bodyLabel(a).localeCompare(this.bodyLabel(b), 'es');
    });
    this.bodies.set(bodies.map((code) => ({ code, label: this.bodyLabel(code) })));

    const specs = Array.from(new Set(this.rows.map((r) => r.spec)));
    specs.sort((a, b) => this.specLabel(a).localeCompare(this.specLabel(b), 'es'));
    this.specs.set(specs.map((code) => ({ code, label: this.specLabel(code) })));
  }

  private updateKpis(rows: Row[]): void {
    this.kpis.set({
      plazas: rows.reduce((n, r) => n + r.n, 0),
      centros: new Set(rows.map((r) => r.centro.code)).size,
      esp: new Set(rows.map((r) => r.spec)).size,
      muni: new Set(rows.map((r) => r.centro.town).filter(Boolean)).size,
    });
  }

  private updateCharts(): void {
    const provRows = this.scoped('prov');
    const counts: Record<string, number> = { Araba: 0, Bizkaia: 0, Gipuzkoa: 0, Otras: 0 };
    provRows.forEach((r) => {
      counts[r.centro.prov] = (counts[r.centro.prov] || 0) + r.n;
    });
    const maxProv = Math.max(1, ...Object.values(counts));
    this.provBars.set(
      this.provinces.map((p) => ({ label: p, n: counts[p] || 0, pct: Math.round(((counts[p] || 0) / maxProv) * 100) })),
    );

    const rows = this.scoped('esp');
    const bySpec = new Map<string, number>();
    rows.forEach((r) => bySpec.set(r.spec, (bySpec.get(r.spec) || 0) + r.n));
    const top = Array.from(bySpec.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const maxSpec = top.length ? top[0][1] : 1;
    this.espBars.set(
      top.map(([code, n]) => ({
        code,
        label: this.specLabel(code),
        n,
        pct: Math.round((n / maxSpec) * 100),
      })),
    );
  }

  private scoped(except: 'prov' | 'esp'): Row[] {
    const q = this.norm(this.q);
    return this.rows.filter((r) => {
      if (except !== 'prov' && this.prov && r.centro.prov !== this.prov) return false;
      if (except !== 'esp' && this.esp && r.spec !== this.esp) return false;
      if (this.body && r.body !== this.body) return false;
      if (q) {
        const hay = this.norm(r.centro.name + ' ' + r.centro.town + ' ' + this.specLabel(r.spec) + ' ' + r.spec);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  private compare(a: Row, b: Row): number {
    const key = this.sortKey();
    const value = (r: Row): string | number => {
      switch (key) {
        case 'centro':
          return r.centro.name;
        case 'muni':
          return r.centro.town;
        case 'prov':
          return r.centro.prov;
        case 'body':
          return this.bodyLabel(r.body);
        case 'spec':
          return this.specLabel(r.spec);
        case 'n':
          return r.n;
        case 'p2':
          return r.p2;
      }
    };
    const va = value(a);
    const vb = value(b);
    let cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es');
    if (cmp === 0) {
      cmp = a.centro.name.localeCompare(b.centro.name, 'es') || this.specLabel(a.spec).localeCompare(this.specLabel(b.spec), 'es');
    }
    return cmp * this.sortDir();
  }

  private initMap(): void {
    const container = document.getElementById('mapRpt');
    if (!container || this.map) return;

    this.map = L.map(container, {
      zoomControl: true,
      attributionControl: false,
      minZoom: 8,
      maxZoom: 14,
      zoomSnap: 0.25,
      scrollWheelZoom: false,
    }).setView([43.02, -2.55], 9);

    L.geoJSON(EUSKADI_GEO, {
      interactive: false,
      style: (feature: any) => {
        const name = feature?.properties?.name ?? '';
        return {
          color: '#cdb9bf',
          weight: 1,
          opacity: 0.9,
          fillColor: PROV_FILLS[name] || '#f3eff0',
          fillOpacity: 1,
        };
      },
    })
      .bindTooltip((layer: any) => layer.feature?.properties?.name ?? '', {
        permanent: true,
        direction: 'center',
        className: 'map-prov-label',
        opacity: 1,
      })
      .addTo(this.map);

    this.markers = L.layerGroup().addTo(this.map);
    window.addEventListener('resize', () => this.map?.invalidateSize());
    this.renderMap();
  }

  private renderMap(): void {
    if (!this.map || !this.markers) return;
    const groups = new Map<string, { centro: Center; total: number; esps: Map<string, number> }>();
    this.filtered().forEach((r) => {
      if (typeof r.centro.lat !== 'number' || typeof r.centro.lon !== 'number') return;
      let group = groups.get(r.centro.code);
      if (!group) {
        group = { centro: r.centro, total: 0, esps: new Map() };
        groups.set(r.centro.code, group);
      }
      group.total += r.n;
      group.esps.set(r.spec, (group.esps.get(r.spec) || 0) + r.n);
    });

    this.markers.clearLayers();
    const list = Array.from(groups.values()).sort((a, b) => b.total - a.total);
    const max = Math.max(1, ...list.map((g) => g.total));
    const bounds: L.LatLngTuple[] = [];

    list.forEach((group) => {
      const c = group.centro;
      const radius = 7 + Math.round(Math.sqrt(group.total / max) * 15);
      const marker = L.circleMarker([c.lat as number, c.lon as number], {
        radius,
        color: '#fff',
        weight: 1.5,
        opacity: 0.95,
        fillColor: PROV_COLORS[c.prov] || '#8d7a80',
        fillOpacity: 0.78,
      }).addTo(this.markers as L.LayerGroup);

      marker.bindTooltip(this.escape(c.name) + ' · ' + this.fmtInt(group.total) + ' plazas', { direction: 'top' });
      marker.bindPopup(this.popupHtml(group), { maxWidth: 320 });
      bounds.push([c.lat as number, c.lon as number]);
    });

    if (bounds.length) this.map.fitBounds(bounds, { padding: [24, 24], maxZoom: 11 });
    else this.map.setView([43.02, -2.55], 9);
  }

  private popupHtml(group: { centro: Center; total: number; esps: Map<string, number> }): string {
    const top = Array.from(group.esps.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return (
      '<b>' +
      this.escape(group.centro.name) +
      '</b><div class="text-muted small">' +
      this.escape(group.centro.town) +
      ' · ' +
      this.escape(group.centro.prov) +
      '</div><div class="mt-1"><strong>' +
      this.fmtInt(group.total) +
      '</strong> plazas</div>' +
      (top.length
        ? '<ul class="mb-0 ps-3 mt-1 small">' +
          top.map(([code, n]) => '<li>' + this.escape(this.specLabel(code)) + ' · ' + this.fmtInt(n) + '</li>').join('') +
          '</ul>'
        : '')
    );
  }

  private norm(value: string): string {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  private escape(value: string): string {
    return String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
  }
}
