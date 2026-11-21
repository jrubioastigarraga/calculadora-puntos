import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pending',
  standalone: true,
  template: `
    <div class="card">
      <div class="card-body text-center py-5">
        <i class="bi bi-tools display-5 text-primary"></i>
        <h2 class="h4 mt-3">En migración</h2>
        <p class="text-muted mb-3">
          La pantalla <strong>{{ title }}</strong> todavía no está migrada a Angular. Se está portando por fases.
        </p>
        <a class="btn btn-outline-primary btn-sm" href="/rpt">Ir a Plazas RPT</a>
      </div>
    </div>
  `,
})
export class PendingComponent {
  readonly title = inject(ActivatedRoute).snapshot.data['title'] ?? 'esta sección';
}
