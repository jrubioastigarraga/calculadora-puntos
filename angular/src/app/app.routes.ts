import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { FaqComponent } from './pages/faq/faq.component';
import { CalculadoraLegacyComponent } from './pages/legacy/calculadora/calculadora.component';
import { ClasificacionLegacyComponent } from './pages/legacy/clasificacion/clasificacion.component';
import { ForzosakLegacyComponent } from './pages/legacy/forzosak/forzosak.component';
import { IkhaLegacyComponent } from './pages/legacy/ikha/ikha.component';
import { PlazasLegacyComponent } from './pages/legacy/plazas/plazas.component';
import { LoginComponent } from './pages/login/login.component';
import { RptComponent } from './pages/rpt/rpt.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'rpt' },
      { path: 'faq', component: FaqComponent },
      { path: 'rpt', component: RptComponent, canActivate: [authGuard] },
      { path: 'calculadora', component: CalculadoraLegacyComponent, canActivate: [authGuard] },
      { path: 'clasificacion', component: ClasificacionLegacyComponent, canActivate: [authGuard] },
      { path: 'plazas', component: PlazasLegacyComponent, canActivate: [authGuard] },
      { path: 'ikha', component: IkhaLegacyComponent, canActivate: [authGuard] },
      { path: 'forzosak', component: ForzosakLegacyComponent, canActivate: [authGuard] },
      { path: '**', redirectTo: 'rpt' },
    ],
  },
];
