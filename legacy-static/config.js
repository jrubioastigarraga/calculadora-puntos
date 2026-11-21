/* Configuración pública del proyecto.
   La clave `anon` es pública por diseño: el acceso a los datos lo controla
   Supabase Auth + las políticas RLS del bucket privado `calculadora-datos`. */
window.APP_CONFIG = {
  SUPABASE_URL: 'https://eanxoqqfxzkpoundagfw.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbnhvcXFmeHprcG91bmRhZ2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2NzcwNTAsImV4cCI6MjExMDI1MzA1MH0.UvoY_djLtRR62FArJDu6ri95BlrcYRy-c7pC4Gxc0rc',
  BUCKET: 'calculadora-datos',
  EMAIL_DOMAIN: 'hezkuntza.eus',
  LOGIN_PAGE: 'login.html'
};
