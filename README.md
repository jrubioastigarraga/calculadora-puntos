# Hezkuntzako datuak · Traslados docentes Euskadi

Seis pantallas de datos y una de ayuda sobre los datos educativos de Euskadi, sin servidor:

| Archivo | Qué hace |
|---|---|
| `index.html` | **Calculadora**: baremo del Anexo I para las convocatorias **2025/2026** y **2026/2027**. |
| `clasificacion.html` | **Clasificación**: participantes de 2010–2025, con desplegable de año, filtros y comparador. |
| `plazas.html` | **Plazas adjudicadas**: destinos por año, con gráficas y tabla. |
| `rpt.html` | **Plazas RPT**: plantilla orgánica de Secundaria y FP de Euskadi, curso 2026/2027. |
| `ikha.html` | **IKHA**: puestos, sustitutos, funcionarios de carrera y prácticas del curso 2026/2027. |
| `forzosak.html` | **Forzosak 27-28 LAL**: clasificación del concurso + seleccionados de la OPE 2025, con plazas ofertadas y adjudicación orientativa. |
| `faq.html` | **Preguntas frecuentes**: modalidades de participación (A-K), perfiles y glosario. Es la única pantalla pública. |
| `datos.js` | Datos de todos los años de traslados (participantes y plazas). |
| `datos-curso.js` | Datos del curso 2026/2027 de IKHA. |

Abre `index.html` con doble clic. El menú lateral enlaza todas las pantallas; `faq.html` no necesita sesión.

## Calculadora · 25/26 y 26/27

- Dos convocatorias con pestañas: **25/26** (Orden de 13/11/2025, BOPV n.º 243) y **26/27** (Orden de 8/10/2026, BOPV n.º 211, concurso de ámbito estatal).
- Baremo completo, topes, desglose y guardado comunes; al cambiar de convocatoria se ajustan los apartados y las reglas.
- **Cambios de 26/27**:
  - desaparece el **4.4** (valoración positiva de cargos directivos);
  - los cargos y funciones de **4.1, 4.2, 4.3, 6.4 y 6.6 se acumulan** aunque se desempeñen simultáneamente;
  - nueva **5.4** de competencia digital docente: A1 0,5 · A2 1 · B1 1,5 · B2 2 · C1 2,5 · C2 3, solo el nivel superior y máximo 3;
  - los idiomas cambian de sitio: **3.4 desaparece**; los certificados de **EOI van a 3.3** y los **externos (ACLES) a 5.5**, una sola vez por idioma y nivel superior; no se valoran los certificados de español;
  - **6.6.2** se computa desde el curso 2025/2026;
  - el resto de valores y topes se mantiene (3: 10 · 4: 30 · 5: 15 · 6: 15).

## Clasificación

- Desplegables con **Select2** (buscador en especialidades).
- Desplegable de **año** (2010–2025; 2018 no se incluye: ese listado corresponde al cuerpo de Maestros).
- Filtros por **especialidad**, **modalidad** (múltiple: A, B, E, F, J), **cuerpo** y búsqueda por nombre.
- Puesto calculado dentro de cada especialidad y año, con la puntuación y los criterios de desempate.
- Ficha desplegable con el desglose 1.1 → 6, el **detalle interno de subapartados** del listado (1.1.1, 1.1.2, 3.3.a, 4.2, 5.1…) y su descripción al pasar el ratón, además del destino y la asignación cuando constan.
- Los importes de los subapartados son los del listado; el total del apartado aplica el tope correspondiente.
- Comparador de puntuación: al elegir especialidad, indica el puesto que se ocuparía ese año.
- Exportación a CSV.

## Plazas

