/* Guard de sesión para las pantallas privadas.
   - Crea el cliente de Supabase en window.sb.
   - Expone window.authReady (promesa con la sesión; redirige a login.html si no hay).
   - Añade el botón «Salir» y el usuario al menú lateral. */
(() => {
  'use strict';

  const cfg = window.APP_CONFIG;
  if (!cfg || !window.supabase) {
    document.body.innerHTML = '<p style="padding:40px;font-family:system-ui">No se ha podido cargar la configuración de acceso.</p>';
    return;
  }

  const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  window.sb = sb;

  const currentFile = () => {
    const name = location.pathname.split('/').pop();
    return (name && name !== cfg.LOGIN_PAGE ? name : 'index.html') + location.search + location.hash;
  };

  const goLogin = () => {
    location.replace(cfg.LOGIN_PAGE + '?next=' + encodeURIComponent(currentFile()));
  };

  const usernameOf = (session) => {
    const email = (session && session.user && session.user.email) || '';
    const suffix = '@' + cfg.EMAIL_DOMAIN;
    return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email;
  };

  window.authReady = (async () => {
    const { data, error } = await sb.auth.getSession();
    if (error) console.error('[auth]', error);
    const session = data && data.session;
    if (!session) {
      goLogin();
      return null;
    }
    return session;
  })();

  sb.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') goLogin();
  });

  window.authReady.then((session) => {
    if (!session) return;
    const mount = () => {
      const tools = document.querySelector('.side-tools-body');
      if (tools && !document.getElementById('btn-logout')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tool-btn';
        btn.id = 'btn-logout';
        btn.textContent = 'Salir';
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          await sb.auth.signOut();
          location.replace(cfg.LOGIN_PAGE);
        });
        tools.appendChild(btn);
      }

      const foot = document.querySelector('.side-foot');
      if (foot && !document.getElementById('side-user')) {
        const user = document.createElement('p');
        user.className = 'side-foot';
        user.id = 'side-user';
        user.textContent = 'Sesión: ' + usernameOf(session);
        if (foot.parentNode) foot.parentNode.insertBefore(user, foot.nextSibling);
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount);
    } else {
      mount();
    }
  });
})();
