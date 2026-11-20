# Hezkuntzako datuak · Traslados docentes Euskadi

Cuatro pantallas sobre los datos educativos de Euskadi, sin servidor:

| Archivo | Qué hace |
|---|---|
| `index.html` | **Calculadora**: baremo del Anexo I para las convocatorias **2025/2026** y **2026/2027**. |
| `clasificacion.html` | **Clasificación**: participantes de 2010–2025, con desplegable de año, filtros y comparador. |
| `plazas.html` | **Plazas adjudicadas**: destinos por año, con gráficas y tabla. |
| `ikha.html` | **IKHA**: puestos, sustitutos, funcionarios de carrera y prácticas del curso 2026/2027. |
| `forzosak.html` | **Forzosak 27-28 LAL**: clasificación del concurso + seleccionados de la OPE 2025, con plazas ofertadas y adjudicación orientativa. |
| `datos.js` | Datos de todos los años de traslados (participantes y plazas). |
| `datos-curso.js` | Datos del curso 2026/2027 de IKHA. |

Abre `index.html` con doble clic. El menú lateral enlaza las cuatro pantallas.

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
- **Exclusión de adjudicatarios previos**: quienes ya tienen destino o asignación en la clasificación del concurso anterior (572 y 233 personas respectivamente en 2025) se marcan como «Ya con plaza» y **no consumen plaza nueva**. Se puede desactivar con la casilla «Excluir quienes ya tienen plaza».
- Filtros por cuerpo, especialidad (Select2), modalidad, origen (clasificación / forzosos), búsqueda por nombre y «Solo con plaza». Indicadores y exportación a CSV.
- Los datos de la OPE y de las plazas ofertadas están en `forzosak-data.js` (archivo público, sin datos personales sensibles: DNI enmascarado).

## Origen de los datos

- `lekualdatze/resultado-*.pdf`: listados de participantes admitidos y de resolución con puntuación de cada año (2010–2024).
- El listado de 2025 procede del PDF del concurso 2025/2026 (`CK3024` y `CK3090`).
- **17.759 participantes** y **7.278 plazas** adjudicadas en total.
- En 2024 el listado de resolución solo incluye el código del centro; cuando no se ha podido cruzar con el catálogo de 2025 se muestra como «Centro XXXXXXXX».
- La provincia se deduce del código de centro (01 Araba, 20 Gipuzkoa, 48 Bizkaia). Los centros con otros códigos se agrupan en «Otras».
- El año 2018 corresponde al cuerpo de Maestros y se ha excluido para no mezclar cuerpos.
- Algunos destinos de años antiguos no se han podido enlazar con su participante por diferencias de nombre; sí se contabilizan como plaza.

## Acceso

- La web está protegida con **Supabase Auth** (usuario y contraseña).
- El usuario `hezkuntza` se mapea internamente al email `hezkuntza@hezkuntza.eus`; el formulario solo pide el nombre de usuario.
- Los datos **no están en el repositorio**: `datos.js` y `datos-curso.js` viven en el bucket privado `calculadora-datos` de Supabase Storage.
- Solo las sesiones autenticadas pueden firmar la descarga (política RLS `calculadora_datos_select_authenticated`).
- La clave `anon` de `config.js` es pública por diseño; no da acceso a los datos sin iniciar sesión.
- Para probar en local hace falta conexión (login y descarga de datos van contra Supabase).

## Estructura

```
calculadora-puntos/
├── index.html          · calculadora
├── clasificacion.html  · clasificación multi-año
├── plazas.html         · plazas y gráficas
├── ikha.html           · curso 2026/2027: puestos, sustitutos, carrera y prácticas
├── login.html          · acceso con Supabase Auth
├── config.js           · URL y clave pública de Supabase
├── auth.js             · guard de sesión, usuario y botón Salir
├── datos-loader.js     · descarga firmada de los datos desde Storage
├── vendor/             · jQuery + Select2 + supabase-js
└── README.md
```

`datos.js` y `datos-curso.js` se suben a mano al bucket `calculadora-datos` (no se versionan).
Todo funciona sin conexión una vez iniciada la sesión y cargados los datos.

## Despliegue

- **GitHub Pages** sirve las pantallas desde la raíz del repositorio.
- Los datos personales quedan en Supabase y no se publican en GitHub.


## Aviso

Herramientas de ayuda sin carácter oficial. No sustituyen la autobaremación ni la puntuación
que asigne el Departamento de Educación. Ante cualquier duda, prevalecen la Orden y la
resolución administrativa.
