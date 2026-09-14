# Innovaciones (prioridad 3)

## I1
### Links compartibles a una película
**Problema.** "Compartir" manda a TMDB; no hay forma de linkear la ficha dentro de la app.
**Criterio de aceptación.** `?movie=603` abre la ficha al cargar; "Compartir" copia ese link;
al cerrar el modal el parámetro se limpia (`history.replaceState`).
**Archivos.** `App.tsx`, `RouletteModal.tsx` (`handleShare`).

## I2
### Sorteo con semilla compartida
**Problema.** En el Discord cada uno sortea algo distinto; no hay "sorteo de la noche".
**Criterio de aceptación.** `?seed=xyz` (o botón "Sorteo de la noche") usa un PRNG determinista
sobre la semilla + fecha para elegir página e índice; misma semilla y filtros → misma película.
**Decisiones.** El link lleva los filtros (`?f=`, solo los que difieren del default, en base64url) y la
búsqueda (`?q=`), porque sin filtros idénticos la semilla no garantiza nada. En modo compartido se ignora
"saltar vistas" (cada usuario tiene una lista distinta). Sortear de nuevo avanza la misma secuencia para todos.
**Archivos.** `tmdb.ts` (`performRandomDraw` recibe `rng`), `seededRandom.ts`, `shareLinks.ts`, `NightDrawBanner.tsx`, `App.tsx`.

## I3
### Backup / restore de "La vi" e historial
**Problema.** Todo vive en localStorage; cambiar de navegador lo pierde y el login no sincroniza nada.
**Criterio de aceptación.** Botón "Exportar backup" (JSON con vistas + historial + presets) y
"Importar backup" que fusiona sin duplicar. `exportUtils.ts` reutilizado.
**Archivos.** `src/lib/backup.ts` (nuevo), `ApiKeyModal.tsx` (sección "Tus datos (backup)").

## I4
### Modo maratón
**Problema.** Sortear de a una es lento para armar una noche de varias películas.
**Criterio de aceptación.** "Sortear 3/5" genera una lista sin repetidos ni vistas, con orden
sugerido por duración, exportable con `exportUtils`.
**Archivos.** `tmdb.ts`, `App.tsx`, `src/components/MarathonModal.tsx` (nuevo).

## I5
### Subtítulos en Torrentio
**Problema.** Webtor soporta `subtitles` en su config y el flujo no lo aprovecha.
**Criterio de aceptación.** Buscar subtítulos por `imdb_id` (OpenSubtitles API, requiere key) en ES/PT/EN
y pasarlos al SDK; si no hay key, el botón SubDivX sigue como alternativa.
**Archivos.** `src/lib/subtitles.ts` (nuevo), `TorrentioPlayer.tsx`, `ApiKeyModal.tsx`.
