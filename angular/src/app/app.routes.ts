import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { FaqComponent } from './pages/faq/faq.component';
import { LoginComponent } from './pages/login/login.component';
import { PendingComponent } from './pages/pending/pending.component';
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
      { path: 'calculadora', component: PendingComponent, canActivate: [authGuard], data: { title: 'Calculadora' } },
      { path: 'clasificacion', component: PendingComponent, canActivate: [authGuard], data: { title: 'Clasificación' } },
      { path: 'plazas', component: PendingComponent, canActivate: [authGuard], data: { title: 'Plazas' } },
      { path: 'ikha', component: PendingComponent, canActivate: [authGuard], data: { title: 'IKHA' } },
      { path: 'forzosak', component: PendingComponent, canActivate: [authGuard], data: { title: 'Forzosak' } },
      { path: '**', redirectTo: 'rpt' },
    ],
  },
];
