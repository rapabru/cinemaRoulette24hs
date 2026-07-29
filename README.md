# Movie Roulette — Cybercafé 24HS Edition 🎰

A desktop-style web application for cataloging movies, custom filter composition, random draw ("Sortear"), right-click watched tracking, and dual visual themes inspired by a late-night neon cybercafé aesthetic.

---

## 🌟 Visual Identity: "Cybercafé 24HS"
- **Art Direction**: Designed to feel like sitting at a CRT terminal inside an always-open 2 AM cybercafé (dark brick backdrop, void shadows, neon magenta/cyan/amber/green glows).
- **Signature "Sortear" Button**: Marquee neon sign with tube warm-up flickering animation, layered glows, and interactive hover feedback.
- **CRT Monitor Cards**: Movie posters framed in retro CRT monitor bezels with subtle scanlines on hover and rating badges.
- **Terminal Context Menu**: Custom right-click menu ("La vi ✔") positioned directly at cursor coordinates.
- **Dual Themes**: **Night Mode** (2 AM Cybercafé) and **Midday Mode** (Warm daylight with 70% saturated signage).

---

## 🔑 How to Get & Configure TMDB API Key

1. Register for a free account at [The Movie Database (TMDB)](https://www.themoviedb.org/).
2. Navigate to **Account Settings** -> **API** ([https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)).
3. Request an API Key (v3 auth).
4. Create a `.env` file in the root directory of this project (or copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
5. Add your TMDB API key:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
> **Note**: You can also configure or change your API key directly inside the app at runtime using the **API Key modal** (🔑 icon in the header).

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🎮 Key Features
- **Catalog Grid**: Browse TMDB catalog with infinite pagination, rating badges, and release years.
- **Random Draw ("Sortear")**: Pick a truly random movie from up to 500 pages matching your active filters.
- **Filter Controls**: Multi-select genres, debounced actor search autocomplete, year range, original language, min rating, runtime range, and "Skip already watched" toggle.
- **"La vi" (Watched) Tracking**: Right-click any movie card to mark/unmark as watched. Stored locally in `localStorage`.
- **Watched Collection View**: Dedicated tab to view, search, and manage watched movies with date-stamps and statistics.
- **Multi-language (i18n)**: Switch UI between Spanish and English on the fly.
- **Theme Switcher**: Switch between Night (2 AM) and Midday (12 PM) Cybercafé themes.

---

## ⚖️ Attribution
This product uses the TMDB API but is not endorsed or certified by TMDB.
