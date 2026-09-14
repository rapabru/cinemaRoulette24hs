# Mejoras UX (prioridad 2)

## M1
### Feedback inmediato al abrir una ficha
**Problema.** Al clickear una card pasa ~1 s sin respuesta mientras carga `fetchMovieDetails`.
**Criterio de aceptación.** El modal abre al instante en estado skeleton (póster de la card + título)
y se completa al llegar el detalle; si falla, muestra error dentro del modal.
**Archivos.** `App.tsx`, `RouletteModal.tsx`.

## M2
### Paginación: ir a página
**Problema.** Solo "Anterior/Siguiente" para hasta 500 páginas.
**Criterio de aceptación.** Botones primera/última + input "ir a la página N" con Enter; teclas ←/→ cambian de página.
**Archivos.** `CatalogGrid.tsx`.

## M3
### Marquee por región
**Problema.** `now_playing` sin `region` devuelve cartelera global.
**Criterio de aceptación.** `fetchNowPlayingMovies(language, region)` con región derivada del idioma (es→AR, pt→BR, en→US).
**Archivos.** `tmdb.ts`, `MarqueeTicker.tsx`.

## M4
### `prefers-reduced-motion`
**Problema.** Marquee, pulse, ping, flash y card-enter ignoran la preferencia del sistema (una sola regla existente).
**Criterio de aceptación.** Bajo `prefers-reduced-motion: reduce` el marquee queda estático, sin pulse/ping/flash; las transiciones de opacidad se mantienen.
**Archivos.** `src/index.css`, `src/App.css`.

## M5
### SEO / PWA mínimo
**Problema.** `index.html` sin `description`, sin Open Graph, sin manifest.
**Criterio de aceptación.** Meta description + OG/Twitter tags con el logo; `manifest.webmanifest` con iconos → la app es instalable en Android/iOS.
**Archivos.** `index.html`, `public/manifest.webmanifest`, `public/icons/*`.
