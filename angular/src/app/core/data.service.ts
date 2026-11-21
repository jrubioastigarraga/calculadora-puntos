import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { APP_CONFIG } from './app-config';

type RptCenter = [string, string, string, string, string, number, number];
type RptRow = [number, string, string, number, number, number];
type RptData = {
  meta: {
    curso: string;
    fecha: string;
    fuente: string;
    total: number;
    centros: number;
    especialidades: number;
    municipios: number;
    birtlh: number;
  };
  cuerpos: Record<string, string>;
  centros: RptCenter[];
  especialidades: Record<string, string>;
  filas: RptRow[];
};

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly auth = inject(AuthService);
  private readonly cache = new Map<string, Promise<unknown>>();

  load<T>(file: string, globalName: string): Promise<T> {
    const key = file + '#' + globalName;
    if (!this.cache.has(key)) {
      this.cache.set(key, this.download<T>(file, globalName));
    }
    return this.cache.get(key) as Promise<T>;
  }

  private async download<T>(file: string, globalName: string): Promise<T> {
    const session = await this.auth.ready;
    if (!session) throw new Error('Sesión no disponible');

    const { data, error } = await this.auth.client.storage.from(APP_CONFIG.BUCKET).createSignedUrl(file, 3600);
    if (error || !data?.signedUrl) {
      throw new Error('No se ha podido firmar la descarga de ' + file + ': ' + (error?.message ?? ''));
    }

    const response = await fetch(data.signedUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('La descarga de ' + file + ' ha fallado (' + response.status + ').');
    const code = await response.text();

    const scope: Record<string, unknown> = {};
    new Function('window', code)(scope);
    if (!(globalName in scope)) throw new Error('El archivo ' + file + ' no define window.' + globalName);
    return scope[globalName] as T;
  }

  async loadRpt(): Promise<RptData> {
    if (this.auth.demo) {
      const response = await fetch('datos-rpt.js', { cache: 'no-store' });
      if (!response.ok) throw new Error('No se ha podido cargar datos-rpt.js (demo).');
      const scope: Record<string, unknown> = {};
      new Function('window', await response.text())(scope);
      return scope['RPT'] as RptData;
    }
    return this.load<RptData>('datos-rpt.js', 'RPT');
  }
}

export type { RptData, RptCenter, RptRow };
