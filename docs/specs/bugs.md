# Bugs (prioridad 1)

## B1
### El sorteo trae películas con 2 votos
**Problema.** `discover` filtraba por `vote_average.gte` sin `vote_count.gte`; TMDB
devuelve títulos con 1–2 votos y 9.0 de promedio. Verificado: la página 400 del sorteo
por defecto devolvía *Hellmare (2 votos, 9.0)*.

**Criterio de aceptación.**
- `FilterState.minVotes` (default 50) se traduce a `vote_count.gte`; 0 lo desactiva.
- Input "Votos mín." en el panel, junto a la calificación, con hint explicativo.
- Los presets guardados antes de este cambio reciben el default al cargarse.
- El catálogo mock respeta el mismo filtro.
- Test unitario de `buildDiscoverParams` cubre ambos casos (con y sin votos).

**Decisión.** No se baja automáticamente el umbral cuando hay filtro de actor/director:
comportamiento oculto sorprende más que un "0 resultados" que se arregla bajando el número.

**Archivos.** `src/lib/tmdb.ts`, `src/lib/presets.ts`, `src/components/FilterPanel.tsx`, `src/i18n/*.json`.

## B2
### Race condition en el catálogo
**Problema.** `loadCatalog` no cancelaba requests: escribir "mat" → "matrix" rápido
disparaba dos pedidos y, si el primero respondía último, la grilla mostraba "mat".

**Criterio de aceptación.**
- Cada `loadCatalog` aborta el anterior (`AbortController`) y descarta respuestas de
  requests que ya no son el más reciente (contador de request).
- Un abort nunca dispara el fallback al catálogo demo ni apaga el spinner del request vigente.
- `isAbortError` testeado.

**Archivos.** `src/App.tsx`, `src/lib/tmdb.ts` (`tmdbFetch`, `discoverMovies`, `searchMovies` aceptan `signal`).

## B3
### Modales sin Escape / foco / `role="dialog"`
**Problema.** Solo el `ContextMenu` cierra con Esc. `RouletteModal`, `ApiKeyModal` y
`GoogleLoginModal` no atrapan el foco, no se cierran con teclado y no declaran `aria-modal`.

**Criterio de aceptación.**
- Hook `useModalA11y({ isOpen, onClose })`: Esc cierra, el foco entra al modal al abrir y
  vuelve al elemento que lo disparó al cerrar, Tab queda atrapado dentro.
- Los tres modales usan el hook y llevan `role="dialog" aria-modal="true" aria-labelledby`.
- Verificación manual con teclado: abrir ficha → Tab recorre solo el modal → Esc cierra.

**Archivos.** `src/hooks/useModalA11y.ts` (nuevo), los tres modales. Las cards del catálogo pasan a ser focusables (`role="button"`, Enter/Espacio abren la ficha) para que el foco tenga adónde volver.

## B4
### Sinopsis generada siempre en español
**Problema.** `fetchMovieDetails` fabrica "Producción audiovisual del género…" aunque
la UI esté en EN/PT.

**Criterio de aceptación.** El texto sale de i18n (`details.generated_overview`) con
interpolación de género/año/director/reparto; `fetchMovieDetails` recibe el `t` o
devuelve las piezas y el componente arma el texto.

**Archivos.** `src/lib/tmdb.ts`, `src/components/RouletteModal.tsx`, `src/i18n/*.json`.

## B5
### Strings sin traducir
**Problema.** ~22 literales en JSX: "Ficha", "▶ Reproductor", "Anterior/Siguiente",
"Pág.", "LA VI", "Opción 1/2/3", "Subtítulos (SubDivX)", "Marcar La Vi", "Cerrar"…

**Criterio de aceptación.** `grep -n ">[^<{]*[A-Za-zÁÉÍÓÚáéíóú]\{3,\}[^<{]*<" src/components/*.tsx | grep -v "t('"`
devuelve 0 líneas. Las tres traducciones tienen las claves nuevas.

**Archivos.** `RouletteModal`, `CatalogGrid`, `MovieCard`, `DrawHistoryView`, `Header`, `WatchedView`, `i18n/*.json`.

## B6
### Login "Google" manual falso
**Problema.** El fallback "ingresá tu correo a mano" guarda cualquier email como sesión,
sin autenticar, y el disclaimer "google.com will share your name…" con links muertos
imita la pantalla oficial de consentimiento (riesgo de branding y engaño al usuario).

**Criterio de aceptación.**
- El fallback pasa a llamarse "Perfil local (sin cuenta)" con su propio copy y sin logo de Google.
- Se elimina el disclaimer falso; el botón oficial de GIS queda como única vía "Google".
- README deja de describir el modo manual como "OAuth 2.0 oficial".

**Archivos.** `src/components/GoogleLoginModal.tsx`, `src/lib/auth.ts`, `README.md`.