- Desplegables con **Select2** (buscador en especialidades).
- Gráfica de **plazas por año** con barras apiladas por **provincia** (Araba, Bizkaia, Gipuzkoa y «Otras»); al seleccionar una provincia, la gráfica muestra solo esa provincia. La altura usa escala raíz cuadrada para que se aprecien todos los años (los valores exactos figuran sobre cada barra).
- Gráfica de **especialidades** con más plazas del año elegido.
- Desglose y filtro por **provincia**: Araba, Bizkaia, Gipuzkoa y «Otras» (centros fuera de las tres provincias).
- Indicadores de plazas, centros, especialidades y cuerpos.
- Tabla de destinos del año (centro, municipio, provincia, especialidad, persona y puntos) con búsqueda y filtro.
- Exportación a CSV.

## Plazas RPT (curso 2026/2027)

- Relación de puestos de trabajo (RPT) de los centros públicos de Educación Secundaria y Formación Profesional: **11.086 plazas**, **183 centros**, **109 especialidades** y **83 municipios**.
- Incluye la propuesta de RPT del **CIFP de Aprendizajes Virtuales y Digitalizados (BIRTLH, 013613)**: 69 plazas.
- Filtros por **provincia**, **cuerpo** (CPES, CPSING, especialistas y PTFP) y **especialidad** (Select2 con buscador), además de búsqueda libre por centro, municipio o especialidad.
- Indicadores de plazas, centros, especialidades y municipios.
- Gráficas por **provincia** y por **especialidad** (top 8), tabla centro-especialidad con plazas y **PL2**, y exportación a CSV.
- **Tabla ordenable**: al pulsar en cualquier cabecera se ordena por esa columna; un segundo clic invierte el orden. Las columnas numéricas empiezan de mayor a menor.
- **Mapa de centros** con las plazas de la selección actual: cada centro es un círculo cuyo tamaño indica sus plazas, coloreado por provincia y con detalle de especialidades al pulsarlo. Se ajusta automáticamente a los filtros.
- El mapa funciona **sin teselas, sin API key y sin peticiones externas**: usa Leaflet en local y los límites provinciales incluidos en `vendor/euskadi-geo.js`.
- Cada fila muestra el **código oficial de centro** (Orden de 8/10/2026, Anexo II-2) y el código RPT cuando difieren.
- La RPT es plantilla orgánica: **no contiene información de ocupación**, así que no permite saber cuántas plazas están vacantes o sin cubrir.

## IKHA (curso 2026/2027)

- Pestañas: **Puestos** (10.570), **Sustitutos** (8.590), **Carrera** (873) y **Prácticas** (886).
- Filtros por **provincia**, **nivel**, **especialidad** (Select2 con buscador) y texto libre.
- Indicadores, gráficas por provincia y especialidad, tabla y exportación a CSV.
- Los **nombres de las prácticas** se han obtenido cruzando el DNI enmascarado con los listados de 2025/2026: **427 de 886** quedan identificados; el resto no aparece en esos listados. Hay una casilla «Solo con nombre».
- Los nombres de sustitutos y carrera provienen de los listados de 2026/2027.

## Forzosak 27-28 LAL

