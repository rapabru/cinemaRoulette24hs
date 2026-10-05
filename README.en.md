# 🎰 CYBERCAFÉ 24HS — Movie Roulette & Streaming Terminal

[![Release](https://img.shields.io/badge/Release-v1.0.0-00f0ff?style=for-the-badge&logo=github&logoColor=black)](https://github.com/rapabru/cinemaRoulette24hs/releases/tag/v1.0.0)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://cinemaroulette.vercel.app)
[![Discord Community](https://img.shields.io/badge/Discord-Join_Community_24HS-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/dfSD65dgx)
[![GitHub Repository](https://img.shields.io/badge/GitHub-rapabru%2FcinemaRoulette24hs-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rapabru/cinemaRoulette24hs)
[![TMDB API](https://img.shields.io/badge/TMDB-v4_v3_API-01b4e4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

> 🌐 **Language / Idioma**: **[🇺🇸 English](README.en.md)** | **[🇦🇷 Español](README.md)**  
> *(Click on **[Español](README.md)** to read this README in Spanish / Hacé clic en **[Español](README.md)** para la versión en español)*

A high-performance, desktop terminal-style web application for movie discovery, advanced filter composition, random draws ("Sortear"), streaming video playback, Spanish subtitle downloads, draw history tracking, and communal movie watch nights wrapped in a nostalgic 2 AM neon cybercafé aesthetic.

👉 **Live URL on Vercel**: [https://cinemaroulette.vercel.app](https://cinemaroulette.vercel.app)  
💬 **Discord Cybercafé 24HS Community (We watch movies together every night)**: [https://discord.gg/dfSD65dgx](https://discord.gg/dfSD65dgx)

---

## 🚀 Key Features

### 🔗 Deep-Linking, Shareable Links & Dynamic Open Graph Embeds
- **Rich Social Previews (Discord, WhatsApp, Telegram, Twitter/X, Facebook)**:
  - Sharing any movie link (`/m/:id` or `/m/:id?player=<server>`) automatically triggers rich embed cards featuring the official **high-resolution 1280x720 panoramic backdrop** or poster (`summary_large_image`).
  - **Live Titles & Metadata**: Formatted as `${title} (${year}) ⭐ ${rating}/10 — Cybercafé 24hs`.
  - **Detailed Overview**: Includes runtime, genres, recommended player server (e.g. `▶ Ver en cinejoy.to`), and movie synopsis (with an automatic English fallback if no Spanish synopsis is provided in TMDB).
- **Vercel Edge Serverless Function (`/api/og.ts`)**:
  - Executes on Vercel's global Edge Network with 0 ms cold starts.
  - Automatically identifies crawlers/bots and returns lightweight HTML with complete Open Graph & Twitter Card tags and `Cache-Control: s-maxage=86400`.
  - Sends the `Vary: User-Agent` HTTP header to prevent CDN cache collisions between social bots and human visitors.
  - For human users browsing the link, it serves the full React SPA with pre-injected `<head>` metadata, seamlessly opening the movie card or video player with no jarring redirects.
- **Legacy URL Redirects**: Previous link formats using query strings (`/?movie=:id`) are automatically redirected via HTTP 307 to canonical `/m/:id` routes.
- **In-Player Toolbar Share**: Direct "Compartir Servidor" button located right next to the fullscreen toggle in the player view.
- **Right-Click Context Menu**: Right-click on any movie poster or carousel item to copy the direct card link.
- **Persistent Action Footer**: Fixed bottom toolbar inside the movie modal with buttons to redraw, share card, share player, and mark as watched regardless of content height.

### 🎬 Built-in Video Players (Multi-Provider)
- **Option 1 (cinejoy.to)**: Full direct streaming catalogue by TMDB ID (`cinejoy.to/watch/movie/{id}`). Due to upstream `X-Frame-Options` policies, includes a quick-launch external button.
- **Option 2 (Torrentio + Webtor)**: Stremio-style flow, 100% free and backend-less. Queries the Torrentio addon (`torrentio.strem.fun`) by IMDB ID, allows selecting quality/size/seeders, and plays the magnet directly in-browser via the Webtor.io embed SDK. Includes an "Open in Stremio" deep link.
- **Option 3 (VidKing Player)**: High-speed video streaming embed using TMDB IDs (`vidking.net/embed/movie/{id}`).
- **Option 4 (PlayIMDB Server)**: Alternative streaming server using IMDB IDs (`playimdb.com/es-es/title/{imdb_id}/`).
- **Official YouTube Trailer**: Embedded trailer player with sound and fullscreen toggles.
- **SubDivX Subtitles**: One-click download button for Spanish subtitles directly on [SubDivX](https://www.subdivx.com/).
- **Responsive Player Modal**: Constrained to `92vh` viewports with internal scrolling for all screen resolutions.

### 🍿 Marathon Mode & Synchronized Movie Nights
- **Batch Draws (Marathon Mode)**: Draw 3 to 6 movies at once to plan movie marathons or group watch nights.
- **Shared Seed Synchronization (`?seed=...`)**: Share a unique seed link so friends across different devices receive the exact same sequence of draws.
- **Arcade Slot Reel**: Physics-based deceleration animation that spins smoothly and lands precisely on the selected movie.
- **Floating "Sortear" Button**: Always-accessible floating draw button follows the user throughout the catalog view.

### 🎛️ Advanced Control Panel & Filtering
- **100% TMDB Catalog Access (+1,000,000 Movies)**: Official TMDB Bearer token pre-configured out of the box.
- **Cinema Industry Filters**: Quick preset checkboxes for major film industries (Hollywood, European cinema, Latin American, Asian cinema, etc.) plus dedicated toggles for short films and unclassified/indie movies ("Otros").
- **Smart Default Filters**: Pre-configured baseline filters (minimum rating 6.0/10, minimum runtime 60 minutes) to eliminate low-quality titles by default.
- **Zero-Friendly Text Inputs**: Clean, flexible input boxes that allow deleting all digits to write new numbers from scratch without forced default values.
- **Multi-Genre Selection (OR Logic)**: Select multiple genres to expand catalog results instead of restricting them.
- **Director & Cast Search**: Debounced autocomplete searching by movie directors (`with_crew`) and actors/actresses (`with_cast`).
- **Country of Origin Filter**: Filter movies by origin country (🇦🇷 Argentina, 🇺🇸 United States, 🇪🇸 Spain, 🇲🇽 Mexico, 🇫🇷 France, 🇬🇧 UK, 🇯🇵 Japan, 🇰🇷 Korea, etc.).
- **Dual Ratings & OMDb Integration**: TMDB score combined with live Rotten Tomatoes, IMDb, and Metacritic scores via OMDb.
- **High-Contrast "Skip Watched" Switch**: High-contrast Cyan (`SÍ ✔`) vs Red (`NO ✖`) toggle.
- **Thousands Separator Formatting**: Clean display (e.g. `1.041.467 Results found`).

### 📱 Progressive Web App (PWA) & Offline Support
- **Installable Desktop & Mobile App**: Full web app manifest with standalone display mode.
- **High-Resolution Icons**: 192x192, 512x512, maskable, and Apple touch icons.
- **Offline Shell**: Cached core assets for immediate startup and performance.

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

# 4. Run automated test suite
npm test

# 5. Build for production
npm run build
```

---

## ⚖️ License & Attribution
This product uses the TMDB API but is not endorsed or certified by TMDB.
