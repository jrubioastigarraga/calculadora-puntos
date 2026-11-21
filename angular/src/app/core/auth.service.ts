import { Injectable, isDevMode, signal } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { APP_CONFIG } from './app-config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly client: SupabaseClient = createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });

  readonly session = signal<Session | null>(null);
  readonly ready: Promise<Session | null>;
  readonly demo = isDevMode() && new URLSearchParams(location.search).has('demo');

  constructor() {
    this.ready = this.client.auth.getSession().then(({ data }) => {
      this.session.set(data.session ?? null);
      return data.session ?? null;
    });

    this.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
    });
  }

  get user(): string {
    const email = this.session()?.user?.email ?? '';
    const suffix = '@' + APP_CONFIG.EMAIL_DOMAIN;
    return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email;
  }

  async signIn(username: string, password: string): Promise<string | null> {
    const value = username.trim();
    if (!value) return 'Escribe el usuario.';
    const email = value.includes('@') ? value : value + '@' + APP_CONFIG.EMAIL_DOMAIN;
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (!error) return null;
    if (/invalid login credentials/i.test(error.message)) return 'Usuario o contraseña incorrectos.';
    if (/email not confirmed/i.test(error.message)) return 'La cuenta no está confirmada.';
    return 'No se ha podido iniciar sesión: ' + error.message;
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }
}