- Clasificación combinada: participantes del concurso 2025 (con puntos, desempates y desglose) y, **a continuación en cada especialidad**, las 895 personas seleccionadas en la OPE 2025 (Anexos I, II y III de la Orden de 9/7/2026, BOPV n.º 138), en su orden de selección.
- **Plazas ofertadas**: vacantes del documento *Lekualdatze Lehiaketa Eragina 27-28* (versión provisional de 19/11/2026): 410 plazas en 51 especialidades. Se muestran por especialidad y se recalculan al filtrar.
- Se marca como «con plaza» a las primeras N personas *elegibles* de cada especialidad, donde N es el número de plazas ofertadas (recálculo orientativo).
- **Exclusión de adjudicatarios previos**: solo quienes tienen **destino adjudicado en el concurso anterior** (572 personas en 2025) se marcan como «Ya con plaza» y **no consumen plaza nueva**. La **asignación azul de principio de curso** (233 personas) no es una plaza de concurso: se muestra en azul junto al nombre, pero no excluye a la persona. Se puede desactivar con la casilla «Excluir plazas del concurso anterior».
- **Separación por provincia elegida el curso anterior** (Araba / Bizkaia / Gipuzkoa): la provincia de la clasificación se obtiene del destino del concurso o de la asignación azul y, si no consta, del PDF del traslado 2025 (campo **LH/TH**); la de los forzosos OPE, del destino de prácticas del curso 2026/27 (cruzando el DNI enmascarado con `datos-curso.js`). Las plazas ofertadas están desglosadas por provincia en `forzosak-data.js` (`plazasProv`) y se adjudican dentro de cada provincia. Solo queda «Sin provincia» si no consta en ninguna de esas fuentes, y entonces no opta a plazas provinciales.
- **Columna LH/TH**: muestra la provincia del listado de participantes del concurso 2025 (CK3024, campo LH/TH), incorporada a `forzosak-data.js` (`lal`) por nombre y cuerpo. Se usa como provincia cuando falta destino o asignación. La OPE 2025 no aparece en ese PDF (todavía no era funcionaria), así que su provincia sigue saliendo de las prácticas.
- **Centros con vacantes**: al elegir una especialidad, el resumen de plazas ofertadas se puede desplegar para ver los centros con vacantes (código, municipio, provincia y plazas), filtrados también por la provincia elegida. Los datos están en `forzosak-data.js` (`plazasCentros`) y proceden del documento *Eragina 27-28* (provisional de 19/11/2026).
- **Cruce OPE ↔ prácticas sin colisiones**: el DNI enmascarado puede repetirse entre personas distintas. El cruce se desempata por nombre completo y, si hace falta, por especialidad, para no atribuir a alguien la provincia de otra persona con el mismo fragmento de DNI. Los casos sin coincidencia fiable quedan como «Sin provincia».
- Filtros por cuerpo, especialidad (Select2), provincia, modalidad, origen (clasificación / forzosos), búsqueda por nombre y «Solo con plaza». Indicadores y exportación a CSV.
- Los datos de la OPE y de las plazas ofertadas están en `forzosak-data.js` (archivo público, sin datos personales sensibles: DNI enmascarado).

## Preguntas frecuentes

- Página de ayuda **pública** (`faq.html`), sin sesión ni datos personales.
- Explica las **modalidades de participación** del concurso (códigos A-K) y destaca las cinco que aparecen en los listados: **A** destino definitivo, **B** excedente voluntario, **E** supresión o modificación del puesto, **F** reingreso con destino provisional y **J** sin primer destino definitivo.
- Aclara que la modalidad **no suma puntos** ni cambia el orden, y la diferencia frente al **perfil lingüístico** (PL1/PL2), el **turno de la OPE** o la **RPT**.
- Incluye un glosario y preguntas habituales sobre «Ya con plaza», el derecho preferente y el origen de los datos.
- Enlazada desde el menú lateral de todas las pantallas y desde la página de acceso.

## Origen de los datos

- `lekualdatze/resultado-*.pdf`: listados de participantes admitidos y de resolución con puntuación de cada año (2010–2024).
- El listado de 2025 procede del PDF del concurso 2025/2026 (`CK3024` y `CK3090`).
- **17.759 participantes** y **7.278 plazas** adjudicadas en total.
- En 2024 el listado de resolución solo incluye el código del centro; cuando no se ha podido cruzar con el catálogo de 2025 se muestra como «Centro XXXXXXXX».
- La provincia se deduce del código de centro (01 Araba, 20 Gipuzkoa, 48 Bizkaia). Los centros con otros códigos se agrupan en «Otras».
- El año 2018 corresponde al cuerpo de Maestros y se ha excluido para no mezclar cuerpos.
- Algunos destinos de años antiguos no se han podido enlazar con su participante por diferencias de nombre; sí se contabilizan como plaza.

## Acceso

