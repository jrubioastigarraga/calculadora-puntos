/* Configuración pública del proyecto.
   La clave `anon` es pública por diseño: el acceso a los datos lo controla
   Supabase Auth + las políticas RLS del bucket privado `calculadora-datos`. */
window.APP_CONFIG = {
  SUPABASE_URL: 'https://idydmepueznvspefottp.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkeWRtZXB1ZXpudnNwZWZvdHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MjI5OTEsImV4cCI6MjEwOTk5ODk5MX0.5mVYiLlzZFumFTihZHLhDs4f8cUZ1sdhNF3HyQ9MxUY',
  BUCKET: 'calculadora-datos',
  EMAIL_DOMAIN: 'hezkuntza.eus',
  LOGIN_PAGE: 'login.html'
};
