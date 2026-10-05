# 🎰 CYBERCAFÉ 24HS — Terminal de Ruleta de Películas & Streaming

[![Release](https://img.shields.io/badge/Release-v1.0.0-00f0ff?style=for-the-badge&logo=github&logoColor=black)](https://github.com/rapabru/cinemaRoulette24hs/releases/tag/v1.0.0)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://cinemaroulette.vercel.app)
[![Discord Community](https://img.shields.io/badge/Discord-Join_Community_24HS-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/dfSD65dgx)
[![GitHub Repository](https://img.shields.io/badge/GitHub-rapabru%2FcinemaRoulette24hs-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rapabru/cinemaRoulette24hs)
[![TMDB API](https://img.shields.io/badge/TMDB-v4_v3_API-01b4e4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

> 🌐 **Idioma / Language**: **[🇦🇷 Español](README.md)** | **[🇺🇸 English](README.en.md)**  
> *(Hacé clic en **[English](README.en.md)** para ver el README en inglés / Click **[English](README.en.md)** to read in English)*

Aplicación web de alto rendimiento estilo terminal de escritorio para descubrir películas, componer filtros avanzados, realizar sorteos aleatorios ("Sortear"), reproducir películas en vivo, descargar subtítulos en español, guardar historial de sorteos y participar en noches de cine en comunidad con una estética retro neón cybercafé de las 2 AM.

👉 **Sitio en Vivo en Vercel**: [https://cinemaroulette.vercel.app](https://cinemaroulette.vercel.app)  
💬 **Comunidad Discord 24HS (Vemos pelis todas las noches)**: [https://discord.gg/dfSD65dgx](https://discord.gg/dfSD65dgx)

---

## 🌟 Características Principales

### 🔗 Deep-Linking, Enlaces Compartibles y Embeds Dinámicos (Open Graph)
- **Previsualizaciones Ricas en Redes Sociales (Discord, WhatsApp, Telegram, Twitter/X, Facebook)**:
  - Al compartir cualquier película (`/m/:id` o `/m/:id?player=<servidor>`), las plataformas sociales muestran automáticamente la tarjeta de la película con su **backdrop panorámico oficial en alta resolución (1280x720)** o póster vertical (`summary_large_image`).
  - **Título y Metadatos en Vivo**: Muestra `${nombre} (${año}) ⭐ ${calificación}/10 — Cybercafé 24hs`.
  - **Descripción Detallada**: Incluye duración, géneros, servidor sugerido (ej. `▶ Ver en cinejoy.to`) y sinopsis (con fallback inteligente en inglés si la película no cuenta con traducción en español).
- **Vercel Edge Serverless Function (`/api/og.ts`)**:
  - Ejecutada en el Edge Network global de Vercel en 0 ms.
  - Detecta automáticamente rastreadores (*crawlers/bots*) sirviendo un HTML ultra liviano con etiquetas Open Graph completas y cabecera `Cache-Control: s-maxage=86400`.
  - Incluye cabecera HTTP `Vary: User-Agent` para evitar colisiones de caché entre bots y visitantes humanos en el CDN.
  - Para usuarios reales en navegadores, sirve la SPA de React con los metadatos inyectados en el `<head>`, abriendo la ficha o el reproductor al instante sin redirecciones molestas.
- **Redirección de Enlaces Previos**: Las URLs con el formato anterior `/?movie=:id` se redirigen automáticamente mediante HTTP 307 a `/m/:id`.
- **Botón en el Reproductor**: Botón *Compartir Servidor* ubicado en la barra superior junto al botón de pantalla completa.
- **Menú Contextual (Clic Derecho)**: Clic derecho sobre cualquier póster o carrusel para copiar la ficha directa al portapapeles.
- **Footer de Acciones Persistente**: Barra inferior fija en la ficha con botones para volver a sortear, compartir ficha, compartir reproductor y marcar como vista sin importar la longitud de la ficha.

### 🎬 Reproductores de Video Integrados (Multi-Servidor)
- **Opción 1 (cinejoy.to)**: Catálogo de streaming directo por ID de TMDB (`cinejoy.to/watch/movie/{id}`). Por políticas de seguridad del servidor de origen, incluye un botón directo para apertura en pestaña externa.
- **Opción 2 (Torrentio + Webtor)**: Flujo estilo Stremio, 100% gratuito y sin backend. Consulta el addon Torrentio (`torrentio.strem.fun`) por código IMDB, permite elegir calidad/tamaño/peers y reproduce el magnet en el navegador mediante el SDK de Webtor.io. Incluye enlace directo "Abrir en Stremio".
- **Opción 3 (VidKing)**: Reproductor integrado de alta velocidad mediante código TMDB (`vidking.net/embed/movie/{id}`).
- **Opción 4 (PlayIMDB)**: Servidor alternativo de streaming por código IMDB (`playimdb.com/es-es/title/{imdb_id}/`).
- **Tráiler Oficial**: Reproductor de tráilers de YouTube con sonido y pantalla completa.
- **Subtítulos en SubDivX**: Botón directo de búsqueda y descarga de subtítulos en español en [SubDivX](https://www.subdivx.com/).
- **Modal Adaptativo**: Límite de altura responsivo (`92vh`) con desplazamiento interno para cualquier resolución de pantalla.

### 🍿 Modo Maratón & Sorteos Compartidos
- **Sorteo en Tanda (Modo Maratón)**: Sortear lotes de 3 a 6 películas simultáneamente para organizar noches de cine en grupo.
- **Semilla Compartida (`?seed=...`)**: Enlace único para sincronizar sorteos en tiempo real con amigos, garantizando que todos vean los mismos resultados en orden idéntico.
- **Ruleta Tragaperras (Slot Reel)**: Animación fluida con desaceleración progresiva que aterriza con precisión en la película ganadora.
- **Botón Flotante de Sorteo**: Botón flotante accesible desde cualquier posición del scroll en el catálogo.

### 🎛️ Panel de Control y Filtros Avanzados
- **100% del Catálogo de TMDB (+1.000.000 de Películas)**: Token oficial de lectura pre-configurado de fábrica.
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
- **Caché Offline**: Recursos base cacheados para arranque inmediato.

### 🔑 Autenticación e Historial
- **Perfil Opcional**: Google Sign-In con el SDK oficial de Google Identity Services, o un perfil local (nombre + avatar, sin servidor, 100% en `localStorage`).
- **Historial de Sorteos**: Registro automático de cada película sorteada con hora, fecha y buscador.
- **Marcado "La Vi" (Vistas)**: Menú contextual con clic derecho y guardado local.
- **Soporte Multilingüe**: Cambio instantáneo entre Español (`ES`), Inglés (`EN`) y Portugués (`PT`).

---

## 🛠️ Instalación y Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/rapabru/cinemaRoulette24hs.git
cd cinemaRoulette24hs

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor local de desarrollo
npm run dev

# 4. Ejecutar la suite de pruebas automatizadas
npm test

# 5. Compilar para producción
npm run build
```

---

## ⚖️ Licencia y Atribución
Este producto utiliza la API de The Movie Database (TMDB) pero no está respaldado ni certificado por TMDB.
