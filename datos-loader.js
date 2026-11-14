/* Carga los datos desde el bucket privado de Supabase Storage.
   Uso: <script src="datos-loader.js" data-file="datos.js"></script>
   Expone window.DATA_READY, que resuelve cuando window.DATOS / window.IKHA
   ya están disponibles. */
(() => {
  'use strict';

  const script = document.currentScript;
  const file = (script && script.dataset.file) || 'datos.js';
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let leaving = false;
  window.addEventListener('beforeunload', () => { leaving = true; });

  const showError = (message) => {
    const box = document.createElement('div');
    box.setAttribute('role', 'alert');
    box.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px;background:#f7eff1;font-family:"Segoe UI",system-ui,sans-serif;color:#241419;text-align:center';
    box.innerHTML = '<div style="max-width:520px;background:#fff;border:1px solid #e7d8dd;border-radius:16px;padding:28px 32px;box-shadow:0 12px 28px -18px rgba(45,20,25,.35)">' +
      '<h1 style="font-size:20px;margin:0 0 8px">No se han podido cargar los datos</h1>' +
      '<p style="margin:0 0 18px;color:#7d6b70">' + message + '</p>' +
      '<button type="button" style="border:0;border-radius:10px;padding:10px 18px;background:#7a1738;color:#fff;font:inherit;cursor:pointer" onclick="location.reload()">Reintentar</button></div>';
    document.body.appendChild(box);
  };

  const signedUrlFor = async (attempt = 1) => {
    const { data, error } = await window.sb.storage
      .from(window.APP_CONFIG.BUCKET)
      .createSignedUrl(file, 3600);
    if (!error) return data.signedUrl;
    if (attempt < 3) {
      await sleep(400 * attempt);
      return signedUrlFor(attempt + 1);
    }
    throw new Error('No se ha podido firmar la descarga de ' + file + ': ' + error.message);
  };

  const download = async (attempt = 1) => {
    try {
      const response = await fetch(await signedUrlFor(), { cache: 'no-store' });
      if (!response.ok) throw new Error('La descarga de ' + file + ' ha fallado (' + response.status + ').');
      return await response.text();
    } catch (error) {
      if (attempt < 4) {
        await sleep(400 * attempt);
        return download(attempt + 1);
      }
      throw error;
    }
  };

  window.DATA_READY = (async () => {
    const session = await window.authReady;
    if (!session) throw new Error('Sesión no disponible');

    const code = await download();
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    try {
      await new Promise((resolve, reject) => {
        const tag = document.createElement('script');
        tag.src = url;
        tag.onload = resolve;
        tag.onerror = () => reject(new Error('El archivo de datos no se ha podido ejecutar.'));
        document.head.appendChild(tag);
      });
    } finally {
      URL.revokeObjectURL(url);
    }
    return true;
  })().catch((error) => {
    if (leaving) return false;
    console.error('[datos]', error);
    if (document.body) showError('Comprueba la conexión e inténtalo de nuevo.');
    throw error;
  });
})();
