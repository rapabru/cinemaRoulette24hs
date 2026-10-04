# 🎰 CYBERCAFÉ 24HS — Movie Roulette & Streaming Terminal

[![Release](https://img.shields.io/badge/Release-v1.0.0-00f0ff?style=for-the-badge&logo=github&logoColor=black)](https://github.com/rapabru/cinemaRoulette24hs/releases/tag/v1.0.0)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://cinemaroulette.vercel.app)
[![Discord Community](https://img.shields.io/badge/Discord-Join_Community_24HS-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/dfSD65dgx)
[![GitHub Repository](https://img.shields.io/badge/GitHub-rapabru%2FcinemaRoulette24hs-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rapabru/cinemaRoulette24hs)
[![TMDB API](https://img.shields.io/badge/TMDB-v4_v3_API-01b4e4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

A high-performance, desktop-style web application for movie discovery, advanced filter composition, random draw ("Sortear"), streaming video playback, Spanish subtitle downloads, draw history tracking, and an optional profile (Google Sign-In or a local, browser-only profile) — wrapped in a nostalgic 2 AM neon cybercafé aesthetic.

👉 **Live URL**: [https://cinemaroulette.vercel.app](https://cinemaroulette.vercel.app)  
💬 **Discord Cybercafé 24HS (We watch movies together every night)**: [https://discord.gg/dfSD65dgx](https://discord.gg/dfSD65dgx)

---

## 🌐 README in Spanish / Versión en Español

> [Saltar a la versión en Español / Skip to Spanish Version](#-español--cybercafé-24hs--terminal-de-ruleta-de-películas)

---

## 🚀 Key Features

### 🔗 Deep-Linking & Shareable Direct Links
- **Direct Movie Card Links (`?movie=<id>`)**: Open directly to any movie's detail modal (synopsis, OMDb / Rotten Tomatoes / IMDb ratings, cast, trailer, and recommendations) via a shareable link.
- **Direct Streaming Server Links (`?movie=<id>&player=<provider>`)**: Send a link that launches directly into a specific streaming player (`vidking`, `cinejoy`, `playimdb`, `torrentio`, or `trailer`).
- **Dedicated Player Toolbar Share**: "Compartir Servidor" button right next to the fullscreen toggle in the player view.
- **Right-Click Context Menu**: Right-click on any movie card or carousel item to copy the direct card link.
- **Persistent Action Footer**: Action buttons (Redraw, Share Card, Share Player, Mark Watched) remain anchored and visible at the bottom of the modal regardless of content height.
- **Browser History Integration**: Seamless back/forward navigation (`popstate`) and real-time URL updates without page reloads.

### 🎬 Built-in Video Players (Multi-Provider)
- **Opción 1 (cinejoy.to)**: Full streaming site keyed by TMDB ID (`cinejoy.to/watch/movie/{id}`). Shows an external launch card with a direct open button due to upstream frame options.
- **Opción 2 (Torrentio + Webtor)**: Stremio-style flow, fully free and backend-less. Queries the Torrentio addon (`torrentio.strem.fun`) for torrent sources by IMDB ID, lets you pick quality/size/seeders, and plays the magnet in-browser through the Webtor.io embed SDK. Includes an "Open in Stremio" deep link.
- **Opción 3 (VidKing Player)**: High-speed video streaming embed using TMDB IDs (`vidking.net/embed/movie/{id}`).
- **Opción 4 (PlayIMDB Server)**: Alternative streaming player server using IMDB IDs (`playimdb.com/es-es/title/{imdb_id}/`).
- **SubDivX Subtitles**: One-click download button for Spanish subtitles directly on [SubDivX](https://www.subdivx.com/).
- **Responsive Player Modal**: Constrained to `92vh` viewports with internal scrolling for all screen resolutions.

### 🍿 Marathon Mode & Synchronized Movie Nights
- **Marathon Batch Draws**: Draw multiple movies at once (3 to 6 movies) to plan movie marathons or group watch nights.
- **Shared Seed Synchronization (`?seed=...`)**: Share a unique seed link so friends in different browsers receive the exact same sequence of draws.
- **Slot Reel Animation**: Arcade-style reel spin that decelerates smoothly and lands precisely on the drawn movie.
- **Floating "Sortear" Button**: Always-accessible floating draw button follows the user throughout the catalog view.

### 🎛️ Advanced Control Panel & Filtering
- **100% TMDB Catalog Access (+1,000,000 Movies)**: Official Bearer token pre-configured out of the box.
- **Cinema Industry Filters**: Quick preset checkboxes for major film industries (Hollywood, European cinema, Latin American, Asian cinema, etc.) plus dedicated toggles for short films and unclassified/indie movies ("Otros").
- **Smart Default Filters**: Pre-configured baseline filters (minimum rating 6.0/10, minimum runtime 60 minutes) to eliminate low-quality titles by default.
- **Zero-Friendly Text Inputs**: Clean, flexible input boxes that allow deleting all digits to write new numbers from scratch without forced values.
- **Multi-Genre Selection (OR Logic)**: Select multiple genres to expand catalog results instead of restricting them.
- **Director & Cast Search**: Debounced autocomplete searching by movie directors (`with_crew`) and actors/actresses (`with_cast`).
- **Country of Origin Filter**: Filter movies by origin country (🇦🇷 Argentina, 🇺🇸 United States, 🇪🇸 Spain, 🇲🇽 Mexico, 🇫🇷 France, 🇬🇧 UK, 🇯🇵 Japan, 🇰🇷 Korea, etc.).
- **Dual Ratings & OMDb Integration**: TMDB score combined with live Rotten Tomatoes, IMDb, and Metacritic scores via OMDb.
- **High-Contrast "Skip Watched" Switch**: High-contrast Cyan (`SÍ ✔`) vs Red (`NO ✖`) toggle.
- **Thousands Separator Formatting**: Clean display (e.g. `1.041.467 Results found`).

### 📱 Progressive Web App (PWA) & Offline Support
- **Installable Desktop & Mobile App**: Full web app manifest with standalone display mode.
- **High-Resolution Icons**: 192x192, 512x512, maskable, and Apple touch icons.
- **Offline Shell**: Cached assets for immediate startup and performance.

### 🔑 Authentication & Persistence
- **Optional Profile**: Google Sign-In through the official Google Identity Services SDK, or a local profile (name + avatar, no account, 100% client-side in localStorage).
- **Draw History ("Historial de Sorteos")**: Automatic logging of every drawn movie with timestamps and search capabilities.
- **"La vi" (Watched) Tracking**: Right-click context menu and button toggle saved to `localStorage`.
- **Multilingual Support (i18n)**: Seamless instant switching between Spanish (`ES`), English (`EN`), and Portuguese (`PT`).

---

## 🛠️ Local Development & Installation

```bash
# 1. Clone repository
git clone https://github.com/rapabru/cinemaRoulette24hs.git
cd cinemaRoulette24hs

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run automated tests
npm test

# 5. Build for production
npm run build
```

---

# 🇦🇷 ESPAÑOL — CYBERCAFÉ 24HS — Terminal de Ruleta de Películas

Aplicación web de alto rendimiento estilo terminal para descubrir películas, componer filtros avanzados, realizar sorteos aleatorios ("Sortear"), reproducir películas en vivo, descargar subtítulos en español, guardar historial de sorteos y, opcionalmente, ponerle nombre a tus datos con Google Sign-In o un perfil local.

👉 **Sitio en Vivo en Vercel**: [https://cinemaroulette.vercel.app](https://cinemaroulette.vercel.app)  
💬 **Comunidad Discord 24HS**: [https://discord.gg/dfSD65dgx](https://discord.gg/dfSD65dgx)

---

## 🌟 Características Principales

### 🔗 Deep-Linking y Enlaces Compartibles
- **Compartir Ficha Directa (`?movie=<id>`)**: Enlace directo para abrir la ficha de cualquier película (sinopsis, calificaciones OMDb / Rotten Tomatoes / IMDb / Metacritic, elenco, tráiler y recomendaciones).
- **Compartir Servidor Específico (`?movie=<id>&player=<provider>`)**: Envía un enlace directo que abre la película lista para reproducir en el servidor elegido (`vidking`, `cinejoy`, `playimdb`, `torrentio` o `trailer`).
- **Botón en Reproductor**: Botón *Compartir Servidor* en la barra superior junto al botón de pantalla completa.
- **Menú Contextual (Clic Derecho)**: Clic derecho sobre cualquier póster o carrusel para *Compartir Ficha* al portapapeles.
- **Footer de Acciones Persistente**: Barra inferior fija en la ficha con botones para volver a sortear, compartir ficha, compartir reproductor y marcar como vista sin importar cuánto contenido tenga la ficha.
- **Sincronización con el Navegador**: La URL se actualiza dinámicamente y respeta el historial de navegación (`atrás` / `adelante`) sin recargar la página.

### 🎬 Reproductores de Video Integrados (Multi-Servidor)
- **Opción 1: cinejoy.to**: Sitio de streaming completo por código TMDB (`cinejoy.to/watch/movie/{id}`). Se abre en pestaña externa debido a restricciones de seguridad del servidor de origen.
- **Opción 2: Torrentio + Webtor**: Flujo estilo Stremio, 100% gratis y sin backend. Consulta el addon Torrentio (`torrentio.strem.fun`) por código IMDB, permite elegir calidad/tamaño/seeds y reproduce el magnet en el navegador mediante el SDK de Webtor.io. Incluye enlace directo "Abrir en Stremio".
- **Opción 3: VidKing**: Reproductor integrado de alta velocidad mediante código TMDB (`vidking.net/embed/movie/{id}`).
- **Opción 4: PlayIMDB**: Servidor alternativo de streaming por código IMDB (`playimdb.com/es-es/title/{imdb_id}/`).
- **Subtítulos en SubDivX**: Botón directo de búsqueda y descarga de subtítulos en español en [SubDivX](https://www.subdivx.com/).
- **Modal Adaptativo**: Límite de altura responsivo (`92vh`) con desplazamiento interno para cualquier resolución de pantalla.

### 🍿 Modo Maratón & Sorteos Compartidos
- **Sorteo en Tanda (Maratón)**: Sortear de 3 a 6 películas simultáneamente para organizar noches de cine en grupo.
- **Semilla Compartida (`?seed=...`)**: Enlace único para sincronizar sorteos en tiempo real con amigos, garantizando que todos vean los mismos resultados.
- **Ruleta Tragaperras (Slot Reel)**: Animación fluida con desaceleración progresiva que aterriza con precisión en la película ganadora.
- **Botón Flotante de Sorteo**: Botón flotante accesible desde cualquier posición del scroll en el catálogo.

### 🎛️ Panel de Control y Filtros Avanzados
- **100% del Catálogo de TMDB (+1.000.000 de Películas)**: Token de lectura oficial pre-configurado de fábrica.
- **Filtros por Industria Cinematográfica**: Filtros rápidos con casillas pre-marcadas para las principales industrias (Hollywood, Cine Europeo, Cine Latinoamericano, Cine Asiático, etc.) más opciones de cortometrajes y cine independiente ("Otros").
- **Filtros Base Predeterminados**: Calificación mínima 6.0/10 y duración mínima 60 minutos como base para evitar resultados vacíos o de baja calidad.
- **Cajas Numéricas Flexibles**: Permite borrar completamente el contenido de las cajas para escribir números desde cero sin valores obligatorios intermedios.
- **Selección de Géneros (Lógica OR)**: Seleccionar varios géneros amplía el catálogo en lugar de restringirlo.
- **Buscador de Directores y Reparto**: Autocompletado inteligente por directores (`with_crew`) y actores/actrices (`with_cast`).
- **Filtro por País de Origen**: Filtra por país de origen (🇦🇷 Argentina, 🇺🇸 EE.UU., 🇪🇸 España, 🇲🇽 México, 🇫🇷 Francia, 🇬🇧 Reino Unido, 🇯🇵 Japón, 🇰🇷 Corea del Sur, etc.).
- **Calificaciones Extras con OMDb**: Puntuaciones en vivo de Rotten Tomatoes, IMDb y Metacritic.
- **Interruptor de Alto Contraste "Omitir Vistas"**: Botón neón Cyan (`SÍ ✔`) vs Rojo (`NO ✖`).
- **Separador de Miles en Resultados**: Formato legible (*ej. `1.041.467 Resultados encontrados`*).

### 📱 Progressive Web App (PWA) e Instalación
- **Instalable en Escritorio y Móvil**: Manifiesto web con ejecución standalone sin barras de navegación del navegador.
- **Iconos Adaptables**: Tamaños 192x192, 512x512, maskable y soporte para Apple touch icons.

### 🔑 Autenticación e Historial
- **Perfil Opcional**: Google Sign-In con el SDK oficial de Google Identity Services, o un perfil local (nombre + avatar, sin servidor, 100% en `localStorage`).
- **Historial de Sorteos**: Registro automático de cada película sorteada con hora, fecha y buscador.
- **Marcado "La Vi" (Vistas)**: Menú contextual con clic derecho y guardado local.
- **Soporte Multilingüe**: Cambio instantáneo entre Español (`ES`), Inglés (`EN`) y Portugués (`PT`).

---

## ⚖️ Licencia y Atribución
Este producto utiliza la API de The Movie Database (TMDB) pero no está respaldado ni certificado por TMDB.