- La web está protegida con **Supabase Auth** (usuario y contraseña). La única excepción es `faq.html`, que es pública.
- El usuario `hezkuntza` se mapea internamente al email `hezkuntza@hezkuntza.eus`; el formulario solo pide el nombre de usuario.
- Los datos **no están en el repositorio**: `datos.js`, `datos-curso.js` y `datos-rpt.js` viven en el bucket privado `calculadora-datos` de Supabase Storage.
- Solo las sesiones autenticadas pueden firmar la descarga (política RLS `calculadora_datos_select_authenticated`).
- La clave `anon` de `config.js` es pública por diseño; no da acceso a los datos sin iniciar sesión.
- Para probar en local hace falta conexión (login y descarga de datos van contra Supabase).

## Estructura

```
calculadora-puntos/
├── index.html          · calculadora
├── clasificacion.html  · clasificación multi-año
├── plazas.html         · plazas y gráficas
├── rpt.html            · plantilla orgánica (RPT) de Secundaria y FP
├── ikha.html           · curso 2026/2027: puestos, sustitutos, carrera y prácticas
├── forzosak.html       · forzosos OPE 2025 y plazas ofertadas 27-28
├── faq.html            · preguntas frecuentes y modalidades (pública)
├── login.html          · acceso con Supabase Auth
├── config.js           · URL y clave pública de Supabase
├── auth.js             · guard de sesión, usuario y botón Salir
├── datos-loader.js     · descarga firmada de los datos desde Storage
├── vendor/             · jQuery + Select2 + supabase-js + Leaflet + límites provinciales
└── README.md
```

`datos.js`, `datos-curso.js` y `datos-rpt.js` se suben a mano al bucket `calculadora-datos` (no se versionan). `datos-rpt.js` se genera con `exportar_rpt.py` a partir de los datos de la RPT (`data.json`, `birtlh.json` y `codigos_centro.json`).
Todo funciona sin conexión una vez iniciada la sesión y cargados los datos.

## Despliegue

- **GitHub Pages** sirve la aplicación Angular desde la raíz del repositorio (`index.html` + `main-*.js` + `styles-*.css`).
- La versión estática anterior queda archivada en `legacy-static/` (no está enlazada).
- Build y publicación: `cd angular && npm run build -- --base-href=/calculadora-puntos/`; copiar a la raíz el `index.html`, `main-*.js`, `styles-*.css`, `favicon.*`, `media/` y `vendor/`. **No copiar** `datos.js`, `datos-curso.js` ni `datos-rpt.js`.
- Los datos personales quedan en Supabase y no se publican en GitHub.


## Migración a Angular

- La carpeta `angular/` contiene la nueva aplicación **Angular 22 + Bootstrap 5** con el aspecto **SB Admin** (sidebar oscuro, topbar, tarjetas, tablas).
- **Todas las pantallas funcionan en Angular**: Calculadora, Clasificación, Plazas, Plazas RPT, IKHA, Forzosak y FAQ.
- **Nativas**: shell SB Admin, login con Supabase, FAQ y Plazas RPT (filtros, KPIs, gráficas, mapa Leaflet, tabla ordenable y CSV).
- **Integradas desde la versión estática**: Calculadora, Clasificación, Plazas, IKHA y Forzosak conservan toda su lógica y datos, aislados por componente; queda pendiente el pulido visual fino para homogeneizarlas con SB Admin.
- Rutas con **hash** (`/#/rpt`) para que funcionen directamente en GitHub Pages.
- Desarrollo: `cd angular && npm install && npm start`.
- Build de producción: `npm run build -- --base-href=/calculadora-puntos/` (salida en `angular/dist/angular/browser`).

## Aviso

Herramientas de ayuda sin carácter oficial. No sustituyen la autobaremación ni la puntuación
que asigne el Departamento de Educación. Ante cualquier duda, prevalecen la Orden y la
resolución administrativa.
