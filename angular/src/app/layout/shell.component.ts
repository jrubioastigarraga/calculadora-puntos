import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../core/auth.service';

type NavItem = { path: string; label: string; icon: string };

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private sub?: Subscription;

  readonly sidebarOpen = signal(false);
  readonly title = signal('');

  readonly navItems: NavItem[] = [
    { path: '/calculadora', label: 'Calculadora', icon: 'bi-calculator' },
    { path: '/clasificacion', label: 'Clasificación', icon: 'bi-list-ol' },
    { path: '/plazas', label: 'Plazas', icon: 'bi-bar-chart' },
    { path: '/rpt', label: 'Plazas RPT', icon: 'bi-building' },
    { path: '/ikha', label: 'IKHA', icon: 'bi-journal-text' },
    { path: '/forzosak', label: 'Forzosak 27-28 LAL', icon: 'bi-people' },
    { path: '/faq', label: 'FAQ', icon: 'bi-question-circle' },
  ];

  ngOnInit(): void {
    this.updateTitle();
    this.sub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTitle();
        this.sidebarOpen.set(false);
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigate(['/login']);
  }

  private updateTitle(): void {
    const current = this.navItems.find((item) => this.router.url.startsWith(item.path));
    const titles: Record<string, string> = {
      '/calculadora': 'Calculadora',
      '/clasificacion': 'Clasificación',
      '/plazas': 'Plazas adjudicadas',
      '/rpt': 'Plazas RPT',
      '/ikha': 'IKHA',
      '/forzosak': 'Forzosak 27-28 LAL',
      '/faq': 'Preguntas frecuentes',
    };
    this.title.set(titles[current?.path ?? ''] ?? 'Hezkuntzako datuak');
  }
}
