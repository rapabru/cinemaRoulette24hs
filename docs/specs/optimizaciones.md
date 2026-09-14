# Optimizaciones (prioridad 2)

## O1
### Pósters más pesados de lo necesario
**Problema.** La grilla pide `w500` para celdas de ~200 px (2.5× el peso necesario).

**Criterio de aceptación.** Grilla y sugerencias usan `w342` con `srcSet` (`w342 1x, w500 2x`);
la ficha sigue en `w500`. Peso total de la grilla en Network baja ≥50 %.

**Archivos.** `MovieCard.tsx`, `FilterPanel.tsx`, `getImageUrl` en `tmdb.ts`.

## O2
### `alert()` para errores
**Problema.** Dos `alert()` en `App.tsx` bloquean la UI y rompen la estética.

**Criterio de aceptación.** Componente `Toast` (sin dependencias, ~40 líneas, estilo neón)
con cola y auto-cierre; cero `alert(` en `src/`.

**Archivos.** `src/components/Toast.tsx` (nuevo), `App.tsx`.

## O3
### Migración legacy en cada lectura de localStorage
**Problema.** `getWatchedMovies` y `getDrawnHistory` corren el parche "id 102 → 603 (Matrix)"
en cada lectura.

**Criterio de aceptación.** La migración corre una sola vez, guardando una clave de versión;
tests de `watched.ts` e `history.ts` con un `localStorage` en memoria.

**Archivos.** `src/lib/watched.ts`, `src/lib/history.ts`, `src/lib/storage.ts` (helper compartido).

## O4
### Tests + CI
**Problema.** Sin tests ni CI; cada cambio se verificaba a mano.

**Criterio de aceptación.**
- Vitest (`npm test`) con tests de la lógica pura de `tmdb.ts` y `torrentio.ts`.
- GitHub Action que corre `lint`, `test` y `build` en cada PR y push a `main`.
- `package-lock.json` sincronizado (`npm ci` funciona).

**Archivos.** `vitest.config.ts`, `src/lib/*.test.ts`, `.github/workflows/ci.yml`.
