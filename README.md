# 🎰 CYBERCAFÉ 24HS — Movie Roulette & Streaming Terminal

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://cinemaroulette.vercel.app)
[![Discord Community](https://img.shields.io/badge/Discord-Join_Community_24HS-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/dfSD65dgx9)
[![GitHub Repository](https://img.shields.io/badge/GitHub-rapabru%2FcinemaRoulette24hs-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rapabru/cinemaRoulette24hs)
[![TMDB API](https://img.shields.io/badge/TMDB-v4_v3_API-01b4e4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

A high-performance, desktop-style web application for movie discovery, advanced filter composition, random draw ("Sortear"), streaming video playback, Spanish subtitle downloads, draw history tracking, and official Google OAuth 2.0 authentication — wrapped in a nostalgic 2 AM neon cybercafé aesthetic.

👉 **Live URL**: [https://cinemaroulette.vercel.app](https://cinemaroulette.vercel.app)  
💬 **Discord Cybercafé 24HS (We watch movies together every night)**: [https://discord.gg/dfSD65dgx9](https://discord.gg/dfSD65dgx9)

---

## 🌐 README in Spanish / Versión en Español

> [Saltar a la versión en Español / Skip to Spanish Version](#-español--cybercafé-24hs--terminal-de-ruleta-de-películas)

---

## 🚀 Key Features

### 🎬 Built-in Video Players (Multi-Provider)
- **Opción 1 (VidKing Player)**: High-speed video streaming embed using TMDB IDs (`vidking.net/embed/movie/{id}`).
- **Opción 2 (PlayIMDB Server)**: Alternative streaming player server using IMDB IDs (`playimdb.com/es-es/title/{imdb_id}/`).
- **SubDivX Subtitles**: One-click download button for Spanish subtitles directly on [SubDivX](https://www.subdivx.com/).
- **Responsive Player Modal**: Constrained to `92vh` viewports with internal scrolling for all screen resolutions.

### 🎛️ Advanced Control Panel & Filtering
- **100% TMDB Catalog Access (+1,000,000 Movies)**: Default official Bearer token pre-configured out of the box.
- **Multi-Genre Selection (OR Logic)**: Select multiple genres to expand catalog results instead of restricting them.
- **"Otro" (Unclassified) Genre**: Include indie, shorts, and unclassified movies to search 100% of TMDB.
- **Director Search**: Debounced autocomplete searching by movie directors (`with_crew`).
- **Actor / Actress Search**: Debounced autocomplete searching by cast (`with_cast`).
- **Country of Origin Filter**: Filter movies by origin country (🇦🇷 Argentina, 🇺🇸 United States, 🇪🇸 Spain, 🇲🇽 Mexico, 🇫🇷 France, 🇬🇧 UK, 🇯🇵 Japan, 🇰🇷 Korea, etc.).
- **Min & Max Rating**: Dual numeric inputs (0.0 to 10.0).
- **Min & Max Runtime**: Text and number inputs in minutes (0 to 300+ min).
- **High-Contrast "Skip Watched" Switch**: High-contrast Cyan (`SÍ ✔`) vs Red (`NO ✖`) toggle.
- **Thousands Separator Formatting**: Clean display (e.g. `1.041.467 Results found`).

### 🔑 Authentication & Persistence
- **Official Google OAuth 2.0**: Integrated with Google Identity Services SDK (`20731269197-rsf5lqraj7apqjuvh5ph1ki5l6cqjfeh.apps.googleusercontent.com`).
- **Custom Account Fallback**: Allows visitors to sign in with their own Gmail account and display name.
- **Draw History ("Historial de Sorteos")**: Automatic logging of every drawn movie with timestamps and search capabilities.
- **"La vi" (Watched) Tracking**: Right-click context menu and button toggle saved to `localStorage`.

### 🎨 Visual Identity & i18n
- **Cybercafé 24HS Aesthetic**: 2 AM dark brick backdrop, CRT monitor card bezels, scanline overlays, neon marquee buttons.
- **Full Internationalization (i18n)**: Instant toggle between Spanish (`ES`) and English (`EN`).

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

# 4. Build for production
npm run build
```

---

# 🇦🇷 ESPAÑOL — CYBERCAFÉ 24HS — Terminal de Ruleta de Películas

Aplicación web de alto rendimiento estilo terminal para descubrir películas, componer filtros avanzados, realizar sorteos aleatorios ("Sortear"), reproducir películas en vivo, descargar subtítulos en español, guardar historial de sorteos y autenticarse oficialmente con Google OAuth 2.0.

👉 **Sitio en Vivo en Vercel**: [https://cinemaroulette.vercel.app](https://cinemaroulette.vercel.app)

---

## 🌟 Características Principales

### 🎬 Reproductores de Video Integrados (Multi-Servidor)
- **Opción 1: VidKing**: Reproductor integrado de alta velocidad mediante código TMDB (`vidking.net/embed/movie/{id}`).
- **Opción 2: PlayIMDB**: Servidor alternativo de streaming por código IMDB (`playimdb.com/es-es/title/{imdb_id}/`).
- **Subtítulos en SubDivX**: Botón directo de búsqueda y descarga de subtítulos en español en [SubDivX](https://www.subdivx.com/).
- **Modal Adaptativo**: Límite de altura responsivo (`92vh`) con desplazamiento interno para cualquier resolución de pantalla.

### 🎛️ Panel de Control y Filtros Avanzados
- **100% del Catálogo de TMDB (+1.000.000 de Películas)**: Token de lectura oficial configurado por defecto.
- **Selección de Géneros (Lógica OR)**: Seleccionar varios géneros amplía el catálogo en lugar de restringirlo.
- **Categoría "Otro" (Sin Clasificar)**: Incluye obras independientes y títulos sin etiquetar para abarcar todo el catálogo.
- **Buscador de Directores**: Autocompletado inteligente por directores de cine (`with_crew`).
- **Buscador de Actores / Actrices**: Autocompletado por reparto (`with_cast`).
- **Filtro por País de Origen**: Filtra por país de creación (🇦🇷 Argentina, 🇺🇸 EE.UU., 🇪🇸 España, 🇲🇽 México, 🇫🇷 Francia, 🇬🇧 Reino Unido, 🇯🇵 Japón, 🇰🇷 Corea del Sur, etc.).
- **Calificación Mínima y Máxima**: Cajas de texto numéricas de 0.0 a 10.0.
- **Duración Mínima y Máxima**: Entradas numéricas en minutos (0 a 300+ min).
- **Interruptor de Alto Contraste "Omitir Vistas"**: Botón neón Cyan (`SÍ ✔`) vs Rojo (`NO ✖`).
- **Separador de Miles en Resultados**: Formato legible (*ej. `1.041.467 Resultados encontrados`*).

### 🔑 Autenticación e Historial
- **Google OAuth 2.0 Oficial**: Integración directa con Google Identity Services SDK (`20731269197-rsf5lqraj7apqjuvh5ph1ki5l6cqjfeh.apps.googleusercontent.com`).
- **Ingreso de Cuenta Personalizado**: Permite a cada visitante iniciar sesión con su correo de Gmail y nombre.
- **Historial de Sorteos**: Registro automático de cada película sorteada con hora, fecha y buscador.
- **Marcado "La Vi" (Vistas)**: Menú contextual con clic derecho y guardado local.

---

## ⚖️ Licencia y Atribución
Este producto utiliza la API de The Movie Database (TMDB) pero no está respaldado ni certificado por TMDB.
