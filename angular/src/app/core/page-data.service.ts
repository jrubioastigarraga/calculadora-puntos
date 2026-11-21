import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { DataService } from './data.service';

type LegacyWindow = Window & {
  DATOS?: unknown;
  IKHA?: unknown;
  FORZOSAK_DATA?: unknown;
};

@Injectable({ providedIn: 'root' })
export class PageDataService {
  private readonly auth = inject(AuthService);
  private readonly data = inject(DataService);

  async ensure(kind: 'datos' | 'curso'): Promise<void> {
    const win = window as LegacyWindow;
    if (kind === 'datos' && !win.DATOS) {
      win.DATOS = await this.loadLegacy('datos.js', 'DATOS');
    }
    if (kind === 'curso' && !win.IKHA) {
      win.IKHA = await this.loadLegacy('datos-curso.js', 'IKHA');
    }
  }

  private async loadLegacy(file: string, globalName: string): Promise<unknown> {
    if (this.auth.demo) {
      const response = await fetch(file, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('No se ha podido cargar ' + file + ' (demo). Copia el archivo a angular/public/.');
      }
      const scope: Record<string, unknown> = {};
      new Function('window', await response.text())(scope);
      return scope[globalName];
    }
    return this.data.load(file, globalName);
  }
}
