import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ready;
    if (session) await this.router.navigateByUrl(this.nextPath());
  }

  async submit(): Promise<void> {
    this.error = '';
    if (!this.username.trim() || !this.password) {
      this.error = 'Escribe el usuario y la contraseña.';
      return;
    }
    this.loading = true;
    const error = await this.auth.signIn(this.username, this.password);
    this.loading = false;
    if (error) {
      this.error = error;
      return;
    }
    await this.router.navigateByUrl(this.nextPath());
  }

  private nextPath(): string {
    const raw = this.route.snapshot.queryParamMap.get('next') ?? '/rpt';
    return raw.startsWith('/') && !raw.startsWith('//') ? raw : '/rpt';
  }
}
